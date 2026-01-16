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

    // Build simple proposal summaries for AI
    const proposalSummaries = proposals.map((p, index) => {
      const price = p.parsedData?.price?.amount || p.price?.amount || 0;
      return {
        vendor: p.vendorName || p.vendorEmail,
        email: p.vendorEmail,
        price: price,
        timeline: p.parsedData?.timeline || p.timeline || "Not specified",
        completeness: p.parsedData?.completeness || p.completeness || 0,
        summary: p.parsedData?.summary || "",
      };
    });

    console.log("Generating recommendation for proposals:", proposalSummaries);

    const prompt = `You are a procurement expert. Compare these vendor proposals and recommend the best one.

RFP: ${rfpDetails.title || "Purchase Request"}
Budget: ${rfpDetails.budget?.max || "Flexible"}

PROPOSALS:
${proposalSummaries.map((p, i) => `
${i+1}. ${p.vendor}
   - Price: $${p.price || "Not specified"}
   - Timeline: ${p.timeline}
   - Completeness: ${p.completeness}%
   - Summary: ${p.summary}
`).join("\n")}

Return ONLY this JSON (no other text):
{
  "winner": "vendor name",
  "confidence": "high",
  "reason": "explanation why this vendor is best",
  "scores": [{"vendor": "name", "score": 85}],
  "risks": ["risk 1"],
  "summary": "brief overall summary"
}`;

    try {
      aiService.initialize();
      const response = await aiService.model.invoke(prompt);
      let content = response.content;
      
      console.log("AI recommendation response length:", content.length);
      
      // Strip markdown code blocks if present
      content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
      
      // Try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log("Recommendation parsed successfully:", parsed.winner);
          
          // Structure the response properly
          return {
            comparison: this.generateQuickComparison(proposals),
            recommendation: {
              winner: parsed.winner,
              confidence: parsed.confidence || "medium",
              reason: parsed.reason || "Based on overall evaluation",
              risks: parsed.risks || [],
            },
            scores: parsed.scores || [],
            summary: parsed.summary || "Analysis complete",
          };
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr.message);
          console.log("Raw response:", content.substring(0, 500));
        }
      }
      
      // Fallback: generate basic recommendation from data
      console.log("Using fallback recommendation logic");
      return this.generateFallbackRecommendation(proposals);
    } catch (err) {
      console.error("Error generating recommendation:", err.message);
      return this.generateFallbackRecommendation(proposals);
    }
  }

  // Fallback when AI fails
  generateFallbackRecommendation(proposals) {
    const quickComparison = this.generateQuickComparison(proposals);
    const bestVendor = quickComparison?.highestCompletenessVendor?.vendor || 
                       quickComparison?.lowestPriceVendor?.vendor ||
                       proposals[0]?.vendorName;

    return {
      comparison: quickComparison,
      recommendation: {
        winner: bestVendor,
        confidence: "medium",
        reason: "Recommended based on completeness and pricing analysis",
        risks: ["Full AI analysis unavailable - review manually"],
      },
      scores: proposals.map(p => ({
        vendor: p.vendorName || p.vendorEmail,
        score: p.parsedData?.completeness || p.completeness || 50,
      })),
      summary: `${proposals.length} proposals received. ${bestVendor} appears to offer the best value.`,
    };
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
