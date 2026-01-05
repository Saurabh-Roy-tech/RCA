const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const analyzeErrorWithContext = async (userQuery, rcaContext) => {
    try {
        // Construct a prompt with the database context
        const prompt = `
        You are an expert Senior Software Engineer and SRE.
        You have access to a database of past Root Cause Analysis (RCA) reports details in JSON format.
        
        The user is reporting an error or describing a problem. 
        Your goal is to:
        1. Analyze the user's input/error.
        2. Search through the provided "RCA Database" to find the most relevant similar issues.
        3. If a matching RCA is found, recommend the solution (Actions) from that RCA.
        4. If no exact match is found, use your general knowledge AND the patterns in the database to suggest a solution.
        5. Provide the response in a clear, helpful manner.
        
        RCA Database (JSON):
        ${JSON.stringify(rcaContext)}

        User Input:
        "${userQuery}"

        Response Format:
        You usually return a JSON string. PLEASE return ONLY a JSON object. Do not include markdown formatting (like \`\`\`json ... \`\`\`) or any other text.
        Structure:
        {
          "analysis": "Brief explanation and recommended fix (string, can use newlines)",
          "relatedRcaIds": ["id1", "id2"] // Array of strings. Only include valid IDs from context if they are relevant matches.
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("Failed to generate AI response.");
    }
};

module.exports = { analyzeErrorWithContext };
