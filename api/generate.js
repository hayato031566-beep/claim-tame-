export default async function handler(req, res) {
  const { message, type } = req.body;

  // 命令を極限までシンプルにし、AIの「迷い」を消します
  const systemPrompt = `あなたはeBayのプロセラーです。以下のルールで返信を1つずつ作成してください。
  1. 英語: 丁寧かつ毅然とした返信。
  2. 日本語: その要約。
  【重要武器】
  ・詐欺疑い: 警察の相談番号(Consultation Number)を取得しeBay Japanへ報告すると伝える。
  ・証拠: 梱包動画(Packing video)があることを強調。
  ・住所: ポリシー上、注文時以外の住所へは送れない。
  ・関税: 支払いはバイヤーの義務。拒否は未着保証対象外になる。`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n方針: ${type}\nメッセージ: ${message}\n\n出力形式:\nEN: (英文)\nJP: (和訳)` }] }]
    })
  });

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  // 爆速で分割処理
  const reply_en = text.match(/EN:([\s\S]*?)JP:/)?.[1]?.trim() || "Error";
  const reply_jp = text.match(/JP:([\s\S]*)/)?.[1]?.trim() || "Error";

  res.status(200).json({ reply_en, reply_jp });
}{
