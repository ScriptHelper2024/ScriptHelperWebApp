"use client";
import { AuthProvider } from "@/context/AuthContext";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useLoginMutation } from "@/graphql/__generated__/login.generated";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { BiSolidHide } from "react-icons/bi";
import { BiSolidShow } from "react-icons/bi";
import { ApolloWrapper } from "../../../../lib/ApolloWrapper";

export default function Login() {
  const router = useRouter();
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      setAuthChecked(true);
    } else {
      redirect("/home");
    }
  }, [isUserAuthenticated]);

  const [login, { data, loading, error }] = useLoginMutation();

  const { setAuthState } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(
      new FormData(e.currentTarget)
    );
    try {
      const { data } = await login({
        variables: { email, password },
        onCompleted: (data) => {
          const token = data?.login?.accessToken;
          if (token) {
            setAuthState(token);
            router.push("/home");
          }
        },
      });
    } catch (error) {
      const castedError = error as Error;

      if (castedError.message.includes("Invalid credentials")) {
        console.error(
          "Invalid credentials. Please check your email and password."
        );
      } else {
        console.error("An error occurred during login:", castedError.message);
      }
    }
  };
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <Form
      className="bg-offwhite mb-4 w-full rounded-2xl px-8 pb-8 pt-6"
      onSubmit={loginUser}
    >
      <div className="text-[24px] font-displayBold mb-4">Sign in</div>
      <TextField className="mb-4" name="email" type="email" isRequired>
        <Label className="block text-[10px] mb-2">Email Address</Label>
        <Input
          className="appearance-none w-full rounded-full bg-white border-[1px] border-light py-2 px-4 focus:outline-none"
          id="username"
          placeholder="Email Address"
        />
        <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
          Please enter an email address.
        </FieldError>
      </TextField>
      <TextField
        className="mb-3 relative"
        name="password"
        type={showPassword ? "text" : "password"}
        isRequired
      >
        <Label className="block text-[10px] mb-2">Password</Label>
        <Input
          className="appearance-none w-full rounded-full bg-white border-[1px] border-light py-2 pl-4 pr-[40px] focus:outline-none"
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder={showPassword ? "Password" : "••••••••"}
        />
        <span
          className="absolute top-[40px] right-4 text-sm cursor-pointer"
          onClick={toggleShowPassword}
        >
          {showPassword ? (
            <span className="text-red-500">
              <BiSolidHide />
            </span>
          ) : (
            <span className="text-secondary">
              <BiSolidShow />
            </span>
          )}
        </span>
        <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
          Please enter a password.
        </FieldError>
      </TextField>
      {error && (
        <div className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center">
          {error.message}
        </div>
      )}
      <div className="flex justify-center gap-2">
        <Button
          className="rounded-full bg-secondary transition hover:bg-secondary-hover text-offwhite  py-2 px-6 focus:outline-none mt-2 text-center"
          type="submit"
        >
          Sign in
        </Button>
        <Link
          href="/auth/register"
          className="rounded-full bg-primary transition hover:bg-primary-hover text-offwhite  py-2 px-6 focus:outline-none mt-2 text-center"
        >
          Register
        </Link>
      </div>
      <div className="text-[10px] text-center items-center flex flex-col text-primary  mt-8">
        <div className="flex gap-2">
          <div className="text-grey">
            Need help?{" "}
            <span className="underline hover:no-underline cursor-pointer">
              Contact Support
            </span>
          </div>
        </div>
      </div>
    </Form>
  );
}
