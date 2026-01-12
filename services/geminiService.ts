
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@1.3.0";
import { WeatherData, HistoryEvent, Quote } from "../types";

export const getDailyInsight = async (lat?: number, lon?: number): Promise<{
  weather?: WeatherData;
  quote?: Quote;
  history?: HistoryEvent;
}> => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  
  if (!apiKey) {
    console.warn("API Key가 설정되지 않았습니다.");
    return {};
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const dateStr = new Date().toLocaleDateString();

    const [quoteRes, historyRes] = await Promise.all([
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "오늘을 위한 짧고 영감을 주는 명언 하나를 한국어로 알려줘.",
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
        contents: `오늘(${dateStr}) 역사적으로 중요한 사건 하나를 한국어로 알려줘.`,
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
        contents: `위도 ${lat}, 경도 ${lon} 지역의 현재 날씨 정보를 알려줘.`,
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
        if (wText) weather = JSON.parse(wText);
      } catch (e) { console.error("Weather parse error", e); }
    }

    return {
      quote: quoteRes.text ? JSON.parse(quoteRes.text) : undefined,
      history: historyRes.text ? JSON.parse(historyRes.text) : undefined,
      weather
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {};
  }
};
