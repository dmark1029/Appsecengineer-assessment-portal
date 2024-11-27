import axios from 'axios'
import { Cookies } from 'quasar'
import config from '../config'

export async function return_success_refresh_token(message) {
  if (message === 'The incoming token has expired') {
    const form_data = {
      refresh_token: Cookies.get('rtoken'),
      asses: true
    }
    return await axios
      .post(config.userPortalURLApi + 'user/refresh-token/', form_data, { headers: {} })
      .then((res) => {
        Cookies.set('token', res.data.data.AuthenticationResult.IdToken)
        window.location.reload()
        return res.data.data.AuthenticationResult.IdToken
      })
      .catch((error) => {
        window.location.href = '/'
        Cookies.remove('token')
        localStorage.clear()
        if (error.response) {
          if (error.response.data.message === 'Not a valid token') {
            Cookies.remove('token')
            localStorage.clear()
            window.location.href = '/'
          }
        }
      })
  } else if (message === 'Not a valid token') {
    Cookies.remove('token')
    localStorage.clear()
    window.location.href = '/'
  } else {
    window.location.href = '/'
  }
}

export default return_success_refresh_token
