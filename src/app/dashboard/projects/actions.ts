'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProject(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const domain = formData.get('domain') as string

  if (!name || !domain) {
    return { error: 'Name and Domain are required' }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('projects').insert({
    name,
    domain,
    user_id: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  return { success: 'Project added successfully' }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  return { success: 'Project deleted' }
}
