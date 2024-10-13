"use client";
import Link from "next/link";
import { useProjectsQuery } from "@/graphql/__generated__/projects.generated";
import { formatDistanceToNowShort } from "@/utils/utils";
import {
  MdAdd,
  MdAddCircle,
  MdAddCircleOutline,
  MdDelete,
  MdOutlineMovie,
} from "react-icons/md";
import { Button } from "react-aria-components";
import { useArchiveProjectMutation } from "@/graphql/__generated__/archiveProject.generated";
import { useContext, useEffect, useState } from "react";
import { Project } from "@/types";
import { redirect } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function Home() {
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);
  const { data, refetch } = useProjectsQuery({
    fetchPolicy: "cache-and-network",
  });
  const [archivingProjectId, setArchivingProjectId] = useState<string | null>(
    null
  );
  const [archiveProject] = useArchiveProjectMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project>();
  const handleDeleteProject = (project: any) => {
    setArchivingProjectId(project?.id);
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (projectId: any) => {
    try {
      await archiveProject({ variables: { projectId } });
    } catch (error) {
      console.error("Error archiving project:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      refetch();
    }
  };
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <>
      <div className="scrollWrapper overflow-y-auto overflow-x-hidden col-start-2 col-span-full row-start-1 row-span-full flex flex-col gap-4 z-10 -mr-8">
        <div className="relative pt-16">
          <h3 className="mt-8 mb-8 z-1 font-displayBold text-[48px] leading-[52px] my-auto pt-16 lg:pt-0 pl-4">
            <span className="font-display opacity-30">Your story</span>{" "}
            <span className="font-sans">starts here.</span>
          </h3>
          <div className="flex gap-20 w-full max-w-[1100px]">
            <div className="grid grid-cols-1 gap-[20px] p-8 pl-4 w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {data?.projects && data?.projects?.length > 0 ? (
                <>
                  <Link
                    href={`/home/new`}
                    className={`flex flex-col bg-white transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px]`}
                  >
                    <div className="w-full aspect-video overflow-hidden bg-secondary rounded-lg mb-3">
                      <div className="w-full aspect-video bg-hero bg-cover flex justify-center items-center hover:scale-[1.1] hover:bg-opacity-50 transition duration-500">
                        <MdAddCircle className="text-white" size={32} />
                      </div>
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold">
                      New Project
                    </span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between">
                      Quickstart a fresh project
                    </span>
                  </Link>
                  {data?.projects
                    ?.slice()
                    .reverse()
                    .map((project) => (
                      <div
                        key={project?.id}
                        className={`flex flex-col bg-white transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px] ${
                          archivingProjectId === project?.id
                            ? "opacity-50 animate-pulse"
                            : ""
                        }`}
                      >
                        <Link href={`/movie/movie?id=${project?.id}`}>
                          <div className="w-full aspect-video bg-gradient-to-t from-secondary to-secondary-hover flex items-center justify-center bg-cover rounded-lg mb-3 text-white">
                            <MdOutlineMovie size="64" className="opacity-20" />
                          </div>
                          <span className="text-[18px] leading-[22px] font-displayBold">
                            {project?.title}
                          </span>
                        </Link>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xs text-grey flex gap-1 items-center justify-between">
                            Last updated{" "}
                            {formatDistanceToNowShort(
                              new Date(project?.updatedAt)
                            )}
                          </span>
                          <Button
                            onPress={() => handleDeleteProject(project)}
                            className="flex items-center gap-1 text-[12px] group"
                          >
                            <span className="opacity-0 group-hover:opacity-100 transition">
                              Delete
                            </span>{" "}
                            <MdDelete
                              size={14}
                              className="opacity-30 group-hover:opacity-100 transition"
                            />
                          </Button>
                        </div>
                      </div>
                    ))}
                </>
              ) : data?.projects ? (
                <>
                  <Link
                    href={`/home/new`}
                    className={`flex flex-col bg-white transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px]`}
                  >
                    <div className="w-full aspect-video overflow-hidden bg-secondary rounded-lg mb-3">
                      <div className="w-full aspect-video bg-hero bg-cover flex justify-center items-center hover:scale-[1.1] hover:bg-opacity-50 transition duration-500">
                        <MdAddCircle className="text-white" size={32} />
                      </div>
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold">
                      New Project
                    </span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between">
                      Quickstart a fresh project
                    </span>
                  </Link>
                  <div className="flex flex-col bg-offwhite transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px] animate-pulse duration-[1000ms]">
                    <div className="w-full aspect-video bg-gradient-to-t from-light to-light-hover flex items-center justify-center bg-cover rounded-lg mb-3 text-white">
                      <MdOutlineMovie size="64" className="opacity-20" />
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold text-transparent"></span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between text-transparent"></span>
                  </div>
                  <div className="flex flex-col bg-offwhite transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px] animate-pulse duration-[1200ms]">
                    <div className="w-full aspect-video bg-gradient-to-t from-light to-light-hover flex items-center justify-center bg-cover rounded-lg mb-3 text-white">
                      <MdOutlineMovie size="64" className="opacity-20" />
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold text-transparent"></span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between text-transparent"></span>
                  </div>
                  <div className="flex flex-col bg-offwhite transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px] animate-pulse duration-[1400ms]">
                    <div className="w-full aspect-video bg-gradient-to-t from-light to-light-hover flex items-center justify-center bg-cover rounded-lg mb-3 text-white">
                      <MdOutlineMovie size="64" className="opacity-20" />
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold text-transparent"></span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between text-transparent"></span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href={`/home/new`}
                    className={`flex flex-col bg-white transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px]`}
                  >
                    <div className="w-full aspect-video overflow-hidden bg-secondary rounded-lg mb-3">
                      <div className="w-full aspect-video bg-hero bg-cover flex justify-center items-center hover:scale-[1.1] hover:bg-opacity-50 transition duration-500">
                        <MdAddCircle className="text-white" size={32} />
                      </div>
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold">
                      New Project
                    </span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between">
                      Quickstart a fresh project
                    </span>
                  </Link>
                  <div className="flex flex-col bg-offwhite transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px] animate-pulse duration-[1000ms]">
                    <div className="w-full aspect-video bg-gradient-to-t from-light to-light-hover flex items-center justify-center bg-cover rounded-lg mb-3 text-white">
                      <MdOutlineMovie size="64" className="opacity-20" />
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold text-transparent"></span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between text-transparent"></span>
                  </div>
                  <div className="flex flex-col bg-offwhite transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px] animate-pulse duration-[1200ms]">
                    <div className="w-full aspect-video bg-gradient-to-t from-light to-light-hover flex items-center justify-center bg-cover rounded-lg mb-3 text-white">
                      <MdOutlineMovie size="64" className="opacity-20" />
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold text-transparent"></span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between text-transparent"></span>
                  </div>
                  <div className="flex flex-col bg-offwhite transition rounded-2xl p-4 relative shadow-md hover:shadow-xl min-h-[248px] animate-pulse duration-[1400ms]">
                    <div className="w-full aspect-video bg-gradient-to-t from-light to-light-hover flex items-center justify-center bg-cover rounded-lg mb-3 text-white">
                      <MdOutlineMovie size="64" className="opacity-20" />
                    </div>
                    <span className="text-[18px] leading-[22px] font-displayBold text-transparent"></span>
                    <span className="text-xs flex gap-1 items-center mt-auto pt-2 justify-between text-transparent"></span>
                  </div>
                </>
              )}
              <div className="h-[100px] w-full"></div>
            </div>
          </div>
          <div className="bg-gradient-to-t from-light to-transparent sticky bottom-0 left-0 right-0 h-[100px]"></div>
        </div>
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
            <div className="rounded-2xl bg-white border-[1px] w-full max-w-[460px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px]">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 pt-4 pb-4 border-[1px]">
                  <div className="text-center font-displayBold text-[18px]">
                    Delete &quot;{projectToDelete?.title}&quot;
                  </div>
                </div>
                <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                  Are you sure you want to delete this project?{" "}
                  <div className="font-displaySemiBold text-red-500">
                    This action is irreversible.
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-end items-center">
                    <div className="flex gap-2">
                      <button
                        className="bg-red-500 hover:bg-red-400 transition text-white py-2 px-4 text-sm rounded-full"
                        onClick={() => handleDeleteConfirm(projectToDelete?.id)}
                      >
                        Delete Permanently
                      </button>
                      <div
                        className="bg-secondary hover:bg-secondary-hover transition text-white py-2 px-4 text-sm rounded-full cursor-pointer"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancel
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
