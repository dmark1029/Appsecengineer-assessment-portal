import jwt_decode from 'jwt-decode'
import { Cookies } from 'quasar'
import { useUserStore } from 'src/stores'
import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '',
    alias: '/login',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/auth',
    component: () => import('pages/verificationLink.vue')
  },
  {
    path: '/signup/:testId',
    component: () => import('src/pages/SignupPage.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: (_to, _from, next) => {
      if (_to.query.rtoken && _to.query.token) {
        Cookies.set('rtoken', `${_to.query.rtoken}`)
        Cookies.set('token', `${_to.query.token}`)
        Cookies.set('timeStampLogin', '')

        const token = `${_to.query.token}`

        try {
          const decodedData: {
            email: string
            given_name: string
            family_name: string
          } = jwt_decode(token)

          const date = new Date()
          const expSetTime = date.setSeconds(date.getSeconds() + 14400)
          Cookies.set('expTime', `${expSetTime}`)

          Cookies.set('publishLoginAPi', 'on')

          const user = {
            email: decodedData.email,
            firstName: decodedData.given_name,
            lastName: decodedData.family_name
          }
          Cookies.set('user', JSON.stringify(user))

          Cookies.remove('userId')
          window.open('/tasks', '_self')
        } catch (error) {}
      }
      const userStore = useUserStore()
      userStore.hasToken ? next() : next({ path: '/' })
    },
    children: [
      {
        path: 'tasks',
        component: () => import('src/pages/TasksPage.vue'),
        meta: { title: 'Assessments', icon: 'assessment' }
      },
      {
        path: 'user-challenges/:id/:type',
        component: () => import('src/pages/CertificationPage.vue'),
        meta: { title: 'Assigned Challenges', icon: 'fas fa-chess-board' }
      },
      {
        path: '/:testId/:labId/:companyId',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Challenge', icon: 'quiz' }
      },
      {
        path: '/:testId/challenge/:challengeId/:companyId',
        component: () => import('pages/customQuiz.vue'),
        meta: { title: 'Challenge', icon: 'quiz' }
      },
      {
        path: '/solution/info/:testId/:labId/:companyId',
        component: () => import('pages/SolutionPage.vue'),
        meta: { title: 'Solution page', icon: 'emoji_objects' }
      },
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { title: 'User profile', icon: 'person' }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    alias: '/404',
    component: () => import('pages/404Error.vue')
  }
]

export default routes
