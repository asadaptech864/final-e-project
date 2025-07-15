import HeroSub from "@/components/shared/HeroSub";
import ResidentialList from "@/components/Properties/Residential";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Property List | Homely",
};

const page = () => {
    return (
        <>
            <HeroSub
                title="Suite Rooms"
                description="Discover our premium suite rooms, offering modern amenities and refined comfort for an unforgettable stay."
                badge="Rooms"
            />
            <ResidentialList roomType="Suite Room" />
        </>
    );
};

export default page;