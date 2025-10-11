-- Seed initial boards and channels
-- Run this in Supabase SQL Editor after creating tables

-- Insert default forum boards
INSERT INTO "Board" (slug, title, about, "isHidden", "createdAt", "updatedAt")
VALUES 
  ('g', 'Technology', 'Technology, programming, and gaming discussion', false, NOW(), NOW()),
  ('biz', 'Business & Finance', 'Crypto, trading, DeFi, and business discussion', false, NOW(), NOW()),
  ('v', 'Video Games', 'Video game discussion and culture', false, NOW(), NOW()),
  ('b', 'Random', 'Random discussion - anything goes (within rules)', false, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert default chat channels
INSERT INTO "Channel" (id, name, slug, description, "isPrivate", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'General', 'general', 'General discussion and welcome area', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Trading', 'trading', 'Crypto trading, tips, and market discussion', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Web3 Dev', 'web3-dev', 'Smart contracts, DApps, and blockchain development', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'NFT Gallery', 'nft-gallery', 'Share and discuss NFTs', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Arcade', 'arcade', 'Gaming, high scores, and challenges', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'VIP Lounge', 'vip', 'Exclusive channel for verified members', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
```

---

**Copy that SQL ☝️, click "New query" in SQL Editor, paste, and click Run!**

After you see "Success", you're completely done with Supabase! ✅

Then we'll redeploy on Vercel! 🚀
