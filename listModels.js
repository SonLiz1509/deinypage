require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.list();
    console.log("Modelos disponibles:");
    for await (const model of response) {
      console.log(model.name);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}
run();
