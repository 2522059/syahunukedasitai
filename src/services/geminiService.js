const { GoogleGenAI } = require("@google/genai");
const generateTemplateHop = require("./generateHop");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function buildFallbackHop(user) {
  return JSON.stringify(generateTemplateHop(user?.interests || []));
}

function createGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

function parseErrorPayload(err) {
  if (!err?.message) return null;

  try {
    return JSON.parse(err.message);
  } catch (_) {
    return null;
  }
}

function getErrorStatus(err) {
  const payload = parseErrorPayload(err);

  return err?.status || err?.code || payload?.error?.code;
}

function isQuotaError(err) {
  const payload = parseErrorPayload(err);
  const status = getErrorStatus(err);
  const message = err?.message || "";

  return (
    status === 429 ||
    payload?.error?.status === "RESOURCE_EXHAUSTED" ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("Quota exceeded")
  );
}

async function generateHop(user) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEYが未設定のため、テンプレートHopを生成します");
    return buildFallbackHop(user);
  }

  const ai = createGeminiClient();

  const prompt = `
あなたはHoppiというアプリです。

ユーザー情報

興味：
${user.interests.join(",")}

この人に今日挑戦できる
小さな冒険を考えてください。

JSONだけ返してください。

{
"title":"",
"description":"",
"exp":20,
"category":""
}
`;

  // 最大3回リトライ
  for (let i = 0; i < 3; i++) {
    try {

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      return response.text();

    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Geminiのクォータ上限に達したため、テンプレートHopを生成します");
        return buildFallbackHop(user);
      }

      // 最後まで失敗したらエラーを投げる
      if (i === 2) throw err;

      console.log(`Gemini混雑中... ${i + 1}回目のリトライ`);

      // 2秒待つ
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

module.exports = {
  generateHop,
};
