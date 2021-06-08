import axios, {AxiosError} from 'axios'
import { parseCookies, setCookie } from 'nookies'

let cookies = parseCookies();
let isRefreshing = false; // identifica se está obtendo novo token e refreshToken
let failedRequestsQueue = [];

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
      const originalConfig = error.config; // toda a configuração da requisição ao backend (rotas, parametros, etc)

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

          // Se conseguir gerar novos token, executar solicitações em fila
          failedRequestsQueue.forEach(request => request.onSuccess(token))
          failedRequestsQueue = [];
        }).catch(err =>{
          failedRequestsQueue.forEach(request => request.onFailure(err))
          failedRequestsQueue = [];
        }).finally(() => {
          isRefreshing = false;

        });
      }


      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalConfig));
          },
          onFailure: (err: AxiosError) => {
            reject(err)
          },
        })
      })
    } else {
      // efetuar logoff
    }
  }
  return error
})