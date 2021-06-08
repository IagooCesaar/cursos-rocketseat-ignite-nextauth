import axios, {AxiosError} from 'axios'
import { parseCookies, setCookie } from 'nookies'

let cookies = parseCookies();
let isRefreshing = false; // identifica se está obtendo novo token e refreshToken

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
})

api.interceptors.response.use(successResponse => {
  return successResponse; // sem modificações
}, (error: AxiosError) => {
  if (error.response.status === 401) { // código de status http
    if (error.response.data?.code === 'token.expired') { //código recuperado do backend
      cookies = parseCookies(); // recuperando cookies atualizados
      const { 'nextauth.refreshToken': refreshToken } = cookies;

      if(!isRefreshing){
        isRefreshing = true;
      
        api.post('/refresh', {
          refreshToken,
        }).then(response => {
          const { token, refreshToken: newRefreshToken } = response.data;
          setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
          })
          setCookie(undefined, 'nextauth.refreshToken', newRefreshToken, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
          });
          api.defaults.headers['Authorization'] = `Bearer ${token}`;
        });
      }
    } else {
      // efetuar logoff
    }
  }
  return error
})