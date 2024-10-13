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
import { useCreateLocationProfileMutation } from "@/graphql/__generated__/createLocation.generated";
import { useUpdateLocationProfileMutation } from "@/graphql/__generated__/updateLocation.generated";
import { useSceneData } from "@/context/SceneContext";
import { useListProjectLocationsQuery } from "@/graphql/__generated__/listProjectLocations.generated";
import { useGetLocationObjectQuery } from "@/graphql/__generated__/getLocationObject.generated";
import { UploadButton } from "@/utils/uploadthing";
import { LocationProfile } from "@/types";
import { redirect } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function Locations() {
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);
  const { movieId } = useSceneData();
  const [addLocationDialog, setAddLocationDialogOpen] = useState(false);
  const [editLocationDialog, setEditLocationDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSeed, setCreateSeed] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateSeed, setUpdateSeed] = useState("");
  const [updateImage, setUpdateImage] = useState("");
  const [updateLocation, setUpdateLocation] = useState<
    LocationProfile | undefined | null
  >();
  const [selectedLocation, setSelectedLocation] = useState<
    LocationProfile | undefined | null
  >();
  const createSeedRef = React.useRef(null);
  const updateContentRef = React.useRef(null);
  const updateSeedRef = React.useRef(null);

  const { data: locations, refetch: refetchProjectLocations } =
    useListProjectLocationsQuery({
      variables: { projectId: movieId },
      skip: !movieId,
    });

  const { data: locationData } = useGetLocationObjectQuery({
    variables: {
      projectId: movieId,
      textId: selectedLocation?.id,
    },
    skip: !selectedLocation,
  });

  const [createLocationProfile] = useCreateLocationProfileMutation();
  const [updateLocationProfile] = useUpdateLocationProfileMutation();

  const handleOpenAddLocationDialog = () => {
    setCreateName("");
    setCreateSeed("");
    setAddLocationDialogOpen(true);
  };

  const handleCreateLocationProfile = async () => {
    setAddLocationDialogOpen(false);
    try {
      await createLocationProfile({
        variables: {
          projectId: movieId,
          name: createName,
          textSeed: createSeed,
        },
        onCompleted: (data) => {
          refetchProjectLocations();
          setEditLocationDialogOpen(false);
          setSelectedLocation(data.createLocationProfile?.locationProfile);
        },
      });
    } catch (error) {
      console.error("Error creating location profile", error);
    }
  };

  useEffect(() => {
    console.log(locations);
    {
      !selectedLocation &&
        locations?.listProjectLocations &&
        setSelectedLocation(locations?.listProjectLocations[0]);
    }
  }, [locations]);

  const handleUpdateLocationDialog = () => {
    setUpdateLocation(
      (locationData?.getLocationProfile as LocationProfile) || null
    );
    setUpdateName(locationData?.getLocationProfile?.name || "");
    setUpdateSeed(locationData?.getLocationProfile?.textSeed || "");
    setUpdateContent(locationData?.getLocationProfile?.textContent || "");
    setUpdateImage(locationData?.getLocationProfile?.textNotes || "");
    setEditLocationDialogOpen(true);
  };

  const handleUpdateLocationProfile = async () => {
    const { data } = await updateLocationProfile({
      variables: {
        projectId: movieId,
        name: updateName,
        textId: updateLocation?.id,
        textSeed: updateSeed,
        textContent: updateContent,
        textNotes: updateImage,
      },
      onCompleted: (data) => {
        refetchProjectLocations();
        setEditLocationDialogOpen(false);
        setSelectedLocation(data.updateLocationProfile?.locationProfile);
      },
    });
  };
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <>
      <div className="flex gap-8 border-[1px] border-secondary border-dashed p-6 rounded-lg h-full">
        <div className="w-2/5">
          <div className="mb-4 flex justify-between items-start">
            <div className="text-[20px] font-displaySemiBold leading-[28px]">
              {locationData?.getLocationProfile?.name}
            </div>
            <div>
              {locationData?.getLocationProfile?.name &&
                locationData?.getLocationProfile?.textSeed &&
                locationData?.getLocationProfile?.textContent &&
                locationData?.getLocationProfile?.textNotes && (
                  <Button
                    onPress={handleUpdateLocationDialog}
                    className="bg-secondary text-white transition hover:bg-secondary-hover outline-none rounded-full py-[5px] px-4 text-[12px] w-max flex gap-1 items-center cursor-pointer"
                  >
                    <MdEdit />
                    Edit Location
                  </Button>
                )}
            </div>
          </div>
          <div className="text-[14px]">
            {locationData && (
              <>
                {locationData?.getLocationProfile?.textSeed ? (
                  <div className="whitespace-pre-line">
                    {locationData?.getLocationProfile?.textSeed}
                  </div>
                ) : (
                  <div>
                    <Button
                      onPress={handleUpdateLocationDialog}
                      className="text-secondary transition hover:text-secondary-hover text-[12px] flex gap-1 items-center cursor-pointer"
                    >
                      <MdEdit />
                      Add a summary
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="w-3/5">
          {locationData ? (
            <div
              className={`rounded-lg bg-cover bg-top bg-no-repeat bg-grey/20 w-full aspect-video flex justify-center items-center group cursor-pointer`}
              style={{
                backgroundImage: locationData?.getLocationProfile?.textNotes
                  ? `url(${locationData.getLocationProfile.textNotes})`
                  : 'url("/location-placeholder.jpg")',
              }}
              onClick={handleUpdateLocationDialog}
            >
              <div
                className={`inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full w-8 h-8 bg-white ${
                  !locationData?.getLocationProfile?.textNotes && "!opacity-100"
                }`}
              >
                <MdEdit size={16} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-cover bg-top bg-no-repeat bg-grey/20 w-full aspect-video relative"></div>
          )}
        </div>
      </div>
      <div className="flex gap-8 h-full p-6">
        <div className="w-2/5">
          <div className="text-[20px] font-displaySemiBold mb-4">Locations</div>
          <div className="mb-4 flex flex-col gap-2 items-start">
            {locations?.listProjectLocations?.map((location: any) => (
              <Button
                key={location?.id}
                className={`rounded-full py-1 px-4 inline w-auto transition ${
                  selectedLocation?.id === location?.id
                    ? "bg-secondary text-white hover:bg-secondary-hover"
                    : "bg-light text-secondary hover:bg-light-hover"
                }`}
                onPress={() => {
                  setSelectedLocation(location);
                }}
              >
                {location?.name}
              </Button>
            ))}
          </div>
          <Button
            onPress={handleOpenAddLocationDialog}
            className="text-secondary hover:text-secondary-hover transition w-max flex gap-1 items-center cursor-pointer"
          >
            <MdAddCircle />
            Add New Location
          </Button>
        </div>
        <div className="w-3/5">
          <div className="font-displaySemiBold text-[20px] mb-4">Biography</div>
          {locationData?.getLocationProfile?.textContent ? (
            <div className="whitespace-pre-line">
              {locationData?.getLocationProfile?.textContent}
            </div>
          ) : (
            <div>
              <Button
                onPress={handleUpdateLocationDialog}
                className="text-secondary transition hover:text-secondary-hover text-[12px] flex gap-1 items-center cursor-pointer"
              >
                <MdEdit />
                Add a biography
              </Button>
            </div>
          )}
        </div>
      </div>

      {addLocationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
          <div className="rounded-2xl bg-white border-[1px] border-light w-full max-w-[460px] min-w-[300px] m-3 transition relative text-[14px] leading-[24px]">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="border-b-[1px] px-4 py-3">
                <div className="text-center font-displayBold text-[18px]">
                  Add a Location Profile
                </div>
                <div
                  className="absolute top-4 right-4 cursor-pointer text-[18px]"
                  onClick={() => setAddLocationDialogOpen(false)}
                >
                  <MdClose />
                </div>
              </div>
              <Form className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                <div className="text-[12px] font-displayBold">Name</div>
                <div className="mb-3">
                  <TextField
                    name="createName"
                    aria-label="Location Name"
                    isRequired
                  >
                    <Input
                      id="textNoteManualWhole"
                      className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto mb-4 p-3 w-full max-h-full focus:outline-none"
                      placeholder="Add a name for your location..."
                      value={createName?.toString()}
                      onChange={(e) => setCreateName(e.target.value)}
                    />
                    <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 text-center mt-2">
                      Location name is required.
                    </FieldError>
                  </TextField>
                </div>
                <div className="text-[12px] font-displayBold">Summary</div>
                <div className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto mb-4">
                  <TextField name="createSeed" aria-label="Location Summary">
                    <TextArea
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden scrollWrapper min-h-[60px]"
                      placeholder="Add a summary for your location..."
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
                      onPress={() => setAddLocationDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`bg-secondary text-white hover:bg-secondary-hover transition py-2 px-4 text-sm rounded-full ${
                        !createName ? "opacity-80" : ""
                      }`}
                      onPress={handleCreateLocationProfile}
                      isDisabled={!createName}
                    >
                      Add Location
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editLocationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
          <div className="rounded-2xl bg-white border-[1px] border-light w-full max-w-[460px] min-w-[300px] m-3 transition relative text-[14px] leading-[24px]">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="border-b-[1px] px-4 py-3">
                <div className="text-center font-displayBold text-[18px]">
                  Edit {updateName}
                </div>
                <div
                  className="absolute top-4 right-4 cursor-pointer text-[18px]"
                  onClick={() => setEditLocationDialogOpen(false)}
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
                      : 'url("/location-placeholder.jpg")',
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
                    aria-label="Location Name"
                    isRequired
                  >
                    <Input
                      id="textNoteManualWhole"
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden"
                      placeholder="Add a name for your location..."
                      value={updateName?.toString()}
                      onChange={(e) => setUpdateName(e.target.value)}
                    />
                    <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
                      Location name is required.
                    </FieldError>
                  </TextField>
                </div>
                <div className="text-[12px] font-displayBold">Summary</div>
                <div className="border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto mb-4">
                  <TextField name="createSeed" aria-label="Location Summary">
                    <TextArea
                      id="textNoteManualWhole"
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden scrollWrapper min-h-[60px]"
                      placeholder="Add a summary for your location..."
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
                    aria-label="Location Biography"
                  >
                    <TextArea
                      id="textNoteManualWhole"
                      className="p-3  h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-y-auto overflow-x-hidden scrollWrapper min-h-[60px]"
                      placeholder="Add a biography for your location..."
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
                      onPress={() => setEditLocationDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-secondary text-white hover:bg-secondary-hover transition py-2 px-4 text-sm rounded-full"
                      onPress={handleUpdateLocationProfile}
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
