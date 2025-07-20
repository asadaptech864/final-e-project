"use client";
import Link from "next/link";
import HeroSub from "@/components/shared/HeroSub";

export default function UnauthorizedPage() {
  return (
    <>
      <HeroSub
        title="Access Denied"
        description="You don't have permission to access this page."
        badge="Unauthorized"
      />
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8">
            Sorry, you don't have the required permissions to access this page. 
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="space-x-4">
            <Link 
              href="/"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Home
            </Link>
            <Link 
              href="/signin"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 