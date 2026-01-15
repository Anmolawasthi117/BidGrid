import { aiService } from "./ai.service.js";

class VendorRecommendationService {
  // Generate comprehensive comparison and recommendation
  async generateRecommendation(proposals, rfpDetails) {
    if (!proposals || proposals.length === 0) {
      return {
        comparison: null,
        recommendation: null,
        message: "No proposals to compare",
      };
    }

    // Build proposal summaries for AI
    const proposalSummaries = proposals.map((p, index) => ({
      index: index + 1,
      vendorName: p.vendorName || p.vendorEmail,
      vendorEmail: p.vendorEmail,
      price: p.parsedData?.price || p.price,
      timeline: p.parsedData?.timeline || p.timeline,
      completeness: p.parsedData?.completeness || p.completeness || 0,
      terms: p.parsedData?.terms || [],
      conditions: p.parsedData?.conditions || [],
      summary: p.parsedData?.summary || "",
      keyPoints: p.parsedData?.keyPoints || [],
    }));

    const prompt = `You are a procurement expert helping a buyer choose the best vendor.

RFP DETAILS:
Title: ${rfpDetails.title}
Description: ${rfpDetails.description}
Budget: ${JSON.stringify(rfpDetails.budget || {})}
Quantity: ${rfpDetails.quantity || "Not specified"}
Key Requirements: ${JSON.stringify(rfpDetails.requirements || [])}

VENDOR PROPOSALS RECEIVED:
${JSON.stringify(proposalSummaries, null, 2)}

---

Analyze all proposals and provide a comprehensive comparison and recommendation.

Return a JSON object with this structure:
{
  "comparison": {
    "priceRange": { "min": 4500, "max": 7200, "average": 5500 },
    "lowestPrice": { "vendor": "Vendor Name", "amount": 4500 },
    "fastestDelivery": { "vendor": "Vendor Name", "timeline": "1 week" },
    "mostComplete": { "vendor": "Vendor Name", "score": 95 },
    "keyDifferences": ["Price varies by 60%", "Only 2 offer warranty"]
  },
  "scores": [
    {
      "vendorName": "Acme Corp",
      "overallScore": 85,
      "priceScore": 80,
      "timelineScore": 90,
      "completenessScore": 85,
      "pros": ["Competitive price", "Fast delivery"],
      "cons": ["No warranty mentioned"]
    }
  ],
  "recommendation": {
    "winner": "Acme Corp",
    "winnerEmail": "acme@example.com",
    "confidence": "high",
    "reason": "Best combination of price, timeline, and completeness. Offers competitive pricing at $5,000 with 2-week delivery and addresses all key requirements.",
    "secondChoice": "Beta Inc",
    "secondChoiceReason": "Slightly more expensive but offers better warranty terms",
    "risks": ["No penalty clause for late delivery"],
    "negotiationTips": ["Could negotiate 5% discount for upfront payment"]
  },
  "summary": "Received 3 proposals ranging from $4,500 to $7,200. Acme Corp provides the best value with competitive pricing and fast delivery. Consider negotiating warranty terms before final decision."
}

Return ONLY valid JSON, no other text.`;

    try {
      aiService.initialize();
      const response = await aiService.model.invoke(prompt);
      const content = response.content;
      
      // Extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      console.error("No JSON found in recommendation");
      return null;
    } catch (err) {
      console.error("Error generating recommendation:", err.message);
      return null;
    }
  }

  // Quick comparison without full AI analysis
  generateQuickComparison(proposals) {
    if (!proposals || proposals.length === 0) {
      return null;
    }

    const prices = proposals
      .map(p => p.parsedData?.price?.amount || p.price?.amount || 0)
      .filter(p => p > 0);

    const completeness = proposals
      .map(p => p.parsedData?.completeness || p.completeness || 0);

    return {
      totalProposals: proposals.length,
      priceRange: prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
        average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      } : null,
      averageCompleteness: completeness.length > 0 
        ? Math.round(completeness.reduce((a, b) => a + b, 0) / completeness.length)
        : 0,
      lowestPriceVendor: this.findLowestPriceVendor(proposals),
      highestCompletenessVendor: this.findHighestCompletenessVendor(proposals),
    };
  }

  findLowestPriceVendor(proposals) {
    let lowest = null;
    let lowestPrice = Infinity;

    for (const p of proposals) {
      const price = p.parsedData?.price?.amount || p.price?.amount || Infinity;
      if (price < lowestPrice) {
        lowestPrice = price;
        lowest = p.vendorName || p.vendorEmail;
      }
    }

    return lowest ? { vendor: lowest, price: lowestPrice } : null;
  }

  findHighestCompletenessVendor(proposals) {
    let highest = null;
    let highestScore = 0;

    for (const p of proposals) {
      const score = p.parsedData?.completeness || p.completeness || 0;
      if (score > highestScore) {
        highestScore = score;
        highest = p.vendorName || p.vendorEmail;
      }
    }

    return highest ? { vendor: highest, score: highestScore } : null;
  }
}

export const vendorRecommendationService = new VendorRecommendationService();
