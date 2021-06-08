import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies, destroyCookie } from "nookies";
import decode from 'jwt-decode';

import { AuthTokenError } from "../errors/AuthTokenError";

type WithSSRAuthOptions = {
  permissions?: string[];  
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  // High Order Function - HOR (função que retorna função)
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);
    const token = cookies['nextauth.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false, // relacionado ao http code
        }
      }
    }

    const user = decode(token);
    console.log('Dados do usuário contidos no token', user)

    try {
      return await fn(context);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(context, 'nextauth.token');
        destroyCookie(context, 'nextauth.refreshToken');
        
        return {
          redirect: {
            destination: '/',
            permanent: false, // relacionado ao http code
          }
        }  
      }
    }
  }
}