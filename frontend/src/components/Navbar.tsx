import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, User, ShieldCheck, PlusCircle } from 'lucide-react'

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isAdmin   = localStorage.getItem('userRole') === 'admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const navLink = (label: string, path: string, icon?: React.ReactNode, color = 'text-foreground') => {
    const active = location.pathname === path
    return (
      <h2
        onClick={() => navigate(path)}
        className={`text-base font-medium cursor-pointer flex items-center gap-1.5 transition-colors ${
          active ? 'text-primary' : `${color} hover:text-primary`
        }`}
      >
        {icon}{label}
      </h2>
    )
  }

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-10">
          <h1 className="text-xl font-bold text-primary">CODEARENA</h1>
          {navLink('Dashboard', '/dashboard')}
          {isAdmin && navLink('Admin Panel', '/admin', <ShieldCheck className="w-4 h-4" />, 'text-amber-400')}
          {isAdmin && navLink('Add Question', '/admin/add-question', <PlusCircle className="w-4 h-4" />, 'text-emerald-400')}
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 bg-primary rounded-full cursor-pointer flex items-center justify-center"
            onClick={() => navigate('/profile')}
          >
            <User className="w-4 h-4" />
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}