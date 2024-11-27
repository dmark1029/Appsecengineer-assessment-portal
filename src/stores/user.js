import jwt_decode from 'jwt-decode'
import { defineStore } from 'pinia'
import { Cookies, Notify } from 'quasar'
import authSigningFlow from 'src/utils/authSigningFlow'
import authUserPortal from 'src/utils/authUserPortal'

export const useUserStore = defineStore('user', {
  state: () => ({
    _isLoading: false,
    _user: null,
    signinError: {},
    signinResponse: {},
    signupError: {},
    hasToken: !!Cookies.get('token')
  }),

  getters: {
    getSigninError: (state) => state.signinError,
    getSigninResponse: (state) => state.signinResponse,
    getSignupError: (state) => state.signupError,
    isLoading: (state) => state._isLoading,
    user: (state) => state._user,
    userInfo: () => Cookies.get('user')
  },

  actions: {
    async fetchSignupUser(payload) {
      this._isLoading = true
      return await authUserPortal
        .post('contest/signup', payload)
        .then(() => {
          for (const [key] of Object.entries(Cookies.getAll())) {
            Cookies.remove(key)
          }
          window.open('/', '_self')
        })
        .catch((error) => {
          Notify.create({
            icon: 'warning',
            message: error.data.message.test_id[0] || error.data.message,
            position: 'top',
            progress: true,
            type: 'negative'
          })
          this.$patch({ signupError: error })
        })
        .finally(() => (this._isLoading = false))
    },

    async loginData(payload) {
      this._isLoading = true
      await authSigningFlow
        .post('auth/signin', payload)
        .then((res) => this.$patch({ signinResponse: res.data }))
        .catch((error) =>
          Notify.create({ icon: 'warning', message: error.data.message, position: 'top', progress: true, type: 'negative' })
        )
        .finally(() => (this._isLoading = false))
    },
    async userProfile() {
      this._isLoading = true
      return await authUserPortal
        .get('user/profile')
        .then(async (res) => res.data)
        .catch(async (error) => error)
        .finally(() => (this._isLoading = false))
    },

    async loginUserVerify(payload) {
      Cookies.set('trial', 'false')
      Cookies.remove('verify')
      this._isLoading = true
      await authSigningFlow
        .post('auth/respond', payload)
        .then((res) => {
          if (res.data.data.Session) {
            payload.session = res.data.data.Session
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: 'Invalid link' })
          }
          if (res.data.success) {
            const token = res.data.data.AuthenticationResult

            Cookies.set('token', token.IdToken)
            Cookies.set('rtoken', token.RefreshToken)
            Cookies.set('timeStampLogin', '')

            const decodedData = jwt_decode(token.IdToken)
            const date = new Date()
            const expSetTime = date.setSeconds(date.getSeconds() + 14400)

            Cookies.set('expTime', expSetTime)

            Cookies.set('publishLoginAPi', 'on')
            const user = {
              email: decodedData.email,
              firstName: decodedData.given_name,
              lastName: decodedData.family_name
            }

            Cookies.set('user', JSON.stringify(user))
            if (token.verify) {
              if (token.verify === 'OPTIONAL') {
                Cookies.set('verify', 'OPTIONAL')
              } else if (token.verify === 'FORCE') {
                Cookies.set('verify', 'FORCE')
              }
            }
            Cookies.remove('userId')
            window.open('/tasks', '_self')
          }
        })
        .catch((error) => {
          Notify.create({ icon: 'warning', message: error.data.message, position: 'top', progress: true, type: 'negative', timeout: 2000 })
          setTimeout(() => this.router.push('/login'), 3000)
        })
        .finally(() => (this._isLoading = false))
    },
    async logOut() {
      for (const [key] of Object.entries(Cookies.getAll())) {
        Cookies.remove(key)
      }
      localStorage.clear()
    }
  }
})
