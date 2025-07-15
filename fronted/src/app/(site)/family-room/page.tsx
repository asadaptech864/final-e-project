import HeroSub from "@/components/shared/HeroSub";
import OfficeSpace from "@/components/Properties/OfficeSpaces";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Property List | Homely",
};

const page = () => {
    return (
        <>
            <HeroSub
                title="Family Rooms"
                description="Discover our family rooms, designed for comfort and convenience, perfect for families and groups."
                badge="Rooms"
            />
            <OfficeSpace roomType="Family Room"/>
        </>
    );
};

export default page;