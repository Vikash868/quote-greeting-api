const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = (req, res) => {
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

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      const { history = [], greetingType = 'morning' } = data;

      if (!process.env.GEMINI_API_KEY) {
        res.status(200).json({ 
          greeting: 'Hello! Have a wonderful day!', 
          greetingType, 
          timestamp: new Date().toISOString()
        });
        return;
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      const historyText = history.length ? `\nAvoid these: ${history.join('; ')}` : '';
      const prompt = `Generate unique ${greetingType} greeting.${historyText} Be creative, 1-2 sentences.`;
      
      genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 1.2 }
      })
        .then(model => model.generateContent(prompt))
        .then(result => result.response.text())
        .then(text => {
          const greeting = text.replace(/^["'`]/, '').replace(/["'`]$/, '').trim();
          res.status(200).json({ greeting, greetingType, timestamp: new Date().toISOString() });
        })
        .catch(error => {
          console.error('Greeting API Error:', error.message);
          res.status(200).json({ 
            greeting: 'Hello! Wishing you a great day!', 
            greetingType, 
            timestamp: new Date().toISOString()
          });
        });
    } catch (error) {
      console.error('JSON Parse Error:', error.message);
      res.status(200).json({ 
        greeting: 'Hello! Have a wonderful day!', 
        greetingType: 'general',
        timestamp: new Date().toISOString()
      });
    }
  });
};
