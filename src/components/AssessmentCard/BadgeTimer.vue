<template>
  <div v-if="showTimer && !oneLiner" class="ase-roboto timer-card column items-center">
    <div class="q-px-md q-py-sm full-width label row justify-center items-center">
      <q-icon name="info" size="xs" class="q-mr-xs cursor-pointer">
        <q-tooltip>Time remaining to complete all challenges</q-tooltip>
      </q-icon>
      <span style="font-weight: 500; font-size: 14px">Time remaining</span>
    </div>
    <div style="color: red" class="q-px-md q-py-sm">{{ formattedTimeLeft }}</div>
  </div>

  <div v-else-if="showTimer && oneLiner" class="ase-roboto">
    <span style="font-weight: 500; font-size: 14px">Time remaining to complete all challenges:{{ ' ' }}</span>
    <span style="color: red">{{ formattedTimeLeft }}</span>
  </div>
</template>

<script setup>
import { getformattedDuration } from 'src/utils/reuseFunctions'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps(['starttime', 'endtime', 'oneLiner'])
const emit = defineEmits(['timeUP', 'update:timeLeft'])

const showTimer = ref(true)
const timerInterval = ref(null)
const endTimeMS = ref(0)
const currentTimeMS = ref(0)
const timeLeftMS = ref(0)

const formattedTimeLeft = computed(() => getformattedDuration(timeLeftMS.value))

onMounted(() => {
  if (props.endtime.running_ttl) {
    currentTimeMS.value = Date.now()
    endTimeMS.value = new Date(props.endtime.running_ttl * 1000)
    const time = endTimeMS.value - currentTimeMS.value
    if (time > 0) {
      timeLeftMS.value = time
    }
    if (time !== 0) {
      startTimer()
    }
  }
})

watch(currentTimeMS, () => {
  const time = endTimeMS.value - currentTimeMS.value
  timeLeftMS.value = time
  if (timeLeftMS.value === 0 || timeLeftMS.value < 0) {
    showTimer.value = false
    timeLeftMS.value = 0
    onTimesUp()
  }
  emit('update:timeLeft', timeLeftMS.value)
})

function onTimesUp() {
  clearInterval(timerInterval)
  emit('timeUP')
}

function startTimer() {
  timerInterval.value = setInterval(() => (currentTimeMS.value += 1000), 1000)
}
</script>

<style lang="scss">
.timer-card {
  border: 1px solid red;
  .label {
    background-color: #ff000036;
  }
  @media (max-width: 800px) {
    width: 100%;
    margin-top: 15px;
  }
}
</style>
