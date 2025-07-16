"use client";
import Link from "next/link";
import axios from 'axios';
import SocialSignUp from "../SocialSignUp";
import Logo from "@/components/Layout/Header/BrandLogo/Logo";
import { signIn } from "next-auth/react";
import { useState } from "react";
const SignUp = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } else {
      try {
        let response = await axios.post('http://localhost:3001/signup/adduser', {
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
      } catch (error: any) {
        const msg = error?.response?.data?.message || "Failed To Add User";
        setError(msg);
      }
      setLoading(false);
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
          href="/"
          className="pl-2 text-primary hover:bg-darkprimary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </>
  );
};

export default SignUp;