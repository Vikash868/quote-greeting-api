const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).status('Method not allowed');
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(200).send('<quote>"Success is not final, failure is not fatal."\n<author>Winston Churchill');
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    .then(model => model.generateContent(`Generate ONE inspirational quote in EXACTLY this format:
<quote>"Quote text here"
<author>Author Name

Return ONLY this format.`))
    .then(result => result.response.text())
    .then(text => {
      const cleanText = text.replace(/```[a-z]*\n?/g, '').trim();
      res.status(200).send(cleanText);
    })
    .catch(error => {
      console.error('Quote API Error:', error.message);
      res.status(200).send('<quote>"The future belongs to those who believe in the beauty of their dreams."\n<author>Eleanor Roosevelt');
    });
};
