import { GoogleGenAI } from "@google/genai";
import { Patient, MedicalRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMedicalSummary = async (patient: Patient): Promise<string> => {
  try {
    const patientContext = JSON.stringify({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: patient.history.map(h => ({
        diagnosis: h.diagnosis,
        date: h.date,
        notes: h.notes
      }))
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful medical administrative assistant for Amasaman Government Hospital. 
      Analyze the following patient data and generate a concise medical summary for a doctor's review. 
      Highlight chronic conditions if any, recent visits, and potential risk factors.
      Keep it professional and clinical.
      
      Patient Data: ${patientContext}`,
    });

    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("AI Error:", error);
    return "AI service is currently unavailable.";
  }
};

export const suggestDiagnosis = async (symptoms: string, age: number, gender: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a clinical decision support system. 
      Based on the symptoms provided, suggest 3 potential diagnoses and recommend 3 standard tests to confirm.
      
      Patient Demographics: Age ${age}, ${gender}
      Reported Symptoms: ${symptoms}
      
      Format the response as markdown with clear sections for 'Potential Diagnoses' and 'Recommended Tests'.
      Add a disclaimer that this is AI-assisted and requires professional verification.`,
    });

    return response.text || "Unable to generate suggestions.";
  } catch (error) {
    console.error("AI Error:", error);
    return "AI service is currently unavailable.";
  }
};
