export default async function handler(req, res) {
  const { message, type } = req.body;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'あなたはeBayのプロセラーです。送られたメッセージに対し、指定された方針で、丁寧かつ簡潔な英語の返信を作成してください。' },
        { role: 'user', content: `方針: ${type}\n\n受信メッセージ:\n${message}` }
      ]
    })
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;
  res.status(200).json({ reply });
}
