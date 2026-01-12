
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, HistoryEvent, Quote } from "../types";

export const getDailyInsight = async (lat?: number, lon?: number): Promise<{
  weather?: WeatherData;
  quote?: Quote;
  history?: HistoryEvent;
}> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key가 설정되지 않았습니다.");
    return {};
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const dateStr = new Date().toLocaleDateString();

    const [quoteRes, historyRes] = await Promise.all([
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give me one inspiring quote for today in Korean.",
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              author: { type: Type.STRING }
            },
            required: ["text", "author"]
          }
        }
      }),
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `오늘(${dateStr})은 역사적으로 어떤 중요한 일이 있었나요? 한국어로 응답하세요.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.STRING },
              event: { type: Type.STRING },
              description: { type: Type.STRING },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    uri: { type: Type.STRING }
                  },
                  required: ["title", "uri"]
                }
              }
            },
            required: ["year", "event", "description", "sources"]
          }
        }
      })
    ]);

    let weather: WeatherData | undefined;
    if (lat && lon) {
      const weatherRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Current weather at latitude ${lat}, longitude ${lon}.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["temp", "condition", "location", "description"]
          }
        }
      });
      try {
        const wText = weatherRes.text;
        if (wText) {
          weather = JSON.parse(wText);
        }
      } catch (e) { console.error("Weather parse error", e); }
    }

    const qText = quoteRes.text;
    const hText = historyRes.text;

    return {
      quote: qText ? JSON.parse(qText) : undefined,
      history: hText ? JSON.parse(hText) : undefined,
      weather
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {};
  }
};
