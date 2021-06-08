import { createContext, ReactNode, useContext, useState } from "react";
import Router from 'next/router'
import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SigInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SigInCredentials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
}

const AuthContext = createContext({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user;

  async function signIn({ email, password }: SigInCredentials) {
    try {
      const response = await api.post('/sessions', {
        email,
        password
      })
      const { permissions, roles } = response.data;
      setUser({
        email,
        permissions,
        roles,
      })

      Router.push('/dashboard')
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      signIn,
      user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const data = useContext(AuthContext);
  return data;
}