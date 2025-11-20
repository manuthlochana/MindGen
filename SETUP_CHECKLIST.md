# MindGen Setup Checklist

Use this checklist to ensure everything is configured before deployment.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] PostgreSQL database created (Neon/Supabase/Railway)
- [ ] `DATABASE_URL` copied and ready
- [ ] Database accessible from external connections

### 2. Google OAuth Setup
- [ ] Google Cloud Project created
- [ ] OAuth 2.0 Client ID created
- [ ] `GOOGLE_CLIENT_ID` copied
- [ ] `GOOGLE_CLIENT_SECRET` copied
- [ ] Authorized redirect URIs configured:
  - [ ] `http://localhost:3000/api/auth/callback/google` (for local dev)
  - [ ] `https://your-app.vercel.app/api/auth/callback/google` (for production)

### 3. Environment Variables
- [ ] `.env` file created (copy from `.env.example`)
- [ ] All variables filled in:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
  - [ ] `NEXTAUTH_URL` (set to deployment URL)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GEMINI_API_KEY` (already provided)
  - [ ] `QDRANT_URL` (already provided)
  - [ ] `QDRANT_API_KEY` (already provided)

### 4. Local Testing
- [ ] Dependencies installed: `npm install`
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Database schema pushed: `npx prisma db push`
- [ ] Dev server runs: `npm run dev`
- [ ] Can sign in with Google
- [ ] Can create mind maps
- [ ] Maps save successfully

### 5. GitHub Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Repository is accessible (public or private with Vercel access)

### 6. Vercel Setup
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported
- [ ] All environment variables added to Vercel
- [ ] First deployment successful

### 7. Post-Deployment
- [ ] Production URL obtained
- [ ] `NEXTAUTH_URL` updated in Vercel
- [ ] Google OAuth redirect URI updated
- [ ] Redeployed after environment variable changes
- [ ] Production authentication tested
- [ ] Production mind map creation tested

---

## 🔧 Quick Commands Reference

### Local Development
\`\`\`bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Run dev server
npm run dev

# Build for production (test)
npm run build
\`\`\`

### Git Commands
\`\`\`bash
# Initialize (already done)
git init

# Add all files
git add .

# Commit
git commit -m "Your message"

# Add remote
git remote add origin https://github.com/username/repo.git

# Push
git push -u origin main
\`\`\`

### Vercel CLI (Optional)
\`\`\`bash
# Install
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Deploy
vercel --prod
\`\`\`

---

## 🚨 Common Issues & Solutions

### Issue: "Module not found: @prisma/client"
**Solution**: Run `npx prisma generate`

### Issue: "Invalid `prisma.user.findMany()` invocation"
**Solution**: Run `npx prisma db push` to sync schema

### Issue: "OAuth redirect_uri_mismatch"
**Solution**: 
1. Check Google Cloud Console redirect URI
2. Ensure exact match (no trailing slash)
3. Wait 5 minutes for changes to propagate

### Issue: "NEXTAUTH_URL is not set"
**Solution**: Add `NEXTAUTH_URL` to `.env` or Vercel environment variables

### Issue: Build fails on Vercel
**Solution**: 
1. Check build logs
2. Ensure `postinstall` script exists in `package.json`
3. Verify all dependencies are in `package.json`

---

## 📊 Environment Variables Summary

| Variable | Where to Get | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL provider | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | `abc123...` |
| `NEXTAUTH_URL` | Your deployment URL | `https://app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | `GOCSPX-...` |
| `GEMINI_API_KEY` | **Provided** | `AIzaSyC0Lv...` |
| `QDRANT_URL` | **Provided** | `https://f4cebaaa...` |
| `QDRANT_API_KEY` | **Provided** | `eyJhbGciOi...` |

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth Docs**: https://authjs.dev
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs
- **Qdrant Docs**: https://qdrant.tech/documentation
- **Gemini API Docs**: https://ai.google.dev/docs

---

**Ready to deploy? Follow the [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) guide!**
