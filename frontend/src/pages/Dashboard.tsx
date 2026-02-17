import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Send, ChevronRight } from 'lucide-react'
import CodeEditor from '@/components/CodeEditor'

const codeTemplates: Record<string, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // your code here
    return 0;
}`,
  java: `public class Solution {
    public static void main(String[] args) {
        // your code here
    }
}`,
  python: `def solve():
    pass

if __name__ == "__main__":
    solve()`,
  javascript: `function solve() {
    // your code here
}

solve();`
}

interface Problem {
  _id: string
  problemNumber: number
  title: string
  difficulty: string
  tags?: string[]
  problemStatement: string
  constraints: string
  sampleTestCases?: { input: string; output: string; explanation?: string }[]
  hiddenTestCases?: { input: string; output: string }[]
}

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState(codeTemplates.cpp)
  const [language, setLanguage] = useState('cpp')
  const [showProblems, setShowProblems] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/problems`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProblems(data.problems)
          if (data.problems.length > 0) loadProblem(data.problems[0]._id)
        }
      })
      .catch(err => console.error('Error fetching problems:', err))
  }, [])

  const loadProblem = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${id}`)
      const data = await res.json()
      if (data.success) {
        setSelectedProblem(data.problem)
        setCode(codeTemplates[language])
      }
    } catch (err) {
      console.error('Error loading problem:', err)
    }
  }

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    setCode(codeTemplates[newLang])
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-600'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-600'
      case 'Hard': return 'bg-red-500/20 text-red-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

  const handleSubmit = () => {
    console.log('Submitted code:', code)
    alert('Code submitted!')
  }

  const handleRun = () => {
    console.log('Running code:', code)
    alert('Code executed!')
  }

  if (!selectedProblem) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Problems Sidebar */}
      {showProblems && (
        <div className="w-80 border-r border-border overflow-y-auto bg-muted/30">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg">Problems ({problems.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {problems.map((problem: Problem) => (
              <div
                key={problem._id}
                onClick={() => loadProblem(problem._id)}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedProblem?._id === problem._id ? 'bg-muted' : ''
                }`}
              >
                <h3 className="font-medium mb-2">{problem.problemNumber}. {problem.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`${getDifficultyColor(problem.difficulty)} px-2 py-0.5 rounded text-xs font-medium`}>
                    {problem.difficulty}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {problem.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-xs text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Left Panel - Question */}
      <div className="flex-1 border-r border-border overflow-y-auto">
        <div className="p-6 h-full">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">{selectedProblem.problemNumber}. {selectedProblem.title}</h1>
              <Button variant="ghost" size="sm" onClick={() => setShowProblems(!showProblems)}>
                <ChevronRight className={`w-4 h-4 transition-transform ${showProblems ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${getDifficultyColor(selectedProblem.difficulty)} px-3 py-1 rounded-full text-sm font-medium`}>
                {selectedProblem.difficulty}
              </span>
              {selectedProblem.tags?.map((tag, i) => (
                <span key={i} className="text-sm text-muted-foreground">#{tag}</span>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {selectedProblem.problemStatement}
              </p>
            </div>
            
            {selectedProblem.sampleTestCases?.map((testCase, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold mb-3">Example {i + 1}</h3>
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <div className="font-mono text-sm space-y-1">
                    <div><span className="font-semibold">Input:</span> {testCase.input}</div>
                    <div><span className="font-semibold">Output:</span> {testCase.output}</div>
                    {testCase.explanation && (
                      <div><span className="font-semibold">Explanation:</span> {testCase.explanation}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div>
              <h3 className="text-lg font-semibold mb-3">Constraints</h3>
              <div className="text-muted-foreground space-y-2 whitespace-pre-line">
                {selectedProblem.constraints}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Code Editor</h3>
              <select 
                value={language} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-muted border border-border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRun}>
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CodeEditor code={code} setCode={setCode} language={language} />
          </div>
          
          {/* Test Cases Section */}
          <div className="border-t border-border bg-muted/30 p-4 max-h-64 overflow-y-auto">
            <h4 className="font-semibold mb-3 text-sm">Test Cases</h4>
            <div className="space-y-3">
              {selectedProblem.sampleTestCases?.slice(0, 2).map((testCase, i) => (
                <div key={i} className="bg-background rounded-lg p-3 border border-border">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Test Case {i + 1}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex gap-2">
                      <span className="font-semibold min-w-[60px]">Input:</span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{testCase.input}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold min-w-[60px]">Output:</span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-green-600">{testCase.output}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}