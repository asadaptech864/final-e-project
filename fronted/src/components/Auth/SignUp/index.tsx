"use client";
import Link from "next/link";
import axios from 'axios';
import SocialSignUp from "../SocialSignUp";
import Logo from "@/components/Layout/Header/BrandLogo/Logo";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const SignUp = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in - before page loads
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if user is authenticated
  if (status === "authenticated" && session) {
    return null;
  }

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one capital letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)";
    }
    return null; // Password is valid
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const name = (document.getElementById('name') as HTMLInputElement)?.value;
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;
    
    if (name === "" || email === "" || password === "") {
      setError("Please Fill All Fields");
      setLoading(false);
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/signup/adduser', {
        name,
        email,
        password
      });
      // Automatically log in the user after signup
      const loginResult = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/"
      });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const msg = error?.response?.data?.message || "Failed To Add User";
      setError(msg);
    }
  };
  
  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <SocialSignUp />

      <span className="z-1 relative my-8 block text-center">
        <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-black/10 dark:bg-white/20"></span>
        <span className="text-body-secondary relative z-10 inline-block bg-white px-3 text-base dark:bg-black">
          OR
        </span>
      </span>

      {error && <div className="text-red-500 text-center mb-2">{error}</div>}

      <form onSubmit={addUser}>
        <div className="mb-[22px]">
          <input
            type="text"
            placeholder="Name"
            name="name"
            id="name"
            required
            className="w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="email"
            placeholder="Email"
            name="email"
            id="email"
            required
            className="w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            required
            className="w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-gray-300 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary"
          />
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-1">Password must contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>One capital letter (A-Z)</li>
              <li>One lowercase letter (a-z)</li>
              <li>One number (0-9)</li>
              <li>One special character (!@#$%^&*(),.?&quot;:{}|&lt;&gt;)</li>
            </ul>
          </div>
        </div>
        <div className="mb-9">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:!bg-darkprimary dark:hover:!bg-darkprimary"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </div>
      </form>

      <p className="text-center mb-4 text-base">
        By creating an account you are agree with our{" "}
        <Link href="/" className="text-primary hover:underline">
          Privacy
        </Link>{" "}
        and{" "}
        <Link href="/" className="text-primary hover:underline">
          Policy
        </Link>
      </p>

      <p className="text-center text-base">
        Already have an account?
        <Link
          href="/signin"
          className="pl-2 text-primary hover:bg-darkprimary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignUp;