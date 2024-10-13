"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  FieldError,
  Form,
  Input,
  TextArea,
  TextField,
} from "react-aria-components";
import { MdAddCircle, MdClose, MdEdit } from "react-icons/md";
import { useCreateCharacterProfileMutation } from "@/graphql/__generated__/createCharacter.generated";
import { useUpdateCharacterProfileMutation } from "@/graphql/__generated__/updateCharacter.generated";
import { useMovieData } from "@/context/MovieContext";
import { useListProjectCharactersQuery } from "@/graphql/__generated__/listProjectCharacters.generated";
import { useGetCharacterObjectQuery } from "@/graphql/__generated__/getCharacterObject.generated";
import { UploadButton } from "@/utils/uploadthing";
import { CharacterProfile } from "@/types";
import { redirect } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function Synopsis() {
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);
  const { movieData } = useMovieData();
  const [addCharacterDialog, setAddCharacterDialogOpen] = useState(false);
  const [editCharacterDialog, setEditCharacterDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSeed, setCreateSeed] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateSeed, setUpdateSeed] = useState("");
  const [updateImage, setUpdateImage] = useState("");
  const [updateCharacter, setUpdateCharacter] = useState<
    CharacterProfile | undefined | null
  >();
  const [selectedCharacter, setSelectedCharacter] = useState<
    CharacterProfile | undefined | null
  >();
  const createSeedRef = React.useRef(null);
  const updateContentRef = React.useRef(null);
  const updateSeedRef = React.useRef(null);

  const { data: characters, refetch: refetchProjectCharacters } =
    useListProjectCharactersQuery({
      variables: { projectId: movieData?.id },
      skip: !movieData,
    });

  const { data: characterData } = useGetCharacterObjectQuery({
    variables: {
      projectId: movieData?.id,
      textId: selectedCharacter?.id,
    },
    skip: !selectedCharacter,
  });

  const [createCharacterProfile] = useCreateCharacterProfileMutation();
  const [updateCharacterProfile] = useUpdateCharacterProfileMutation();

  const handleOpenAddCharacterDialog = () => {
    setCreateName("");
    setCreateSeed("");
    setAddCharacterDialogOpen(true);
  };

  const handleCreateCharacterProfile = async () => {
    setAddCharacterDialogOpen(false);
    try {
      await createCharacterProfile({
        variables: {
          projectId: movieData?.id,
          name: createName,
          textSeed: createSeed,
        },
        onCompleted: (data) => {
          refetchProjectCharacters();
          setEditCharacterDialogOpen(false);
          setSelectedCharacter(data.createCharacterProfile?.characterProfile);
        },
      });
    } catch (error) {
      console.error("Error creating character profile", error);
    }
  };

  useEffect(() => {
    {
      !selectedCharacter &&
        characters?.listProjectCharacters &&
        setSelectedCharacter(characters?.listProjectCharacters[0]);
    }
  }, [characters]);

  const handleUpdateCharacterDialog = () => {
    setUpdateCharacter(
      (characterData?.getCharacterProfile as CharacterProfile) || null
    );
    setUpdateName(characterData?.getCharacterProfile?.name || "");
    setUpdateSeed(characterData?.getCharacterProfile?.textSeed || "");
    setUpdateContent(characterData?.getCharacterProfile?.textContent || "");
    setUpdateImage(characterData?.getCharacterProfile?.textNotes || "");
    setEditCharacterDialogOpen(true);
  };

  const handleUpdateCharacterProfile = async () => {
    const { data } = await updateCharacterProfile({
      variables: {
        projectId: movieData?.id,
        name: updateName,
        textId: updateCharacter?.id,
        textSeed: updateSeed,
        textContent: updateContent,
        textNotes: updateImage,
      },
      onCompleted: (data) => {
        refetchProjectCharacters();
        setEditCharacterDialogOpen(false);
        setSelectedCharacter(data.updateCharacterProfile?.characterProfile);
      },
    });
  };
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <>
      <div className="flex flex-col gap-6 p-6 h-full">
        <div className="text-[20px] font-displaySemiBold leading-[28px]">
          Synposis
        </div>
        {characterData ? (
          <div
            className={`rounded-lg bg-cover bg-top bg-no-repeat bg-grey/20 w-full flex justify-center items-center group cursor-pointer h-[250px]`}
            style={{
              backgroundImage: characterData?.getCharacterProfile?.textNotes
                ? `url(${characterData.getCharacterProfile.textNotes})`
                : 'url("/character-placeholder.jpg")',
            }}
            onClick={handleUpdateCharacterDialog}
          >
            <div
              className={`inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full w-8 h-8 bg-white ${
                !characterData?.getCharacterProfile?.textNotes && "!opacity-100"
              }`}
            >
              <MdEdit size={16} />
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-cover bg-top bg-no-repeat bg-grey/20 w-full aspect-video relative"></div>
        )}
      </div>
      <div className="flex gap-8 h-full p-6">
        <div className="w-2/5">
          <div className="text-[20px] font-displaySemiBold mb-4">
            Characters
          </div>
          <div className="mb-4 flex flex-col gap-2 items-start">
            {characters?.listProjectCharacters?.map((character: any) => (
              <Button
                key={character?.id}
                className={`rounded-full py-1 px-4 inline w-auto transition ${
                  selectedCharacter?.id === character?.id
                    ? "bg-secondary text-white hover:bg-secondary-hover"
                    : "bg-light text-secondary hover:bg-light-hover"
                }`}
                onPress={() => {
                  setSelectedCharacter(character);
                }}
              >
                {character?.name}
              </Button>
            ))}
          </div>
          <Button
            onPress={handleOpenAddCharacterDialog}
            className="text-secondary hover:text-secondary-hover transition w-max flex gap-1 items-center cursor-pointer"
          >
            <MdAddCircle />
            Add New Character
          </Button>
        </div>
        <div className="w-3/5">
          <div className="font-displaySemiBold text-[20px] mb-4">Biography</div>
          {characterData?.getCharacterProfile?.textContent ? (
            <div className="whitespace-pre-line">
              {characterData?.getCharacterProfile?.textContent}
            </div>
          ) : (
            <div>
              <Button
                onPress={handleUpdateCharacterDialog}
                className="text-secondary transition hover:text-secondary-hover text-[12px] flex gap-1 items-center cursor-pointer"
              >
                <MdEdit />
                Add a biography
              </Button>
            </div>
          )}
        </div>
      </div>

      {addCharacterDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
          <div className="rounded-2xl bg-white border-[1px] border-light w-full max-w-[460px] min-w-[300px] m-3 transition relative text-[14px] leading-[24px]">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="border-b-[1px] px-4 py-3">
                <div className="text-center font-displayBold text-[18px]">
                  Add a Character Profile
                </div>
                <div
                  className="absolute top-4 right-4 cursor-pointer text-[18px]"
                  onClick={() => setAddCharacterDialogOpen(false)}
                >
                  <MdClose />
                </div>
              </div>
              <Form className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                <div className="text-[12px] font-displayBold">Name</div>
                <div className="mb-3">
                  <TextField
                    name="createName"
                    aria-label="Character Name"
                    isRequired
                  >
                    <Input
                      id="textNoteManualWhole"
                      className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto mb-4 p-3 w-full max-h-full focus:outline-none"
                      placeholder="Add a name for your character..."
                      value={createName?.toString()}
                      onChange={(e) => setCreateName(e.target.value)}
                    />
                    <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 text-center mt-2">
                      Character name is required.
                    </FieldError>
                  </TextField>
                </div>
                <div className="text-[12px] font-displayBold">Summary</div>
                <div className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto mb-4">
                  <TextField name="createSeed" aria-label="Character Summary">
                    <TextArea
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden scrollWrapper min-h-[60px]"
                      placeholder="Add a summary for your character..."
                      ref={createSeedRef}
                      value={createSeed?.toString()}
                      onChange={(e) => setCreateSeed(e.target.value)}
                    />
                  </TextField>
                </div>
              </Form>
              <div className="p-4">
                <div className="flex justify-end items-center">
                  <div className="flex gap-2">
                    <Button
                      className="bg-primary text-white hover:bg-primary-hover transition py-2 px-4 text-sm rounded-full"
                      onPress={() => setAddCharacterDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`bg-secondary text-white hover:bg-secondary-hover transition py-2 px-4 text-sm rounded-full ${
                        !createName ? "opacity-80" : ""
                      }`}
                      onPress={handleCreateCharacterProfile}
                      isDisabled={!createName}
                    >
                      Add Character
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editCharacterDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
          <div className="rounded-2xl bg-white border-[1px] border-light w-full max-w-[460px] min-w-[300px] m-3 transition relative text-[14px] leading-[24px]">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="border-b-[1px] px-4 py-3">
                <div className="text-center font-displayBold text-[18px]">
                  Edit {updateName}
                </div>
                <div
                  className="absolute top-4 right-4 cursor-pointer text-[18px]"
                  onClick={() => setEditCharacterDialogOpen(false)}
                >
                  <MdClose />
                </div>
              </div>
              <Form className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                <div
                  className="rounded-lg bg-cover bg-top bg-no-repeat bg-grey/20 w-full aspect-video relative mb-4"
                  style={{
                    backgroundImage: updateImage
                      ? `url(${updateImage})`
                      : 'url("/character-placeholder.jpg")',
                  }}
                ></div>
                <UploadButton
                  className="ut-button:bg-secondary hover:ut-button:bg-secondary-hover ut-button:transition ut-button:rounded-full ut-button:py-1 ut-button:px-4 ut-button:w-auto ut-button:h-auto ut-button:text-[12px] ut-button:outline-0 ut-button:focus-within:border-0 ut-button:focus-within:ring-0 ut-allowed-content:ut-uploading:text-primary ut-button:after:bg-light/80"
                  endpoint="imageUploader"
                  content={{
                    button({ ready }) {
                      if (ready) return <div>Choose an image</div>;
                    },
                  }}
                  onClientUploadComplete={(res: any) => {
                    // Do something with the response

                    setUpdateImage(res[0].url.toString());
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    alert(`ERROR! ${error.message}`);
                  }}
                />
                <div className="text-[12px] font-displayBold">Name</div>
                <div className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto mb-4">
                  <TextField
                    name="createName"
                    aria-label="Character Name"
                    isRequired
                  >
                    <Input
                      id="textNoteManualWhole"
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden"
                      placeholder="Add a name for your character..."
                      value={updateName?.toString()}
                      onChange={(e) => setUpdateName(e.target.value)}
                    />
                    <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
                      Character name is required.
                    </FieldError>
                  </TextField>
                </div>
                <div className="text-[12px] font-displayBold">Summary</div>
                <div className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto mb-4">
                  <TextField name="createSeed" aria-label="Character Summary">
                    <TextArea
                      id="textNoteManualWhole"
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden scrollWrapper min-h-[60px]"
                      placeholder="Add a summary for your character..."
                      ref={updateSeedRef}
                      value={updateSeed?.toString()}
                      onChange={(e) => setUpdateSeed(e.target.value)}
                    />
                  </TextField>
                </div>
                <div className="text-[12px] font-displayBold">Biography</div>
                <div className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto">
                  <TextField
                    name="updateContent"
                    aria-label="Character Biography"
                  >
                    <TextArea
                      id="textNoteManualWhole"
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden scrollWrapper min-h-[60px]"
                      placeholder="Add a biography for your character..."
                      ref={updateContentRef}
                      value={updateContent?.toString()}
                      onChange={(e) => setUpdateContent(e.target.value)}
                    />
                  </TextField>
                </div>
              </Form>
              <div className="p-4">
                <div className="flex justify-end items-center">
                  <div className="flex gap-2">
                    <Button
                      className="bg-primary text-white hover:bg-primary-hover transition py-2 px-4 text-sm rounded-full"
                      onPress={() => setEditCharacterDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-secondary text-white hover:bg-secondary-hover transition py-2 px-4 text-sm rounded-full"
                      onPress={handleUpdateCharacterProfile}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
