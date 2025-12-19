require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Determine which AI provider to use
const AI_PROVIDER = process.env.AI_PROVIDER || 'demo'; // 'openai', 'groq', 'gemini', 'demo'

console.log(`🤖 Using AI Provider: ${AI_PROVIDER.toUpperCase()}`);

// Initialize AI clients based on provider
let openai = null;
let groq = null;

if (AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (AI_PROVIDER === 'groq' && process.env.GROQ_API_KEY) {
  const Groq = require('groq-sdk');
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// System prompts for different operations
const SYSTEM_PROMPTS = {
  grammar: `You are an expert grammar and spelling checker. Your task is to:
- Fix all spelling mistakes
- Correct grammar errors
- Improve sentence structure while maintaining the original meaning
- Return ONLY the corrected text, no explanations
- Preserve the original formatting (paragraphs, line breaks)`,

  improve: `You are a professional writing coach. Your task is to:
- Make the text clearer and more professional
- Use better word choices
- Improve flow and tone
- Maintain the original meaning and intent
- Return ONLY the improved text, no explanations`,

  summarize: `You are an expert summarizer. Your task is to:
- Create a concise summary of the provided text
- Capture all key points and main ideas
- Return a well-structured summary (can use bullet points for longer texts)
- Keep it informative yet brief`,

  shorten: `You are a concise writing expert. Your task is to:
- Reduce the length of the text significantly
- Keep the original meaning intact
- Remove redundancy and unnecessary words
- Make every word count
- Return ONLY the shortened text, no explanations`,
};

// Demo mode responses (simulated AI for testing without API)
function getDemoResponse(text, operation, options = {}) {
  const responses = {
    grammar: () => {
      // Simple demo transformations
      let result = text
        .replace(/\bi\b/g, 'I')
        .replace(/\bdont\b/gi, "don't")
        .replace(/\bcant\b/gi, "can't")
        .replace(/\bwont\b/gi, "won't")
        .replace(/\bim\b/gi, "I'm")
        .replace(/\bive\b/gi, "I've")
        .replace(/\bthier\b/gi, 'their')
        .replace(/\bteh\b/gi, 'the')
        .replace(/\brecieve\b/gi, 'receive')
        .replace(/\boccured\b/gi, 'occurred')
        .replace(/\bseperately\b/gi, 'separately')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Capitalize first letter of sentences
      result = result.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
      return result;
    },
    improve: () => {
      // Add some professional touches (demo simulation)
      let result = text
        .replace(/\bgood\b/gi, 'excellent')
        .replace(/\bbad\b/gi, 'suboptimal')
        .replace(/\bvery\b/gi, 'highly')
        .replace(/\bget\b/gi, 'obtain')
        .replace(/\bbig\b/gi, 'significant')
        .replace(/\bsmall\b/gi, 'minimal')
        .replace(/\bhelp\b/gi, 'assist')
        .replace(/\buse\b/gi, 'utilize')
        .replace(/\bmake\b/gi, 'create')
        .replace(/\bshow\b/gi, 'demonstrate');
      return result;
    },
    summarize: () => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const summaryLength = options.length || 'medium';
      
      let numSentences;
      switch (summaryLength) {
        case 'short': numSentences = Math.min(2, sentences.length); break;
        case 'detailed': numSentences = Math.min(5, sentences.length); break;
        default: numSentences = Math.min(3, sentences.length);
      }
      
      return `Summary:\n${sentences.slice(0, numSentences).join(' ').trim()}`;
    },
    shorten: () => {
      // Remove filler words and redundancy
      let result = text
        .replace(/\b(very|really|actually|basically|literally|just|quite|rather|somewhat)\b/gi, '')
        .replace(/\b(in order to)\b/gi, 'to')
        .replace(/\b(due to the fact that)\b/gi, 'because')
        .replace(/\b(at this point in time)\b/gi, 'now')
        .replace(/\b(in the event that)\b/gi, 'if')
        .replace(/\b(it is important to note that)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return result;
    }
  };

  return responses[operation] ? responses[operation]() : text;
}

// Process with OpenAI
async function processWithOpenAI(text, operation, options = {}) {
  const systemPrompt = SYSTEM_PROMPTS[operation];
  let userPrompt = text;

  if (operation === 'summarize' && options.length) {
    const lengthInstructions = {
      short: 'Keep the summary very brief (2-3 sentences max).',
      medium: 'Provide a moderate-length summary (1 paragraph).',
      detailed: 'Provide a detailed summary with bullet points.',
    };
    userPrompt = `${lengthInstructions[options.length] || ''}\n\nText to summarize:\n${text}`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return completion.choices[0].message.content;
}

// Process with Groq (FREE!)
async function processWithGroq(text, operation, options = {}) {
  const systemPrompt = SYSTEM_PROMPTS[operation];
  let userPrompt = text;

  if (operation === 'summarize' && options.length) {
    const lengthInstructions = {
      short: 'Keep the summary very brief (2-3 sentences max).',
      medium: 'Provide a moderate-length summary (1 paragraph).',
      detailed: 'Provide a detailed summary with bullet points.',
    };
    userPrompt = `${lengthInstructions[options.length] || ''}\n\nText to summarize:\n${text}`;
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant', // Fast and free!
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return completion.choices[0].message.content;
}

// Process with Google Gemini (FREE tier available!)
async function processWithGemini(text, operation, options = {}) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = SYSTEM_PROMPTS[operation];
  let userPrompt = text;

  if (operation === 'summarize' && options.length) {
    const lengthInstructions = {
      short: 'Keep the summary very brief (2-3 sentences max).',
      medium: 'Provide a moderate-length summary (1 paragraph).',
      detailed: 'Provide a detailed summary with bullet points.',
    };
    userPrompt = `${lengthInstructions[options.length] || ''}\n\nText to summarize:\n${text}`;
  }

  const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
  return result.response.text();
}

// Main processing function - routes to appropriate provider
async function processText(text, operation, options = {}) {
  switch (AI_PROVIDER) {
    case 'openai':
      if (!openai) throw new Error('OpenAI API key not configured');
      return processWithOpenAI(text, operation, options);
    
    case 'groq':
      if (!groq) throw new Error('Groq API key not configured');
      return processWithGroq(text, operation, options);
    
    case 'gemini':
      if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key not configured');
      return processWithGemini(text, operation, options);
    
    case 'demo':
    default:
      // Demo mode - no API needed
      return getDemoResponse(text, operation, options);
  }
}

// API Routes

// Health check with provider info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    provider: AI_PROVIDER,
    timestamp: new Date().toISOString() 
  });
});

