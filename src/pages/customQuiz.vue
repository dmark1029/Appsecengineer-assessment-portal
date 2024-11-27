<template>
  <q-card
    v-if="test.validation_type === 'code' || test.validation_type === 'Code'"
    class="flex-column q-mx-auto q-mt-xl"
    style="width: 1200px; max-width: 100vw"
  >
    <q-card-section>
      <p class="text-subtitle1">
        <span class="text-bold">Challenge Name:</span>
        {{ test.name }}
      </p>
      <p class="text-subtitle1">
        <b>Instructions:</b>
        Identify the vulnerability in this source code.
      </p>
      <CodeEditor v-if="codeEditor" v-model="codeEditor" />
    </q-card-section>

    <q-form @submit="validateCodeResponse">
      <q-card-section>
        <q-btn class="q-mr-md text-black" label="Give me a Hint" size="12px" color="blue-1" @click="toggleHints" />

        <q-slide-transition>
          <div v-if="showHints">
            <div v-for="(hint, index) in test.hints" :key="index" class="q-mt-xs">
              <q-input :model-value="hint" filled readonly style="background-color: #edf1fa; border-radius: 6px" />
            </div>
          </div>
        </q-slide-transition>

        <div class="flex-column q-mt-md">
          <q-btn
            class="q-pa-md text-center full-width q-mt-md"
            type="submit"
            :loading="progress[0].loading"
            :percentage="progress[0].percentage"
            @click="startComputing(0)"
            color="primary"
          >
            <span class="q-ml-sm">Submit Response</span>
          </q-btn>

          <q-input
            v-if="testStore.getQuizAnswer.airesponse"
            v-model="testStore.getQuizAnswer.airesponse"
            readonly
            filled
            label="Explanation"
            type="textarea"
            style="background-color: #edf1fa; border-radius: 6px"
            class="q-mt-md"
          />
        </div>
      </q-card-section>
    </q-form>
  </q-card>

  <div v-if="test.validation_type === 'text' || test.validation_type === 'Text'" class="flex row q-mt-lg q-mx-lg">
    <div class="col-md-6 col-sm-12 q-pr-lg">
      <q-card>
        <q-card-section>
          <p class="text-subtitle1 q-mb-none text-bold">{{ test.name }}</p>
          <highlightjs :language="test.language" :code="code" />
        </q-card-section>
      </q-card>
    </div>

    <q-form class="col-md-6 col-sm-12" @submit="validateResponse">
      <div>
        <q-card>
          <q-card-section>
            <div>
              <p class="text-subtitle1 q-mb-none text-bold">Instructions</p>
              <p>Identify the vulnerability in this source code.</p>

              <p class="text-subtitle1 q-mb-none text-bold">Answer:</p>
              <q-input
                :error="testStore.getQuizData.is_correct === false ? true : false"
                v-model="answer"
                filled
                type="textarea"
                style="background-color: #edf1fa"
                required
              />
            </div>

            <div class="flex q-mt-md">
              <q-btn class="q-mr-md text-black" label="Give me a Hint" size="12px" color="blue-1" @click="toggleHints" />
              <q-btn label="Show me the answer" icon="comment" size="12px" @click="showAnswerResponse" />
            </div>

            <q-slide-transition>
              <div v-if="showAnswer" class="q-mt-xs">
                <q-input
                  v-model="onShowAnswer"
                  readonly
                  type="textarea"
                  :loading="testStore.isLoading"
                  filled
                  style="background-color: #edf1fa; border-radius: 6px"
                />
              </div>
            </q-slide-transition>

            <q-slide-transition>
              <div v-if="showHints">
                <div v-for="(hint, index) in test.hints" :key="index" class="q-mt-xs">
                  <q-input :model-value="hint" filled readonly style="background-color: #edf1fa; border-radius: 6px" />
                </div>
              </div>
            </q-slide-transition>

            <div class="flex justify-center q-mt-md">
              <q-btn class="q-pa-md text-center full-width" type="submit" :loading="testStore.isLoading" color="primary">
                <span class="q-ml-sm">Submit Response</span>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import hljsVuePlugin from '@highlightjs/vue-plugin'
import 'highlight.js/lib/common'
import 'highlight.js/styles/stackoverflow-light.css'
import { Notify } from 'quasar'
import CodeEditor from 'src/components/CodeEditor.vue'
import { useTestStore } from 'src/stores'
import { urlSafeBase64Decode, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const testStore = useTestStore()
const showHints = ref(false)
const showAnswer = ref(false)
const onShowAnswer = ref('')
const answer = ref('')
const route = useRoute()
const highlightjs = hljsVuePlugin.component
const test = ref({})
const code = ref('')
const codeEditor = ref('')

onMounted(async () => {
  if (!testStore.getChallengesTestsResponse.data?.quizes.length) {
    await testStore.fetchAssignedChallenges({ reset: true, test: atob(route.params.testId) })
  }
  test.value = testStore.getChallengesTestsResponse.data.quizes.find((quiz) => quiz._key === atob(route.params.challengeId))
  code.value = atob(test.value.code)

  codeEditor.value = urlSafeBase64Decode(test.value.code)
})

const progress = ref([{ loading: false, percentage: 0 }])

const intervals = [null]

function startComputing(id) {
  progress.value[id].loading = true
  progress.value[id].percentage = 0

  intervals[id] = setInterval(() => {
    progress.value[id].percentage += 4.2
    if (progress.value[id].percentage >= 100 && testStore.getQuizAnswer.airesponse) {
      clearInterval(intervals[id])
      progress.value[id].loading = false
    }
  }, 500)

  testStore.resetQuizAnswersResponse()
}

onBeforeUnmount(() => {
  testStore.resetQuizAnswersResponse()
  intervals.forEach((val) => {
    clearInterval(val)
  })
})

const toggleHints = () => {
  showHints.value = !showHints.value
}

const showAnswerResponse = async () => {
  if (showAnswer.value) {
    showAnswer.value = false
    onShowAnswer.value = ''
    return
  }

  showAnswer.value = true

  const payload = {
    test_id: testStore.test_id,
    challenge_id: test.value._key,
    answer: onShowAnswer.value,
    show_answer: true
  }

  await testStore.validateAnswer(payload)
  onShowAnswer.value = testStore.getQuizData.actual_answer
}

const validateResponse = async () => {
  const payload = {
    test_id: testStore.test_id,
    challenge_id: test.value._key,
    answer: answer.value,
    show_answer: false
  }
  await testStore.validateAnswer(payload)

  if (testStore.getQuizData.is_correct === true) {
    Notify.create({ message: 'Correct Answer', color: 'green', position: 'top' })
    showAnswer.value = false
  } else {
    Notify.create({ message: 'Incorrect Answer', color: 'red', position: 'top' })
    onShowAnswer.value = testStore.getQuizAnswersResponse
    showAnswer.value = true
  }
}

const validateCodeResponse = async () => {
  const payload = {
    challenge_id: test.value._key,
    answer: urlSafeBase64Encode(code.value),
    test_id: testStore.test_id
  }

  await testStore.validateCodeAnswer(payload)
}
</script>
