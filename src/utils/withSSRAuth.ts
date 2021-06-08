import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies, destroyCookie } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  // High Order Function - HOR (função que retorna função)
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);

    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false, // relacionado ao http code
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