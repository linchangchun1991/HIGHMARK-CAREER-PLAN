
import { AnalysisResult, StudentProfile } from "../types";
import { PROMPT_CORE, PROMPT_VISUALS, PROMPT_ROADMAP, REAL_CASES_DB } from "../constants";

// Using Alibaba Cloud DashScope (Qwen) Compatible API
const API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const parseJSON = (text: string) => {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            const jsonStr = text.substring(start, end + 1);
            return JSON.parse(jsonStr);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return {};
    }
}

// Helper to call Qwen API
const callQwen = async (apiKey: string, model: string, messages: any[], temperature = 0.6) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: temperature,
            response_format: { type: "json_object" } // Qwen usually supports this or tries to follow system prompt
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Qwen API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "{}";
};

// 1. Resume Parsing (Uses Qwen-VL for Vision capabilities)
export const parseResume = async (
  apiKey: string,
  fileBase64: string,
  mimeType: string
): Promise<Partial<StudentProfile>> => {
  const prompt = `You are a data extraction assistant. Extract the following fields from the resume image: name, university, major, graduationYear, resumeText (summary of experience). Return valid JSON only.`;
  
  // Format for Vision models in OpenAI compatible API
  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { 
            type: "image_url", 
            image_url: { 
                url: `data:${mimeType};base64,${fileBase64}` 
            } 
        }
      ]
    }
  ];

  try {
    // Use qwen-vl-max for best image understanding
    const jsonText = await callQwen(apiKey, "qwen-vl-max", messages, 0.1);
    return parseJSON(jsonText);
  } catch (error) {
    console.error("Parse Error", error);
    // Return empty to allow manual entry if parsing fails
    return {};
  }
};

// 2. Fast Core Identity (ATS + Verdict)
export const generateCoreIdentity = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const candidateContext = `Name: ${profile.name}, Major: ${profile.major}, School: ${profile.university}`;
    const fullPrompt = `${PROMPT_CORE} \n\nCandidate Context:\n${candidateContext}`;
    
    const messages = [
        { role: "system", content: "You are an expert Career Consultant. Output strictly in JSON format." },
        { role: "user", content: fullPrompt }
    ];

    try {
        const jsonText = await callQwen(apiKey, "qwen-plus", messages, 0.6);
        return parseJSON(jsonText);
    } catch (error) {
        console.error("Core Identity Error", error);
        return {};
    }
};

// 3. Visuals (Radar + Gap + Financial)
export const generateVisualAnalysis = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const candidateContext = `Target Role: ${profile.targetRole}, Target Tier: ${profile.targetTier}`;
    const fullPrompt = `${PROMPT_VISUALS} \n\nCandidate Context:\n${candidateContext}`;
    
    const messages = [
        { role: "system", content: "You are an expert Data Analyst. Output strictly in JSON format." },
        { role: "user", content: fullPrompt }
    ];

    try {
        const jsonText = await callQwen(apiKey, "qwen-plus", messages, 0.6);
        const data = parseJSON(jsonText);
        if(data.radarData) data.radarChart = data.radarData;
        return data;
    } catch (error) {
        console.error("Visual Analysis Error", error);
        return {};
    }
};

// 4. Roadmap (Timeline + Stories)
export const generateRoadmap = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const contextData = `REAL_CASES_DB: ${JSON.stringify(REAL_CASES_DB)}`;
    const fullPrompt = `${PROMPT_ROADMAP} \n\nReference Data:\n${contextData}`;

    const messages = [
        { role: "system", content: "You are an expert Career Planner. Output strictly in JSON format." },
        { role: "user", content: fullPrompt }
    ];

    try {
        const jsonText = await callQwen(apiKey, "qwen-plus", messages, 0.6);
        return parseJSON(jsonText);
    } catch (error) {
        console.error("Roadmap Error", error);
        return {};
    }
};