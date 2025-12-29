
import { GoogleGenAI } from "@google/genai";
import { WeatherData, GroundingSource, ForecastDay, HourlyForecast } from "../types";

export const fetchWeatherInfo = async (query: string): Promise<WeatherData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current weather in ${query}? 
      
      IMPORTANT: If coordinates are provided, resolve them to the nearest city name.
      
      First, provide the official city or location name.
      Format exactly as: LOCATION_DATA | [City Name, Region/Country]
      
      Second, provide a detailed natural language summary including temperature, humidity, wind, and sky description. 
      
      Third, provide the current Air Quality Index (AQI) value and its health category.
      Format: AQI_DATA | Value: [number] | Category: [category]
      
      Fourth, provide the next 12 hours of forecast starting from the current hour.
      Format exactly as:
      HOURLY_START
      Time: 10:00 | Temp: 22 | Condition: Sunny
      ... (12 lines)
      HOURLY_END
      
      Fifth, provide a 7-day daily forecast.
      Format exactly as:
      FORECAST_START
      Day: Monday | High: 25 | Low: 15 | Precip: 10% | Wind: 12km/h | Condition: Sunny
      ... (7 days)
      FORECAST_END`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text || "";
    
    // Parse Location Name
    const locationLine = fullText.split('\n').find(line => line.includes('LOCATION_DATA'));
    const parsedLocation = locationLine ? locationLine.split('|')[1]?.trim() : query;

    // Summary - extract intelligently between markers
    let summary = fullText
      .split('LOCATION_DATA')[0] 
      .split('AQI_DATA')[0]
      .split('HOURLY_START')[0]
      .split('FORECAST_START')[0]
      .replace(/LOCATION_DATA\s*\|\s*.*?\n/, '') 
      .trim();
    
    if (!summary) {
      const parts = fullText.split('\n');
      const startIdx = parts.findIndex(p => p.includes('LOCATION_DATA')) + 1;
      const endIdx = parts.findIndex(p => p.includes('AQI_DATA'));
      if (startIdx > 0 && endIdx > startIdx) {
        summary = parts.slice(startIdx, endIdx).join('\n').trim();
      }
    }
    
    // AQI
    let aqi;
    const aqiLine = fullText.split('\n').find(line => line.includes('AQI_DATA'));
    if (aqiLine) {
      const parts = aqiLine.split('|').map(p => p.trim());
      const v = parts.find(p => p.startsWith('Value:'))?.split(':')[1]?.trim();
      const c = parts.find(p => p.startsWith('Category:'))?.split(':')[1]?.trim();
      if (v && c) aqi = { value: parseInt(v) || 0, category: c };
    }

    // Hourly
    const hourly: HourlyForecast[] = [];
    const hourlyMatch = fullText.match(/HOURLY_START([\s\S]*?)HOURLY_END/);
    if (hourlyMatch && hourlyMatch[1]) {
      hourlyMatch[1].trim().split('\n').forEach(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          hourly.push({
            time: parts[0].replace('Time:', '').trim(),
            temp: parseInt(parts[1].replace('Temp:', '').trim()) || 0,
            condition: parts[2].replace('Condition:', '').trim(),
          });
        }
      });
    }

    // Daily Forecast
    const forecast: ForecastDay[] = [];
    const forecastMatch = fullText.match(/FORECAST_START([\s\S]*?)FORECAST_END/);
    if (forecastMatch && forecastMatch[1]) {
      forecastMatch[1].trim().split('\n').forEach(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          forecast.push({
            day: parts[0].replace('Day:', '').trim(),
            high: parseInt(parts[1].replace('High:', '').trim()) || 0,
            low: parseInt(parts[2].replace('Low:', '').trim()) || 0,
            precip: parseInt(parts[3].replace('Precip:', '').replace('%', '').trim()) || 0,
            windSpeed: parseInt(parts[4].replace('Wind:', '').replace('km/h', '').trim()) || 0,
            condition: parts[5].replace('Condition:', '').trim(),
          });
        }
      });
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

    return {
      location: parsedLocation,
      summary: summary || "No summary available.",
      aqi,
      hourly,
      forecast,
      sources,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw new Error("Failed to fetch weather information.");
  }
};

/**
 * Sends a message to the AI assistant with weather context
 */
export const getAIAdvice = async (message: string, context: WeatherData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are SkyInsight AI, a world-class personal weather stylist and lifestyle advisor. 
  Current Location: ${context.location}
  Current Weather Summary: ${context.summary}
  AQI: ${context.aqi?.value} (${context.aqi?.category})
  Forecast: ${JSON.stringify(context.forecast)}

  Guidelines:
  1. Use the specific weather data provided above.
  2. Be conversational, friendly, and expert.
  3. Provide actionable advice (e.g., "Wear a light jacket", "Carry an umbrella", "Good day for a 5k run").
  4. Keep responses concise (max 3 sentences).
  5. If asked something unrelated to weather/lifestyle, politely redirect to weather topics.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    return response.text || "I'm sorry, I couldn't generate advice right now.";
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "The SkyInsight AI is currently unavailable. Please try again in a moment.";
  }
};
