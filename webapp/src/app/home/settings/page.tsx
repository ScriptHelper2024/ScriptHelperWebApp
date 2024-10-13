"use client";
import React, { useContext, useEffect, useState } from "react";
import { useMeQuery } from "@/graphql/__generated__/me.generated";
import { useUpdateMeMutation } from "@/graphql/__generated__/updateMe.generated";
import { useUpdateMyUserPreferenceMutation } from "@/graphql/__generated__/updateLLM.generated";
import { useGetDefaultLlmOptionsQuery } from "@/graphql/__generated__/listLLM.generated";
import { useMyUserPreferenceQuery } from "@/graphql/__generated__/myUserPref.generated";
import { MyUserPreferenceQuery } from "@/graphql/__generated__/myUserPref.generated";
import {
  FieldError,
  Form,
  Label,
  TextField,
  Input,
  Button,
} from "react-aria-components";
import type { TextFieldProps, ValidationResult } from "react-aria-components";
import { MdArrowDropDown, MdArrowRight, MdSettings } from "react-icons/md";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { redirect } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

interface UserFieldProps extends TextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export default function Settings() {
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);
  const [updateMe, { loading: updating }] = useUpdateMeMutation();
  const { data, refetch } = useMeQuery({ variables: {} });
  const [updateMyUserPreference, { loading: defaultLLMUpdating }] =
    useUpdateMyUserPreferenceMutation();
  const { data: defaultLlmList } = useGetDefaultLlmOptionsQuery();
  const [userSettings, setUserSettings] = useState(true);
  const [llmSettings, setLlmSettings] = useState(false);
  const [passwordSettings, setPasswordSettings] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [LLMError, setLLMError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [visible, setVisible] = useState(true);

  function UserField({
    label,
    description,
    errorMessage,
    ...props
  }: UserFieldProps) {
    const [fieldValue, setFieldValue] = useState(props.defaultValue || "");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue(e.target.value);
    };
    return (
      <TextField
        {...props}
        className="transition-all duration-200 ease-in relative mb-4"
      >
        <Label className="mb-2 block text-[11px] opacity-50">{label}</Label>
        <Input
          onChange={handleChange}
          className="border-light w-full appearance-none rounded-full border-[1px] bg-white py-2 pl-4 pr-[40px] focus:outline-none"
          autoComplete="off"
        />
        <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
          {errorMessage}
        </FieldError>
      </TextField>
    );
  }

  const [userPrefDataResult, setUserPrefDataResult] =
    useState<MyUserPreferenceQuery | null>(null);

  const { data: userPrefData } = useMyUserPreferenceQuery({
    onCompleted: (data) => setUserPrefDataResult(data),
  });

  useEffect(() => {
    if (userPrefDataResult?.myUserPreference?.defaultLlm) {
      setSelectedLlmOption(userPrefDataResult.myUserPreference.defaultLlm);
    }
  }, [userPrefDataResult]);

  const [selectedLlmOption, setSelectedLlmOption] = useState<string | null>(
    userPrefDataResult?.myUserPreference?.defaultLlm ?? "Auto"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    try {
      await updateMe({
        variables: { firstName, lastName, email, password },
      });
      await refetch();
      setSuccessMessage("Settings updated!");
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setSuccessMessage("");
          setVisible(true);
        }, 3000);
      }, 3000);
      return () => clearTimeout(timer);
    } catch (errors: any) {
      setFormError(errors.message);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      await updateMe({
        variables: { firstName, lastName, email, password },
      });
      setPassword("");
      setConfirmPassword("");
      await refetch();
      setSuccessMessage("Settings updated!");
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setSuccessMessage("");
          setVisible(true);
        }, 3000);
      }, 3000);
      return () => clearTimeout(timer);
    } catch (errors: any) {
      setPasswordError(errors.message);
    }
  };

  const handleSubmitPref = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateMyUserPreference({
        variables: {
          defaultLlm: selectedLlmOption,
        },
      });
      await refetch();
      setSuccessMessage("Settings updated!");
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setSuccessMessage("");
          setVisible(true);
        }, 3000);
      }, 3000);
      return () => clearTimeout(timer);
    } catch (errors: any) {
      setLLMError(errors.message);
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleUserSettings = () => {
    setUserSettings(true);
    setLlmSettings(false);
    setPasswordSettings(false);
  };

  const handlePasswordSettings = () => {
    setPasswordSettings(true);
    setUserSettings(false);
    setLlmSettings(false);
  };

  const handleLlmSettings = () => {
    setLlmSettings(true);
    setUserSettings(false);
    setPasswordSettings(false);
  };

  const defaultLlmOptionsString =
    defaultLlmList?.defaultLlmOptions?.defaultLlmOptions;

  let defaultLlmOptions: { [key: string]: string } = {};
  if (defaultLlmOptionsString) {
    try {
      defaultLlmOptions = JSON.parse(defaultLlmOptionsString);
    } catch (error) {
      console.error("Error parsing defaultLlmOptionsString:", error);
    }
  }
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <>
      <div className="col-span-2 relative row-start-2 mt-4 col-start-2">
        <div className="bg-white z-10 w-full text-secondary/30 relative flex px-8 items-center justify-start h-[64px] rounded-tr-2xl rounded-tl-2xl gap-2 shadow-lg">
          <MdSettings /> Settings
        </div>
      </div>
      <div className="col-start-2 row-start-3 row-span-1 relative h-full bg-uiLight rounded-bl-2xl pt-8">
        <div className="w-full text-secondary  relative flex flex-col p-8 pt-12">
          <div className="text-2xl items-center font-displayBold mb-4">
            Your Settings
          </div>
          <p className="mb-8 text-[14px]">
            Update your profile or change your default Large Language Model.
          </p>
        </div>
      </div>
      <div className="col-start-3 row-start-3 row-span-1 h-full bg-uiLight  rounded-br-2xl relative flex flex-col pt-8">
        <div className="z-10 relative h-full mb-8">
          <div className="flex h-full relative">
            <div className="flex flex-col w-full p-8 pt-12 bg-white rounded-tl-2xl rounded-bl-2xl shadow-lg">
              <div className="w-full text-secondary  relative flex flex-col max-w-[400px]">
                <div>
                  <button
                    onClick={handleUserSettings}
                    className="flex justify-between mb-4 gap-2 items-center bg-grey/10 w-full px-4 py-2 text-[14px] font-displayBold rounded-lg"
                  >
                    <span>Account Profile</span>{" "}
                    {userSettings ? <MdArrowDropDown /> : <MdArrowRight />}
                  </button>
                  {userSettings && (
                    <Form
                      id="userForm"
                      onSubmit={handleSubmit}
                      className="pb-8"
                    >
                      {!updating && (
                        <>
                          <UserField
                            defaultValue={data?.me?.firstName || ""}
                            label="First Name"
                            name="firstName"
                          />
                          <UserField
                            defaultValue={data?.me?.lastName || ""}
                            label="Last Name"
                            name="lastName"
                          />
                          <UserField
                            defaultValue={data?.me?.email}
                            label="Email"
                            name="email"
                          />
                        </>
                      )}
                      {formError && (
                        <div className="mb-4 rounded-md bg-pink-50 p-2 text-sm text-red-500 text-center">
                          {formError}
                        </div>
                      )}
                      <Button
                        className="bg-secondary hover:bg-secondary-hover transition text-white py-2 px-4 text-sm rounded-full"
                        type="submit"
                      >
                        {updating && !formError
                          ? "Updating..."
                          : "Update Profile"}
                      </Button>
                    </Form>
                  )}
                </div>
                <div>
                  <button
                    onClick={handleLlmSettings}
                    className="flex justify-between mb-4 gap-2 items-center bg-grey/10 w-full px-4 py-2 text-[14px] font-displayBold rounded-lg"
                  >
                    <span>Default LLM (Large Language Model)</span>{" "}
                    {llmSettings ? <MdArrowDropDown /> : <MdArrowRight />}
                  </button>
                  {llmSettings && (
                    <form onSubmit={handleSubmitPref} className="relative pb-8">
                      <div className="absolute right-4 top-3 text-[18px] text-secondary">
                        <MdArrowDropDown />
                      </div>
                      <select
                        value={selectedLlmOption || "Auto"}
                        onChange={(e) => setSelectedLlmOption(e.target.value)}
                        className="w-full appearance-none rounded-full border-[1px] bg-white border-light hover:bg-offwhite py-2 pl-4 pr-[40px] focus:outline-none"
                      >
                        {Object.entries(defaultLlmOptions).map(
                          ([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          )
                        )}
                      </select>
                      {LLMError && (
                        <div className="mb-4 rounded-md bg-pink-50 p-2 text-sm text-red-500 text-center">
                          {LLMError}
                        </div>
                      )}
                      <button
                        className="bg-secondary hover:bg-secondary-hover transition text-white py-2 px-4 text-sm rounded-full mt-4"
                        type="submit"
                      >
                        {defaultLLMUpdating && !LLMError
                          ? "Updating Default LLM..."
                          : "Change Default LLM"}
                      </button>
                    </form>
                  )}
                </div>
                <div>
                  <button
                    onClick={handlePasswordSettings}
                    className="flex justify-between mb-4 gap-2 items-center bg-grey/10 w-full px-4 py-2 text-[14px] font-displayBold rounded-lg"
                  >
                    <span>Change Password</span>{" "}
                    {passwordSettings ? <MdArrowDropDown /> : <MdArrowRight />}
                  </button>
                  {passwordSettings && (
                    <Form onSubmit={handleSubmitPassword} className="pb-8">
                      {!updating && (
                        <>
                          <TextField
                            className="relative mb-3"
                            name="password"
                            type="password"
                            isRequired
                          >
                            <Label className="mb-2 block text-[11px] opacity-50">
                              New Password
                            </Label>
                            <Input
                              className="border-light     w-full appearance-none rounded-full border-[1px] bg-white py-2 pl-4 pr-[40px] focus:outline-none"
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={
                                showPassword ? "Password" : "••••••••"
                              }
                              value={password}
                              onChange={handlePasswordChange}
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
                            className={`transition-all duration-200 ease-in relative mb-4 h-0 opacity-0 ${
                              password && `!h-full !opacity-100`
                            }`}
                            name="confirmPassword"
                            type="password"
                            isRequired
                          >
                            <Label className="mb-2 block text-[11px] opacity-50">
                              Confirm New password
                            </Label>
                            <Input
                              className="border-light     w-full appearance-none rounded-full border-[1px] bg-white py-2 pl-4 pr-[40px] focus:outline-none"
                              id="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder={
                                showPassword ? "Password" : "••••••••"
                              }
                              value={confirmPassword}
                              onChange={handleConfirmPasswordChange}
                            />
                            <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
                              Please confirm your password.
                            </FieldError>
                          </TextField>
                        </>
                      )}
                      {passwordError && (
                        <div className="mb-4 rounded-md bg-pink-50 p-2 text-sm text-red-500 text-center">
                          {passwordError}
                        </div>
                      )}
                      <Button
                        className="bg-secondary hover:bg-secondary-hover transition text-white py-2 px-4 text-sm rounded-full"
                        type="submit"
                      >
                        {updating && !passwordError
                          ? "Updating password..."
                          : "Change Password"}
                      </Button>
                    </Form>
                  )}
                  <div
                    className={`mb-4 rounded-md bg-green-50 p-2 text-sm text-green-500 text-center transition-opacity ${
                      visible && successMessage
                        ? "opacity-100 h-auto pointer-events-auto"
                        : "opacity-0 pointer-events-none h-0"
                    }`}
                  >
                    {successMessage}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
