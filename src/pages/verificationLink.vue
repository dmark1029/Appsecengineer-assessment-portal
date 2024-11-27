<template>
  <q-layout>
    <q-header class="bg-dark" dark :elevated="false" style="border-bottom: 3px solid #f5f5fc">
      <q-img src="~assets/appsec.png" class="text-white" style="width: 150px; height: 100%" />
    </q-header>
    <q-page-container class="bg_color">
      <q-page>
        <q-spinner v-if="userStore.isLoading" class="absolute-center" color="blue" :thickness="4" label="Verifying..." size="7em">
          <div class="text-weight-bold text-h5" style="color: #000">Verifying</div>
        </q-spinner>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useUserStore } from 'src/stores/user'

const userStore = useUserStore()

let urlSearchParams = new URLSearchParams(window.location.search)
urlSearchParams = urlSearchParams.toString()
urlSearchParams = decodeURIComponent(urlSearchParams)
const url = encodeURI(urlSearchParams)
const splitItems = url.split('&')
const email = splitItems[0]?.match(/email=(.*)/)
const code = splitItems[1]?.match(/code=(.*)/)

if (email.length > 1 && code.length > 1) {
  let params = {
    email: email[1],
    code: code[1]
  }
  if (params.email && params.code) {
    params = params
    onSubmitLink(params)
  }
}

async function onSubmitLink(params) {
  if (!params.code) {
    this.$q.notify({
      type: 'negative',
      position: 'top',
      progress: true,
      icon: 'warning',
      message: 'Invalid link'
    })
  } else if (!params.email) {
    this.$q.notify({
      type: 'negative',
      position: 'top',
      progress: true,
      icon: 'warning',
      message: 'Please enter a valid email'
    })
  }
  if (params.email && params.code) {
    await userStore.loginUserVerify({
      username: params.email,
      answer: params.code
    })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;600&display=swap');

.bg_color {
  background-image: radial-gradient(circle, #f5f5fc 20%, #ffffff 100%);
}
</style>
