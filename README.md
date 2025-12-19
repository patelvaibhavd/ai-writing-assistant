# ✦ WriteAI - AI Writing Assistant

A Grammarly-like AI Writing Assistant POC built with **Angular 17** and **Node.js/Express**, with **multiple AI provider support** including FREE options!

![WriteAI Demo](https://via.placeholder.com/800x400/1e1e2e/66d9ef?text=WriteAI+-+AI+Writing+Assistant)

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Fix Grammar** | Correct spelling mistakes, grammar errors, and improve sentence structure |
| **Improve Writing** | Make text clearer, more professional with better word choices |
| **Summarize** | Create concise summaries (short/medium/detailed options) |
| **Make Shorter** | Reduce length while preserving original meaning |

## 🤖 AI Providers (Choose One!)

| Provider | Cost | Quality | Setup |
|----------|------|---------|-------|
| **Demo Mode** | 🆓 FREE | Basic | No API key needed |
| **Groq** | 🆓 FREE | ⭐⭐⭐⭐ Excellent | [Get free key](https://console.groq.com) |
| **Google Gemini** | 🆓 FREE tier | ⭐⭐⭐⭐ Excellent | [Get free key](https://aistudio.google.com/apikey) |
| **OpenAI** | 💰 Paid | ⭐⭐⭐⭐⭐ Best | [Get key](https://platform.openai.com/api-keys) |

### 🎯 Recommended: Use Groq (FREE!)

Groq offers incredibly fast AI responses with a generous free tier. Perfect for this POC!

## 🏗️ Tech Stack

- **Frontend**: Angular 17 (Standalone Components)
- **Backend**: Node.js + Express
- **AI**: Multiple providers (Groq, Gemini, OpenAI, or Demo)
- **Styling**: SCSS with custom design system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed

### 1. Clone & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.sample .env

# Edit .env - Choose your provider:
# AI_PROVIDER=demo    # No API key needed (default)
# AI_PROVIDER=groq    # FREE - recommended!
# AI_PROVIDER=gemini  # FREE tier
# AI_PROVIDER=openai  # Paid

# Start the server
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start Angular dev server
npm start
```

Frontend will run on `http://localhost:4200`

## 🔧 Configuration Examples

### Option 1: Demo Mode (No API Key)

```env
AI_PROVIDER=demo
```

Basic text transformations - great for testing the UI!

### Option 2: Groq (FREE - Recommended!)

1. Get free API key at [console.groq.com](https://console.groq.com)
2. Configure:

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
```

### Option 3: Google Gemini (FREE Tier)

1. Get API key at [aistudio.google.com](https://aistudio.google.com/apikey)
2. Configure:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

### Option 4: OpenAI (Paid)

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
```

## 📁 Project Structure

```
ai-writing-assistant/
├── backend/
│   ├── src/
│   │   └── index.js          # Express server with multi-provider AI
│   ├── package.json
│   ├── env.sample            # Environment template
│   └── render.yaml           # Render deployment config
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts      # Main component with UI
│   │   │   └── services/
│   │   │       └── writing.service.ts # API service
│   │   ├── environments/
│   │   ├── styles.scss        # Global styles
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── vercel.json            # Vercel deployment config
│
└── README.md
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with provider info |
| GET | `/api/provider` | Get current AI provider details |
| POST | `/api/grammar` | Fix spelling & grammar |
| POST | `/api/improve` | Improve writing quality |
| POST | `/api/summarize` | Summarize text |
| POST | `/api/shorten` | Make text shorter |

### Request Format

```json
{
  "text": "Your text here",
  "length": "short|medium|detailed"  // Only for /api/summarize
}
```

### Response Format

```json
{
  "original": "Original text",
  "result": "Processed text",
  "provider": "groq"
}
```

## 🚢 Deployment (Free Platforms)

### Backend → Render.com (Free)

1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a **New Web Service**
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `AI_PROVIDER`: `groq` (or your choice)
   - `GROQ_API_KEY`: Your API key (if using Groq)
6. Deploy!

Your backend URL will be: `https://your-app-name.onrender.com`

### Frontend → Vercel (Free)

1. Create account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `dist/ai-writing-assistant/browser`
4. Before deploying, update the API URL in `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-name.onrender.com/api'
};
```

5. Deploy!

### Alternative Free Platforms

| Service | Best For | Free Tier |
|---------|----------|-----------|
| [Railway](https://railway.app) | Full-stack | $5 credit/month |
| [Fly.io](https://fly.io) | Backend | 3 VMs free |
| [Netlify](https://netlify.com) | Frontend | 100GB bandwidth |
| [Cyclic](https://cyclic.sh) | Backend | Generous free tier |

## 💡 Usage Tips

1. **Grammar Fix**: Best for checking emails, messages, documents
2. **Improve Writing**: Use for making content more professional
3. **Summarize**: Great for long articles or documents
4. **Make Shorter**: Ideal for Twitter, headlines, concise communication

## 🔧 Advanced Configuration

### Switching AI Models

Edit `backend/src/index.js` to customize models:

```javascript
// For Groq - other options: 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'
model: 'llama-3.1-8b-instant'

// For OpenAI - other options: 'gpt-4', 'gpt-4-turbo'
model: 'gpt-3.5-turbo'

// For Gemini - other options: 'gemini-1.5-pro'
model: 'gemini-1.5-flash'
```

### Adding New Features

1. Add new system prompt in `SYSTEM_PROMPTS` object
2. Create new API endpoint in `backend/src/index.js`
3. Add method in `frontend/src/app/services/writing.service.ts`
4. Add UI option in `frontend/src/app/app.component.ts`

## 🔒 Security Notes

- Never commit your `.env` file
- Use environment variables for API keys
- Add rate limiting for production use
- Consider adding authentication for public deployment

## 📝 License

MIT License - Feel free to use for your projects!

---

Built with ♥ using Angular, Node.js, and AI (Groq/Gemini/OpenAI)
