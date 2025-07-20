"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useRole } from "@/hooks/useRole";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/signin" 
}: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const { hasRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // If not authenticated, redirect to login
    if (!session?.user) {
      router.push(redirectTo);
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
      router.push("/unauthorized"); // or any other page
      return;
    }
  }, [session, status, allowedRoles, hasRole, router, redirectTo]);

  // Show loading while checking authentication
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If not authenticated, don't render children
  if (!session?.user) {
    return null;
  }

  // If roles are specified and user doesn't have required role, don't render
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 