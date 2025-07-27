import HeroSub from "@/components/shared/HeroSub";
import Appartment from "@/components/Properties/Appartment";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Property List | Homely",
};

const page = () => {
    return (
        <>
            <HeroSub
                title="Standard Rooms"
                description="Discover comfort and style in our Standard Rooms, thoughtfully designed for a relaxing and enjoyable stay."
                badge="Rooms"
            />
            <Appartment roomType="Standard Room"/>
        </>
    );
};

export default page;