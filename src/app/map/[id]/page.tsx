import MapCanvas from '@/components/MapCanvas';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MapPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session) redirect("/api/auth/signin");

    return <MapCanvas mapId={params.id} />;
}
