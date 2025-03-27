// src/lib/groqClient.ts
import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"; // Replace with correct URL
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Store API Key in .env

export const callGroqAPI = async (systemPrompt: string, userInput: string): Promise<string> => {
    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userInput }
                ],
                max_tokens: 800,
                temperature: 0.7,
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling Groq API:", error);
        return "Error processing request";
    }
};
