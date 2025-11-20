import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/signin");

    const maps = await prisma.mindMap.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            updatedAt: true,
            // We don't need the full map_data for the list
        }
    });

    return <DashboardClient userName={session.user.name || "User"} maps={maps} />;
}
