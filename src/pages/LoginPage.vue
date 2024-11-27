<template>
  <LoadingScreen v-if="tokenLocal" />
  <q-layout v-else class="flex items-center justify-evenly window-height">
    <q-img src="/sign/man_books.svg" :ratio="591 / 493" width="30rem" />
    <q-page-container class="relative-position">
      <q-img class="absolute" :ratio="195 / 163" src="/sign/blue_circle.svg" style="margin: -3.75rem 0 0 -6.25rem" width="12.5rem" />
      <q-card
        class="absolute-center bg-indigo-14"
        square
        style="margin: -0.375rem 0 0 0.625rem; height: 31rem; max-width: 90vw; width: 25rem"
      >
        &nbsp;
      </q-card>
      <q-img
        class="absolute-bottom-right z-fab"
        :ratio="242 / 274"
        src="/sign/orange_form.svg"
        style="margin: 0 -4.375rem -7.1875rem 0"
        width="12.5rem"
      />
      <q-card class="bg-indigo-10 text-white" square style="height: 31rem; max-width: 90vw; width: 25rem">
        <q-card-section class="q-pa-xl text-center">
          <q-img alt="AppSecEngineer" :ratio="242 / 76" src="logo.svg" width="18.75rem" />
        </q-card-section>
        <div class="flex items-center justify-between">
          <q-separator color="indigo-14" size="2px" style="width: 25%" />
          <h1 class="inline-block q-my-none text-accent text-bold text-h6">ASSESSMENTS</h1>
          <q-separator color="indigo-14" size="2px" style="width: 25%" />
        </div>
        <q-card-section>
          <p class="text-h5 text-weight-regular">Sign In</p>
          <q-form greedy @submit.prevent="onSubmit">
            <q-input
              autofocus
              bg-color="indigo-14"
              color="white"
              dense
              :error="userStore.getSigninError.error"
              :error-message="userStore.getSigninError.message"
              input-class="text-white"
              label="Email"
              lazy-rules
              outlined
              ref="inputRef"
              required
              :rules="email"
              type="email"
              v-model="username"
              @blur="!username ? inputRef.resetValidation() : inputRef.validate()"
              @focus="inputRef.resetValidation()"
            />
            <q-btn
              style="border-radius: 8px"
              color="accent"
              :label="userStore.isLoading ? 'Loading...' : 'Continue without password'"
              no-caps
              size="md"
              text-color="white"
              type="submit"
            />
          </q-form>
        </q-card-section>
        <q-card-section class="q-pb-xl">
          <p class="q-mb-none text-subtitle2 text-weight-light">Not yet an AppSecEngineer?</p>
          <a class="text-primary text-subtitle2 text-weight-light" href="/signup" style="text-decoration: none">Get your plan now</a>
        </q-card-section>
      </q-card>
    </q-page-container>
    <q-footer class="bg-secondary flex items-center justify-between q-px-md" reveal>
      <h6 class="q-my-sm text-body2">Copyright &copy; Appsec Engineer PTE Ltd., Singapore {{ new Date().getFullYear() }}</h6>
      <div class="q-gutter-x-xl">
        <a href="https://ase-legal.sgp1.digitaloceanspaces.com/Terms%20of%20Use.pdf" target="_blank">Terms of Use</a>
        <a href="https://appsecengineer.com/privacy-policy" target="_blank">Privacy Policy</a>
      </div>
    </q-footer>

    <q-dialog v-model="showMagicLinkDialog">
      <q-card style="border-radius: 24px">
        <q-card-section class="text-right">
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-mb-xl q-mx-xl q-pa-none text-center">
          <div class="q-pb-xs q-px-lg">
            <p class="text-h5">Magic Link Sent to your email</p>
            <p class="text-subtitle1 text-weight-light">
              We have sent an email with sign-in link. Please sign-in using that link. The link will expire in three minutes.
            </p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { Cookies } from 'quasar'
import { useUserStore } from 'src/stores/user'
import { email } from 'src/utils/rules'
import { ref } from 'vue'
import LoadingScreen from 'pages/LoadingScreen'

const userStore = useUserStore()

const inputRef = ref(null)
const showMagicLinkDialog = ref(false)
const username = ref('')
const tokenLocal = ref(Cookies.get('token'))

if (Cookies.get('token') && Cookies.get('rtoken')) {
  const status = userStore.userProfile()
  status.then((res) => {
    if (res.success) {
      window.open('/tasks', '_self')
    } else {
      userStore.logOut()
    }
  })
}

async function onSubmit() {
  userStore.$reset()
  await userStore.loginData({ username: username.value })
  if (userStore.getSigninResponse.success) {
    showMagicLinkDialog.value = true
  }
}
</script>

<style scoped>
a {
  color: #fff;
  text-decoration: none;
}
</style>
