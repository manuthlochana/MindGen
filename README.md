# MindGen - AI-Powered Mind Map Generator

A production-ready SaaS application that uses **Retrieval Augmented Generation (RAG)** to create intelligent, contextual mind maps. Built with Next.js 14, TypeScript, and Google Gemini AI.

## 🎯 Features

- **RAG-Powered Generation**: Uses Qdrant vector database to retrieve context from previous maps
- **Real-time Mind Mapping**: Interactive canvas powered by React Flow
- **Secure Authentication**: Google OAuth via NextAuth.js v5
- **Persistent Storage**: PostgreSQL with Prisma ORM
- **AI Memory**: Continuous learning from user's mind map history
- **Serverless Architecture**: Optimized for Vercel deployment

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | PostgreSQL + Prisma ORM |
| Vector DB | Qdrant Cloud |
| AI | Google Gemini API |
| Auth | NextAuth.js v5 |
| Canvas | React Flow + Zustand |
| Deployment | Vercel |

## 📋 Prerequisites

Before deployment, you need:

1. **PostgreSQL Database** (e.g., Neon, Supabase, Railway)
2. **Google OAuth Credentials** ([Google Cloud Console](https://console.cloud.google.com))
3. **Gemini API Key** (Provided in .env)
4. **Qdrant Cloud Instance** (Provided in .env)

## 🚀 Quick Start

### 1. Clone & Install

\`\`\`bash
cd "my fucking project folder name"
npm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

**Required Variables:**

\`\`\`env
# Database (Get from your PostgreSQL provider)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth (Generate secret: openssl rand -base64 32)
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"  # Change to Vercel URL in production

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# AI Services (Already provided)
GEMINI_API_KEY="AIzaSyC0LvGQjXQ4mokDu5RrU2dNPeQtZwV-Mr8"
QDRANT_URL="https://f4cebaaa-6e22-402b-8e78-f7f49f1f85c0.europe-west3-0.gcp.cloud.qdrant.io"
QDRANT_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.vy__15zim9OPy9OOqf0nBLWEM-48m823kWZcHYlGiTs"
\`\`\`

### 3. Setup Database

\`\`\`bash
npx prisma db push
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment to Vercel

### Step 1: Push to GitHub

\`\`\`bash
git remote add origin https://github.com/yourusername/mindgen.git
git push -u origin main
\`\`\`

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables (copy from `.env`)

### Step 3: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add Authorized Redirect URI:
   \`\`\`
   https://your-app.vercel.app/api/auth/callback/google
   \`\`\`
3. Update `NEXTAUTH_URL` in Vercel environment variables:
   \`\`\`
   NEXTAUTH_URL=https://your-app.vercel.app
   \`\`\`

### Step 4: Deploy

Click "Deploy" - Vercel will automatically:
- Install dependencies
- Build the Next.js app
- Deploy to production

## 🏗️ Project Structure

\`\`\`
my fucking project folder name/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── generate-map/        # RAG generation endpoint
│   │   │   └── save-map/            # Save & sync endpoint
│   │   ├── dashboard/         # User dashboard
│   │   ├── map/[id]/          # Mind map canvas
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── MapCanvas.tsx      # React Flow canvas
│   │   ├── Providers.tsx      # Session provider
│   │   └── ui/                # Shadcn components
│   ├── lib/
│   │   ├── prisma.ts          # Database client
│   │   ├── gemini.ts          # AI client
│   │   └── qdrant.ts          # Vector DB client
│   ├── store/
│   │   └── useStore.ts        # Zustand state
│   └── auth.ts                # NextAuth config
└── .env                       # Environment variables
\`\`\`

## 🔄 How RAG Works

1. **User Input**: User enters a prompt in the canvas
2. **Embedding**: Gemini generates vector embedding of the prompt
3. **Retrieval**: Qdrant searches for similar previous maps (filtered by user ID)
4. **Context Construction**: Retrieved context is combined with new prompt
5. **Generation**: Gemini generates React Flow JSON with context
6. **Rendering**: MapCanvas displays the generated mind map
7. **Save & Sync**: Map saved to PostgreSQL, embedding synced to Qdrant

## 🔐 Security Features

- ✅ Protected API routes with NextAuth
- ✅ User-scoped data isolation
- ✅ Secure OAuth flow
- ✅ Environment variable validation
- ✅ Serverless execution

## 📝 API Endpoints

### `POST /api/generate-map`
Generate mind map using RAG
- **Auth**: Required
- **Body**: `{ prompt: string }`
- **Returns**: React Flow JSON

### `POST /api/save-map`
Save map and sync to Qdrant
- **Auth**: Required
- **Body**: `{ id?: string, mapData: object, concept: string }`
- **Returns**: `{ success: boolean, id: string }`

## 🎨 UI Components

Built with **Shadcn UI** for a premium, modern design:
- Button
- Input
- React Flow Canvas
- MiniMap
- Controls

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Run `npx prisma db push` to sync schema

### OAuth Errors
- Ensure redirect URI matches exactly
- Check `NEXTAUTH_URL` is set correctly
- Verify Google OAuth credentials

### Qdrant Connection
- Confirm `QDRANT_URL` and `QDRANT_API_KEY` are correct
- Collection "mindmaps" is auto-created on first save

## 📄 License

MIT

## 🙏 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js, Gemini AI, and Qdrant**
