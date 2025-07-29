import { footerlinks } from "@/types/footerlinks"

// Basic footer links for all users (including guests)
export const basicFooterLinks: footerlinks[] = [
    { label: 'Rooms', href: '/properties' },
    { label: 'Contact Us', href: '/contactus' },
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
]

// Guest specific footer links
export const guestFooterLinks: footerlinks[] = [
    { label: 'Rooms', href: '/properties' },
    { label: 'My Reservations', href: '/reservation-table' },
    { label: 'Maintenance', href: '/maintenance-requests' },
    { label: 'Contact Us', href: '/contactus' },
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
]

// Admin specific footer links
export const adminFooterLinks: footerlinks[] = [
    { label: 'Rooms Management', href: '/rooms-table' },
    { label: 'Reservations', href: '/reservation-table' },
    { label: 'Maintenance', href: '/maintenance-requests' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Contact Us', href: '/contactus' },
]

// Manager specific footer links
export const managerFooterLinks: footerlinks[] = [
    { label: 'Rooms Management', href: '/rooms-table' },
    { label: 'Reservations', href: '/reservation-table' },
    { label: 'Maintenance', href: '/maintenance-requests' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Contact Us', href: '/contactus' },
]

// Receptionist specific footer links
export const receptionistFooterLinks: footerlinks[] = [
    { label: 'Booking', href: '/properties/book' },
    { label: 'Reservations', href: '/reservation-table' },
    { label: 'Contact Us', href: '/contactus' },
]

// Housekeeping specific footer links
export const housekeepingFooterLinks: footerlinks[] = [
    { label: 'Rooms', href: '/rooms-table' },
    { label: 'Maintenance', href: '/maintenance-requests' },
    { label: 'Contact Us', href: '/contactus' },
]

// Maintenance specific footer links
export const maintenanceFooterLinks: footerlinks[] = [
    { label: 'Maintenance', href: '/maintenance-requests' },
    { label: 'Contact Us', href: '/contactus' },
]

// Function to get footer links based on user role
export const getFooterLinks = (userRole?: string): footerlinks[] => {
    if (!userRole) {
        return basicFooterLinks; // Guest users
    }
    if (userRole === 'guest') {
        return guestFooterLinks;
    }
    if (userRole === 'admin') {
        return adminFooterLinks;
    }
    if (userRole === 'manager') {
        return managerFooterLinks;
    }
    if (userRole === 'receptionist') {
        return receptionistFooterLinks;
    }
    if (userRole === 'housekeeping') {
        return housekeepingFooterLinks;
    }
    if (userRole === 'maintenance') {
        return maintenanceFooterLinks;
    }
    return basicFooterLinks;
}

// Keep the original export for backward compatibility
export const FooterLinks: footerlinks[] = basicFooterLinks;
