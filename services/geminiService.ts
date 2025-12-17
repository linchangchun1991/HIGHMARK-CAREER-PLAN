
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
    try {
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
                response_format: { type: "json_object" } 
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Qwen API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "{}";
    } catch (error) {
        console.error("API Call Failed:", error);
        throw error;
    }
};

// Helper: Extract text from PDF using PDF.js (Client Side)
const extractPdfText = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        // @ts-ignore - pdfjsLib is loaded via CDN in index.html
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
        }
        return fullText;
    } catch (e) {
        console.error("PDF Extraction Failed", e);
        throw new Error("PDF Parsing Failed");
    }
};

// Helper: Convert File to Base64 (for Images)
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/...;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

// 1. Resume Parsing (Smart Routing: PDF -> Text Model, Image -> Vision Model)
export const parseResume = async (
  apiKey: string,
  file: File
): Promise<Partial<StudentProfile>> => {
  
  const isPdf = file.type === "application/pdf";
  const systemPrompt = `You are a data extraction assistant. Extract the following fields from the resume: name, university, major, graduationYear, resumeText (a comprehensive summary of experience). Return valid JSON only.`;

  let messages = [];
  let model = "qwen-plus"; // Default to text model

  try {
      if (isPdf) {
          // Path A: PDF -> Extract Text -> Qwen Plus
          const textContent = await extractPdfText(file);
          if (!textContent || textContent.length < 50) {
              throw new Error("PDF text content is empty or unreadable (scanned PDF?)");
          }
          model = "qwen-plus";
          messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Resume Content:\n${textContent}` }
          ];
      } else {
          // Path B: Image -> Qwen VL Max
          const base64 = await fileToBase64(file);
          model = "qwen-vl-max";
          messages = [
            {
              role: "user",
              content: [
                { type: "text", text: systemPrompt },
                { 
                    type: "image_url", 
                    image_url: { 
                        url: `data:${file.type};base64,${base64}` 
                    } 
                }
              ]
            }
          ];
      }

      // Call API
      const jsonText = await callQwen(apiKey, model, messages, 0.1);
      return parseJSON(jsonText);

  } catch (error) {
    console.error("Parse Resume Error", error);
    // Return empty to allow manual entry
    return {};
  }
};

// 2. Fast Core Identity (ATS + Verdict)
export const generateCoreIdentity = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const candidateContext = `Name: ${profile.name}, Major: ${profile.major}, School: ${profile.university}, Resume Text: ${profile.resumeText.substring(0, 2000)}`;
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
        throw error; // Throw to trigger UI error handling
    }
};

// 3. Visuals (Radar + Gap + Financial)
export const generateVisualAnalysis = async (apiKey: string, profile: StudentProfile): Promise<Partial<AnalysisResult>> => {
    const candidateContext = `Target Role: ${profile.targetRole}, Target Tier: ${profile.targetTier}, Resume Summary: ${profile.resumeText.substring(0, 1000)}`;
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