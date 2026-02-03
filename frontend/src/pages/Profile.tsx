import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Hash, Edit, Shield } from 'lucide-react'
import axios from 'axios'

interface UserData {
  id: string
  name: string
  email: string
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await axios.get('http://localhost:3001/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          setUser(response.data.data.user)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        localStorage.removeItem('token')
        navigate('/login')
      }
    }

    fetchUserProfile()
  }, [navigate])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="font-semibold">{user?.name || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="font-semibold">{user?.email || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{user?.id || 'Loading...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Account Status</span>
                <span className="bg-green-500/20 text-green-600 px-2 py-1 rounded-full text-sm font-medium">Active</span>
              </div>
              <p className="text-sm text-muted-foreground">Your account is verified and active</p>
            </div>
            <Button className="w-full" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button className="w-full" variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}