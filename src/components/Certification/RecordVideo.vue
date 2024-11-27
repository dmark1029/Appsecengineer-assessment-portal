<template>
  <ol>
    <li class="text-subtitle2">
      Once you click on "Start Recording" button to join the meeting, turn on your camera and your screen will start recording.
    </li>
    <li class="text-subtitle2">When finished, click "Leave Call" and your recording will automatically be sent to us.</li>
    <li class="text-subtitle2">Once done, you can continue using the "Continue" button below.</li>
  </ol>
  <div v-if="isRecording" class="q-mb-md" style="width: 80%; margin: 30px auto">
    <q-btn color="secondary" label="Show Your Answers" @click="showAnswers" />
  </div>

  <fieldset
    class="q-mb-md"
    style="width: 80%; margin: 30px auto; border: 2px solid; display: flex; justify-content: space-between; align-items: center"
    v-if="videoPreviewUrl"
  >
    <legend class="text-subtitle2">Recording Status</legend>
    <span>
      <span style="margin: 0px 20px">You have recorded the video before.</span>
    </span>
    <span>
      <q-btn color="secondary" :label="openVideo ? 'Close Video Preview' : 'Open Video Preview'" @click="videoPreview" />
    </span>
  </fieldset>
  <div v-if="openVideo" style="margin: auto; height: 30rem; width: 60rem">
    <video controls style="width: 60rem; height: 100%">
      <source :src="videoPreviewUrl" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>

  <fieldset v-if="projectDescription" class="q-mb-md" style="width: 80%; margin: 30px auto; border: 2px solid">
    <legend class="text-subtitle2">Project Detail</legend>
    <div class="text-subtitle1">
      <div class="flex justify-start">
        <q-markdown no-line-numbers :src="projectDescription" class="q-mb-none" style="margin: 0px 20px">
            {{ projectDescription }}
          </q-markdown>
      </div>
    </div>
  </fieldset>
  <div v-if="!isRecording" class="text-center">
    <q-btn color="secondary" :disabled="!projectDescription" icon="camera" label="Start Recording" @click="startRecording" />
  </div>
  <div v-else class="q-mx-auto" id="record" style="height: 30rem; width: 60rem"></div>
  <section v-if="testStore._iisLoading" style="height: 220px !important">
    <transition name="fade">
      <q-spinner fade="none" :thickness="3" class="absolute-center" color="primary" size="8em" />
    </transition>
  </section>
  <q-dialog v-model="showModal" persistent>
    <q-card style="min-width: 680px">
      <q-card-section class="padding_12">
        <q-bar class="bg-white">
          <div class="text-h5 text-weight-bold none-spacing">Warning</div>
          <q-space />
          <q-btn dense flat icon="close" round v-close-popup />
        </q-bar>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pb-sm">
        <div class="text-body1 text-left q-pa-sm ase-roboto">
          <p style="display: flex; align-items: center; justify-content: center; font-size: 20px">You have already recorded a video.</p>
          <p style="display: flex; align-items: center; justify-content: center; font-size: 20px">You can't record again!</p>
        </div>
      </q-card-section>
      <q-card-actions style="display: flex; align-items: center; justify-content: center">
        <q-btn color="secondary" size="md" label="OK" style="width: 100px" :loading="testStore.isLoading" @click="closeModal" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showAnswerState">
    <q-card style="width: 80%; max-width: 90vw">
      <q-form greedy @submit.prevent="answerQuestion">
        <q-card-section class="text-body1">
          <p class="q-mb-sm text-bold">Your answers to the questions and challenges</p>
          <fieldset class="q-mb-md" style="height: 150px; overflow-y: auto">
            <legend class="text-subtitle2">Descriptive Questions</legend>
            <div v-for="(qa, index) in status.data?.answers" class="text-subtitle1" :key="index">
              <p class="q-mb-none">
                <span class="text-bold">Q:&nbsp;</span>
                <span class="text-body2">{{ qa.question }}</span>
              </p>
              <p>
                <span class="text-bold">A:&nbsp;</span>
                <span class="text-body2">{{ qa.answer }}</span>
              </p>
            </div>
            <span v-if="!status.data?.answers.length">You didn't answer any questions.</span>
          </fieldset>
          <fieldset class="q-mb-md" style="height: 150px; overflow-y: auto">
            <legend class="text-subtitle2">Challenges</legend>
            <div v-for="(challenge, index) in status.data?.challenges" class="text-subtitle1" :key="index">
              <p class="q-mb-none">
                <span class="text-bold">Challenge Name:&nbsp;</span>
                <span class="text-body2">{{ challenge.name }}&nbsp;&nbsp;&nbsp;</span>
                <span class="text-bold">Result:&nbsp;</span>
                <span class="text-body2">{{ challenge.status === 'pass' ? 'Passed' : 'Failed' }}</span>
              </p>
              {{ challenge }}
            </div>
            <span v-if="!status.data?.challenges.length">You didn't face any challenges.</span>
          </fieldset>
        </q-card-section>
        <q-card-actions align="stretch" style="width: 200px; margin: auto">
          <q-btn class="col-grow" color="primary" label="Ok" outline v-close-popup />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { VideoSDKMeeting } from '@videosdk.live/rtc-js-prebuilt'
import { useTestStore } from 'src/stores'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { v4 as uuidv4 } from 'uuid'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const testStore = useTestStore()
const status = ref({})
const isRecording = ref(false)
const meeting = new VideoSDKMeeting()
const showModal = ref(false)
const showAnswerState = ref(false)

const openVideo = ref(false)
const videoPreviewUrl = ref('')
const uniqueId = ref('')
const fileURL = ref('')

const forceStopState = computed(() => testStore.forceStopState)
const videoUrl = computed(() => testStore.videoUrl)
const projectDescription = computed(()=>{
   if(testStore.getChallengesTestsResponse?.data?.project?.description){
      return urlSafeBase64Decode(testStore.getChallengesTestsResponse?.data?.project.description)
   }
   return ''
})

onMounted(async () => {
  localStorage.removeItem('isRecording')
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
  videoPreviewUrl.value = status.value.data.meet
})
function closeModal() {
  showModal.value = false
}
async function showAnswers() {
  showAnswerState.value = true
}
async function startRecording() {
  uniqueId.value = uuidv4()
  testStore.setVideoUuid(uniqueId.value)
  localStorage.setItem('isRecording', true)
  localStorage.setItem('recordingStartTime', Date.now())
  isRecording.value = true
  const record_config = {
    name: 'Record',
    meetingId: uniqueId.value,
    apiKey: 'b8e4b6a7-7792-4cd9-a977-d742d57d4e37',
    containerId: 'record',
    chatEnabled: true,
    joinWithoutUserInteraction: true,
    maintainVideoAspectRatio: true,
    micEnabled: true,
    participantCanLeave: true,
    participantCanToggleSelfMic: true,
    participantCanToggleSelfWebcam: true,
    raiseHandEnabled: false,
    screenShareEnabled: true,
    webcamEnabled: true,
    whiteboardEnabled: true,
    recording: {
      autoStart: true,
      enabled: true
    }
  }
  meeting.init(record_config)
}
async function videoPreview() {
  openVideo.value = !openVideo.value
}
</script>
