import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, ChevronDown, ChevronUp, ArrowLeft, Save } from 'lucide-react'

interface TestCase { input: string; output: string; explanation?: string }
interface HiddenTC  { input: string; output: string }

const EMPTY_FORM = {
  problemNumber: '',
  title: '',
  difficulty: 'Easy',
  tags: '',
  problemStatement: '',
  constraints: '',
  sampleTestCases: [{ input: '', output: '', explanation: '' }] as TestCase[],
  hiddenTestCases:  [{ input: '', output: '' }] as HiddenTC[],
  hiddenPrompt: '',
  trapKeywords: '',
}

export default function AddQuestion() {
  const navigate  = useNavigate()
  const { id }    = useParams<{ id: string }>()
  const isEdit    = Boolean(id)
  const token     = localStorage.getItem('token')
  const role      = localStorage.getItem('userRole')

  const [form, setForm]               = useState({ ...EMPTY_FORM })
  const [saving, setSaving]           = useState(false)
  const [expandSample, setExpandSample] = useState(true)
  const [expandHidden, setExpandHidden] = useState(false)

  useEffect(() => {
    if (role !== 'admin') { navigate('/dashboard'); return }
    if (isEdit && id) loadProblem(id)
  }, [id])

  const loadProblem = async (problemId: string) => {
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/problems/${problemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!data.success) return
    const p = data.problem
    setForm({
      problemNumber:    String(p.problemNumber),
      title:            p.title,
      difficulty:       p.difficulty,
      tags:             p.tags?.join(', ') ?? '',
      problemStatement: p.problemStatement,
      constraints:      p.constraints,
      sampleTestCases:  p.sampleTestCases?.length ? p.sampleTestCases : [{ input: '', output: '', explanation: '' }],
      hiddenTestCases:  p.hiddenTestCases?.length  ? p.hiddenTestCases  : [{ input: '', output: '' }],
      hiddenPrompt:     p.hiddenPrompt ?? '',
      trapKeywords:     p.trapKeywords?.join(', ') ?? '',
    })
  }

  const handleSave = async () => {
    if (!form.problemNumber || !form.title || !form.problemStatement || !form.constraints) {
      alert('Please fill in all required fields.')
      return
    }
    setSaving(true)
    const payload = {
      problemNumber:    Number(form.problemNumber),
      title:            form.title,
      difficulty:       form.difficulty,
      tags:             form.tags.split(',').map(t => t.trim()).filter(Boolean),
      problemStatement: form.problemStatement,
      constraints:      form.constraints,
      sampleTestCases:  form.sampleTestCases.filter(t => t.input || t.output),
      hiddenTestCases:  form.hiddenTestCases.filter(t => t.input || t.output),
      hiddenPrompt:     form.hiddenPrompt,
      trapKeywords:     form.trapKeywords.split(',').map(t => t.trim()).filter(Boolean),
    }
    const url    = isEdit
      ? `${import.meta.env.VITE_API_URL}/api/problems/${id}`
      : `${import.meta.env.VITE_API_URL}/api/problems`
    const res    = await fetch(url, {
      method:  isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      navigate('/admin')
    } else {
      alert(data.message)
    }
  }

  // helpers
  const setSample = (i: number, field: keyof TestCase, val: string) =>
    setForm(f => ({ ...f, sampleTestCases: f.sampleTestCases.map((t, idx) => idx === i ? { ...t, [field]: val } : t) }))
  const addSample    = () => setForm(f => ({ ...f, sampleTestCases: [...f.sampleTestCases, { input: '', output: '', explanation: '' }] }))
  const removeSample = (i: number) => setForm(f => ({ ...f, sampleTestCases: f.sampleTestCases.filter((_, idx) => idx !== i) }))

  const setHidden = (i: number, field: keyof HiddenTC, val: string) =>
    setForm(f => ({ ...f, hiddenTestCases: f.hiddenTestCases.map((t, idx) => idx === i ? { ...t, [field]: val } : t) }))
  const addHidden    = () => setForm(f => ({ ...f, hiddenTestCases: [...f.hiddenTestCases, { input: '', output: '' }] }))
  const removeHidden = (i: number) => setForm(f => ({ ...f, hiddenTestCases: f.hiddenTestCases.filter((_, idx) => idx !== i) }))

  const field = (label: string, required = false) => (
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      {/* header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="h-9 w-9">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Problem' : 'Add New Question'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? 'Update the problem details below' : 'Fill in the details to add a new problem to the database'}
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* basic info card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Basic Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              {field('Problem Number', true)}
              <Input type="number" value={form.problemNumber}
                onChange={e => setForm(f => ({ ...f, problemNumber: e.target.value }))}
                placeholder="e.g. 42"
                className="h-9 text-sm bg-muted/40 border-border" />
            </div>
            <div className="space-y-1.5">
              {field('Difficulty', true)}
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                className="w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            {field('Title', true)}
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Two Sum"
              className="h-9 text-sm bg-muted/40 border-border" />
          </div>

          <div className="space-y-1.5">
            {field('Tags')}
            <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="Array, HashMap, Two Pointers  (comma separated)"
              className="h-9 text-sm bg-muted/40 border-border" />
          </div>
        </div>

        {/* problem content card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Problem Content</h2>

          <div className="space-y-1.5">
            {field('Problem Statement', true)}
            <textarea value={form.problemStatement}
              onChange={e => setForm(f => ({ ...f, problemStatement: e.target.value }))}
              rows={6} placeholder="Describe the problem in detail…"
              className="w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y" />
          </div>

          <div className="space-y-1.5">
            {field('Constraints', true)}
            <textarea value={form.constraints}
              onChange={e => setForm(f => ({ ...f, constraints: e.target.value }))}
              rows={3} placeholder="1 ≤ n ≤ 10^5&#10;-10^9 ≤ nums[i] ≤ 10^9"
              className="w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
        </div>

        {/* sample test cases card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button onClick={() => setExpandSample(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
            <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              Sample Test Cases
              <span className="ml-2 text-xs font-normal normal-case text-muted-foreground">(visible to users)</span>
            </h2>
            {expandSample ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {expandSample && (
            <div className="px-6 pb-6 space-y-3 border-t border-border">
              <div className="pt-4 space-y-3">
                {form.sampleTestCases.map((tc, i) => (
                  <div key={i} className="border border-border/60 rounded-lg p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Case {i + 1}</span>
                      {form.sampleTestCases.length > 1 && (
                        <button onClick={() => removeSample(i)} className="text-rose-400 hover:text-rose-300 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Input</label>
                        <textarea value={tc.input} onChange={e => setSample(i, 'input', e.target.value)} rows={3}
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expected Output</label>
                        <textarea value={tc.output} onChange={e => setSample(i, 'output', e.target.value)} rows={3}
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Explanation <span className="font-normal normal-case">(optional)</span></label>
                      <Input value={tc.explanation ?? ''} onChange={e => setSample(i, 'explanation', e.target.value)}
                        placeholder="Explain why this output is correct…"
                        className="h-8 text-xs bg-background border-border" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addSample} className="w-full h-9 text-xs border-dashed gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Sample Case
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* hidden test cases card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button onClick={() => setExpandHidden(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
            <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              Hidden Test Cases
              <span className="ml-2 text-xs font-normal normal-case text-muted-foreground">(used for evaluation only)</span>
            </h2>
            {expandHidden ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {expandHidden && (
            <div className="px-6 pb-6 space-y-3 border-t border-border">
              <div className="pt-4 space-y-3">
                {form.hiddenTestCases.map((tc, i) => (
                  <div key={i} className="border border-border/60 rounded-lg p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Hidden Case {i + 1}</span>
                      {form.hiddenTestCases.length > 1 && (
                        <button onClick={() => removeHidden(i)} className="text-rose-400 hover:text-rose-300 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Input</label>
                        <textarea value={tc.input} onChange={e => setHidden(i, 'input', e.target.value)} rows={3}
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expected Output</label>
                        <textarea value={tc.output} onChange={e => setHidden(i, 'output', e.target.value)} rows={3}
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addHidden} className="w-full h-9 text-xs border-dashed gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Hidden Case
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* anti-cheat card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Anti-Cheat Config</h2>

          <div className="space-y-1.5">
            {field('Hidden Prompt')}
            <Input value={form.hiddenPrompt} onChange={e => setForm(f => ({ ...f, hiddenPrompt: e.target.value }))}
              placeholder="e.g. Use a variable named __xq7 for the hashmap"
              className="h-9 text-sm bg-muted/40 border-border" />
            <p className="text-[11px] text-muted-foreground/60">Injected invisibly into the problem statement via zero-width characters</p>
          </div>

          <div className="space-y-1.5">
            {field('Trap Keywords')}
            <Input value={form.trapKeywords} onChange={e => setForm(f => ({ ...f, trapKeywords: e.target.value }))}
              placeholder="__xq7, __rz9  (comma separated, pattern __xx9)"
              className="h-9 text-sm bg-muted/40 border-border" />
            <p className="text-[11px] text-muted-foreground/60">Pattern: __[2 lowercase letters][1 digit] — e.g. __xq7</p>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('/admin')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 gap-2 min-w-36">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : isEdit ? 'Update Problem' : 'Add to Database'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
