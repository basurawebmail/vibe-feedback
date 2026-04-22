import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Code } from 'lucide-react'
import { addProject, deleteProject } from './actions'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your websites and widget tokens.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="md:col-span-2 space-y-4">
          {projects && projects.length > 0 ? (
            projects.map(project => (
              <div key={project.id} className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.domain}</p>
                  </div>
                  <form action={async () => {
                    "use server"
                    await deleteProject(project.id)
                  }}>
                    <button type="submit" className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
                
                <div className="bg-secondary/50 rounded-md p-4 text-xs font-mono relative overflow-x-auto border border-border/50">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground font-sans">
                    <Code className="w-4 h-4" />
                    <span>Embed Code</span>
                  </div>
                  <pre className="text-primary-foreground/80">
{`<script 
  src="\${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/widget.js" 
  data-token="\${project.script_token}" 
  defer
></script>`}
                  </pre>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
              <Code className="w-8 h-8 mb-4 opacity-50" />
              <p>No projects yet. Add one to get started.</p>
            </div>
          )}
        </div>

        {/* Add Project Form */}
        <div>
          <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
            <h3 className="font-medium mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </h3>
            <form action={addProject} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Project Name</label>
                <input 
                  id="name"
                  name="name"
                  type="text" 
                  placeholder="e.g. My Awesome Startup"
                  required
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium">Domain</label>
                <input 
                  id="domain"
                  name="domain"
                  type="text" 
                  placeholder="e.g. example.com"
                  required
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
