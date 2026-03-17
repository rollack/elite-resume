import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";
import { mockResumes } from "../mockData";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function suggestBulletPoints(role: string, company: string, description: string) {
  const ai = getAI();
  if (!ai) throw new Error("Gemini API key is required for AI suggestions. You can get a free key at aistudio.google.com");
  
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As a top-tier executive resume writer, rewrite the following job description into 3-4 high-impact, results-oriented bullet points.
    
    CRITICAL GUIDELINES:
    1. Use strong action verbs (e.g., "Spearheaded", "Orchestrated", "Surpassed").
    2. EMPHASIZE QUANTIFIABLE RESULTS (e.g., "increased revenue by 20%", "reduced latency by 50ms", "managed $2M budget").
    3. Use the Google XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].
    4. Keep them concise and professional.
    
    Role: ${role}
    Company: ${company}
    Description: ${description}
    
    Return only the bullet points, one per line, starting with a dash (-).`,
  });

  const response = await model;
  return response.text?.split('\n').filter(line => line.trim().startsWith('-')) || [];
}

export async function generateSummary(name: string, role: string, skills: string[]) {
  const ai = getAI();
  if (!ai) throw new Error("Gemini API key is required for AI summary generation.");
  
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a high-impact professional resume summary for ${name}, a ${role}.
    
    CRITICAL GUIDELINES:
    1. Focus on unique value proposition and years of experience.
    2. Mention key skills: ${skills.join(', ')}.
    3. Use professional, punchy language.
    4. Limit to 3 powerful sentences.
    
    Return only the summary text.`,
  });

  const response = await model;
  return response.text?.trim() || "";
}

export async function auditResume(data: ResumeData) {
  const ai = getAI();
  if (!ai) return { score: 0, suggestions: ["Connect your Gemini API key to enable AI resume auditing."] };
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Audit this resume data according to top-tier industry standards.
    
    RESUME DATA:
    ${JSON.stringify(data, null, 2)}
    
    CRITICAL AUDIT CRITERIA:
    1. Score from 0-100 (100 is perfect).
    2. Check for strong action verbs vs weak words (e.g. "Responsible for" is weak).
    3. Check for quantifiable results in experience.
    4. Check for completeness (summary, skills, education).
    5. Provide 3-5 specific, actionable suggestions for improvement.
    
    Return the result in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "suggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as { score: number; suggestions: string[] };
  } catch (e) {
    return { score: 0, suggestions: ["Failed to generate audit. Please try again."] };
  }
}

export async function generateResumeFromProfile(profile: any) {
  const ai = getAI();
  if (!ai) return null;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a full resume structure based on this user profile data. 
    If data is missing, use your knowledge to create highly relevant placeholders for a professional in their field.
    
    PROFILE DATA:
    ${JSON.stringify(profile, null, 2)}
    
    Return a full ResumeData object in JSON format.`,
    config: {
      responseMimeType: "application/json",
      // We don't strictly need a full schema if we trust the model to follow the ResumeData structure, 
      // but let's provide a basic one to ensure it returns the right keys.
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalInfo: { type: Type.OBJECT },
          summary: { type: Type.STRING },
          experience: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          education: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          projects: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          certifications: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          languages: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "{}") as ResumeData;
    // Ensure all arrays are initialized to prevent crashes in the editor
    return {
      ...data,
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      projects: data.projects || [],
      certifications: data.certifications || [],
      languages: data.languages || [],
      auditSuggestions: data.auditSuggestions || []
    };
  } catch (e) {
    return null;
  }
}

export async function generateRandomResume() {
  const ai = getAI();
  
  if (!ai) {
    // Return a random mock resume if API is not available
    const randomIndex = Math.floor(Math.random() * mockResumes.length);
    return mockResumes[randomIndex];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a completely random, high-quality professional resume for a fictional person. 
      Pick a random industry (Tech, Healthcare, Finance, Creative, etc.) and a random seniority level.
      
      Return a full ResumeData object in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: { type: Type.OBJECT },
            summary: { type: Type.STRING },
            experience: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            education: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            projects: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            certifications: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            languages: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}") as ResumeData;
    return {
      ...data,
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      projects: data.projects || [],
      certifications: data.certifications || [],
      languages: data.languages || [],
      auditSuggestions: []
    };
  } catch (e) {
    // Fallback to mock data on any AI failure
    const randomIndex = Math.floor(Math.random() * mockResumes.length);
    return mockResumes[randomIndex];
  }
}
