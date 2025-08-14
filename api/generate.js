export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      })
    });

    const data = await response.json();
    res.status(200).json({ output: data.choices?.[0]?.message?.content || "No output." });

  } catch (error) {
    console.error("❌ Error in /api/generate:", error);
    res.status(500).json({ error: 'Newsletter generation failed.' });
  }
}
