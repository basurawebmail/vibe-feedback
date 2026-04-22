'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Set this to false if you do not want the user to be automatically signed up
      shouldCreateUser: true,
      emailRedirectTo: \`\${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm\`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Check your email for the login link!' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
