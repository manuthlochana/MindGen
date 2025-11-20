import MapCanvas from '@/components/MapCanvas';
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MapPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    // Load existing map data if it exists
    const existingMap = await prisma.mindMap.findUnique({
        where: { id: params.id },
    });

    // Parse map_data if it exists
    const initialData = existingMap?.map_data
        ? (typeof existingMap.map_data === 'string'
            ? JSON.parse(existingMap.map_data)
            : existingMap.map_data)
        : { nodes: [], edges: [] };

    return <MapCanvas mapId={params.id} initialData={initialData} />;
}
