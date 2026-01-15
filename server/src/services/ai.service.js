import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const SYSTEM_PROMPT = `You are an expert procurement assistant for BidGrid, an AI-powered RFP (Request for Proposal) management system.

Your job is to help users create complete, detailed RFPs through natural conversation.

## REQUIRED INFORMATION for a complete RFP:
1. **Item/Service Description** - What they need
2. **Quantity** - How many units
3. **Budget Range** - Min/max budget or estimate
4. **Deadline** - When they need it by
5. **Key Specifications** - Technical requirements, brand preferences, etc.

## YOUR BEHAVIOR:
- If the user's request is vague or missing required info, ask specific clarifying questions
- Be conversational, friendly, and professional
- Ask ONE set of questions at a time (2-4 questions max)
- Remember context from previous messages
- When you have ALL required information, respond with a friendly confirmation like:
  "Perfect! I have all the details needed to create your RFP. Your RFP for [brief description] is ready! You can now review it in the preview panel and select vendors to send it to."
  
  Then provide the RFP data as a JSON block (this will be parsed by the system, not shown to users):

\`\`\`json
{
  "isComplete": true,
  "title": "RFP Title Here",
  "description": "Detailed description",
  "requirements": ["Requirement 1", "Requirement 2"],
  "quantity": 100,
  "budget": { "min": 5000, "max": 10000, "currency": "USD" },
  "deadline": "2024-03-01",
  "specs": { "key": "value" }
}
\`\`\`

## IMPORTANT:
- Do NOT generate the JSON until you have all required information
- If user provides everything in one message, you can generate immediately
- The JSON block is for system parsing only - focus on the friendly message above it
- Always be helpful and guide the user through the process`;

class AIService {
  constructor() {
    this.model = null;
  }

  initialize() {
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
      }

      console.log("Initializing Gemini with API key:", apiKey.substring(0, 10) + "...");

      this.model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: apiKey,
        temperature: 0.7,
        maxOutputTokens: 1024,
      });
    }
    return this.model;
  }

  async chat(chatHistory) {
    try {
      const model = this.initialize();

      // Build messages array
      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...chatHistory.map((msg) =>
          msg.role === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        ),
      ];

      // Get response from Gemini
      const response = await model.invoke(messages);
      return response.content;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }

  parseRFPFromResponse(content) {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.isComplete) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse RFP JSON:", e);
      }
    }
    return null;
  }

  // Parse vendor email response to extract proposal details
  async parseVendorResponse(emailContent, rfpDetails) {
    this.initialize();

    const parserPrompt = `You are an expert at extracting proposal information from vendor emails.

The vendor is responding to this RFP:
Title: ${rfpDetails.title}
Description: ${rfpDetails.description}
Requirements: ${JSON.stringify(rfpDetails.requirements || [])}
Budget: ${JSON.stringify(rfpDetails.budget || {})}
Quantity: ${rfpDetails.quantity || "Not specified"}

The vendor's email/document content is below. Extract ALL relevant proposal information.
Handle messy formats: free-form text, tables, bullet points, etc.

VENDOR EMAIL/DOCUMENT:
${emailContent}

---

Extract and return a JSON object with these fields:
{
  "vendorName": "Company name from signature or email",
  "price": {
    "amount": 5000,
    "currency": "USD",
    "breakdown": "Any price breakdown mentioned"
  },
  "timeline": "Delivery timeframe mentioned",
  "deliveryDate": "Specific date if mentioned (YYYY-MM-DD)",
  "terms": ["Array of payment/delivery terms"],
  "conditions": ["Array of conditions or caveats"],
  "warranty": "Warranty info if mentioned",
  "keyPoints": ["Main selling points or highlights"],
  "quotedPrices": ["All price mentions found: '$5,000 per unit', 'Total: $25k'"],
  "completeness": 85,
  "missingInfo": ["What was not addressed from the RFP requirements"],
  "summary": "2-3 sentence summary of this proposal"
}

Return ONLY valid JSON, no other text.`;

    try {
      const response = await this.model.invoke(parserPrompt);
      const content = response.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      console.error("No JSON found in vendor response parsing");
      return null;
    } catch (err) {
      console.error("Error parsing vendor response:", err.message);
      return null;
    }
  }
}

export const aiService = new AIService();

