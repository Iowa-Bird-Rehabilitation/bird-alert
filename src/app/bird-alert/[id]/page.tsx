'use client'

import RescueDetails from "@/components/RescueDetails";

export default function Page({params}: { params: { id: string } }) {
    return <RescueDetails id={params.id} />;
}
