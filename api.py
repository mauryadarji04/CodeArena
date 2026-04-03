#!/usr/bin/env python3
import os
import re
import json
import shutil
import subprocess
import tempfile
import requests
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

app = FastAPI(title="Code Analysis API", version="1.0.0")

GROQ_API_KEY = ""
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

_EXT_MAP = {".py": "python", ".cpp": "cpp", ".c": "c", ".java": "java"}


# ================= LLM =================
def llm(system, user):
    res = requests.post(
        GROQ_API_URL,
        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
        json={
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user}
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"}
        },
        timeout=90
    )
    body = res.json()
    if "choices" not in body:
        raise ValueError(f"Groq API error: {body.get('error', {}).get('message', str(body))}")
    raw = body["choices"][0]["message"]["content"]
    raw = re.sub(r"^```[a-zA-Z]*\s*", "", raw.strip())
    raw = re.sub(r"```\s*$", "", raw.strip())
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from LLM: {e} | Raw: {raw[:300]}")


# ================= SANITIZE =================
def sanitize(code):
    return code.encode("ascii", errors="ignore").decode("ascii")


# ================= COMPILE =================
def _compile_named(code, language, tmp, name):
    code = sanitize(code)

    if language == "python":
        fp = os.path.join(tmp, f"{name}.py")
        with open(fp, "w", encoding="utf-8") as f:
            f.write(code)
        return ["python", "-X", "utf8", fp], None

    elif language == "cpp":
        fp = os.path.join(tmp, f"{name}.cpp")
        ep = os.path.join(tmp, f"{name}.exe")
        with open(fp, "w", encoding="utf-8") as f:
            f.write(code)
        r = subprocess.run(["g++", "-std=c++17", fp, "-o", ep],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        return ([ep], None) if r.returncode == 0 else (None, r.stderr)

    elif language == "c":
        fp = os.path.join(tmp, f"{name}.c")
        ep = os.path.join(tmp, f"{name}.exe")
        with open(fp, "w", encoding="utf-8") as f:
            f.write(code)
        r = subprocess.run(["gcc", fp, "-o", ep],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        return ([ep], None) if r.returncode == 0 else (None, r.stderr)

    elif language == "java":
        sub_tmp = os.path.join(tmp, name)
        os.makedirs(sub_tmp, exist_ok=True)
        fp = os.path.join(sub_tmp, "Main.java")
        with open(fp, "w", encoding="utf-8") as f:
            f.write(code)
        r = subprocess.run(["javac", fp],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        return (["java", "-cp", sub_tmp, "Main"], None) if r.returncode == 0 else (None, r.stderr)

    return None, "Unsupported language"


# ================= RUN PROGRAM =================
def run_program(run_cmd, stdin_input, timeout=5):
    try:
        result = subprocess.run(
            run_cmd, input=stdin_input,
            capture_output=True, text=True,
            encoding="utf-8", errors="replace",
            timeout=timeout
        )
        if result.returncode != 0 and result.stderr.strip():
            return None, result.stderr.strip(), "Runtime Error"
        return result.stdout.strip(), None, None
    except subprocess.TimeoutExpired:
        return None, "Time Limit Exceeded (>5s)", "Time Limit Exceeded"
    except Exception as e:
        return None, str(e), "Runtime Error"


# ================= SYNTAX CHECK =================
def check_syntax(code, language):
    tmp = tempfile.mkdtemp()
    try:
        cmd, err = _compile_named(code, language, tmp, "syntax_check")
        return (False, err) if err else (True, None)
    except Exception as e:
        return False, str(e)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ================= GENERATE ARTIFACTS =================
def generate_judge_artifacts(code, language):
    system = f"""You are a production online-judge engine.

Analyze the submitted solution and return ONLY this JSON:

{{
  "difficulty": "easy" | "medium" | "hard",
  "problem_summary": "<one sentence describing what the code solves>",
  "driver_code": "<COMPLETE {language} program: embed user solution AS-IS + main() that reads T from stdin then T inputs, calls solution, prints result>",
  "reference_code": "<COMPLETE {language} program: independent correct solution, same stdin/stdout as driver_code>",
  "test_inputs": [
    {{
      "input": "<stdin string, first line = T>",
      "is_valid": true | false,
      "invalid_reason": "<reason if is_valid=false, else empty>"
    }}
  ]
}}

RULES:
- C++: use #include <bits/stdc++.h> and using namespace std;
- Java: single public class Main
- Python: use sys.stdin
- easy/medium: 10 test_inputs, hard: 30 test_inputs
- NO emoji, NO non-ASCII characters in any code
- Output ONLY JSON, no markdown"""

    return llm(system, f"Language: {language}\n\nCode:\n{code}")


# ================= RUN JUDGE =================
def run_judge(driver_code, reference_code, language, test_inputs):
    passed  = 0
    invalid = 0
    failed  = []

    tmp = tempfile.mkdtemp()
    try:
        driver_cmd, driver_err = _compile_named(driver_code,    language, tmp, "driver")
        ref_cmd,    ref_err    = _compile_named(reference_code, language, tmp, "reference")

        if driver_err:
            return 0, 0, [{"test_case": 0, "failure_type": "Compilation Error (Driver)", "detail": driver_err.strip()}]
        if ref_err:
            return 0, 0, [{"test_case": 0, "failure_type": "Compilation Error (Reference)", "detail": ref_err.strip()}]

        for i, ti in enumerate(test_inputs):
            stdin_input = ti.get("input", "")
            if not ti.get("is_valid", True):
                invalid += 1
                continue

            ref_out, ref_err_msg, _ = run_program(ref_cmd, stdin_input)
            if ref_err_msg:
                invalid += 1
                continue

            actual, err_msg, failure_type = run_program(driver_cmd, stdin_input)
            if err_msg:
                failed.append({"test_case": i+1, "failure_type": failure_type, "actual": err_msg, "expected": ref_out})
            elif actual == ref_out:
                passed += 1
            else:
                failed.append({"test_case": i+1, "failure_type": "Wrong Answer", "expected": ref_out, "actual": actual})

    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    return passed, invalid, failed


# ================= COMPLEXITY =================
def analyze_complexity(code, language):
    system = """You are a code complexity analyzer.
Return ONLY JSON:
{
  "time_best":          "<Big-O with justification>",
  "time_average":       "<Big-O with justification>",
  "time_worst":         "<Big-O with justification>",
  "space":              "<auxiliary space with explanation>",
  "is_optimized":       true | false,
  "better_possible":    true | false,
  "suggested_approach": "<better algorithm or why current is optimal>",
  "reason":             "<explanation referencing actual code>",
  "generalization":     "<Generalized or Not Generalized with reason>"
}
No N/A. Output ONLY JSON, no markdown."""
    return llm(system, f"Language: {language}\n\nCode:\n{code}")


# ================= ENDPOINT =================
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        filename = file.filename
        ext      = Path(filename).suffix.lower()
        language = _EXT_MAP.get(ext)

        if not language:
            return JSONResponse(status_code=400, content={
                "status": "CLIENT_ERROR",
                "error_detail": f"Unsupported file type '{ext}'. Allowed: .py .cpp .c .java"
            })

        raw_code = (await file.read()).decode("utf-8")

        # Step 1: Syntax check
        ok, error = check_syntax(raw_code, language)
        if not ok:
            return JSONResponse(status_code=422, content={
                "status": "COMPILATION_ERROR",
                "error_detail": error,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

        # Step 2: Generate artifacts
        artifacts       = generate_judge_artifacts(raw_code, language)
        difficulty      = artifacts.get("difficulty", "medium")
        problem_summary = artifacts.get("problem_summary", "")
        driver_code     = artifacts.get("driver_code", "")
        reference_code  = artifacts.get("reference_code", "")
        test_inputs     = artifacts.get("test_inputs", [])

        # Step 3: Run judge
        total                   = len(test_inputs)
        passed, invalid, failed = run_judge(driver_code, reference_code, language, test_inputs)
        valid_total             = total - invalid

        # Step 4: Complexity
        try:
            complexity = analyze_complexity(raw_code, language)
        except Exception:
            complexity = {}

        compiler_map = {"cpp": "g++ -std=c++17", "c": "gcc", "python": "python", "java": "javac + java"}

        return JSONResponse(content={
            "status":          "SUCCESS",
            "filename":        filename,
            "language":        language,
            "difficulty":      difficulty,
            "problem_summary": problem_summary,
            "execution_details": {
                "used_custom_driver":    True,
                "used_reference_oracle": True,
                "input_via_stdin":       True,
                "compiler":              compiler_map.get(language)
            },
            "test_summary": {
                "total":   total,
                "valid":   valid_total,
                "invalid": invalid,
                "passed":  passed,
                "failed":  len(failed)
            },
            "complexity": {
                "time_best":    complexity.get("time_best", ""),
                "time_average": complexity.get("time_average", ""),
                "time_worst":   complexity.get("time_worst", ""),
                "space":        complexity.get("space", "")
            },
            "optimization": {
                "is_optimized":       complexity.get("is_optimized", False),
                "better_possible":    complexity.get("better_possible", False),
                "suggested_approach": complexity.get("suggested_approach", ""),
                "reason":             complexity.get("reason", ""),
                "generalization":     complexity.get("generalization", "")
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={
            "status":       "ERROR",
            "error_detail": str(e)
        })
# uvicorn api:app --host 0.0.0.0 --port 8000 --reload
# http://127.0.0.1:8000/docs 
