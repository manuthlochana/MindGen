import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    const maps = await prisma.mindMap.findMany({
        where: { userId: session.user?.id },
        orderBy: { updatedAt: 'desc' },
    });

    return <DashboardClient userName={session.user?.name} maps={maps} />;
}
