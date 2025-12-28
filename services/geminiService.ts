import { GoogleGenAI } from "@google/genai";

const apikey = process.env.API_KEY || '';

// Safely initialize the client only if key exists (handled in UI if missing)
const ai = apikey ? new GoogleGenAI({ apikey }) : null;

export const getChessHint = async (fen: string, turn: 'w' | 'b'): Promise<string> => {
    if (!ai) {
        throw new Error("API Key is missing.");
    }

    const color = turn === 'w' ? 'White' : 'Black';

    const prompt = `
        
    `
}