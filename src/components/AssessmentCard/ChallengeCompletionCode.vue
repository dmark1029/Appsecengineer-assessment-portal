<template>
  <q-btn color="secondary" no-caps outline size="md" @click="verifyLab({ challenge_id: lab.challenge_id })">Verify Challenge Code</q-btn>

  <q-dialog v-model="showVerify">
    <q-card style="width: 700px; max-width: 80vw">
      <q-form greedy @submit.prevent="confirmSubmitVerifyLab()">
        <q-card-section>
          <h6 class="q-my-lg text-center">Please verify your challenge code</h6>
          <BaseInput
            label="Challenge code *"
            :maxlength="500"
            required
            :rules="[...minLength(1), ...maxLength(500)]"
            v-model="verifyLabName"
          />
        </q-card-section>
        <q-card-actions>
          <q-btn class="col-grow" color="secondary" outline v-close-popup>Cancel</q-btn>
          <q-btn class="col-grow" color="primary" :disable="!verifyLabName" type="submit">Verify</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showCongrats" persistent @escape-key="cancelCongrats()">
    <q-card class="padding_12" style="width: 800px; max-width: 80vw">
      <q-card-section class="padding_7">
        <p style="padding-top: 2%" class="badge-title text-h6 ase-roboto text-center">Congrats! You've attempted the challenge</p>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import BaseInput from 'components/BaseInput.vue'
import { useTestStore } from 'src/stores/test'
import { maxLength, minLength } from 'src/utils/rules'
import { ref } from 'vue'

const props = defineProps({
  challengeId: { type: String, required: true },
  lab: { type: Object, required: true },
  labInfo: { type: Object, required: true },
  testId: { type: String, required: true }
})

const emit = defineEmits(['confirmDelete'])
const testStore = useTestStore()

const showCongrats = ref(false)
const showVerify = ref(false)
const verifyLabName = ref('')

function verifyLab() {
  verifyLabName.value = ''
  showVerify.value = true
}

function cancelCongrats() {
  showCongrats.value = false
}

async function confirmSubmitVerifyLab() {
  await testStore.fetchVerifyLabAction({
    token: verifyLabName.value,
    lab_id: props.labInfo.sk,
    test_id: props.testId
  })
  if (testStore.getChallengeCode.sk) {
    showVerify.value = false
    setTimeout(() => (showCongrats.value = true), 1000)
    setTimeout(() => (showCongrats.value = false), 5000)
    emit('confirmDelete')
  } else {
    showVerify.value = false
    setTimeout(() => (showCongrats.value = true), 1000)
    setTimeout(() => (showCongrats.value = false), 5000)
  }
}
</script>
