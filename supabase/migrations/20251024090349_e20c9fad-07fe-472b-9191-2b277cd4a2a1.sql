-- Insert default Board for forum
INSERT INTO "Board" (id, slug, title, about, "isHidden", "createdAt", "updatedAt")
VALUES (1, 'general', 'General Discussion', 'General chat and discussion', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;