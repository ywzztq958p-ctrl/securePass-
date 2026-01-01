
import { GoogleGenAI } from "@google/genai";

export const askSecurityAI = async (prompt: string, context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const occupancyRate = ((context.scannedCount / context.totalExpected) * 100).toFixed(1);
  
  const systemInstruction = `
    Tu es l'Expert IA en Sécurité Événementielle pour le "Neon Pulse Festival".
    Ton rôle est d'assister les agents de sécurité avec une expertise tactique et calme.
    
    CONTEXTE OPÉRATIONNEL :
    - Événement : ${context.eventName || 'Concert'}
    - Taux d'occupation actuel : ${occupancyRate}%
    - Anomalies détectées : ${context.anomalies} (scans invalides/tentatives de fraude)
    - Capacité totale : ${context.totalExpected}
    
    COMPÉTENCES TECHNIQUES :
    1. Analyse de flux : Si l'occupation dépasse 85%, suggère un ralentissement des entrées.
    2. Protocoles d'urgence : Évacuation, incendie (extincteurs CO2/H2O), malaise médical (SAMU/Protection Civile).
    3. Objets interdits : Verre, perches à selfie, sacs volumineux, pointeurs laser.
    4. Gestion des accès : Procédures VIP et Backstage.
    
    RÈGLES DE RÉPONSE :
    - Sois ultra-concis. Chaque seconde compte en sécurité.
    - Ton : Professionnel, froid et analytique.
    - En cas de signalement d'incident, demande systématiquement la localisation précise (Zone A/B/C).
    - Langue : Français uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur Système IA. Basculez sur le canal radio de secours pour toute question de protocole.";
  }
};
