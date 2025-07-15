import HeroSub from "@/components/shared/HeroSub";
import LuxuryVillas from "@/components/Properties/LuxuryVilla";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Property List | Homely",
};

const page = () => {
    return (
        <>
            <HeroSub
                title="Deluxe Rooms"
                description="Experience luxury and comfort in our Deluxe Rooms, designed for refined living and relaxation."
                badge="Rooms"
            />
            <LuxuryVillas roomType="Deluxe Room" />
        </>
    );
};

export default page;