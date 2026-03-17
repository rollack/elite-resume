import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestBulletPoints(role: string, company: string, description: string) {
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
