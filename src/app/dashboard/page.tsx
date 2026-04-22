import { 
  Plus, 
  Search, 
  Filter,
  MessageSquare,
  Bug,
  HelpCircle,
  MoreVertical
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Fetch user projects to get their IDs for the feedbacks query
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id);

  const projectIds = projects?.map(p => p.id) || [];

  // Fetch feedbacks for user's projects
  let feedbacks: any[] = [];
  if (projectIds.length > 0) {
    const { data: projectFeedbacks } = await supabase
      .from("feedbacks")
      .select("*, projects(name)")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });
    
    if (projectFeedbacks) {
      feedbacks = projectFeedbacks;
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return <Bug className="w-4 h-4 text-destructive" />;
      case "feedback": return <MessageSquare className="w-4 h-4 text-primary" />;
      default: return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch(priority?.toLowerCase()) {
      case "alta": 
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "media": 
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  }

  // Calculate metrics
  const totalFeedback = feedbacks.length;
  const openBugs = feedbacks.filter(f => f.type === 'bug').length;
  // This is simplified. In a real app, you might parse gemini_summary for sentiment or store it separately
  const avgSentiment = "Positive"; 

  return (
    <>
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background shrink-0">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search feedback..." 
              className="pl-9 pr-4 py-1.5 text-sm bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
          </div>
          <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-1.5 rounded-md text-sm font-medium flex items-center border border-border">
            Upgrade to Starter
          </button>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 rounded-md text-sm font-medium flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Feedback</h3>
            <p className="text-3xl font-semibold">{totalFeedback}</p>
            <p className="text-xs text-primary mt-2 flex items-center">All time</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Open Bugs</h3>
            <p className="text-3xl font-semibold">{openBugs}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">Require attention</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg Sentiment</h3>
            <p className="text-3xl font-semibold">{avgSentiment}</p>
            <p className="text-xs text-muted-foreground mt-2">Based on AI summaries</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
            <h2 className="font-medium">Recent Activity</h2>
            <button className="text-sm flex items-center text-muted-foreground hover:text-foreground">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/20">
                <tr>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">AI Summary</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {feedbacks.length > 0 ? (
                  feedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-secondary/40 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getTypeIcon(fb.type)}
                          <span className="ml-2 capitalize text-muted-foreground">{fb.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-muted-foreground">{fb.projects?.name}</td>
                      <td className="px-6 py-4 font-medium">{fb.email || 'Anonymous'}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-md truncate">
                        {fb.gemini_summary?.summary || fb.message}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(fb.gemini_summary?.priority || 'Medium')}`}>
                          {fb.gemini_summary?.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No feedback yet. Ensure your widget is installed!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </>
  );
}
