import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {

  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key niet gevonden. Zorg dat VITE_GEMINI_API_KEY in je .env bestand staat.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getFinancialAdvice = async (
  context: string,
  userQuestion?: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "Geen API key gevonden. Controleer je instellingen.";

  try {
    // In de @google/generative-ai SDK gebruik je getGenerativeModel
    const model = client.getGenerativeModel({ 
      model: "gemini-2.0-flash", // Of "gemini-1.5-flash"
    });

    const prompt = `
      Je bent een ervaren financieel adviseur in Nederland.
      Gebruik de volgende context (data uit een calculator):
      ${context}

      Vraag van de gebruiker: ${userQuestion || "Geef een korte analyse en 3 praktische tips om mijn situatie te verbeteren."}

      Geef antwoord in het Nederlands. Gebruik markdown voor opmaak. Houd het beknopt en actiegericht.
    `;

    // De syntax voor het genereren van content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "Geen antwoord ontvangen van de AI.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is een fout opgetreden bij het ophalen van advies. Probeer het later opnieuw.";
  }
};