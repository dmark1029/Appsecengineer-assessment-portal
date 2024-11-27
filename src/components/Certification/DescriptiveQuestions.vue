<template>
  <template v-if="testList.questions?.length">
    <q-card v-for="(question, index) in testList.questions" :key="index" class="q-mb-md" elevation="sm">
      <q-card-section>
        <div class="text-bold q-mb-md row justify-between items-center">
          <div class="row items-center">
            <span class="q-mr-sm">Question {{ index + 1 }}</span>
            <q-btn
              v-if="question?.attempted"
              flat
              round
              icon="check_circle"
              :style="{ color: 'var(--q-positive)' }"
              @click="onOpenQuestion(question)"
            >
              <q-tooltip>Attempted</q-tooltip>
            </q-btn>
          </div>
          <q-chip outline color="primary" text-color="white">Score: {{ question?.score }}</q-chip>
        </div>
        <div>
          {{ question?.question }}
        </div>
        <div v-if="!question?.attempted" class="row items-center justify-end">
          <q-btn flat round icon="question_answer" :style="{ color: 'var(--q-secondary)' }" @click="onOpenQuestion(question)">
            <q-tooltip>Not yet attempted'</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </template>

  <q-dialog v-model="descriptiveQuestion.show">
    <q-card style="width: 800px; max-width: 90vw">
      <q-form greedy @submit.prevent="confirmAnswer">
        <q-card-section class="text-body1">
          <p class="q-mb-sm text-bold">Question</p>
          <p>{{ descriptiveQuestion.question }}</p>
          <q-input
            autofocus
            counter
            label="Answer"
            lazy-rules
            outlined
            :readonly="descriptiveQuestion.attempted"
            :rules="[(val) => val?.length > 50 || 'Answer must be at least 50 characters']"
            type="textarea"
            class="answer-input"
            no-error-icon
            v-model.trim="descriptiveQuestion.answer"
          />
          <p class="q-my-md text-center text-warning" v-show="descriptiveQuestion.attempted === 'Answer'">
            Once you submit, you will not be able to edit your answer.
          </p>
        </q-card-section>
        <q-card-actions align="stretch">
          <q-btn class="col-grow" color="primary" label="Cancel" outline v-close-popup />
          <q-btn
            class="col-grow"
            color="positive"
            :disable="descriptiveQuestion.attempted"
            :label="descriptiveQuestion.attempted ? 'Already Answered' : 'Answer'"
            type="submit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="confirmShowPopUp">
    <q-card style="width: 500px; max-width: 90vw">
      <q-form greedy @submit.prevent="answerQuestion">
        <q-card-section class="text-body1">
          <p class="q-mb-lg text-danger" align="center" style="font-size: 20px; font-weight: 600; color: var(--q-negative)">Warning</p>
          <p class="warning-text">Are you sure you want to submit the answer ?</p>
          <p class="warning-text">Once you submit, You will not be able to re-answer the question.</p>
        </q-card-section>
        <q-card-actions align="stretch">
          <q-btn class="col-grow" color="primary" label="Cancel" outline v-close-popup />
          <q-btn class="col-grow" color="positive" label="Confirm" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useTestStore } from 'src/stores'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  testList: { type: Object, required: true }
})

const route = useRoute()
const testStore = useTestStore()

const descriptiveQuestion = ref({})
const confirmShowPopUp = ref(false)

const testId = atob(route.params.id)

function onOpenQuestion(row) {
  descriptiveQuestion.value = row
  descriptiveQuestion.value.show = true
}

function confirmAnswer() {
  confirmShowPopUp.value = true
}
async function answerQuestion() {
  await testStore.answerDescriptiveQuestion({
    answer: descriptiveQuestion.value.answer,
    question_id: descriptiveQuestion.value.sk,
    test: testId
  })
  descriptiveQuestion.value = {}
}
</script>
<style>
.warning-text {
  text-align: center;
  margin: 0px 20px;
}

.answer-input {
  .q-field__control {
    padding-right: 0;
  }
}
</style>
