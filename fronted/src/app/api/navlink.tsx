import { NavLinks } from '@/types/navlink'

// Basic links for all users (including guests)
export const basicNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/properties' },
  { label: 'Contact', href: '/contactus' },
]

// Guest specific links
export const guestNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Rooms', href: '/properties' },
  { label: 'Booking', href: '/properties/book' },
  { label: 'Reservations', href: '/reservation-table' },
  { label: 'Maintenances', href: '/maintenance-requests' },
  { label: 'Contact', href: '/contactus' },
]
// Admin specific links
export const adminNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms-table' },
  { label: 'Room Types', href: '/roomtype-table' },
  { label: 'Reservations', href: '/reservation-table' },
  { label: 'Report Maintenance', href: '/report' },
  { label: 'Maintenances', href: '/maintenance-requests' },
  { label: 'Staffs', href: '/staff-table' },  
  { label: 'Analytics', href: '/analytics' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Contacts', href: '/admin/contacts' },
]
//  Manager specific links
export const managerNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms-table' },
  { label: 'Room Types', href: '/roomtype-table' },
  { label: 'Reservations', href: '/reservation-table' },
  { label: 'Report Maintenance', href: '/report' },
  { label: 'Maintenances', href: '/maintenance-requests' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Contact', href: '/contactus' },
]

// Receptionist specific links
export const receptionistNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Booking', href: '/properties/book' },
  { label: 'Reservations', href: '/reservation-table' },
  { label: 'Contact', href: '/contactus' },
]

// housekeeping specific links
export const housekeepingNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Rooms', href: '/rooms-table' },
  { label: 'Report Maintenance', href: '/report' },
  { label: 'Maintenances', href: '/maintenance-requests' },
  { label: 'Contact', href: '/contactus' },
]

// maintenance specific links
export const maintenanceNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Maintenances', href: '/maintenance-requests' },
  { label: 'Contact', href: '/contactus' },
]
// Function to get navigation links based on user role
export const getNavLinks = (userRole?: string): NavLinks[] => {
  if (!userRole) {
    return basicNavLinks; // Guest users
  }
  if (userRole === 'guest') {
    return guestNavLinks;
  }
  // Admin and Manager get full access
  if (userRole === 'admin') {
    return adminNavLinks;
  }
  
  // All other roles get basic access
  if (userRole === 'manager') {
    return managerNavLinks;
  }

  if (userRole === 'receptionist') {
    return receptionistNavLinks;
  }

  if (userRole === 'housekeeping') {
    return housekeepingNavLinks;
  }
  if (userRole === 'maintenance') {
    return maintenanceNavLinks;
  }
  return basicNavLinks;
}

// Keep the original export for backward compatibility
export const navLinks: NavLinks[] = basicNavLinks;
