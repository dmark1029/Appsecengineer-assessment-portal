<template>
  <q-card class="q-mx-auto q-my-lg absolute-center radius-8" style="width: 700px; max-width: 90vw">
    <q-card-section>
      <div class="text-bold text-primary text-h6">Profile</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label class="flex items-center q-gutter-xs text-grey-8">
              <q-icon name="mail_outline" outline />
              <p class="q-mb-none text-bold text-caption">Email</p>
            </q-item-label>
            <q-item-label>
              <p class="q-mb-none text-caption text-bold">{{ userStore.userInfo.email }}</p>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item>
          <q-item-section>
            <q-item-label class="flex items-center q-gutter-xs text-grey-8">
              <q-icon name="person_outline" outline />
              <p class="q-mb-none text-bold text-caption">First name</p>
            </q-item-label>
            <q-item-label>
              <p class="q-mb-none text-caption text-bold">{{ userStore.userInfo.firstName }}</p>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item>
          <q-item-section>
            <q-item-label class="flex items-center q-gutter-xs text-grey-8">
              <q-icon name="person_outline" outline />
              <p class="q-mb-none text-bold text-caption">Last name</p>
            </q-item-label>
            <q-item-label>
              <p class="q-mb-none text-caption text-bold">{{ userStore.userInfo.lastName }}</p>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useUserStore } from 'src/stores'

const userStore = useUserStore()
</script>
