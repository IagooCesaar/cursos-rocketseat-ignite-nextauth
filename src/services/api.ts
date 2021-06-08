import axios, {AxiosError} from 'axios'
import { parseCookies } from 'nookies'

const cookies = parseCookies();

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
      // renovar token
    } else {
      // efetuar logoff
    }
  }
  return error
})