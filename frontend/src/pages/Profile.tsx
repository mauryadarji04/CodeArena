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
  username?: string
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
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
          setUsername(response.data.data.user.username || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        localStorage.removeItem('token')
        navigate('/login')
      }
    }

    fetchUserProfile()
  }, [navigate])

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      alert('Username cannot be empty')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        'http://localhost:3001/api/profile',
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        setUser(response.data.data.user)
        localStorage.setItem('userId', response.data.data.user._id)
        setIsEditing(false)
        alert('Username updated successfully!')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update username')
    } finally {
      setLoading(false)
    }
  }

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
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-background border border-border rounded px-2 py-1 mt-1"
                    placeholder="Enter username"
                  />
                ) : (
                  <p className="font-semibold">{user?.username || 'Not set'}</p>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleUpdateUsername} disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={() => { setIsEditing(false); setUsername(user?.username || ''); }} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
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
            <Button className="w-full" variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
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