import { useSession } from "next-auth/react";

export const useRole = () => {
  const { data: session } = useSession();
  
  const userRole = (session?.user as any)?.role || 'guest';
  
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
    isAuthenticated: !!session?.user
  };
}; 