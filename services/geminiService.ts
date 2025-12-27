import { GoogleGenAI } from "@google/genai";

const apikey = process.env.API_KEY || '';

// Safely initialize the client only if key exists (handled in UI if missing)
