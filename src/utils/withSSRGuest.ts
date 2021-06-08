import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest(fn: GetServerSideProps) {
  // High Order Function - HOR (função que retorna função)
  return async (context: GetServerSidePropsContext) => {
    const cookies = parseCookies(context);

    if (cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false, // relacionado ao http code
        }
      }
    }

    return await fn(context);
  }
}