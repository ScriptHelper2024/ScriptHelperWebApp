"use client";
import React, { useState, useContext, useEffect } from "react";
import { useRegisterUserMutation } from "@/graphql/__generated__/registerUser.generated";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
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

export default function Register() {
  const router = useRouter();
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      setAuthChecked(true);
    } else {
      router.push("/auth/verify-email");
      setAuthChecked(true);
    }
  }, [isUserAuthenticated, router]);
  const [
    register,
    { data: registerData, loading: registerLoading, error: registerError },
  ] = useRegisterUserMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [registering, setRegistering] = useState(false);

  const { setAuthState } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const registerUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistering(true);
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    } else {
      setFormError("");
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      await register({
        variables: { firstName, lastName, email, password },
        onCompleted: (data) => {
          const token = data?.registerUser?.accessToken;
          if (token) {
            setAuthState(token);
            router.push("/auth/verify-email");
            setRegistering(false);
          }
        },
      });
      setPassword("");
      setConfirmPassword("");
    } catch (mutationError: any) {
      setFormError(
        mutationError.message || "An error occurred during registration."
      );
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (password === "" && confirmPassword === "") {
      setFormError("");
    }
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
    if (password === "" && confirmPassword === "") {
      setFormError("");
    }
  };

  if (!authChecked) {
    return <div></div>;
  }

  return (
    <AuthProvider>
      <Form
        className="bg-offwhite mb-4 w-full rounded-2xl px-8 pb-8 pt-6"
        onSubmit={registerUser}
      >
        <div className="text-[24px] font-displayBold mb-4">Register</div>
        <TextField className="mb-3" name="firstName" type="text" isRequired>
          <Label className="mb-2 block text-[11px] opacity-50">
            First Name
          </Label>
          <Input
            className="border-light w-full appearance-none rounded-full border-[1px] bg-white px-4 py-2 focus:outline-none"
            id="firstName"
            placeholder="First Name"
          />
          <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
            Please enter your first name.
          </FieldError>
        </TextField>
        <TextField className="mb-3" name="lastName" type="text" isRequired>
          <Label className="mb-2 block text-[11px] opacity-50">Last Name</Label>
          <Input
            className="border-light w-full appearance-none rounded-full border-[1px] bg-white px-4 py-2 focus:outline-none"
            id="lastName"
            placeholder="Last Name"
          />
          <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
            Please enter your last name.
          </FieldError>
        </TextField>
        <TextField className="mb-3" name="email" type="email" isRequired>
          <Label className="mb-2 block text-[11px] opacity-50">
            Email Address
          </Label>
          <Input
            className="border-light w-full appearance-none rounded-full border-[1px] bg-white px-4 py-2 focus:outline-none"
            id="username"
            placeholder="Email Address"
          />
          <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
            Please enter a valid email address.
          </FieldError>
        </TextField>
        <TextField
          className="relative mb-3"
          name="password"
          type="password"
          isRequired
        >
          <Label className="mb-2 block text-[11px] opacity-50">Password</Label>
          <Input
            className="password-field border-light w-full appearance-none rounded-full border-[1px] bg-white py-2 pl-4 pr-[40px] focus:outline-none"
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={showPassword ? "Password" : "••••••••"}
            value={password}
            onChange={handlePasswordChange}
            autoComplete="new-password"
            data-password="true"
          />
          <span
            className="absolute right-4 top-[40px] cursor-pointer text-sm"
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
        <TextField
          className={`transition-all duration-200 ease-in relative mb-4`}
          name="confirmPassword"
          type="password"
          isRequired
        >
          <Label className="mb-2 block text-[11px] opacity-50">
            Confirm Password
          </Label>
          <Input
            className="confirm-password-field border-light w-full appearance-none rounded-full border-[1px] bg-white py-2 pl-4 pr-[40px] focus:outline-none"
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder={showPassword ? "Confirm Password" : "••••••••"}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            autoComplete="new-password"
            data-confirm-password="true"
          />
          <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
            Please confirm your password.
          </FieldError>
        </TextField>
        {formError && (
          <div className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
            {formError}
          </div>
        )}
        <Button
          className={`bg-secondary hover:bg-secondary-hover  text-offwhite mx-auto block mt-2 w-auto rounded-full px-4 py-2 transition focus:outline-none cursor-pointer text-center ${
            registering && !registerError && "opacity-20"
          }`}
          type="submit"
        >
          {registering && !registerError ? "Registering..." : "Register"}
        </Button>
        <p className="mx-auto mt-3 mb-8 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline">
            Sign in
          </Link>
        </p>
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
    </AuthProvider>
  );
}
