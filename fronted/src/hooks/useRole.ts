import { useSession } from "next-auth/react";

export const useRole = () => {
  const { data: session, status } = useSession();
  
  // Get role from session with proper typing
  let userRole = session?.user?.role || 'user';
  
  // Debug logging
  console.log('Session:', session);
  console.log('User Role:', userRole);
  console.log('Status:', status);
  
  // Temporary: Check if user email is admin (for debugging)
  if (session?.user?.email === 'admin@portal.com') {
    userRole = 'admin';
    console.log('Forced admin role for debugging');
  }
  
  const hasRole = (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(userRole);
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole(['admin', 'manager']);
  const isStaff = () => hasRole(['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance']);
  const isGuest = () => hasRole('guest');

  return {
    userRole,
    hasRole,
    isAdmin,
    isManager,
    isStaff,
    isGuest,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading"
  };
}; 