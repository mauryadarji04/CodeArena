import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

type Step = 'email' | 'otp' | 'password'

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email')
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:3001/api/send-otp', {
        email: formData.email
      })
      setStep('otp')
    } catch (error) {
      console.error('Error sending OTP:', error)
      alert('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:3001/api/verify-otp', {
        email: formData.email,
        otp: formData.otp
      })
      setStep('password')
    } catch (error) {
      console.error('Error verifying OTP:', error)
      alert('Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await axios.post('http://localhost:3001/api/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      })
      alert('Password reset successfully')
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = () => {
    switch (step) {
      case 'email': return <Mail className="h-8 w-8 text-blue-400" />
      case 'otp': return <KeyRound className="h-8 w-8 text-yellow-400" />
      case 'password': return <Lock className="h-8 w-8 text-green-400" />
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Reset Password'
      case 'otp': return 'Verify Code'
      case 'password': return 'New Password'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            {getStepIcon()}
            <CardTitle className="text-3xl font-bold ml-3">{getStepTitle()}</CardTitle>
          </div>
          <CardDescription>
            {step === 'email' && 'Enter your email to receive a verification code'}
            {step === 'otp' && 'Enter the 6-digit code sent to your email'}
            {step === 'password' && 'Create a new secure password'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending code...' : 'Send verification code'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify code'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('email')}
              >
                Back to email
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset password'}
              </Button>
            </form>
          )}

          <div className="text-center text-sm">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}