<template>
  <transition v-if="testStore.isLoading" name="fade">
    <q-spinner fade="none" :thickness="3" class="absolute-center" color="primary" size="8em" />
  </transition>
  <section v-else class="q-pa-lg">
    <!-- TEST INFO -->
    <q-card class="radius-8 q-mb-lg q-pa-lg">
      <q-item class="row wrap-tablet">
        <q-item-section class="row no-wrap items-center" style="flex-direction: row; justify-content: start">
          <q-avatar size="xl" round v-if="assignedTestInfoData.name" class="bg-secondary text-white text-capitalize q-mr-md">
            {{ assignedTestInfoData.name[0] }}
          </q-avatar>
          <div>
            <div class="text-h5 text-capitalize text-weight-bold">{{ assignedTestInfoData.name }}</div>
            <div>
              <q-badge size="lg" color="secondary" class="text-capitalize">
                {{ assignedTestInfoData.test_type }}
              </q-badge>
            </div>
          </div>
        </q-item-section>
        <q-item-section class="text-dark text-subtitle1" side>
          <!-- <p
            v-if="testList?.challenges?.every((item) => item.attempted) && testList?.quizes?.every((item) => item.attempted)"
            class="flex items-center q-mb-none"
          >
            <q-icon color="green" name="check_circle" size="xs" />
            <span class="q-ml-xs">All challenges completed</span>
          </p> -->
          <BadgeTimer
            v-if="Math.floor(Date.now() / 1000) && assignedTestInfoData.running_ttl"
            class="text-dark text-bold text-subtitle1"
            :starttime="Math.floor(Date.now() / 1000)"
            :endtime="assignedTestInfoData"
            @timeUP="timeUP"
            @update:timeLeft="parentTimeLeft = $event"
          />
          <!-- <p v-if="testList?.questions?.every((item) => item.attempted)" class="flex items-center q-mb-none">
            <q-icon color="green" name="check_circle" size="xs" />
            <span class="q-ml-xs">All questions completed</span>
          </p> -->
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>{{ assignedTestInfoData.description }}</q-item-section>
      </q-item>
    </q-card>

    <q-stepper active-color="secondary" alternative-labels header-nav animated class="q-my-lg" ref="stepper" v-model="step">
      <!-- CHALLENGES -->
      <q-step :done="step > 1" done-color="positive" icon="landscape" :name="1" title="Challenges">
        <Challenges :testList="testList" />
        <CustomChallenges :testList="testList" />
      </q-step>
      <!-- DESCRIPTIVE QUESTIONS -->
      <q-step v-if="!isTest" :done="step > 2" done-color="positive" icon="quiz" :name="2" title="Descriptive Questions">
        <DescriptiveQuestions :testList="testList" />
      </q-step>
      <!-- MEETING -->
      <q-step v-if="!isTest" :done="step > 3" done-color="positive" icon="videocam" :name="3" title="Project">
        <RecordVideo />
      </q-step>
      <!-- FILE UPLOAD -->
      <q-step v-if="!isTest" :done="step > 4" done-color="positive" icon="upload" :name="4" title="File Upload">
        <FileUpload :testList="testList" />
      </q-step>
      <!-- REVIEW & SUBMIT -->
      <q-step :done="step > 5" done-color="positive" icon="send" :name="5" title="Review & Submit">
        <ReviewSubmit />
      </q-step>
      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn v-if="step > 1" class="q-mr-sm" color="secondary" label="Back" outline @click="$refs.stepper.previous()" />
          <q-btn v-if="step < 5" color="secondary" label="Continue" @click="$refs.stepper.next()" />
          <q-btn v-if="step === 5" color="secondary" label="Finish" @click="timeUP" />
        </q-stepper-navigation>
      </template>
    </q-stepper>
    <q-dialog v-model="showModal" persistent>
      <q-card style="min-width: 680px">
        <q-card-section class="padding_12">
          <q-bar class="bg-white">
            <div class="text-h5 text-weight-bold none-spacing">Warning</div>
            <q-space />
          </q-bar>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pb-xl">
          <div class="text-body1 text-center q-pa-sm ase-roboto">
            <p>
              Are you sure you want to proceed ?
              <br />
              The recording will be saved!
            </p>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            class="ase-roboto ase-md col-grow radius-8"
            color="secondary"
            size="md"
            label="End & Continue"
            :loading="testStore.isLoading"
            @click="moveNext"
          />
          <q-btn
            class="ase-roboto ase-md col-grow radius-8"
            color="secondary"
            size="md"
            label="Cancel"
            :loading="testStore.isLoading"
            @click="closeModal()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showSuccessModal" persistent>
      <q-card style="min-width: 680px">
        <q-card-section class="padding_12">
          <q-bar class="bg-white">
            <div class="text-h5 text-weight-bold none-spacing">Success</div>
            <q-space />
            <q-btn dense flat icon="close" round v-close-popup />
          </q-bar>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pb-xl">
          <div class="text-body1 text-center q-pa-sm ase-roboto">
            <p>Your video has been successfully submitted !</p>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            class="ase-roboto ase-md col-grow radius-8"
            color="secondary"
            size="md"
            label="Close"
            :loading="testStore.isLoading"
            @click="closeSuccessModal()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showFinishModal" persistent>
      <q-card style="min-width: 680px">
        <q-card-section class="padding_12">
          <q-bar class="bg-white">
            <div class="text-h5 text-weight-bold none-spacing">Warning</div>
            <q-space />
          </q-bar>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pb-xl">
          <div class="text-body1 text-center q-pa-sm ase-roboto">
            <p>
              Do you wish to end the examination ?
              <br />
              If you end the examination, you will not able to access this test again.
            </p>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            class="ase-roboto ase-md col-grow radius-8"
            color="secondary"
            size="md"
            label="Confirm"
            :loading="testStore.isLoading"
            @click="endTest"
          />
          <q-btn
            class="ase-roboto ase-md col-grow radius-8"
            color="secondary"
            size="md"
            label="Cancel"
            :loading="testStore.isLoading"
            @click="closeConfirm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { default as axios } from 'axios'
