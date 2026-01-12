
import { GoogleGenAI } from "@google/genai";
import { WeatherData, HistoryEvent, Quote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyInsight = async (lat?: number, lon?: number): Promise<{
  weather?: WeatherData;
  quote?: Quote;
  history?: HistoryEvent;
}> => {
  const dateStr = new Date().toLocaleDateString();
  
  // 1. Get Quote (Fast)
  const quoteResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Give me one inspiring quote for today in Korean. Format as JSON: { \"text\": \"...\", \"author\": \"...\" }",
    config: { responseMimeType: "application/json" }
  });
  const quote = JSON.parse(quoteResponse.text || "{}");

  // 2. Get Weather (requires Search)
  let weather: WeatherData | undefined;
  if (lat && lon) {
    const weatherPrompt = `What is the current weather at latitude ${lat}, longitude ${lon}? Provide temperature in Celsius, condition, and location name. Return as JSON: { "temp": number, "condition": "sunny/cloudy/rainy...", "location": "City Name", "description": "short description" }`;
    const weatherResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: weatherPrompt,
      config: { 
        tools: [{ googleSearch: {} }] 
      }
    });
    // Since search grounding response might not be pure JSON, we extract or fallback
    try {
        // Simple extraction logic if model returns text + json
        const match = weatherResponse.text.match(/\{.*\}/s);
        if (match) weather = JSON.parse(match[0]);
    } catch (e) {
        console.error("Failed to parse weather", e);
    }
  }

  // 3. History Today (requires Search)
  let history: HistoryEvent | undefined;
  const historyPrompt = `오늘(${dateStr})은 역사적으로 어떤 중요한 일이 있었나요? 가장 중요한 사건 하나만 알려주세요. 연도와 사건 설명을 포함해 JSON으로 응답하세요: { "year": "연도", "event": "사건명", "description": "간략한 설명" }`;
  const historyResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: historyPrompt,
    config: { 
      tools: [{ googleSearch: {} }] 
    }
  });
  
  try {
    const match = historyResponse.text.match(/\{.*\}/s);
    if (match) {
        history = JSON.parse(match[0]);
        const sources = historyResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        history!.sources = sources.map((c: any) => ({
            title: c.web?.title || "출처",
            uri: c.web?.uri || "#"
        })).filter((s: any) => s.uri !== "#");
    }
  } catch (e) {
    console.error("Failed to parse history", e);
  }

  return { weather, quote, history };
};
