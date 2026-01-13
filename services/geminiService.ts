
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

    // 1. 명언 및 역사 정보
    const [quoteRes, historyRes] = await Promise.all([
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "오늘을 위한 짧고 영감을 주는 명언 하나를 한국어로 알려줘. JSON 형식으로 text와 author 필드를 포함해줘.",
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

    // 2. 날씨 정보 (좌표 기반 정밀 검색)
    let weather: WeatherData | undefined;
    if (lat && lon) {
      const weatherRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `현재 위도(${lat}), 경도(${lon}) 좌표에 해당하는 한국의 구체적인 동네 이름(예: 서울시 강남구 역삼동)을 먼저 확인하고, 그 지역의 '현재' 날씨(온도, 상태)를 검색해서 알려줘.
        반드시 아래 JSON 형식으로만 답변해줘. 다른 말은 하지 마:
        {"temp": 현재온도숫자만, "condition": "날씨상태(맑음, 흐림 등)", "location": "파악된 구체적인 동네이름", "description": "날씨 한줄 요약"}`,
        config: { 
          tools: [{ googleSearch: {} }]
        }
      });

      try {
        const text = weatherRes.text || "";
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
          weather = JSON.parse(jsonMatch[0]);
          const chunks = weatherRes.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks && weather) {
            weather.sources = chunks
              .filter(chunk => chunk.web)
              .map(chunk => ({
                title: chunk.web?.title || "날씨 정보",
                uri: chunk.web?.uri || ""
              }));
          }
        }
      } catch (e) { 
        console.error("Weather search parse error", e); 
      }
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
