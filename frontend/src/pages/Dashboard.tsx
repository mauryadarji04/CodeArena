import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Play, Send, ChevronRight, Search, X, Loader2, CheckCircle2, XCircle, FlaskConical, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import CodeEditor from '@/components/CodeEditor'

const codeTemplates: Record<string, string> = {
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}`,
  python: `def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()`,
  javascript: `function solve() {\n    // your code here\n}\n\nsolve();`
}

interface TestCase { input: string; output: string; explanation?: string }
interface Problem {
  _id: string
  problemNumber: number
  title: string
  difficulty: string
  tags?: string[]
  problemStatement: string
  constraints: string
  sampleTestCases?: TestCase[]
  hiddenPrompt?: string
}

const DIFFICULTY_OPTS = ['All', 'Easy', 'Medium', 'Hard'] as const

const difficultyConfig = {
  Easy:   { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25', active: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/50' },
  Medium: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25',         active: 'bg-amber-500/25 text-amber-400 border-amber-500/50'     },
  Hard:   { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25',             active: 'bg-rose-500/25 text-rose-400 border-rose-500/50'         },
} as const

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cfg = difficultyConfig[difficulty as keyof typeof difficultyConfig]
  if (!cfg) return null
  return (
    <Badge className={`border text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
      {difficulty}
    </Badge>
  )
}

const fadeUp   = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }
const fadeIn   = { hidden: { opacity: 0 },         show: { opacity: 1, transition: { duration: 0.2 } } }
const slideIn  = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.22 } } }

export default function Dashboard() {
  const [problems, setProblems]               = useState<Problem[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [code, setCode]                       = useState(codeTemplates.cpp)
  const [language, setLanguage]               = useState('cpp')
  const [showProblems, setShowProblems]       = useState(true)
  const [analysis, setAnalysis]               = useState<any>(null)
  const [plagiarism, setPlagiarism]           = useState<any>(null)
  const [lastAction, setLastAction]           = useState<'run' | 'submit' | null>(null)
  const [isRunning, setIsRunning]             = useState(false)
  const [isSubmitting, setIsSubmitting]       = useState(false)
  const [runStatus, setRunStatus]             = useState<'idle' | 'passed' | 'failed'>('idle')
  const [submitWarning, setSubmitWarning]     = useState(false)
  const [search, setSearch]                   = useState('')
  const [diffFilter, setDiffFilter]           = useState('All')
  const [tagFilter, setTagFilter]             = useState('All')

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/problems`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProblems(data.problems)
          if (data.problems.length > 0) loadProblem(data.problems[0]._id)
        }
      })
      .catch(console.error)
  }, [])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    problems.forEach(p => p.tags?.forEach(t => set.add(t)))
    return ['All', ...Array.from(set).sort()]
  }, [problems])

  const filtered = useMemo(() => problems.filter(p => {
    const q = search.toLowerCase()
    return (
      (p.title.toLowerCase().includes(q) || String(p.problemNumber).includes(q)) &&
      (diffFilter === 'All' || p.difficulty === diffFilter) &&
      (tagFilter  === 'All' || p.tags?.includes(tagFilter))
    )
  }), [problems, search, diffFilter, tagFilter])

  const loadProblem = async (id: string) => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${id}`)
      const data = await res.json()
      if (data.success) {
        setSelectedProblem(data.problem)
        setAnalysis(null)
        setPlagiarism(null)
        setLastAction(null)
        setRunStatus('idle')
        setCode(codeTemplates[language])
      }
    } catch (err) { console.error(err) }
  }

  const handleLanguageChange = (lang: string) => { setLanguage(lang); setCode(codeTemplates[lang]); setRunStatus('idle') }

  const handleRun = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId)          { alert('Please login first!'); return }
    if (!selectedProblem) { alert('No problem selected!'); return }
    setIsRunning(true); setAnalysis(null); setPlagiarism(null); setLastAction('run'); setRunStatus('idle')
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, problemId: selectedProblem._id, code, language, type: 'run' })
      })
      const data = await res.json()
      if (data.success) {
        setAnalysis(data.analysis)
        const results = data.analysis?.test_results
        if (Array.isArray(results) && results.length > 0 && results.every((r: any) => r.passed)) {
          setRunStatus('passed')
        } else {
          setRunStatus('failed')
        }
      } else {
        alert('Failed: ' + data.message)
      }
    } catch (err) { alert('Error: ' + err) }
    finally { setIsRunning(false) }
  }

  const handleSubmit = async () => {
    if (runStatus !== 'passed') {
      setSubmitWarning(true)
      setTimeout(() => setSubmitWarning(false), 3000)
      return
    }
    const userId = localStorage.getItem('userId')
    if (!userId)          { alert('Please login first!'); return }
    if (!selectedProblem) { alert('No problem selected!'); return }
    setIsSubmitting(true); setAnalysis(null); setPlagiarism(null); setLastAction('submit')
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, problemId: selectedProblem._id, code, language, type: 'submit' })
      })
      const data = await res.json()
      if (data.success) {
        setAnalysis({ ...data.analysis, _submitStatus: data.record?.status ?? 'wrong_answer' })
        setPlagiarism(data.plagiarism ?? null)
      } else {
        alert('Submit failed: ' + data.message)
      }
    } catch (err) { alert('Error: ' + err) }
    finally { setIsSubmitting(false) }
  }

  const tc = selectedProblem?.sampleTestCases ?? []

  if (!selectedProblem) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground tracking-wide">Loading problems…</p>
      </motion.div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-73px)] bg-background overflow-hidden">

      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {showProblems && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex flex-col border-r border-border bg-[hsl(224,71%,4%)] overflow-hidden shrink-0"
          >
            <div className="p-4 space-y-3 border-b border-border">
              {/* header */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm tracking-wide text-foreground">PROBLEMS</span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-mono">
                  {filtered.length}/{problems.length}
                </Badge>
              </div>

              {/* search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or #…"
                  className="pl-9 pr-8 h-8 text-xs bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-primary"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* difficulty pills */}
              <div className="flex gap-1.5 flex-wrap">
                {DIFFICULTY_OPTS.map(d => {
                  const isActive = diffFilter === d
                  const cfg = difficultyConfig[d as keyof typeof difficultyConfig]
                  return (
                    <motion.button
                      key={d} whileTap={{ scale: 0.93 }}
                      onClick={() => setDiffFilter(d)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                        isActive
                          ? cfg ? cfg.active : 'bg-primary/20 text-primary border-primary/40'
                          : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground/50'
                      }`}
                    >{d}</motion.button>
                  )
                })}
              </div>

              {/* tag select */}
              <select
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                {allTags.map(t => <option key={t} value={t}>{t === 'All' ? '📂 All Topics' : t}</option>)}
              </select>
            </div>

            {/* problem list */}
            <ScrollArea className="flex-1">
              <div className="py-1">
                <AnimatePresence mode="popLayout">
                  {filtered.length === 0 ? (
                    <motion.div key="empty" {...fadeIn} className="p-8 text-center">
                      <p className="text-muted-foreground text-sm">No problems found</p>
                    </motion.div>
                  ) : filtered.map((p, idx) => {
                    const active = selectedProblem?._id === p._id
                    return (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.015, duration: 0.18 }}
                        onClick={() => loadProblem(p._id)}
                        className={`relative px-4 py-3 cursor-pointer transition-colors group border-l-2 ${
                          active
                            ? 'bg-primary/10 border-l-primary'
                            : 'border-l-transparent hover:bg-muted/30 hover:border-l-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className={`text-xs font-medium leading-snug ${active ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}`}>
                            <span className="text-muted-foreground/60 mr-1 font-mono">{p.problemNumber}.</span>
                            {p.title}
                          </span>
                          <DifficultyBadge difficulty={p.difficulty} />
                        </div>
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {p.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[10px] text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded border border-border/40">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 bg-primary/5 pointer-events-none"
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Problem Panel ── */}
      <ScrollArea className="flex-1 border-r border-border">
        <motion.div key={selectedProblem._id} variants={fadeUp} initial="hidden" animate="show" className="p-6 max-w-3xl">

          {/* title */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="space-y-2">
              <h1 className="text-xl font-bold leading-tight">
                <span className="text-muted-foreground/50 font-mono mr-1.5 text-lg">{selectedProblem.problemNumber}.</span>
                {selectedProblem.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={selectedProblem.difficulty} />
                <Separator orientation="vertical" className="h-4" />
                {selectedProblem.tags?.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground border-border/60 font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowProblems(!showProblems)} className="shrink-0 h-8 w-8">
              <motion.div animate={{ rotate: showProblems ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </Button>
          </div>

          <Separator className="mb-5" />

          {/* problem statement */}
          <motion.div variants={fadeUp} className="mb-6">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {selectedProblem.problemStatement}
            </p>
            {selectedProblem.hiddenPrompt && (
              <span
                className="text-sm select-all whitespace-pre-line"
                style={{ color: 'hsl(224,71%,4%)' }}
                aria-hidden="true"
              >
                {selectedProblem.hiddenPrompt}
              </span>
            )}
          </motion.div>

          {/* examples */}
          {tc.map((testCase, i) => (
            <motion.div key={i} variants={fadeUp} className="mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Example {i + 1}
              </p>
              <Card className="border-border/60 bg-muted/10 overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-border/60">
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Input</p>
                    <pre className="font-mono text-xs text-foreground/90 whitespace-pre-wrap break-all leading-relaxed">{testCase.input}</pre>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Output</p>
                    <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">{testCase.output}</pre>
                  </div>
                </div>
                {testCase.explanation && (
                  <>
                    <Separator />
                    <CardContent className="py-2.5 px-4">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/60">Explanation: </span>
                        {testCase.explanation}
                      </p>
                    </CardContent>
                  </>
                )}
              </Card>
            </motion.div>
          ))}

          {/* constraints */}
          <motion.div variants={fadeUp}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Constraints</p>
            <Card className="border-border/60 bg-muted/10">
              <CardContent className="p-4">
                <pre className="font-mono text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {selectedProblem.constraints}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </ScrollArea>

      {/* ── Code Editor Panel ── */}
      <div className="w-[50%] flex flex-col min-w-0">

        {/* toolbar */}
        <div className="px-4 py-2.5 border-b border-border bg-[hsl(224,71%,4%)] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editor</span>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex gap-1">
              {(['cpp', 'python'] as const).map(lang => (
                <motion.button
                  key={lang} whileTap={{ scale: 0.93 }}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                    language === lang
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground/50'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : 'Python'}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={handleRun} disabled={isRunning}
              className="h-7 text-xs px-3 border-border hover:border-primary hover:text-primary transition-colors"
            >
              {isRunning
                ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Running…</>
                : <><Play className="w-3 h-3 mr-1.5" />Run</>
              }
            </Button>
            <div className="relative">
              <Button
                size="sm" onClick={handleSubmit} disabled={isSubmitting}
                className={`h-7 text-xs px-3 text-white border-0 transition-colors ${
                  runStatus === 'passed'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-zinc-600 hover:bg-zinc-500 opacity-60'
                }`}
              >
                {isSubmitting
                  ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Submitting…</>
                  : <><Send className="w-3 h-3 mr-1.5" />Submit</>
                }
              </Button>
              <AnimatePresence>
                {submitWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-9 z-50 w-64 rounded-lg border border-amber-500/40 bg-zinc-900 px-3 py-2.5 shadow-xl"
                  >
                    <p className="text-xs text-amber-400 font-medium">
                      {runStatus === 'idle'
                        ? '⚠ Run your code first before submitting.'
                        : '⚠ All test cases must pass before submitting.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor code={code} setCode={setCode} language={language} />
        </div>

        {/* ── Test Cases Tabs ── */}
        <div className="border-t border-border bg-[hsl(224,71%,4%)] shrink-0" style={{ maxHeight: 240 }}>
          <Tabs defaultValue="0">
            <div className="flex items-center gap-2 px-4 pt-2 border-b border-border">
              <FlaskConical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <TabsList className="bg-transparent p-0 h-auto gap-0.5">
                {tc.map((_, i) => (
                  <TabsTrigger
                    key={i} value={String(i)}
                    className="h-8 px-3 text-xs rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground"
                  >
                    Case {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tc.map((testCase, i) => (
              <TabsContent key={i} value={String(i)} className="mt-0">
                <div className="grid grid-cols-2 divide-x divide-border overflow-y-auto" style={{ maxHeight: 180 }}>
                  <div className="p-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Input</p>
                    <pre className="font-mono text-xs bg-muted/30 rounded-md p-2.5 text-foreground/90 whitespace-pre-wrap break-all border border-border/40 leading-relaxed">
                      {testCase.input}
                    </pre>
                  </div>
                  <div className="p-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expected Output</p>
                    <pre className="font-mono text-xs bg-emerald-500/8 rounded-md p-2.5 text-emerald-400 whitespace-pre-wrap break-all border border-emerald-500/20 leading-relaxed">
                      {testCase.output}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* ── Results Panel ── */}
        <AnimatePresence mode="wait">

          {/* RUN: show test case results */}
          {lastAction === 'run' && analysis && (
            <motion.div
              key="run-results"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-border overflow-hidden shrink-0"
            >
              <div className="bg-muted/20 p-3 max-h-52 overflow-y-auto space-y-2">

                {/* test case results */}
                <div className="flex items-center gap-2">
                  {analysis.error
                    ? <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    : runStatus === 'passed'
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    : <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  }
                  <span className={`text-xs font-semibold ${runStatus === 'passed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {analysis.error ? 'Error' : runStatus === 'passed' ? 'All Test Cases Passed' : 'Some Test Cases Failed'}
                  </span>
                  {!analysis.error && Array.isArray(analysis.test_results) && (
                    <span className="ml-auto text-xs text-muted-foreground font-mono">
                      {analysis.test_results.filter((r: any) => r.passed).length}/{analysis.test_results.length} passed
                    </span>
                  )}
                </div>

                {Array.isArray(analysis.test_results) && (
                  <div className="space-y-1.5">
                    {analysis.test_results.map((r: any, i: number) => (
                      <div key={i} className={`text-xs rounded-md border ${
                        r.passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                      }`}>
                        <div className={`flex items-center gap-2 px-2.5 py-1.5 font-medium ${
                          r.passed ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {r.passed ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                          <span>{r.label ?? `Case ${i + 1}`}: {r.passed ? 'Passed' : 'Failed'}</span>
                        </div>
                        <div className="px-2.5 pb-2 grid grid-cols-2 gap-x-3 gap-y-1">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Expected</p>
                            <pre className="font-mono text-[11px] text-foreground/80">{r.expected ?? '—'}</pre>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Actual</p>
                            <pre className={`font-mono text-[11px] ${r.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{r.actual ?? '—'}</pre>
                          </div>
                          {r.error && (
                            <div className="col-span-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Error</p>
                              <pre className="font-mono text-[11px] text-rose-400 whitespace-pre-wrap">{r.error}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* complexity */}
                {analysis.complexity && (
                  <div className="flex gap-3 text-[10px] text-muted-foreground font-mono pt-1">
                    <span>Time: {analysis.complexity.time_worst}</span>
                    <span>Space: {analysis.complexity.space}</span>
                    {analysis.optimization?.is_optimized !== undefined && (
                      <span className={analysis.optimization.is_optimized ? 'text-emerald-400' : 'text-amber-400'}>
                        {analysis.optimization.is_optimized ? 'Optimized' : 'Can be optimized'}
                      </span>
                    )}
                  </div>
                )}

                {analysis.error && (
                  <pre className="text-xs bg-background rounded-md p-2.5 border border-border text-rose-400 whitespace-pre-wrap">
                    {analysis.error}
                  </pre>
                )}
              </div>
            </motion.div>
          )}

          {/* SUBMIT: show verdict + plagiarism */}
          {lastAction === 'submit' && analysis && (
            <motion.div
              key="submit-results"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-border overflow-hidden shrink-0"
            >
              <div className="bg-muted/20 p-3 max-h-52 overflow-y-auto space-y-3">

                {/* verdict row */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                  analysis._submitStatus === 'accepted'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  {analysis._submitStatus === 'accepted'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    : <XCircle className="w-4 h-4 text-rose-400" />
                  }
                  <span className={`text-sm font-semibold ${
                    analysis._submitStatus === 'accepted' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {analysis._submitStatus === 'accepted' ? 'Accepted ✓' : 'Wrong Answer'}
                  </span>
                </div>

                {/* plagiarism row */}
                {plagiarism?.checked && (
                  <div className={`px-3 py-2 rounded-md border space-y-1.5 ${
                    plagiarism.verdict === 'clean'      ? 'bg-emerald-500/10 border-emerald-500/30'
                    : plagiarism.verdict === 'suspicious' ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      {plagiarism.verdict === 'clean'
                        ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        : plagiarism.verdict === 'suspicious'
                        ? <ShieldQuestion className="w-3.5 h-3.5 text-amber-400" />
                        : <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      }
                      <span className={`text-xs font-semibold ${
                        plagiarism.verdict === 'clean'       ? 'text-emerald-400'
                        : plagiarism.verdict === 'suspicious' ? 'text-amber-400'
                        : 'text-rose-400'
                      }`}>
                        Plagiarism: {plagiarism.verdict.charAt(0).toUpperCase() + plagiarism.verdict.slice(1)}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground font-mono">Score: {plagiarism.score ?? '—'}</span>
                    </div>
                    {plagiarism.matchedKeywords?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {plagiarism.matchedKeywords.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
