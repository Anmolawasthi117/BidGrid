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
        model: "gemini-2.5-flash-lite",  // Use 1.5-flash for free tier
        apiKey: apiKey,
        temperature: 0.3,
        maxOutputTokens: 4096,
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

    // Truncate very long emails to avoid token limits
    const maxLength = 8000;
    const truncatedContent = emailContent.length > maxLength 
      ? emailContent.substring(0, maxLength) + "... [truncated]"
      : emailContent;

    console.log(`Parsing vendor response (${truncatedContent.length} chars)`);

    const parserPrompt = `You are an expert at extracting proposal information from vendor emails and documents.

CONTEXT - The vendor is responding to this RFP:
- Title: ${rfpDetails.title || "Not specified"}
- Description: ${rfpDetails.description || "Not specified"}
- Budget: ${JSON.stringify(rfpDetails.budget || {})}
- Quantity: ${rfpDetails.quantity || "Not specified"}

VENDOR'S EMAIL/DOCUMENT CONTENT:
"""
${truncatedContent}
"""

TASK: Extract the proposal information from the vendor's response above.

Your response must be ONLY a valid JSON object with this exact structure (use null for missing values):
{
  "vendorName": "company name or sender name",
  "price": {
    "amount": 0,
    "currency": "USD",
    "breakdown": "price details if any"
  },
  "timeline": "delivery timeframe",
  "deliveryDate": "YYYY-MM-DD or null",
  "terms": ["payment term 1", "payment term 2"],
  "conditions": ["condition 1", "condition 2"],
  "warranty": "warranty info or null",
  "keyPoints": ["highlight 1", "highlight 2"],
  "quotedPrices": ["$X for Y", "Total: $Z"],
  "completeness": 50,
  "missingInfo": ["missing item 1"],
  "summary": "Brief 1-2 sentence summary of this proposal"
}

IMPORTANT:
- Return ONLY the JSON object, nothing else
- Use 0 for price.amount if no price is mentioned
- Use an empty array [] if no items found for array fields
- Estimate completeness as a score from 0-100
- Extract ANY price mentions you find`;

    try {
      const response = await this.model.invoke(parserPrompt);
      let content = response.content;
      
      console.log("AI Response received, length:", content.length);
      
      // Strip markdown code blocks if present
      content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
      
      // Try to extract JSON from response
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log("Successfully parsed vendor response:", parsed.vendorName, "Price:", parsed.price?.amount);
          return parsed;
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr.message);
          console.log("Raw content:", content.substring(0, 500));
        }
      }
      
      console.error("No valid JSON found in AI response");
      console.log("Response preview:", content.substring(0, 300));
      
      // Return default structure if parsing fails
      return {
        vendorName: "Unknown",
        price: { amount: 0, currency: "USD", breakdown: "" },
        timeline: "Not specified",
        deliveryDate: null,
        terms: [],
        conditions: [],
        warranty: null,
        keyPoints: [],
        quotedPrices: [],
        completeness: 0,
        missingInfo: ["Could not parse response"],
        summary: "Failed to extract proposal details from email"
      };
    } catch (err) {
      console.error("Error parsing vendor response:", err.message);
      return {
        vendorName: "Unknown",
        price: { amount: 0, currency: "USD" },
        timeline: "Not specified",
        completeness: 0,
        summary: "Error occurred during parsing"
      };
    }
  }
}

export const aiService = new AIService();


