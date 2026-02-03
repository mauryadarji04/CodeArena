import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-12">
          <h1 className="text-xl font-bold text-primary">CODEARENA</h1>
          <h2 className="text-base font-medium cursor-pointer" onClick={() => navigate('/dashboard')}>
            Dashboard
          </h2>
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