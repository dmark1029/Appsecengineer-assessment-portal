<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey" elevated>
      <q-toolbar>
        <q-toolbar-title class="text-body1">
          <BreadcrumbsElement />
        </q-toolbar-title>
        <q-space />
        <q-btn-dropdown color="dark" label="Account" no-caps :style="{ 'font-weight': 600, 'font-size': '12px', 'border-radius': '7px' }">
          <q-list style="min-width: 100px">
            <q-item clickable @click="profilePage()">
              <q-item-section side>
                <q-icon class="ase-xs" name="face" />
              </q-item-section>
              <q-item-section class="ase-roboto ase-md ase-sm-bold ase-custom-grey">Profile</q-item-section>
            </q-item>
            <q-item clickable @click="logout()">
              <q-item-section side>
                <q-icon class="ase-xs" name="logout" />
              </q-item-section>
              <q-item-section class="ase-roboto ase-md ase-sm-bold ase-custom-grey" @click="logout()">Logout</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
      <q-footer class="bg-dark flex justify-between q-px-md text-caption">
        <span>AppSecEngineer © {{ new Date().getFullYear() }}</span>
        <a class="text-white" href="https://www.appsecengineer.com/privacy-policy">Privacy Policy</a>
      </q-footer>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import BreadcrumbsElement from 'src/layouts/BreadcrumbsElement.vue'
import { useUserStore } from 'src/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

function profilePage() {
  router.push('/profile')
}

function logout() {
  userStore.logOut()
  window.location.href = '/'
}
</script>