// Get current provider info
app.get('/api/provider', (req, res) => {
  const providerInfo = {
    openai: { name: 'OpenAI GPT-3.5', free: false, description: 'Premium AI with best quality' },
    groq: { name: 'Groq (Llama 3.1)', free: true, description: 'Fast & free AI powered by Llama' },
    gemini: { name: 'Google Gemini', free: true, description: 'Google AI with free tier' },
    demo: { name: 'Demo Mode', free: true, description: 'Basic transformations (no API needed)' }
  };
  
  res.json({
    current: AI_PROVIDER,
    info: providerInfo[AI_PROVIDER] || providerInfo.demo,
    available: Object.keys(providerInfo)
  });
});

// Fix grammar and spelling
app.post('/api/grammar', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await processText(text, 'grammar');
    res.json({ original: text, result, provider: AI_PROVIDER });
  } catch (error) {
    console.error('Grammar processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process text' });
  }
});

// Improve writing
app.post('/api/improve', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await processText(text, 'improve');
    res.json({ original: text, result, provider: AI_PROVIDER });
  } catch (error) {
    console.error('Improve processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process text' });
  }
});

// Summarize text
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, length = 'medium' } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await processText(text, 'summarize', { length });
    res.json({ original: text, result, length, provider: AI_PROVIDER });
  } catch (error) {
    console.error('Summarize processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process text' });
  }
});

// Make text shorter
app.post('/api/shorten', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await processText(text, 'shorten');
    res.json({ original: text, result, provider: AI_PROVIDER });
  } catch (error) {
    console.error('Shorten processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process text' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Writing Assistant API running on port ${PORT}`);
  console.log(`📡 Provider: ${AI_PROVIDER.toUpperCase()}`);
  if (AI_PROVIDER === 'demo') {
    console.log(`💡 Tip: Set AI_PROVIDER=groq and get a free API key at https://console.groq.com`);
  }
});
