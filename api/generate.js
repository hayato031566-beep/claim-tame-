export default async function handler(req, res) {
  const { message, type } = req.body;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `あなたはeBayのプロセラーです。送られたメッセージに対し、方針「${type}」に沿って、丁寧かつ簡潔な英語の返信を作成してください。余計な説明は不要です。返信文のみを出力してください。\n\n受信メッセージ:\n${message}` }]
      }]
    })
  });

  const data = await response.json();
  const reply = data.candidates[0].content.parts[0].text;
  res.status(200).json({ reply });
}
