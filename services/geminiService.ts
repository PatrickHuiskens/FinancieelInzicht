import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getFinancialAdvice = async (
  context: string,
  userQuestion?: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "Geen API key gevonden. Controleer je instellingen.";

  try {
    const prompt = `
      Je bent een ervaren financieel adviseur in Nederland.
      Gebruik de volgende context (data uit een calculator):
      ${context}

      Vraag van de gebruiker: ${userQuestion || "Geef een korte analyse en 3 praktische tips om mijn situatie te verbeteren."}

      Geef antwoord in het Nederlands. Gebruik markdown voor opmaak. Houd het beknopt en actiegericht.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple responses
      },
    });

    return response.text || "Geen antwoord ontvangen van de AI.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is een fout opgetreden bij het ophalen van advies. Probeer het later opnieuw.";
  }
};
