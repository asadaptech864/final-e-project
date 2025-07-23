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
  { label: 'Staffs', href: '/staff-table' },
]
//  Manager specific links
export const managerNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms-table' },
  { label: 'Room Types', href: '/roomtype-table' },
  { label: 'Maintenances', href: '/maintenance-requests' },
]

// Receptionist specific links
export const receptionistNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Booking', href: '/properties/book' },
  { label: 'Reservations', href: '/reservation-table' },
]

// housekeeping specific links
export const housekeepingNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms-table' },
  { label: 'Report Maintenance', href: '/report' },
  { label: 'Maintenances', href: '/maintenance-requests' },
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
 
  return basicNavLinks;
}

// Keep the original export for backward compatibility
export const navLinks: NavLinks[] = basicNavLinks;
