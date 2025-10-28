# 🔒 MANDATORY SECURITY PROTOCOL

## NEVER DO THIS:
❌ Commit .env files
❌ Commit private keys
❌ Commit any file with "SECRET", "PRIVATE_KEY", "API_KEY" in it
❌ Push sensitive data to GitHub

## ALWAYS DO THIS:
✅ Store keys in `.env` files (already in .gitignore)
✅ Use environment variables in code
✅ Check `git diff` before every commit
✅ Verify `git status` shows no .env files
✅ Review commits for sensitive data before pushing

## When Receiving Credentials:
1. Store ONLY in local `.env` files
2. NEVER add them to git
3. Use them only for deployment/contract interaction
4. Immediately remove if accidentally staged