import BadgeTimer from 'src/components/AssessmentCard/BadgeTimer.vue'
import Challenges from 'src/components/Certification/Challenges.vue'
import CustomChallenges from 'src/components/Certification/CustomChallenges.vue'
import DescriptiveQuestions from 'src/components/Certification/DescriptiveQuestions.vue'
import FileUpload from 'src/components/Certification/FileUpload.vue'
import RecordVideo from 'src/components/Certification/RecordVideo.vue'
import ReviewSubmit from 'src/components/Certification/ReviewSubmit.vue'
import { useTestStore } from 'src/stores'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const testStore = useTestStore()

const assignedTestInfoData = ref({})
const testList = ref([])
const step = ref(1)
const testId = atob(route.params.id)
const showModal = ref(false)
const showFinishModal = ref(false)
const showSuccessModal = ref(false)
const recording_duration = ref('')
const temp_step = ref([])
const fileURL = ref('')
const isTest = ref(false)
const parentTimeLeft = ref(0)

const video_uuid = computed(() => testStore.video_id)
const detailChallenge = computed(() => testStore.getDetailedRunningExam)
const status = ref({})

watch(step, async (newVal) => {
  if (newVal && localStorage.getItem('isRecording')) {
    temp_step.value.push(newVal)
    step.value = 3
    if (showModal.value || showSuccessModal.value) {
      return
    }
    const url = 'https://api.videosdk.live/v2/recordings?roomId=' + video_uuid.value + '&page=1&perPage=10'
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI5MjYzYzgwNC1iMDQ0LTQ2NGItYmIxZC05MGY5OGFmMjFmMGQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY5OTI4NzY4MSwiZXhwIjoxNzMwODIzNjgxfQ.QJFS6Pz3FBqqGT6Wuu7NEPRgu-koUmZgjFGf9tpKxGc'
    await axios
      .get(url, {
        headers: {
          Authorization: token
        }
      })
      .then((response) => {
        recording_duration.value = response.data.data[0].file.meta.duration ? response.data.data[0].file.meta.duration : ''
        if (recording_duration.value) {
          testStore.setFileUrl(response.data.data[0].file.fileUrl)
          fileURL.value = response.data.data[0].file.fileUrl
          step.value = temp_step.value[temp_step.value.length - 2]
          localStorage.removeItem('isRecording')
          localStorage.removeItem('recordingStartTime')
          showSuccessModal.value = true
        }
      })
      .catch((err) => {
        console.error(err)
      })
    if (recording_duration.value) {
      const payload = {
        test: atob(route.params.id),
        meet_id: fileURL.value
      }
      testStore.meetReference(payload)
    }
    if (!recording_duration.value) showModal.value = true
  } else {
    showModal.value = false
  }
})

watchEffect(() => {
  const timeLeftValue = parentTimeLeft.value
  const totalSeconds = Math.floor(timeLeftValue / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const recordingState = localStorage.getItem('isRecording')
  if (hours === 0 && minutes === 1 && seconds === 0 && recordingState) {
    showSuccessModal.value = true
    testStore.setForceStop(true)
    localStorage.removeItem('isRecording')
    step.value = 4
  }
})

function handleOneHourElapsed() {
  showSuccessModal.value = true
  testStore.setForceStop(true)
  localStorage.removeItem('isRecording')
  step.value = 4
}

watchEffect(() => {
  const isRecording = localStorage.getItem('isRecording')
  const starttime = localStorage.getItem('recordingStartTime')
  if (isRecording === 'true') {
    const timer = setInterval(() => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - starttime
      if (elapsedTime >= 3600000) {
        clearInterval(timer)
        handleOneHourElapsed()
      }
    }, 1000)
  }
})

onMounted(async () => {
  await testStore.fetchAssignedTestsInfo({ reset: true })
  await testStore.fetchIndividualTestInfo({ test: testId })
  await testStore.fetchAssignedChallenges({ reset: true, test: testId })
  assignedTestInfoData.value = detailChallenge.value
  testList.value = testStore.getChallengesTestsResponse.data || []
  const temp = assignedTestInfoData.value.sk
  isTest.value = temp.includes('test')
})

function closeModal() {
  showModal.value = false
  step.value = 3
}
function closeConfirm() {
  showFinishModal.value = false
}
function closeSuccessModal() {
  showSuccessModal.value = false
}
async function moveNext() {
  showModal.value = true
  showSuccessModal.value = false
  testStore.setForceStop(true)
  localStorage.removeItem('isRecording')
  step.value = temp_step.value[temp_step.value.length - 2]
}
async function endTest() {
  showFinishModal.value = false
  const payload = {
    test_id: atob(route.params.id)
  }
  status.value = await testStore.endTest(payload)
  if (status.value === 200) {
    router.push('/tasks')
  }
}
async function timeUP() {
  localStorage.removeItem('isRecording')
  showFinishModal.value = true
}
</script>

<style lang="scss">
.wrap-tablet {
  @media (max-width: 800px) {
    flex-direction: column;
  }
}
</style>
