<template>
  <section v-if="testStore._iisLoading" style="height: 220px !important">
    <transition name="fade">
      <q-spinner fade="none" :thickness="3" class="absolute-center" color="primary" size="8em" />
    </transition>
  </section>
  <section v-else>
    <fieldset class="q-mb-md" v-if="!isTest">
      <legend class="text-subtitle2">Descriptive Questions</legend>
      <div v-if="!status.data?.answers">You didn't answer any questions.</div>
      <div v-else>
        <div v-for="(qa, index) in status.data?.answers" class="text-subtitle1" :key="index">
          <!-- <p class="q-mb-none">
            <span class="text-bold">Q:&nbsp;</span>
            <span class="text-body2">{{ qa.question }}</span>
          </p>
          <p>
            <span class="text-bold">A:&nbsp;</span>
            <span class="text-body2">{{ qa.answer }}</span>
          </p> -->
          <q-expansion-item switch-toggle-side expand-separator :label="'Question' + (index + 1) + ': ' + qa.question">
            <q-card>
              <q-card-section>{{ qa.answer }}</q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>
    </fieldset>

    <fieldset class="q-mb-md">
      <legend class="text-subtitle2">Challenges Attemped</legend>
      <div v-if="!status.data?.challenges">You didn't face any challenges.</div>
      <div v-else>
        <div v-for="(challenge, index) in status.data?.challenges" class="text-subtitle1" :key="index">
          <div class="flex justify-start">
            <p class="q-mb-none">
              <span class="text-bold">Challenge Name:&nbsp;</span>
              <span class="text-body2">{{ challenge.challenge }}</span>
            </p>
            <p class="q-ml-md">
              <span class="text-bold">Status:&nbsp;</span>
              <span class="text-body1">{{ challenge.status ? challenge.status : 'Failed' }}</span>
            </p>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset class="q-mb-md" v-if="!isTest">
      <legend class="text-subtitle2">File Upload</legend>
      <div v-if="!status.data?.attachment">You didn't upload any file.</div>
      <div v-else>
        <div v-for="(qa, index) in displayAttachments" class="text-subtitle1" :key="index">
          <span class="text-bold">Uploaded File:&nbsp;</span>
          <span>{{ qa.fileName }}</span>
        </div>
      </div>
    </fieldset>

    <fieldset class="q-mb-md" v-if="!isTest" style="display: flex; justify-content: space-between; align-items: center">
      <legend class="text-subtitle2">Recording</legend>
      <span>
        <span v-if="videoPreviewUrl">You recorded the video.</span>
        <span v-else style="color: var(--q-negative)">You didn't record the video.</span>
      </span>
      <span v-if="videoPreviewUrl">
        <q-btn color="secondary" :label="openVideo ? 'Close Video Preview' : 'Open Video Preview'" @click="videoPreview" />
      </span>
    </fieldset>
    <div v-if="openVideo" style="margin: auto; height: 30rem; width: 60rem">
      <video controls style="width: 60rem; height: 100%">
        <source :src="videoPreviewUrl" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </section>
</template>

<script setup>
import { useTestStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const testStore = useTestStore()
const status = ref({})
const isTest = ref(false)
const openVideo = ref(false)
const videoPreviewUrl = ref('')
const fileURL = ref('')

const getDetailedRunningExam = computed(() => testStore.getDetailedRunningExam)
const forceStopState = computed(() => testStore.forceStopState)
const videoUrl = computed(() => testStore.videoUrl)

const displayAttachments = computed(() => {
  return status.value.data?.attachment.map((qa) => ({
    ...qa,
    fileName: qa.url.split('/').pop()
  }))
})

onMounted(async () => {
  if (forceStopState.value) {
    await testStore.getRecordState()
    fileURL.value = videoUrl.value
    const payload = {
      test: atob(route.params.id),
      meet_id: fileURL.value
    }
    testStore.meetReference(payload)
    testStore.setForceStop(false)
  }
  const status_payload = {
    test: atob(route.params.id)
  }
  status.value = await testStore.viewStatus(status_payload)
  const temp = getDetailedRunningExam.value.sk
  isTest.value = temp.includes('test')
  videoPreviewUrl.value = status.value.data.meet
})
async function videoPreview() {
  openVideo.value = !openVideo.value
}
</script>
