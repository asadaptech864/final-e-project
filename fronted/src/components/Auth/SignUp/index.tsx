"use client";
import Link from "next/link";
import axios from 'axios';
import SocialSignUp from "../SocialSignUp";
import Logo from "@/components/Layout/Header/BrandLogo/Logo";
const addUser = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    if (name === "" || email === "" || password === "") {
       alert("Please Fill All Fields") 
    } else {
        try {
           let response= await
            axios.post('http://localhost:3001/users/allusers', {
                name,
                email,
                password
            });
            console.log(response.data);
            alert("Product Added Successfully");
        } catch (error) {
            console.error("Failed To Add Product", error);
            alert("Failed To Add Product");
        }
    }
}
const SignUp = () => {
  
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

      <form>
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
            className="flex w-full cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:!bg-darkprimary dark:hover:!bg-darkprimary"
            onClick={addUser} >
            Sign Up
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
