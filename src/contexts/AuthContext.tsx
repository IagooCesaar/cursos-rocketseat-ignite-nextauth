import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from "../services/apiClient";

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
  signIn: (credentials: SigInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
}

const AuthContext = createContext({} as AuthContextData);


let authChannel: BroadcastChannel;

type AuthProviderProps = {
  children: ReactNode;
}

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');
  authChannel.postMessage('signOut')
  Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');
    authChannel.onmessage = (message) => {
      console.log('authChanel', message);
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        case 'signIn':
          Router.push('/dashboard')
          break;
        default:
          break;
      }
    }
  }, [])

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api.get('/me')
        .then(response => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        .catch(error => {
          signOut();
        })
    }
  }, [])

  async function signIn({ email, password }: SigInCredentials) {
    try {
      const response = await api.post('/sessions', {
        email,
        password
      })
      const { token, refreshToken, permissions, roles } = response.data;
      setCookie(
        undefined, // contexto de utilização. Se lado browser, deverá ser undefined
        'nextauth.token', // chave de identificação do cookie
        token, // valor a ser armazenado
        {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/', // caminhos da aplicação que terão acesso ao cookie, / é global
        }
      )
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      setUser({ email, permissions, roles });
      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
      authChannel.postMessage('signIn');
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      signIn,
      user,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const data = useContext(AuthContext);
  return data;
}