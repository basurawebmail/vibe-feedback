'use client'

import { useState } from 'react'
import { login } from './actions'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData()
    formData.append('email', email)

    const result = await login(formData)

    if (result.error) {
      setStatus('error')
      setMessage(result.error)
    } else if (result.success) {
      setStatus('success')
      setMessage(result.success)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-primary mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 bg-primary-foreground rounded-sm" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome to VibeFeedback</h2>
          <p className="text-sm text-muted-foreground mt-2">Enter your email to sign in or create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border p-6 rounded-lg shadow-sm">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-[0_0_15px_rgba(74,225,118,0.2)]"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {status === 'success' ? 'Link Sent' : 'Send Magic Link'}
          </button>

          {status === 'success' && (
            <div className="p-3 text-sm rounded-md bg-primary/10 text-primary border border-primary/20">
              {message}
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
