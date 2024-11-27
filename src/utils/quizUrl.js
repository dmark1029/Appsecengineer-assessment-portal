import axios from 'axios'
import { Cookies } from 'quasar'
import config from '../config'
import { return_success_refresh_token } from './saveNewToken'

let tokenValue = Cookies.get('token')
let rTokenValue = Cookies.get('rtoken')
if (tokenValue) {
  localStorage.setItem('token', tokenValue)
  localStorage.setItem('rtoken', rTokenValue)
}
const instance = axios.create({
  baseURL: config.quizUrl,
  headers: {
    Authorization: Cookies.get('token')
  }
})
instance.interceptors.response.use(
  (res) => {
    return res
  },
  (error) => {
    if (error.response.status === 401 && Cookies.get('token') && Cookies.get('rtoken')) {
      if (error.response.data.message === 'The incoming token has expired') {
        return return_success_refresh_token(error.response.data.message).then(async (refreshTokenResponse) => {
          axios.interceptors.request.use(async function (config) {
            const token = Cookies.get('token')
            config.headers.Authorization = token
            return config
          })
          if (refreshTokenResponse === Cookies.get('token')) {
            const reCallApi = error.response.config
            reCallApi.headers.Authorization = Cookies.get('token')
            instance.interceptors.request.use((request) => {
              request.headers.Authorization = Cookies.get('token')
              return request
            })
            Cookies.set('token', Cookies.get('token'))
            return axios(reCallApi)
          }
        })
      } else if (error.response.data.message === 'Unauthorized') {
        for (const [key] of Object.entries(Cookies.getAll())) {
          Cookies.remove(key)
        }
        window.location.href = '/'
        return Promise.reject(error.response)
      }
    } else {
      return Promise.reject(error.response)
    }
  }
)

export default instance
