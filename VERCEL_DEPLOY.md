# Vercel Deployment Guide for MindGen

This guide walks you through deploying MindGen to Vercel with zero manual infrastructure work.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub account
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] PostgreSQL database URL (from Neon, Supabase, or Railway)
- [ ] Google OAuth credentials (Client ID & Secret)
- [ ] All environment variables ready

---

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `mindgen` (or your preferred name)
3. Keep it **Private** or **Public** (your choice)
4. **Do NOT** initialize with README (we already have one)
5. Click "Create repository"

### 1.2 Push Your Code

\`\`\`bash
cd "/Users/manuthlochana/Documents/Dev/my fucking project folder name"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/mindgen.git

# Push
git branch -M main
git push -u origin main
\`\`\`

---

## Step 2: Import to Vercel

### 2.1 Connect GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Continue with GitHub"
3. Authorize Vercel to access your repositories

### 2.2 Import Repository

1. Find your `mindgen` repository
2. Click "Import"
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `./` (default)
5. **Build Command**: `npm run build` (default)
6. **Output Directory**: `.next` (default)

### 2.3 Configure Environment Variables

Click "Environment Variables" and add **ALL** of these:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | Random secret for NextAuth |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | **Leave blank for now** |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | OAuth Client Secret |
| `GEMINI_API_KEY` | `AIzaSyC0LvGQjXQ4mokDu5RrU2dNPeQtZwV-Mr8` | Provided |
| `QDRANT_URL` | `https://f4cebaaa-6e22-402b-8e78-f7f49f1f85c0.europe-west3-0.gcp.cloud.qdrant.io` | Provided |
| `QDRANT_API_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Provided |

> **Note**: We'll update `NEXTAUTH_URL` after deployment

### 2.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Copy your deployment URL (e.g., `https://mindgen-abc123.vercel.app`)

---

## Step 3: Configure Google OAuth

### 3.1 Update Authorized Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   \`\`\`
   https://your-app.vercel.app/api/auth/callback/google
   \`\`\`
4. Click "Save"

### 3.2 Update NEXTAUTH_URL in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Find `NEXTAUTH_URL`
4. Update value to: `https://your-app.vercel.app`
5. Click "Save"
6. **Redeploy**: Go to "Deployments" → Click "..." → "Redeploy"

---

## Step 4: Initialize Database

### 4.1 Run Prisma Migration

You have two options:

#### Option A: Using Vercel CLI (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.local
npx prisma db push
\`\`\`

#### Option B: Using Local Environment

\`\`\`bash
# Update .env with production DATABASE_URL
DATABASE_URL="your-production-database-url"

# Push schema
npx prisma db push
\`\`\`

---

## Step 5: Verify Deployment

### 5.1 Test Authentication

1. Visit `https://your-app.vercel.app`
2. You should be redirected to `/dashboard`
3. Click "Sign in with Google"
4. Authorize the app
5. You should see the dashboard

### 5.2 Test Mind Map Generation

1. Click "Create New Map"
2. Enter a prompt (e.g., "AI and Machine Learning")
3. Click "Generate"
4. Verify the mind map appears
5. Click "Save"
6. Return to dashboard and verify the map is listed

---

## Troubleshooting

### Build Fails

**Error**: `Module not found: Can't resolve '@/...'`

**Solution**: Verify `tsconfig.json` has correct paths:
\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
\`\`\`

### OAuth Error: "Redirect URI Mismatch"

**Solution**:
1. Check Google Cloud Console redirect URI **exactly** matches
2. Ensure no trailing slash
3. Wait 5 minutes for Google to propagate changes

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check if database allows connections from Vercel IPs
3. For Neon/Supabase: Enable "Pooling" mode

### Prisma Client Not Generated

**Error**: `@prisma/client did not initialize yet`

**Solution**: Add to `package.json`:
\`\`\`json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
\`\`\`

Then redeploy.

### Qdrant Connection Issues

**Error**: `Failed to connect to Qdrant`

**Solution**:
1. Verify `QDRANT_URL` and `QDRANT_API_KEY`
2. Check Qdrant Cloud instance is active
3. Collection is auto-created on first save

---

## Post-Deployment Checklist

- [ ] Authentication works (Google OAuth)
- [ ] Can create new mind maps
- [ ] Mind maps save successfully
- [ ] Dashboard displays saved maps
- [ ] RAG retrieval works (test with multiple maps)
- [ ] Custom domain configured (optional)

---

## Optional: Custom Domain

1. Go to Vercel project → "Settings" → "Domains"
2. Add your domain (e.g., `mindgen.com`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to new domain
5. Update Google OAuth redirect URI

---

## Monitoring & Logs

### View Logs

1. Vercel Dashboard → Your Project → "Logs"
2. Filter by:
   - Build logs
   - Function logs (API routes)
   - Edge logs

### Performance

1. Vercel Dashboard → "Analytics"
2. Monitor:
   - Response times
   - Error rates
   - Traffic

---

## Scaling Considerations

### Database

- **Neon**: Auto-scales, supports branching
- **Supabase**: Upgrade plan for more connections
- **Railway**: Monitor usage, upgrade as needed

### Qdrant

- Current plan supports up to 1M vectors
- Monitor usage in Qdrant Cloud dashboard
- Upgrade if approaching limits

### Vercel

- **Hobby Plan**: 100GB bandwidth/month
- **Pro Plan**: Unlimited bandwidth, better performance
- Monitor usage in Vercel dashboard

---

## Security Best Practices

1. **Rotate Secrets**: Change `NEXTAUTH_SECRET` periodically
2. **API Keys**: Never commit to Git (use `.env`)
3. **Database**: Use connection pooling (PgBouncer)
4. **OAuth**: Restrict to specific domains if needed
5. **Monitoring**: Set up error alerts in Vercel

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review this troubleshooting guide
3. Verify all environment variables
4. Test locally first with `npm run dev`

---

**Deployment Complete! 🎉**

Your MindGen app is now live and ready for users.
