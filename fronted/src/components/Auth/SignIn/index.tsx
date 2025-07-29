"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialSignIn from "../SocialSignIn";
import toast, { Toaster } from 'react-hot-toast';
import Logo from "@/components/Layout/Header/BrandLogo/Logo";

const Signin = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/"
    });
    if (result?.error) {
      // Sirf backend ka error show karo, static error hatao
      let backendError = result.error;
      setError(backendError || "");
      if (backendError) toast.error(backendError);
      setLoading(false);
    } else if (result?.ok) {
      window.location.href = "/";
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10 text-center flex justify-center">
        <Logo />
      </div>

      <SocialSignIn />

      <span className="z-1 relative my-8 block text-center">
        <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-black/10 dark:bg-white/20"></span>
        <span className="text-body-secondary relative z-10 inline-block bg-white px-3 text-base dark:bg-black">
          OR
        </span>
        <Toaster />
      </span>

      <form onSubmit={handleSubmit}>
        <div className="mb-[22px]">
          <input
            type="text"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border placeholder:text-gray-400 border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition  focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-black/10 dark:border-white/20 border-solid bg-transparent px-5 py-3 text-base text-dark outline-none transition  focus:border-primary focus-visible:shadow-none dark:border-border_color dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="mb-9">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-primary bg-primary hover:bg-transparent hover:text-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out "
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      </form>

      <div className="text-center">
        <Link
          href="/"
          className="mb-2 text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forget Password?
        </Link>
      </div>
      <p className="text-body-secondary text-base text-center">
        Not a member yet?{" "}
        <Link href="/" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default Signin;