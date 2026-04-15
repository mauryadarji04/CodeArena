import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

interface Problem {
  _id: string
  problemNumber: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
}

const diffColor: Record<string, string> = {
  Easy:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Hard:   'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [problems, setProblems] = useState<Problem[]>([])
  const [search, setSearch]     = useState('')
  const [diffFilter, setDiff]   = useState('All')
  const [tagFilter, setTag]     = useState('All')

  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('userRole')

  useEffect(() => {
    if (role !== 'admin') { navigate('/dashboard'); return }
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/problems`)
    const data = await res.json()
    if (data.success) setProblems(data.problems)
  }

  const allTags = useMemo(() => {
    const s = new Set<string>()
    problems.forEach(p => p.tags?.forEach(t => s.add(t)))
    return ['All', ...Array.from(s).sort()]
  }, [problems])

  const filtered = useMemo(() => problems.filter(p => {
    const q = search.toLowerCase()
    return (
      (p.title.toLowerCase().includes(q) || String(p.problemNumber).includes(q)) &&
      (diffFilter === 'All' || p.difficulty === diffFilter) &&
      (tagFilter  === 'All' || p.tags?.includes(tagFilter))
    )
  }), [problems, search, diffFilter, tagFilter])

  const stats = useMemo(() => ({
    total:  problems.length,
    easy:   problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard:   problems.filter(p => p.difficulty === 'Hard').length,
  }), [problems])

  const openAdd  = () => navigate('/admin/add-question')
  const openEdit = (id: string) => navigate(`/admin/edit-question/${id}`)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setProblems(prev => prev.filter(p => p._id !== id))
  }

  return (
    <div className="p-6 min-h-screen bg-background">

      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all problems</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',  value: stats.total,  cls: 'text-foreground' },
          { label: 'Easy',   value: stats.easy,   cls: 'text-emerald-400' },
          { label: 'Medium', value: stats.medium, cls: 'text-amber-400' },
          { label: 'Hard',   value: stats.hard,   cls: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or #…"
            className="pl-9 h-9 text-sm bg-muted/40 border-border" />
        </div>
        <select value={diffFilter} onChange={e => setDiff(e.target.value)}
          className="bg-muted/40 border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          {['All','Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={tagFilter} onChange={e => setTag(e.target.value)}
          className="bg-muted/40 border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
          {allTags.map(t => <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>)}
        </select>
      </div>

      {/* table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Difficulty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No problems found</td></tr>
              ) : filtered.map((p, idx) => (
                <motion.tr key={p._id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{p.problemNumber}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                  <td className="px-4 py-3">
                    <Badge className={`border text-xs font-semibold px-2.5 py-0.5 rounded-full ${diffColor[p.difficulty]}`}>
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.tags?.slice(0, 3).map((t, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground/70 bg-muted/30 px-1.5 py-0.5 rounded border border-border/40">{t}</span>
                      ))}
                      {p.tags?.length > 3 && <span className="text-[10px] text-muted-foreground/50">+{p.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openEdit(p._id)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-rose-400" onClick={() => handleDelete(p._id, p.title)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
