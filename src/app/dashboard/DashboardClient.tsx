'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DashboardClientProps {
    userName: string | null | undefined;
    maps: Array<{
        id: string;
        updatedAt: Date;
    }>;
}

export default function DashboardClient({ userName, maps }: DashboardClientProps) {
    const router = useRouter();
    const [creating, setCreating] = useState(false);

    const handleCreateMap = async () => {
        setCreating(true);
        try {
            const res = await fetch("/api/create-map", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const data = await res.json();

            if (data.success && data.id) {
                router.push(`/map/${data.id}`);
            } else {
                alert("Failed to create map");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create map");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Mind Maps</h1>
                <div className="flex gap-4 items-center">
                    <span>{userName}</span>
                    <Button onClick={handleCreateMap} disabled={creating}>
                        {creating ? "Creating..." : "Create New Map"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {maps.length === 0 && (
                    <p className="text-gray-500 col-span-3 text-center py-10">
                        No maps yet. Create one to get started!
                    </p>
                )}
                {maps.map((map) => (
                    <Link
                        key={map.id}
                        href={`/map/${map.id}`}
                        className="block p-6 border rounded-lg hover:shadow-md transition-shadow bg-white"
                    >
                        <h2 className="font-semibold text-lg mb-2">
                            Map {map.id.slice(0, 8)}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Updated: {new Date(map.updatedAt).toLocaleDateString()}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
