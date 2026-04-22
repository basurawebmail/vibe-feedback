-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  script_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create feedbacks table
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'bug', 'nps')),
  message TEXT NOT NULL,
  screenshot_url TEXT,
  annotated_image_url TEXT,
  email TEXT,
  metadata JSONB,
  gemini_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for feedbacks
-- Owners can read their projects' feedbacks
CREATE POLICY "Users can view feedbacks of their projects" ON feedbacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = feedbacks.project_id AND projects.user_id = auth.uid()
    )
  );
-- Deleting feedbacks
CREATE POLICY "Users can delete feedbacks of their projects" ON feedbacks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = feedbacks.project_id AND projects.user_id = auth.uid()
    )
  );
-- Updates allowed for owners (if they want to mark as resolved, etc)
CREATE POLICY "Users can update feedbacks of their projects" ON feedbacks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = feedbacks.project_id AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Triggers or Functions if needed
-- A function to automatically create a free subscription on user signup could be useful, but can also be handled on app level or webhook.
