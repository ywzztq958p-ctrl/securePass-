
import { GoogleGenAI } from "@google/genai";

export const askSecurityAI = async (prompt: string, context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const occupancyRate = ((context.scannedCount / context.totalExpected) * 100).toFixed(1);
  const recentAnomalies = context.recentScans?.filter((s: any) => s.status !== 'success').length || 0;
  
  const systemInstruction = `
    Tu es "COMMANDER-1", l'Expert Tactique IA du Neon Pulse Festival.
    
    PARAMÈTRES RÉELS :
    - Événement : ${context.eventName || 'Neon Pulse'}
    - Occupation : ${occupancyRate}% (Seuil critique : 85%)
    - Taux d'Anomalie : ${recentAnomalies}/20 derniers scans.
    
    PROTOCOLES PRIORITAIRES :
    1. Si occupation > 90% : Recommande la fermeture immédiate des accès secondaires.
    2. Si anomalies > 5/20 : Alerte fraude massive, vérification manuelle des IDs.
    3. Triage Médical : Malaise = PLS + Canal Médical 2. Inconscience = Défibrillateur + SAMU.
    4. Incendie : Évacuation Zone Sud, Extincteurs Poudre (A/B/C).
    
    DIRECTIVES DE RÉPONSE :
    - Réponds avec l'autorité d'un chef de sécurité.
    - Utilise des termes comme "Affirmatif", "Négatif", "Reçu", "Terminé".
    - Ne dépasse jamais 3 phrases courtes. 
    - En cas d'urgence absolue, commence par "ALERTE NIVEAU ROUGE".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.25,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "LIEN SATELLITE INTERROMPU. APPLIQUEZ LES PROTOCOLES STANDARDS. REÇU ?";
  }
};
