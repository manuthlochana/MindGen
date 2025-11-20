import { auth } from "@/auth";
import { model, embeddingModel } from "@/lib/gemini";
import { qdrant } from "@/lib/qdrant";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `
You are a Conversational Secondary Brain.
Your goal is to act as a bridge between the user and their stored memories (Mind Map).
You must classify the user's intent into one of three categories: "STORE_MEMORY", "Q_AND_A", or "MIND_MAP".

1. **STORE_MEMORY**:
   - Use this when the user states a fact, a preference, or a piece of information they want to remember (e.g., "I like red cars", "My dog's name is Rex").
   - Extract the core concept (e.g., "Red Cars", "Rex").
   - Create a new Node for this concept.
   - Create an Edge connecting the "User Node" (or a relevant parent node) to this new node.
   - Return a conversational acknowledgment.

2. **Q_AND_A**:
   - Use this when the user asks a question or greets you (e.g., "What is my dog's name?", "Hello").
   - Use the provided "Context" to answer the question.
   - Return the answer in 'responseText'.
   - Identify the 'centerNodeId' of the node that best answers the question (if found in context).

3. **MIND_MAP**:
   - Use this when the user explicitly asks to generate a complex map or brainstorm (e.g., "Create a map about Space", "Brainstorm marketing ideas").
   - Generate a comprehensive set of Nodes and Edges.
   - Return a brief confirmation.

**Response Schema (JSON ONLY, NO MARKDOWN):**
{
  "intent": "STORE_MEMORY" | "Q_AND_A" | "MIND_MAP",
  "data": {
    "nodes": [ { "id": "uuid", "type": "default", "data": { "label": "..." }, "position": { "x": 0, "y": 0 } } ],
    "edges": [ { "id": "e1-2", "source": "...", "target": "..." } ],
    "responseText": "...",
    "centerNodeId": "...",
    "concept": "..." // (Optional) Only for STORE_MEMORY, the concept to embed
  }
}

**Important Rules:**
- For 'STORE_MEMORY', you MUST create a node for the new memory.
- For 'Q_AND_A', 'nodes' and 'edges' can be empty.
- 'centerNodeId' is the ID of the node to focus on (the new memory, or the answer source).
- Do not hallucinate context. If you don't know the answer, say so.
`;

export const POST = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, mapId } = await req.json();
    const userId = req.auth.user?.id;

    if (!prompt || !userId || !mapId) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    try {
        // 1. Embedding & RAG
        const embeddingResult = await embeddingModel.embedContent(prompt);
        const vector = embeddingResult.embedding.values;

        let contextText = "";
        let searchResult: any[] = [];
        try {
            searchResult = await qdrant.search("mindmaps", {
                vector: vector,
                filter: {
                    must: [{ key: "userId", match: { value: userId } }],
                },
                limit: 5,
            });
            contextText = searchResult.map((item) => item.payload?.content).join("\n");
        } catch (e) {
            console.warn("Qdrant search failed", e);
        }

        // 2. Gemini Call
        const finalPrompt = `
Context from memories:
${contextText}

Current User Input: ${prompt}
`;
        const result = await model.generateContent([SYSTEM_PROMPT, finalPrompt]);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiResponse = JSON.parse(cleanedText);

        // 3. Handle Intents & Side Effects

        // Fetch current map to update it
        const currentMap = await prisma.mindMap.findUnique({ where: { id: mapId } });
        let currentNodes = (currentMap?.map_data as any)?.nodes || [];
        let currentEdges = (currentMap?.map_data as any)?.edges || [];

        // Ensure User Node exists (Central Node)
        const userNodeId = "user-node";
        const hasUserNode = currentNodes.some((n: any) => n.id === userNodeId);
        if (!hasUserNode) {
            const userNode = {
                id: userNodeId,
                type: 'input',
                data: { label: req.auth.user?.name || "Me" },
                position: { x: 0, y: 0 }
            };
            currentNodes.push(userNode);
            // If AI generated edges connecting to 'user-node', they will work now.
        }

        if (aiResponse.intent === "STORE_MEMORY") {
            // 3a. Vector Sync (Upsert Memory)
            if (aiResponse.data.concept) {
                const conceptEmbedding = await embeddingModel.embedContent(aiResponse.data.concept);
                const conceptVector = conceptEmbedding.embedding.values;

                // Use the ID of the new node as the point ID if possible, else random
                const newNodeId = aiResponse.data.nodes[0]?.id || uuidv4();

                await qdrant.upsert("mindmaps", {
                    points: [{
                        id: uuidv4(), // Point ID must be UUID. Node ID might not be UUID compatible if generated by AI? AI usually generates strings. Let's use uuidv4 for point ID.
                        vector: conceptVector,
                        payload: {
                            userId,
                            content: prompt, // Store the full phrase
                            mindMapId: mapId,
                            nodeId: newNodeId // Link to the visual node
                        }
                    }]
                });
            }
        }

        if (aiResponse.intent === "STORE_MEMORY" || aiResponse.intent === "MIND_MAP") {
            // 3b. DB Update (Save new nodes/edges)
            // Merge logic: Append new nodes/edges. 
            // Note: This is a simple append. In a real app, we might need smarter merging to avoid duplicates.
            // For now, we assume AI generates unique IDs or we trust it.

            const newNodes = aiResponse.data.nodes || [];
            const newEdges = aiResponse.data.edges || [];

            // Fix: Ensure new nodes don't overlap exactly with user node if generated at 0,0
            // (AI usually handles this, but good to note)

            const updatedNodes = [...currentNodes, ...newNodes];
            const updatedEdges = [...currentEdges, ...newEdges];

            await prisma.mindMap.update({
                where: { id: mapId },
                data: {
                    map_data: {
                        nodes: updatedNodes,
                        edges: updatedEdges
                    }
                }
            });
        }

        return NextResponse.json(aiResponse);

    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
});
