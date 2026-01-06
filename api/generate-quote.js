const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
    });
    
    const prompt = `Generate ONE inspirational quote in EXACTLY this format:
<quote>"Quote text here"
<author>Author Name

Return ONLY this format. No extra text.`;

    const result = await model.generateContent(prompt);
    let text = await result.response.text();
    
    // Clean response
    text = text.replace(/```[a-z]*\n?/g, '').trim();
    
    res.status(200).send(text);
    
  } catch (error) {
    console.error('Quote Error:', error.message);
    res.status(200).send('<quote>"The only way to do great work is to love what you do."\n<author>Steve Jobs');
  }
};
