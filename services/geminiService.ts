
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, StudentProfile } from "../types";
import { PROMPT_CORE, PROMPT_VISUALS, PROMPT_ROADMAP, REAL_CASES_DB, GEMINI_API_BASE_URL } from "../constants";

const getAI = (apiKey: string) => {
  return new GoogleGenAI({ 
      apiKey: apiKey, 
      baseUrl: GEMINI_API_BASE_URL 
  });
};

const parseJSON = (text: string) => {
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return {};
    }
}

export const parseResume = async (
  apiKey: string,
  fileBase64: string,
  mimeType: string
): Promise<Partial<StudentProfile>> => {
  const ai = getAI(apiKey);
  const prompt = `Extract: name, university, major, graduationYear, resumeText. JSON.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" },
    });
    return parseJSON(response.text || "{}");
  } catch (error) {
    console.error("Parse Error", error);
    return {};
  }
};

// 1. Fast Core Identity (ATS + Verdict)
export const generateCoreIdentity = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const ai = getAI(apiKey);
    const candidateContext = `Name: ${profile.name}, Major: ${profile.major}, School: ${profile.university}`;
    const fullPrompt = `${PROMPT_CORE} \n ${candidateContext}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: { responseMimeType: "application/json", temperature: 0.6 }
        });
        return parseJSON(response.text || "{}");
    } catch (error) {
        console.error("Core Identity Error", error);
        return {};
    }
};

// 2. Visuals (Radar + Gap + Financial)
export const generateVisualAnalysis = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const ai = getAI(apiKey);
    const candidateContext = `Target Role: ${profile.targetRole}, Target Tier: ${profile.targetTier}`;
    const fullPrompt = `${PROMPT_VISUALS} \n ${candidateContext}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: { responseMimeType: "application/json", temperature: 0.6 }
        });
        const data = parseJSON(response.text || "{}");
        if(data.radarData) data.radarChart = data.radarData;
        return data;
    } catch (error) {
        console.error("Visual Analysis Error", error);
        return {};
    }
};

// 3. Roadmap (Timeline + Stories)
export const generateRoadmap = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const ai = getAI(apiKey);
    const contextData = `REAL_CASES_DB: ${JSON.stringify(REAL_CASES_DB)}`;
    const fullPrompt = `${PROMPT_ROADMAP} \n ${contextData}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: { responseMimeType: "application/json", temperature: 0.6 }
        });
        return parseJSON(response.text || "{}");
    } catch (error) {
        console.error("Roadmap Error", error);
        return {};
    }
};