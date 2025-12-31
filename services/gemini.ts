
import { GoogleGenAI } from "@google/genai";

export const askSecurityAI = async (prompt: string, context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Tu es l'Assistant IA de Sécurité pour un concert de grande envergure nommé "Neon Pulse Festival".
    Ta mission est d'aider le personnel de sécurité à :
    1. Interpréter les données de scan (ex: hausse soudaine d'invalidité).
    2. Répondre aux questions sur les protocoles de sécurité du lieu (Accès VIP, objets interdits, procédures d'urgence).
    3. Analyser les comportements suspects rapportés.
    4. Fournir des informations sur le plan de la salle.
    
    Données actuelles du concert :
    - Capacité totale : ${context.totalExpected}
    - Déjà scannés : ${context.scannedCount}
    - Anomalies détectées : ${context.anomalies}
    
    Réponds de manière concise, professionnelle et calme. Langue : Français.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Désolé, je rencontre une difficulté technique pour analyser cette demande.";
  }
};
