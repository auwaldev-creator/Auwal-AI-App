require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const FormData = require('form-data'); // Muna buƙatar wannan don DeepAI
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys (Zamu sa su a Vercel)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY;

// Middlewares
app.use(cors());
app.use(express.json());
// Yi serving ɗin static files daga 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ========== API ROUTES ==========

// 1. Hanyar Chat (Gemini AI)
app.post('/api/chat', async (req, res) => {
  const { prompt, history } = req.body;
  console.log('An karɓi buƙatar chat:', prompt);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

  const requestData = {
    contents: [
      ...history,
      { role: "user", parts: [{ text: prompt }] }
    ],
    generationConfig: { temperature: 1, topK: 64, topP: 0.95 }
  };

  try {
    const response = await axios.post(API_URL, requestData);
    const text = response.data.candidates[0].content.parts[0].text;
    console.log('An samu amsa daga Gemini.');
    res.json({ text });
  } catch (error) {
    console.error('Kuskure a Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Kuskure wajen kiran Gemini API' });
  }
});

// 2. Hanyar Hoto (DeepAI)
app.post('/api/image', async (req, res) => {
  const { prompt } = req.body;
  console.log('An karɓi buƙatar hoto:', prompt);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const API_URL = 'https://api.deepai.org/api/text2img';
  
  // DeepAI yana buƙatar 'form-data'
  const form = new FormData();
  form.append('text', prompt);

  try {
    const response = await axios.post(API_URL, form, {
      headers: {
        'api-key': DEEPAI_API_KEY,
        ...form.getHeaders()
      },
    });

    // DeepAI yana dawo da URL na hoton
    const imageUrl = response.data.output_url;
    console.log('An samu amsa daga DeepAI:', imageUrl);
    res.json({ imageUrl }); // A dawo da URL ɗin

  } catch (error) {
    console.error('Kuskure a DeepAI API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Kuskure wajen kiran DeepAI API' });
  }
});

// Wannan don Vercel ya gane shi
module.exports = app;
