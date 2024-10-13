"use client";
import { useContext, useEffect, useState } from "react";
import { useMeQuery } from "@/graphql/__generated__/me.generated";
import { useVerifyEmailMutation } from "@/graphql/__generated__/verifyEmail.generated";
import { useResendVerifyEmailMutation } from "@/graphql/__generated__/resendVerifyEmail.generated";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { redirect, useRouter } from "next/navigation";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";

export default function VerifyEmail() {
  const router = useRouter();
  const { isUserAuthenticated, setEmailVerified } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);

  const [verifyEmail, { data, loading, error }] = useVerifyEmailMutation();
  const { data: meData, refetch: refetchMe } = useMeQuery();
  const [
    resendVerifyEmail,
    { data: resendData, loading: resendLoading, error: resendError },
  ] = useResendVerifyEmailMutation();
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  useEffect(() => {
    if (meData?.me?.emailVerified) {
      setEmailVerified(true);
      refetchMe();
      router.push("/home");
      router.refresh();
    }
  }, [router, meData, refetchMe, setEmailVerified]);

  const verifyEmailAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;

    setVerifyingEmail(true);

    try {
      await verifyEmail({
        variables: { code },
        onCompleted: (data) => {
          const addressVerified = data?.verifyEmail?.success;
          if (addressVerified) {
            setEmailVerified(true);
            refetchMe();
            router.push("/home");
            router.refresh();
          }
        },
      });
    } catch (mutationError: any) {
      setFormError(
        mutationError.message || "An error occurred during email verification."
      );
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerifyEmail({
        onCompleted: (data) => {
          const resendComplete = data?.sendEmailVerification?.success;
          if (resendComplete) {
            setFormSuccess("Verification email sent.");
          }
        },
      });
    } catch (error) {
      console.error("Error resending verification email", error);
    }
  };

  if (!authChecked) {
    return <div></div>;
  }

  return (
    <AuthProvider>
      {meData && !meData?.me?.emailVerified && (
        <Form
          className="bg-offwhite  mb-4 w-full rounded-2xl px-8 pb-8 pt-6 text-center"
          onSubmit={verifyEmailAddress}
        >
          <div className="text-[24px] font-displayBold mb-4">
            Verify Email Address
          </div>

          <div className="text-[16px] mb-4">
            Please check your email and enter the code we just sent you.
          </div>

          <TextField className="mb-3" name="code" type="text" isRequired>
            <Input
              className="border-light     w-full appearance-none rounded-full border-[1px] bg-white px-4 py-2 focus:outline-none text-[32px] font-mono text-center tracking-wide"
              id="code"
              maxLength={6}
              placeholder="------"
            />
            <Label className="mb-6 mt-1 block text-[11px] opacity-50">
              Verification code
            </Label>
            <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
              Please enter the code we sent to to your {meData?.me?.email}{" "}
              address.
            </FieldError>
          </TextField>
          <Button
            className={`bg-secondary hover:bg-secondary-hover  text-offwhite mx-auto block mt-2 rounded-full px-6 py-2 transition focus:outline-none ${
              verifyingEmail && !error && "opacity-20"
            }`}
            type="submit"
            isDisabled={verifyingEmail && !error}
          >
            {verifyingEmail && !error ? "Verifying..." : "Verify"}
          </Button>
          <div
            className="text-xs cursor-pointer text-secondary mt-4 text-center hover:underline"
            onClick={handleResendVerification}
          >
            Resend verification code
          </div>

          {formError && (
            <div className="mt-2 rounded-md bg-pink-50 p-2 text-sm text-red-500 text-center">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mt-2 rounded-md bg-light p-2 text-sm text-primary text-center">
              {formSuccess}
            </div>
          )}
        </Form>
      )}
    </AuthProvider>
  );
}
