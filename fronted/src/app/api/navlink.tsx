import { NavLinks } from '@/types/navlink'

// Basic links for all users (including guests)
export const basicNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/properties' },
  { label: 'Contact', href: '/contactus' },
]

// Admin and Manager specific links
export const adminNavLinks: NavLinks[] = [
  { label: 'Home', href: '/' },
  { label: 'Rooms Table', href: '/rooms-table' },
  { label: 'Room Types', href: '/roomtype-table' },
  { label: 'Staff Table', href: '/staff-table' },
]

// Function to get navigation links based on user role
export const getNavLinks = (userRole?: string): NavLinks[] => {
  if (!userRole) {
    return basicNavLinks; // Guest users
  }
  
  // Admin and Manager get full access
  if (userRole === 'admin' || userRole === 'manager') {
    return adminNavLinks;
  }
  
  // All other roles get basic access
  return basicNavLinks;
}

// Keep the original export for backward compatibility
export const navLinks: NavLinks[] = basicNavLinks;
