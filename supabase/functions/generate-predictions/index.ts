import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DataSummary {
  datasetName: string;
  rowCount: number;
  columns: Array<{
    name: string;
    type: string;
    mean?: number;
    min?: number;
    max?: number;
    std?: number;
    skewnessType?: string;
    uniqueCount: number;
  }>;
  correlations?: Array<{
    xColumn: string;
    yColumn: string;
    strength: string;
    value: number;
  }>;
  analysisType: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dataSummary } = await req.json() as { dataSummary: DataSummary };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert data scientist and business analyst. Based on the provided dataset summary and statistics, generate actionable predictions and strategic recommendations.

Your response MUST be valid JSON with this exact structure:
{
  "predictions": [
    {
      "title": "Short prediction title",
      "prediction": "Detailed prediction statement based on data patterns",
      "confidence": "high" | "medium" | "low",
      "timeframe": "short-term" | "medium-term" | "long-term",
      "basedOn": "Which data patterns support this prediction"
    }
  ],
  "recommendations": [
    {
      "title": "Action-oriented recommendation title",
      "description": "Detailed recommendation with specific actions",
      "priority": "critical" | "high" | "medium" | "low",
      "expectedImpact": "Quantified or qualified expected outcome",
      "implementation": "How to implement this recommendation"
    }
  ],
  "riskFactors": [
    {
      "risk": "Identified risk or concern",
      "mitigation": "How to mitigate this risk"
    }
  ],
  "opportunityScore": 1-100,
  "overallOutlook": "Brief overall assessment paragraph"
}

Generate 3-5 predictions, 4-6 recommendations, and 2-3 risk factors. Be specific and data-driven.`;

    const userPrompt = `Analyze this dataset and provide predictions and recommendations:

Dataset: ${dataSummary.datasetName}
Records: ${dataSummary.rowCount}
Analysis Type: ${dataSummary.analysisType}

Columns Summary:
${dataSummary.columns.map(col => `- ${col.name} (${col.type}): ${
  col.type === 'number' 
    ? `Range: ${col.min}-${col.max}, Mean: ${col.mean?.toFixed(2)}, Std: ${col.std?.toFixed(2)}, Distribution: ${col.skewnessType || 'unknown'}`
    : `${col.uniqueCount} unique values`
}`).join('\n')}

${dataSummary.correlations && dataSummary.correlations.length > 0 ? `
Correlations Found:
${dataSummary.correlations.map(c => `- ${c.xColumn} vs ${c.yColumn}: ${c.strength} correlation (r=${c.value.toFixed(3)})`).join('\n')}
` : ''}

Based on these statistics and patterns, provide data-driven predictions and actionable recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsedContent;
    try {
      // Try to extract JSON from markdown code block if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback structure
      parsedContent = {
        predictions: [{
          title: "Analysis in Progress",
          prediction: "The AI generated insights but they couldn't be fully parsed. Raw insight: " + content.slice(0, 500),
          confidence: "medium",
          timeframe: "medium-term",
          basedOn: "Statistical analysis of dataset"
        }],
        recommendations: [{
          title: "Review Raw Data",
          description: "Manually review the dataset patterns for deeper insights",
          priority: "medium",
          expectedImpact: "Better understanding of data quality",
          implementation: "Export data and analyze in detail"
        }],
        riskFactors: [],
        opportunityScore: 50,
        overallOutlook: "Further analysis recommended."
      };
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Prediction generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate predictions" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
