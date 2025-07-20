"use client";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

const RoleBasedAccess = ({ children, allowedRoles, fallback = null }: RoleBasedAccessProps) => {
  const { data: session } = useSession();
  
  // If no session, show fallback
  if (!session?.user) {
    return <>{fallback}</>;
  }

  // Check if user's role is in allowed roles
  const userRole = (session.user as any)?.role || 'guest';
  const hasAccess = allowedRoles.includes(userRole);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default RoleBasedAccess; 