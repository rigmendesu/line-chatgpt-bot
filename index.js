import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {

    // 🛡 メッセージじゃない or テキストじゃない → スキップ
    if (!event.message || event.message.type !== "text") continue;

    const userMessage = event.message.text;

    try {
      const aiResponse = await axios.post(
        "https://api.openai.com/v1/responses",
        {
          model: "gpt-4o-mini",
          input: userMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const replyText =
        aiResponse.data.output[0].content[0].text;

      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: replyText }],
        },
        {
          headers: {
            Authorization: `Bearer ${LINE_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

    } catch (err) {
      console.error("エラー:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});

// Render対応（PORT環境変数）
app.listen(process.env.PORT || 3000);
