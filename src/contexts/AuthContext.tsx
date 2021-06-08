import { createContext } from "react";

type SigInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SigInCredentials): Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }) {
  const isAuthenticated = false;
  async function signIn({ email, password }: SigInCredentials) {
    console.log({ email, password });
  }
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      signIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}