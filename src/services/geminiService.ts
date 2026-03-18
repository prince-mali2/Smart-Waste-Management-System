import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface RecyclingCenterData {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  acceptedWaste: string[];
  mapsUrl?: string;
}

export const fetchNearbyRecyclingCenters = async (lat: number, lng: number): Promise<RecyclingCenterData[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find real recycling centers near coordinates ${lat}, ${lng}. Return a list of at least 5 centers with their names, addresses, coordinates (lat, lng), and types of waste they accept.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              acceptedWaste: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["name", "address", "lat", "lng", "acceptedWaste"]
          }
        }
      },
    });

    // Extract grounding chunks for maps URLs
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchUrls = groundingChunks
      .filter(chunk => chunk.web?.uri)
      .map(chunk => ({ title: chunk.web?.title, uri: chunk.web?.uri }));

    let centers: any[] = [];
    try {
      centers = JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      return [];
    }

    return centers.map((center, index) => {
      const match = searchUrls.find(m => m.title?.toLowerCase().includes(center.name.toLowerCase()));
      return {
        id: `real-${index}`,
        name: center.name,
        address: center.address,
        lat: center.lat,
        lng: center.lng,
        acceptedWaste: center.acceptedWaste,
        mapsUrl: match?.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`
      };
    });
  } catch (error) {
    console.error("Error fetching recycling centers from Gemini:", error);
    return [];
  }
};
