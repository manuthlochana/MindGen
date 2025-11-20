import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { embeddingModel } from "@/lib/gemini";
import { qdrant } from "@/lib/qdrant";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mapData, concept, id } = await req.json();
    const userId = req.auth.user?.id;

    if (!mapData || !userId) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    try {
        // 1. PostgreSQL Save (Upsert)
        const mindMap = await prisma.mindMap.upsert({
            where: { id: id || "new" }, // "new" won't match, so it creates if id is missing/new. But if id is provided, it tries to find it.
            // Actually, if id is provided (UUID), we want to create if not exists.
            // If id is NOT provided, we create.
            // Upsert requires a unique where clause. 'id' is unique.
            // If we pass a generated UUID from client, we can use it in create and where.
            create: {
                id: id, // If id is undefined, Prisma autogenerates (cuid). If provided, uses it.
                userId,
                map_data: mapData,
            },
            update: {
                map_data: mapData,
            },
        });

        // 2. Qdrant Sync (New Memory)
        if (concept) {
            const embeddingResult = await embeddingModel.embedContent(concept);
            const vector = embeddingResult.embedding.values;

            // Collection "mindmaps" is assumed to exist

            await qdrant.upsert("mindmaps", {
                points: [
                    {
                        id: mindMap.id,
                        vector: vector,
                        payload: {
                            userId,
                            content: concept,
                            mindMapId: mindMap.id,
                        },
                    },
                ],
            });
        }

        return NextResponse.json({ success: true, id: mindMap.id });

    } catch (error) {
        console.error("Save error:", error);
        return NextResponse.json({ error: "Failed to save map" }, { status: 500 });
    }
});
