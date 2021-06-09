import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies, destroyCookie } from "nookies";
import decode from 'jwt-decode';

import { AuthTokenError } from "../errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermission";

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

    const user = decode<{ 
      permissions: string[];
      roles: string[];
    }>(token);
    if (options) {
      const { permissions, roles } = options;    
      const userHasValidPermissions = validateUserPermissions({
        permissions, roles, user
      })
      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard', //redirecionar para página onde todos tenham acesso, como home
            permanent: false, // relacionado ao http code
          }
        }
      }
    }

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