import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

async function testGemini() {
  console.log("Testing Gemini API...");
  console.log("API Key:", process.env.GEMINI_API_KEY?.substring(0, 15) + "...");
  
  try {
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY?.trim(),
    });

    const response = await model.invoke([new HumanMessage("Say hello in one word")]);
    console.log("Success! Response:", response.content);
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Full error:", error);
  }
}

testGemini();
