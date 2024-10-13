"use client";
import React, { useState, FormEvent, useContext, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { useCreateProjectMutation } from "@/graphql/__generated__/createProject.generated";
import { MdArrowBackIosNew } from "react-icons/md";
import Link from "next/link";
import {
  Form,
  TextField,
  Label,
  FieldError,
  TextArea,
  Button,
  Input,
} from "react-aria-components";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { MovieProvider } from "@/context/MovieContext";
export default function NewProject() {
  const router = useRouter();
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);
  const [createProject] = useCreateProjectMutation();
  const [action, setAction] = useState<string>("");
  const [textSeedInput, setTextSeedInput] = useState<string>();
  const handleInput = (event: React.ChangeEvent<HTMLSpanElement>) => {
    event.preventDefault();
    setTextSeedInput(event.target.innerText);
    console.log(textSeedInput);
  };
  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const textSeed = formData.get("textSeed") as string;
    await createProject({
      variables: { title, textSeed },
      onCompleted: (data) => {
        const createdProject = data?.createProject?.project;
        if (createdProject) {
          if (action === "saveDraft") {
            router.push(`/home`);
          } else {
            router.push(`/movie/movie?id=${createdProject.id}`);
          }
        }
      },
    });
  };
  const handleSaveDraft = () => {
    setAction("saveDraft");
  };
  const handleCreateProjectClick = () => {
    setAction("createProject");
  };
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <AuthProvider>
      <MovieProvider>
        <style jsx>{`
          #textSeedInput[contenteditable]:empty::before {
            content: "Share your movie idea, themes, characters, plot points, or any other sparks of inspiration. The more details, the better.";
            color: rgb(147, 152, 166);
            cursor: text;
          }
        `}</style>
        <div className="col-span-2 relative row-start-2 mt-4 col-start-2">
          <div className="bg-white z-10 w-full text-secondary relative flex px-8 items-center justify-between h-[64px] rounded-tr-2xl rounded-tl-2xl gap-2 shadow-lg">
            <Link
              href="/home"
              className="flex gap-2 items-center hover:text-secondary-hover transition text-[14px] font-displaySemiBold"
            >
              <span>
                <MdArrowBackIosNew />
              </span>
              Back to Projects
            </Link>
          </div>
        </div>
        <div className="col-start-2 row-start-3 row-span-1 relative h-full bg-uiLight rounded-bl-2xl pt-8">
          <div className="w-full text-secondary  relative flex flex-col p-8 pt-12">
            <div className="text-2xl items-center font-displayBold mb-4">
              Questionnaire
            </div>
            <p className="mb-8 text-[14px]">
              Bring your movie idea to life! Fill out the form to jumpstart your
              scriptwriting journey.
            </p>
          </div>
        </div>
        <div className="col-start-3 row-start-3 row-span-1 h-full bg-uiLight  rounded-br-2xl relative flex flex-col py-8">
          <div className="z-10 relative h-full w-full">
            <div className="flex h-full relative">
              <div className="flex flex-col w-[800px] p-8 pt-12 bg-white rounded-tl-2xl rounded-bl-2xl shadow-lg">
                <div className="text-2xl items-center font-displayBold mb-4">
                  Movie Idea
                </div>
                <p className="text-[18px] pr-8">
                  Unleash your cinematic vision. Share your seed, grow your
                  script.
                </p>
                <div className="rounded-2xl h-full">
                  <Form
                    onSubmit={handleCreateProject}
                    className="flex flex-col h-full pr-8"
                  >
                    <TextField
                      className="mb-4"
                      name="title"
                      type="text"
                      isRequired
                    >
                      <Label className="block text-[14px] mb-2 font-bold">
                        Title
                      </Label>
                      {/* <small className="mb-2 ">
                        <i>Give your movie a captivating title.</i>
                      </small> */}
                      <Input
                        className="appearance-none w-full rounded-full bg-white border-[1px] border-light     py-2 px-4 focus:outline-none"
                        id="title"
                        type="text"
                        placeholder="Give your movie a captivating title"
                      />
                      <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center mt-4 inline-block">
                        Please enter a title.
                      </FieldError>
                    </TextField>
                    <TextField
                      className="h-full w-full"
                      name="textSeed"
                      isRequired
                    >
                      <Label className="block mb-2 text-[14px] font-bold">
                        Movie Seed
                      </Label>
                      {/* <small className="mb-2 ">
                        <i>
                          Share your movie idea, themes, characters, plot
                          points, or any other sparks of inspiration. The more
                          details, the better.
                        </i>
                      </small> */}
                      <TextArea
                        className="appearance-none opacity-0 h-0 w-full"
                        id="textSeed"
                        value={textSeedInput}
                      />
                      <span
                        className="w-full resize-none border-[1px] border-light rounded-lg bg-transparent outline outline-0 transition-all focus:outline-0 disabled:resize-none disabled:border-0 p-4 h-full block pb-0"
                        id="textSeedInput"
                        contentEditable={true}
                        onInput={handleInput}
                        suppressContentEditableWarning={true}
                      ></span>
                      <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center mt-4 inline-block">
                        Please enter a movie seed.
                      </FieldError>
                    </TextField>
                    <div className="flex gap-4 mt-32">
                      <Button
                        onPress={handleSaveDraft}
                        className="rounded-full bg-primary transition hover:bg-primary-hover text-offwhite  py-2 px-6 focus:outline-none mt-2 flex-1 whitespace-nowrap"
                      >
                        Save draft
                      </Button>
                      <Button
                        onPress={handleCreateProjectClick}
                        className="rounded-full bg-secondary transition hover:bg-secondary-hover text-offwhite  py-2 px-6 focus:outline-none mt-2 flex-1 whitespace-nowrap"
                        type="submit"
                      >
                        Generate Movie
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
              <div className="bg-heroAlt bg-cover w-full flex justify-center items-center h-full text-center p-8">
                <div className="font-displayBold text-white text-[32px] leading-[32px]">
                  Your story starts here.
                </div>
              </div>
            </div>
          </div>
        </div>
      </MovieProvider>
    </AuthProvider>
  );
}
