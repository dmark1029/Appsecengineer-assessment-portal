<template>
  <q-layout class="flex items-center justify-evenly window-height">
    <q-page-container class="relative-position">
      <q-img class="absolute" :ratio="195 / 163" src="/sign/blue_circle.svg" style="margin: -3.75rem 0 0 -6.25rem" width="12.5rem" />
      <q-card
        class="absolute-center bg-indigo-14"
        square
        style="margin: -0.375rem 0 0 0.625rem; height: 38rem; max-width: 90vw; width: 27rem"
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
      <q-card class="bg-indigo-10 text-white" square style="height: 38rem; max-width: 90vw; width: 27rem">
        <q-card-section class="q-pa-xl text-center">
          <q-img alt="AppSecEngineer" :ratio="242 / 76" src="logo.svg" />
        </q-card-section>
        <div class="flex items-center justify-between">
          <q-separator color="indigo-14" size="2px" style="width: 25%" />
          <h1 class="inline-block q-my-none text-accent text-bold text-h6">ASSESSMENTS</h1>
          <q-separator color="indigo-14" size="2px" style="width: 25%" />
        </div>
        <q-card-section class="q-px-lg">
          <p class="text-h6 text-weight-regular">Verify your Email</p>
          <q-form autofocus greedy @submit.prevent="onSubmit">
            <p style="color: red" v-if="signupErrorData.data ? signupErrorData.data.message.test_id : false">
              {{ signupErrorData.data.message.test_id.toString() }} Test
            </p>
            <BaseInput input-class="text-white" bg-color="indigo-14" label="First Name" required :rules="shortName" v-model="firstName" />
            <p style="color: red" v-if="signupErrorData.data ? signupErrorData.data.message.first_name : false">
              {{ signupErrorData.data.message.first_name.toString() }}
            </p>
            <BaseInput input-class="text-white" bg-color="indigo-14" label="Last Name" required :rules="shortName" v-model="lastName" />
            <p style="color: red" v-if="signupErrorData.data ? signupErrorData.data.message.last_name : false">
              {{ signupErrorData.data.message.last_name.toString() }}
            </p>
            <BaseInput
              input-class="text-white"
              bg-color="indigo-14"
              :error="userStore.getSigninError.error"
              :error-message="userStore.getSigninError.message"
              label="Email"
              required
              :rules="email"
              type="email"
              v-model="mail"
            />
            <p style="color: red" v-if="signupErrorData.data ? signupErrorData.data.message.email : false">
              {{ signupErrorData.data.message.email.toString() }}
            </p>
            <q-btn
              color="accent"
              :label="userStore.isLoading ? 'Loading...' : 'Sign Up'"
              no-caps
              size="md"
              style="border-radius: 8px"
              text-color="white"
              type="submit"
            />
          </q-form>
        </q-card-section>
        <q-card-section class="q-pb-xl">
          <p class="q-mb-none text-subtitle2 text-weight-light">Already have account?</p>
          <a class="text-primary text-subtitle2 text-weight-light" href="/login" style="text-decoration: none">Login</a>
        </q-card-section>
      </q-card>
    </q-page-container>
    <q-img :ratio="783 / 429" src="/sign/people_board.svg" width="45rem" />

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
import BaseInput from 'src/components/BaseInput.vue'
import { useUserStore } from 'src/stores'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { email, shortName } from 'src/utils/rules'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()

const showMagicLinkDialog = ref(false)
const firstName = ref('')
const lastName = ref('')
const mail = ref('')
userStore.logOut()
const route = useRoute()
const testId = urlSafeBase64Decode(route.params.testId)
const signupErrorData = ref({})
watchEffect(() => {
  signupErrorData.value = userStore.getSignupError
})
async function onSubmit() {
  userStore.$reset()

  const data = {
    first_name: firstName.value,
    last_name: lastName.value,
    email: mail.value,
    test_id: testId
  }
  const status = await userStore.fetchSignupUser(data)
  if (status?.status === 200) {
    window.open('/', '_self')
  }
}
</script>

<style scoped>
a {
  color: #fff;
  text-decoration: none;
}
</style>
