export default async function handler(req, res) {
  const { message, type } = req.body;

  // 指示通り、命令（システムプロンプト）は一切変更していません
  const systemPrompt = `あなたはeBayのプロセラーです。以下のルールで返信を1つずつ作成してください。
  1. 英語: 丁寧かつ毅然とした返信。
  2. 日本語: その要約。
  【重要武器】
  ・詐欺疑い: 警察の相談番号(Consultation Number)を取得しeBay Japanへ報告すると伝える。
  ・証拠: 梱包動画(Packing video)があることを強調。
  ・住所: ポリシー上、注文時以外の住所へは送れない。
  ・関税: 支払いはバイヤーの義務。拒否は未着保証対象外になる。`;

  // 【修正箇所】モデルを 1.5-flash から 3-flash にアップグレードしました
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n方針: ${type}\nメッセージ: ${message}\n\n出力形式:\nEN: (英文)\nJP: (和訳)` }] }]
    })
  });

  const data = await response.json();
  
  // 念のため、データが取れなかった時のエラー回避処理
  if (!data.candidates || !data.candidates[0]) {
    return res.status(500).json({ error: "AIからの返答が得られませんでした。" });
  }

  const text = data.candidates[0].content.parts[0].text;

  // 爆速で分割処理（昨日と同じロジックを維持）
  const reply_en = text.match(/EN:([\s\S]*?)JP:/)?.[1]?.trim() || "Error";
  const reply_jp = text.match(/JP:([\s\S]*)/)?.[1]?.trim() || "Error";

  res.status(200).json({ reply_en, reply_jp });
}
