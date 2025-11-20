import { auth } from "@/auth";
import { model, embeddingModel } from "@/lib/gemini";
import { qdrant } from "@/lib/qdrant";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are a Mind Map Generator.
Your task is to generate a mind map based on the user's prompt and the provided context.
You must return ONLY a valid JSON object compatible with React Flow.
The JSON structure must be:
{
  "nodes": [
    { "id": "1", "type": "default", "data": { "label": "Main Concept" }, "position": { "x": 250, "y": 5 } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}
Ensure the nodes are laid out reasonably (not all overlapping).
Do not include any markdown formatting (like \`\`\`json). Just the raw JSON.
`;

export const POST = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    const userId = req.auth.user?.id;

    if (!prompt || !userId) {
        return NextResponse.json({ error: "Missing prompt or user ID" }, { status: 400 });
    }

    try {
        // 1. Embedding
        const embeddingResult = await embeddingModel.embedContent(prompt);
        const vector = embeddingResult.embedding.values;

        // 2. Retrieval (Qdrant)
        // Ensure collection exists (optional, or assume pre-created. For MVP, we might want to ensure it exists or handle error)
        // We'll assume collection 'mindmaps' exists or we catch error. 
        // Actually, for a "production-ready" script, we should probably create it if missing, but that's expensive to check every time.
        // We'll try to search.

        let contextText = "";
        try {
            const searchResult = await qdrant.search("mindmaps", {
                vector: vector,
                filter: {
                    must: [
                        {
                            key: "userId",
                            match: {
                                value: userId,
                            },
                        },
                    ],
                },
                limit: 3,
            });

            contextText = searchResult.map((item) => item.payload?.content).join("\n\n");
        } catch (e) {
            console.warn("Qdrant search failed or collection missing", e);
            // Proceed without context if search fails (e.g. first run)
        }

        // 3. Context Construction
        const finalPrompt = `
Context from previous maps:
${contextText}

User Prompt: ${prompt}
`;

        // 4. Generation
        const result = await model.generateContent([SYSTEM_PROMPT, finalPrompt]);
        const response = result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const mapData = JSON.parse(text);

        return NextResponse.json(mapData);

    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json({ error: "Failed to generate map" }, { status: 500 });
    }
});
