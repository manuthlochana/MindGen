import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/signin");

    // Find the most recently updated map
    const latestMap = await prisma.mindMap.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
    });

    if (latestMap) {
        redirect(`/map/${latestMap.id}`);
    } else {
        // Create a new map if none exists
        const newMap = await prisma.mindMap.create({
            data: {
                userId: session.user.id,
                map_data: { nodes: [], edges: [] },
            },
        });
        redirect(`/map/${newMap.id}`);
    }
}
