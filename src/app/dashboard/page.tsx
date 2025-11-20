import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
    const session = await auth();
    if (!session) redirect("/api/auth/signin");

    const maps = await prisma.mindMap.findMany({
        where: { userId: session.user?.id },
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Mind Maps</h1>
                <div className="flex gap-4 items-center">
                    <span>{session.user?.name}</span>
                    <Link href={`/map/${crypto.randomUUID()}`}>
                        <Button>Create New Map</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {maps.length === 0 && (
                    <p className="text-gray-500 col-span-3 text-center py-10">No maps yet. Create one to get started!</p>
                )}
                {maps.map((map) => (
                    <Link key={map.id} href={`/map/${map.id}`} className="block p-6 border rounded-lg hover:shadow-md transition-shadow bg-white">
                        <h2 className="font-semibold text-lg mb-2">Map {map.id.slice(0, 8)}</h2>
                        <p className="text-sm text-gray-500">Updated: {map.updatedAt.toLocaleDateString()}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
