import MapCanvas from '@/components/MapCanvas';
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    // Await params in Next.js 15
    const { id } = await params;

    let initialData = { nodes: [], edges: [] };

    try {
        // Load existing map data if it exists
        const existingMap = await prisma.mindMap.findUnique({
            where: { id },
        });

        // Parse map_data if it exists
        if (existingMap?.map_data) {
            initialData = typeof existingMap.map_data === 'string'
                ? JSON.parse(existingMap.map_data)
                : existingMap.map_data;
        }
    } catch (error) {
        console.error("Failed to load map data:", error);
        // We continue with empty initialData to prevent page crash
    }

    return <MapCanvas mapId={id} initialData={initialData} />;
}
