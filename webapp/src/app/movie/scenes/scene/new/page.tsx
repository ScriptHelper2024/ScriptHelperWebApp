"use client";
import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  useContext,
} from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useCreateSceneTextMutation } from "@/graphql/__generated__/createScene.generated";

import {
  Button,
  Dialog,
  DialogTrigger,
  FieldError,
  Form,
  Input,
  OverlayArrow,
  Popover,
  TextArea,
  TextField,
} from "react-aria-components";
import Link from "next/link";
import { FocusScope } from "react-aria";
import { MdEdit } from "react-icons/md";
import { AuthContext } from "@/context/AuthContext";

export default function NewScene() {
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
  const query = useSearchParams();
  const movieId = query.get("id");

  const [createScene] = useCreateSceneTextMutation();

  const [seedText, setSeedText] = useState<String>();
  const seedAreaRef = useRef<HTMLTextAreaElement>(null);

  const [titleText, setTitleText] = useState<String>();
  const titleAreaRef = useRef<HTMLInputElement>(null);

  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    const resizeSeedArea = () => {
      const currentRef = seedAreaRef.current;
      if (currentRef) {
        currentRef.style.height = "auto";
        currentRef.style.height = `${currentRef.scrollHeight}px`;
      }
    };
    resizeSeedArea();
  }, [seedText]);

  const handleCreateScene = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = titleText;
    if (!title) {
      setTitleError(true);
      return;
    } else {
      setTitleError(false);
    }
    const textSeed = seedText;

    const { data } = await createScene({
      variables: { projectId: movieId, title: title, textSeed: textSeed },
      onCompleted: (data) => {
        const createdSceneKey = data?.createSceneText?.sceneText?.sceneKey;
        if (createdSceneKey) {
          router.push(
            `/movie/scenes/scene?id=${movieId}&sceneKey=${createdSceneKey}`
          );
        }
      },
    });
  };
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <>
      <div className="col-start-1 col-span-2 pl-[64px] row-span-1 row-start-3 relative h-full bg-uiLight">
        <div className="flex flex-col p-4 h-full">
          <div className="rounded-lg bg-white border-[1px] w-full max-w-[600px] min-w-[300px] p-4 pt-3 mb-5 border-light  transition relative text-[14px] leading-[24px]">
            <div className="text-[12px] font-displayBold text-secondary">
              New Scene
            </div>
            <TextField aria-label="Title field" isRequired>
              <FocusScope restoreFocus autoFocus>
                <div className="flex justify-between relative text-[16px]">
                  <Input
                    className="group border-[1px] border-light  py-2 bg-offwhite rounded-md w-[324px] font-displayBold text-[16px] px-2 mb-3 relative outline-none block"
                    id="titleInput"
                    tabIndex={1}
                    value={titleText?.toString()}
                    onChange={(e) => setTitleText(e.target.value)}
                    ref={titleAreaRef}
                    name="title"
                    placeholder="Untitled Scene"
                  />
                  <MdEdit className="opacity-100 text-secondary/30 absolute right-[17px] top-[13px]" />
                </div>
              </FocusScope>
            </TextField>
            {!titleText && titleError && (
              <div className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center mt-2 inline-block">
                Title can not be blank.
              </div>
            )}
            <Link
              href={`/movie/scenes?id=${movieId}`}
              className="text-secondary underline hover:no-underline py-1 text-[12px] mt-1 block"
            >
              Cancel and return to Scenes
            </Link>
          </div>
        </div>
      </div>
      <div className="col-start-3 row-span-1 row-start-3 h-full bg-white  relative overflow-hidden flex flex-col max-h-[calc(100vh-138px)]">
        <div className="bg-white scrollWrapper overflow-y-auto overflow-x-hidden h-full w-full">
          <Form className="relative w-full pt-2" onSubmit={handleCreateScene}>
            <div className="bg-white relative">
              <div className="p-8 pt-5 pb-0 w-full" id="sceneSeed">
                <div className="font-displayBold pb-3 text-[12px] absolute left-8 top-6 z-10">
                  Seed
                </div>
                <div className="flex gap-3 justify-end sticky top-4 right-0 pb-2 z-30">
                  <Button
                    className="outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4"
                    type="submit"
                  >
                    Create Scene
                  </Button>
                </div>
                <TextField name="textSeed" aria-label="Text Seed" isRequired>
                  <TextArea
                    id="textSeed"
                    tabIndex={2}
                    ref={seedAreaRef}
                    className="new-seed text-[14px] leading-[24px] w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 pb-4"
                    placeholder={"Type a seed and generate Scene Text"}
                    value={seedText?.toString()}
                    onChange={(e) => setSeedText(e.target.value)}
                  />
                  <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
                    {`Seedtext is required to generate Scene Text.`}
                  </FieldError>
                </TextField>
              </div>
            </div>
            <div className="border-b-[1px] w-full absolute right-0 left-0"></div>
          </Form>
          <div className="pt-1">
            <div className="min-h-[54px] pt-4 pb-0 relative">
              <div className="text-secondary font-displayBold pb-3 text-[12px] absolute left-8 top-4 z-10 pt-2">
                Scene Text
              </div>
              <div className="px-8">
                <DialogTrigger>
                  <Button className="text-left pt-12">
                    <div
                      className={`whitespace-pre-line flex flex-col w-full leading-[24px] font-mono text-[12px] pb-12`}
                    >
                      <div className="opacity-40">
                        <p className="text-light ">
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                        </p>
                      </div>
                    </div>
                  </Button>
                  <Popover>
                    <OverlayArrow>
                      <svg width={12} height={12} viewBox="0 0 12 12">
                        <path d="M0 0 L6 6 L12 0" />
                      </svg>
                    </OverlayArrow>
                    <Dialog>
                      <div className="bg-secondary text-white py-2 px-3 rounded-lg text-[12px]">
                        <div className="font-displayBold">Scene Text</div>
                        {`This is where your Scene Text will appear after. Type in a Seed for this scene and click "Create Scene" to generate Scene Text.`}
                      </div>
                    </Dialog>
                  </Popover>
                </DialogTrigger>
              </div>
              <div className="border-b-[1px] w-full absolute right-0 left-0"></div>
            </div>
          </div>
          <div className="pt-1">
            <div className="min-h-[54px] pt-4 pb-0 relative">
              <div className="text-secondary font-displayBold pb-3 text-[12px] absolute left-8 top-4 z-10 pt-2">
                Script Text
              </div>
              <div className="px-8">
                <DialogTrigger>
                  <Button className="text-left pt-12">
                    <div
                      className={`whitespace-pre-line flex flex-col w-full leading-[24px] font-mono text-[12px] pb-12`}
                    >
                      <div className="opacity-40">
                        <p className="text-light ">
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                          &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                        </p>
                      </div>
                    </div>
                  </Button>
                  <Popover>
                    <OverlayArrow>
                      <svg width={12} height={12} viewBox="0 0 12 12">
                        <path d="M0 0 L6 6 L12 0" />
                      </svg>
                    </OverlayArrow>
                    <Dialog>
                      <div className="bg-secondary text-white py-2 px-3 rounded-lg text-[12px]">
                        <div className="font-displayBold">Script Text</div>
                        {`This is where your Script will appear after. Type in a Seed for this scene and click "Create Scene" to generate Scene Text.`}
                      </div>
                    </Dialog>
                  </Popover>
                </DialogTrigger>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
