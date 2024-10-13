import { useSearchParams } from "next/navigation";
import React, { createContext, useState } from "react";

interface VersionContextProps {
  version: number;
  setVersion: React.Dispatch<React.SetStateAction<number>>;
}

export const VersionContext = createContext<VersionContextProps>({
  version: 0,
  setVersion: () => {},
});

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [version, setVersion] = useState(2);
  return (
    <VersionContext.Provider value={{ version, setVersion }}>
      {children}
    </VersionContext.Provider>
  );
};
