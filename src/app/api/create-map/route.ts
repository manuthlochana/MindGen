import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title } = await req.json();

        // Create new mind map with empty initial data
        const mindMap = await prisma.mindMap.create({
            data: {
                userId: session.user.id,
                map_data: {
                    nodes: [],
                    edges: []
                },
            },
        });

        return NextResponse.json({
            success: true,
            id: mindMap.id
        });
    } catch (error) {
        console.error("Create map error:", error);
        return NextResponse.json(
            { error: "Failed to create map" },
            { status: 500 }
        );
    }
}
