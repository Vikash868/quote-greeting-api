const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST method' });
    return;
  }

  try {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const data = JSON.parse(body || '{}');
      const { history = [], greetingType = 'morning' } = data;
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 1.2,
          maxOutputTokens: 100,
        }
      });
      
      const historyText = history.length ? `\nAVOID these: ${history.join('; ')}` : '';
      const prompt = `Generate unique ${greetingType} greeting.${historyText} Be creative, 1-2 sentences.`;
      
      const result = await model.generateContent(prompt);
      let greeting = await result.response.text();
      greeting = greeting.replace(/^["'`]/, '').replace(/["'`]$/, '').trim();
      
      res.status(200).json({ 
        greeting, 
        greetingType, 
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('Greeting Error:', error.message);
    res.status(200).json({ 
      greeting: 'Hello! Have a wonderful day!',
      greetingType: 'general',
      timestamp: new Date().toISOString()
    });
  }
};
