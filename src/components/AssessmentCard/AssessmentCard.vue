<template>
  <div>
    <q-card class="q-mt-xl">
      <q-card-section>
        <q-item class="no-padding">
          <q-item-section>
            <div class="flex">
              <q-btn color="negative" icon="question_mark" outline round size="xs" @click="dialog = true" />
              <q-item-label class="q-ml-sm text-h6">{{ label }}</q-item-label>
            </div>

            <div class="row full-width">
              <div class="col-12 q-pt-sm">
                <BadgeTimer
                  v-if="Math.floor(Date.now() / 1000) && labTTl && isActiveLab && !progress"
                  align="right"
                  class="text-dark text-weight-bold inline-block"
                  :starttime="Math.floor(Date.now() / 1000)"
                  :endtime="labTTl"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section v-if="!statusOfLab && !isActiveLab && !progress" class="flex justify-between">
        <q-toggle v-if="authEnabled" class="non-selectable" label="Enable Authentication" v-model="enable" />
        <q-toggle v-else color="green" class="non-selectable" label="Enable Authentication" v-model="enable" />
        <q-btn
          v-if="!statusOfLab"
          color="secondary"
          :disable="disableProvision"
          label="Provision"
          size="14px"
          @click="$emit('provision', enable)"
        />
      </q-card-section>
      <q-card-section class="full-width" v-if="statusOfLab && !loadingData && !isActiveLab">
        <p v-if="statusOfLab" class="q-mt-sm q-b-none text-bold text-center text-positive text-h5">Attempt completed</p>
      </q-card-section>
      <q-card-section>
        <q-slide-transition>
          <q-linear-progress v-show="progress" class="q-mt-sm" rounded size="25px" stripe :value="progress">
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="primary" :label="progressLabel" />
            </div>
          </q-linear-progress>
        </q-slide-transition>
        <q-slide-transition>
          <p v-show="progress" class="q-mt-sm q-mb-none text-bold text-center text-negative">
            Please do not leave the page or refresh the page while server provisioning
          </p>
        </q-slide-transition>
        <slot name="accessBtn"></slot>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-body1 text-bold">Disclaimer</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator spaced inset />
        <q-card-section>
          <ul class="q-gutter-sm text-body2 text-grey-14">
            <li>Using automated scanners</li>
            <li>Using brute force attacks</li>
            <li>Denial of Service attacks</li>
            <li>Attacking other student machines in challenges where you might achieve a shell on the vulnerable system</li>
            <li>Attacking the lab infrastructure</li>
            <li>Users violating the above will be either temporarily or permanently banned from the website.</li>
            <li>
              If you are unsure about an activity, then please contact
              <a href="mailto:help@appsecengineer.com" target="_blank">support</a>
              to confirm that it is allowed on our websites.
            </li>
          </ul>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import BadgeTimer from 'src/components/AssessmentCard/BadgeTimer.vue'
import { ref } from 'vue'

defineEmits(['provision', 'toggleAuth'])
defineProps([
  'authEnabled',
  'disableProvision',
  'label',
  'labTTl',
  'loadingData',
  'progress',
  'progressLabel',
  'isActiveLab',
  'statusOfLab'
])

const enable = ref(false)
const dialog = ref(false)
</script>
