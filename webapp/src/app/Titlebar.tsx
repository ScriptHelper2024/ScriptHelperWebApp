"use client";
import { useState, useEffect } from "react";
import { FieldError, Input, TextField } from "react-aria-components";
import { useUpdateProjectMutation } from "@/graphql/__generated__/updateProject.generated";
import { MdEdit } from "react-icons/md";
import { useGetProjectTitleQuery } from "@/graphql/__generated__/getProjectTitle.generated";
interface TitlebarProps {
  movieId: string | null;
}
export default function Titlebar({ movieId }: TitlebarProps) {
  const [updateProject] = useUpdateProjectMutation();
  const [editTitle, setEditTitle] = useState(false);
  const [movieTitle, setMovieTitle] = useState<string>();
  const { data } = useGetProjectTitleQuery({
    variables: {
      id: movieId,
    },
    skip: !movieId,
    fetchPolicy: "cache-and-network",
  });
  useEffect(() => {
    setMovieTitle(data?.projectById?.title);
  }, [data]);
  useEffect(() => {
    setMovieTitle(movieTitle);
  }, [updateProject, movieTitle]);
  const handleEditTitle = () => {
    setEditTitle(true);
    setTimeout(() => {
      const input = document.getElementById("titleInput");
      if (input) {
        input.focus();
        input.style.width = `${input.scrollWidth}px`;
      }
    }, 0);
  };
  const handleCancelEditTitle = () => {
    setEditTitle(false);
    setMovieTitle(movieTitle);
  };
  const handleUpdateProject = () => {
    setEditTitle(false);
    updateProject({
      variables: {
        projectId: movieId,
        title: movieTitle,
      },
    });
  };
  const getInitials = (str: String | any) => {
    const words = str?.split(" ");
    if (!words) return "";
    const initials = words
      .slice(0, 2)
      .map((word: String | any) => word[0])
      .join("");
    return initials.toUpperCase();
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMovieTitle(e.target.value);
  };
  return (
    <div className="col-span-2 relative row-start-2 col-start-2 z-30">
      <div className="bg-white shadow-md shadow-black/5 z-10 w-full text-secondary relative flex px-4 items-center justify-between h-[74px] rounded-tr-2xl">
        <div className="flex items-center justify-start">
          {movieTitle && (
            <div className="bg-secondary rounded-full w-[50px] h-[50px] mr-3 flex items-center justify-center">
              <div className="font-displayBold text-white text-[18px]">
                {getInitials(movieTitle)}
              </div>
            </div>
          )}
          {editTitle ? (
            <>
              <TextField
                aria-label="Title field"
                isRequired
                className="relative"
              >
                <Input
                  id="titleInput"
                  className="border-[1px] border-light p-2 bg-offwhite rounded-md outline-none flex-1 min-w-[155px] pr-[30px] w-auto"
                  value={movieTitle}
                  onChange={handleChange}
                />
                <MdEdit className="opacity-100 text-secondary/30 hover:text-secondary absolute right-[10px] top-[12px] cursor-pointer" />
                <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
                  Please enter a title.
                </FieldError>
              </TextField>
              <div className="flex gap-2 pl-4">
                <div
                  className="outline-none rounded-full w-max flex gap-1 items-center bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 text-[12px] cursor-pointer"
                  onClick={handleUpdateProject}
                >
                  Save
                </div>
                <div
                  className="outline-none rounded-full w-max flex gap-1 items-center bg-red-500 text-offwhite hover:bg-red-400 transition py-[5px] px-4 text-[12px] cursor-pointer"
                  onClick={handleCancelEditTitle}
                >
                  Cancel
                </div>
              </div>
            </>
          ) : (
            <div
              className="flex gap-3 group hover:border-[1px] border-light p-2 hover:bg-offwhite hover:rounded-md w-fit items-center relative pr-10 hover:cursor-text"
              onClick={handleEditTitle}
            >
              {movieTitle}
              <MdEdit className="opacity-0 group-hover:opacity-100 text-secondary/30 hover:text-secondary absolute right-[10px] top-[11px] cursor-pointer" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
