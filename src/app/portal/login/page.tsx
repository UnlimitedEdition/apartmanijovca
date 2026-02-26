'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '../../[lang]/components/ui/button'
import { Input } from '../../[lang]/components/ui/input'
import { Label } from '../../[lang]/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../[lang]/components/ui/card'
import { Alert, AlertDescription } from '../../[lang]/components/ui/alert'
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type LoginMode = 'login' | 'forgot-password' | 'signup'

interface FormState {
  isLoading: boolean
  error: string | null
  success: string | null
}

export default function PortalLoginPage() {
  const [mode, setMode] = useState<LoginMode>('login')
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: null,
    success: null
  })
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [bookingNumber, setBookingNumber] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  
  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('')
  
  // Signup form
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  })

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState({ isLoading: true, error: null, success: null })

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: {
          // If remember me is checked, don't set a shorter expiry
          // By default, OTP links expire in 1 hour
          data: {
            booking_number: bookingNumber
          }
        }
      })

      if (error) {
        setFormState({ isLoading: false, error: error.message, success: null })
      } else {
        setFormState({ 
          isLoading: false, 
          error: null, 
          success: 'Check your email for the login link!' 
        })
      }
    } catch {
      setFormState({ 
        isLoading: false, 
        error: 'An unexpected error occurred', 
        success: null 
      })
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState({ isLoading: true, error: null, success: null })

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/portal/auth/callback?next=/portal/settings`
      })

      if (error) {
        setFormState({ isLoading: false, error: error.message, success: null })
      } else {
        setFormState({ 
          isLoading: false, 
          error: null, 
          success: 'Password reset link sent to your email!' 
        })
      }
    } catch {
      setFormState({ 
        isLoading: false, 
        error: 'An unexpected error occurred', 
        success: null 
      })
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState({ isLoading: true, error: null, success: null })

    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: Math.random().toString(36).slice(-12), // Temporary password
        options: {
          data: {
            name: signupData.name,
            phone: signupData.phone,
            country: signupData.country
          }
        }
      })

      if (authError) {
        setFormState({ isLoading: false, error: authError.message, success: null })
        return
      }

      // Then create the guest record
      if (authData.user) {
        const { error: guestError } = await supabase
          .from('guests')
          .insert({
            id: authData.user.id,
            email: signupData.email,
            name: signupData.name,
            phone: signupData.phone || null,
            country: signupData.country || null
          })

        if (guestError && !guestError.message.includes('duplicate')) {
          console.error('Guest creation error:', guestError)
        }
      }

      setFormState({ 
        isLoading: false, 
        error: null, 
        success: 'Account created! Please check your email to verify your account.' 
      })
      
      // Switch to login after successful signup
      setTimeout(() => {
        setMode('login')
        setLoginEmail(signupData.email)
      }, 2000)
      
    } catch {
      setFormState({ 
        isLoading: false, 
        error: 'An unexpected error occurred', 
        success: null 
      })
    }
  }

  const resetForm = () => {
    setFormState({ isLoading: false, error: null, success: null })
  }

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Apartmani Jovča
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Guest Portal
          </p>
        </div>

        {/* Error/Success Messages */}
        {formState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}

        {formState.success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{formState.success}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email and booking number to access your portal
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleMagicLinkLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingNumber">Booking Number</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="bookingNumber"
                      type="text"
                      placeholder="BJ-2024-XXXX"
                      value={bookingNumber}
                      onChange={(e) => setBookingNumber(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Remember me
                  </label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => switchMode('forgot-password')}
                    className="text-sm"
                  >
                    Forgot booking number?
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={formState.isLoading}
                >
                  {formState.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Magic Link'
                  )}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => switchMode('signup')}
                >
                  Create Account
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot-password' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => switchMode('login')}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgotEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={formState.isLoading}
                >
                  {formState.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Sign Up Form */}
        {mode === 'signup' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => switchMode('login')}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Create Account
              </CardTitle>
              <CardDescription>
                Create an account to manage your bookings and reservations
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signupName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signupName"
                      type="text"
                      placeholder="John Doe"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPhone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signupPhone"
                      type="tel"
                      placeholder="+381 60 123 4567"
                      value={signupData.phone}
                      onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupCountry">Country (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signupCountry"
                      type="text"
                      placeholder="Serbia"
                      value={signupData.country}
                      onChange={(e) => setSignupData(prev => ({ ...prev, country: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={formState.isLoading}
                >
                  {formState.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Need help? <a href="/contact" className="text-primary hover:underline">Contact us</a></p>
        </div>
      </div>
    </div>
  )
}
