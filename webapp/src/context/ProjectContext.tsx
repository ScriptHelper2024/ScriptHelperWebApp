import { Project } from "@/types";
import { createContext, useContext, useState } from "react";

const ProjectContext = createContext({
  project: null as Project | null,
  createProject: (project: Project) => {},
  deleteProject: () => {},
  updateProject: (project: Project) => {},
  getProject: (project: Project) => {},
});

const { Provider } = ProjectContext;

function useProject() {
  return useContext(ProjectContext);
}

const ProjectProvider = ({ children }: any) => {
  const [project, setProject] = useState<Project | null>(null);

  function createProject(newProject: Project) {
    setProject(newProject);
  }

  function deleteProject() {
    setProject(null);
  }

  function updateProject(updatedProject: Project) {
    setProject(updatedProject);
  }

  function getProject(retrievedProject: Project) {
    setProject(retrievedProject);
  }

  return (
    <Provider
      value={{
        project,
        createProject,
        deleteProject,
        updateProject,
        getProject,
      }}
    >
      {children}
    </Provider>
  );
};

export { ProjectContext, ProjectProvider, useProject };
