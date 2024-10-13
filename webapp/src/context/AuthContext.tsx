import React, { useState, createContext, useEffect, ReactNode } from "react";

interface AuthContextProps {
  authState: string;
  setAuthState: (token: string | null) => void;
  isUserAuthenticated: () => boolean;
  emailVerified: boolean;
  setEmailVerified: (verified: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({
  authState: "",
  setAuthState: (token: string | null) => {},
  isUserAuthenticated: () => false,
  emailVerified: false,
  setEmailVerified: (verified: boolean) => {},
});

const { Provider } = AuthContext;

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Checks if the user is authenticated or not
  const isUserAuthenticated = () => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("AUTH_TOKEN");
      return !!storedToken;
    }
    return false;
  };

  const [authState, setAuthState] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    // On mount, check if the user is authenticated
    setAuthState(isUserAuthenticated() ? "LOGGED_IN" : "");
  }, []);

  const setUserAuthInfo = (token: string | null) => {
    if (typeof window !== "undefined") {
      // Check if window is defined (not in SSR)
      if (!token) {
        localStorage.removeItem("AUTH_TOKEN");
        setAuthState("");
        return;
      }
      localStorage.setItem("AUTH_TOKEN", token);
      setAuthState("LOGGED_IN");
    }
  };

  return (
    <Provider
      value={{
        authState,
        setAuthState: (token: string | null) => setUserAuthInfo(token),
        isUserAuthenticated,
        emailVerified,
        setEmailVerified,
      }}
    >
      {children}
    </Provider>
  );
};

export { AuthContext, AuthProvider };
