import { Icon } from '@iconify/react';
import Image from 'next/image';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ: React.FC = () => {
    return (
        <section id='faqs'>
            <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
                <div className="grid lg:grid-cols-2 gap-10 ">
                    <div className='lg:mx-0 mx-auto'>
                        <Image
                            src="/images/faqs/faq-image.png"
                            alt='image'
                            width={680}
                            height={644}
                            className='lg:w-full'
                            unoptimized={true}
                        />
                    </div>
                    <div className='lg:px-12'>
                        <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2">
                            <Icon icon="ph:house-simple-fill" className="text-2xl text-primary " />
                            FAQs
                        </p>
                        <h2 className='lg:text-52 text-40 leading-[1.2] font-medium text-dark dark:text-white'>
                            Everything about our Hotel
                        </h2>
                        <p className='text-dark/50 dark:text-white/50 pr-20'>
                            We understand that planning your stay can raise questions. Here are some frequently asked questions to help you make the most of your hotel experience.
                        </p>
                        <div className="my-8">
                            <Accordion type="single" defaultValue="item-1" collapsible className="w-full flex flex-col gap-6">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>1. What are the check-in and check-out times?</AccordionTrigger>
                                    <AccordionContent>
                                        Check-in time is 3:00 PM and check-out time is 11:00 AM. Early check-in and late check-out can be arranged based on availability and may incur additional charges.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>2. Do you offer airport transportation?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes, we provide airport shuttle service for our guests. Please contact our concierge at least 24 hours in advance to arrange transportation. Additional fees may apply.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>3. What amenities are included in my stay?</AccordionTrigger>
                                    <AccordionContent>
                                        Your stay includes access to our fitness center, swimming pool, spa facilities, complimentary Wi-Fi, daily housekeeping, and access to our business center. Premium amenities may require additional fees.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
