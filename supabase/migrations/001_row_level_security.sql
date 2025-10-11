-- Enable Row Level Security on all tables
ALTER TABLE "Board" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Thread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ban" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read boards" ON "Board";
DROP POLICY IF EXISTS "Public read threads" ON "Thread";
DROP POLICY IF EXISTS "Public read posts" ON "Post";
DROP POLICY IF EXISTS "Service role write boards" ON "Board";
DROP POLICY IF EXISTS "Service role write threads" ON "Thread";
DROP POLICY IF EXISTS "Service role write posts" ON "Post";
DROP POLICY IF EXISTS "Service role only admins" ON "Admin";
DROP POLICY IF EXISTS "Service role only bans" ON "Ban";

-- Public READ access to boards, threads, and posts
CREATE POLICY "Public read boards"
ON "Board" FOR SELECT
USING (true);

CREATE POLICY "Public read threads"
ON "Thread" FOR SELECT
USING (true);

CREATE POLICY "Public read posts"
ON "Post" FOR SELECT
USING (true);

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role write boards"
ON "Board" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role write threads"
ON "Thread" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role write posts"
ON "Post" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Admin and Ban tables - service role only
CREATE POLICY "Service role only admins"
ON "Admin" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role only bans"
ON "Ban" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

