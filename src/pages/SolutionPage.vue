<template>
  <div class="row">
    <div class="q-pa-xs col-12">
      <q-card>
        <div class="row padding_12">
          <div class="q-pa-xs col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div class="q-pa-sm">
              <q-btn
                class="none-spacing text-weight-bold ase-roboto cursor_pointer"
                :no-caps="false"
                :style="{ background: '#11142D', color: '#fff', display: 'inline-block' }"
                size="sm"
                icon="arrow_back"
                @click="challengePage"
              >
                <q-tooltip>Challenge Info</q-tooltip>
              </q-btn>
            </div>
            <q-list>
              <q-item class="q-pa-lg">
                <q-item-section>
                  <q-item-label class="text-h6 ase-roboto ellipsis text-capitalize" v-if="fetchChallengeInfo.name">
                    {{ fetchChallengeInfo.name }}
                  </q-item-label>
                  <q-item-label
                    class="text-subtitle1 text-weight-regular ase-roboto text-grey-7"
                    style="line-height: 20px"
                    v-if="fetchChallengeInfo.description"
                  >
                    <span class="text-black">Info:</span>
                    {{ fetchChallengeInfo.description }}
                  </q-item-label>
                  <q-item-label
                    class="text-subtitle1 text-weight-regular ase-roboto text-grey-7"
                    style="line-height: 20px"
                    v-if="fetchChallengeInfo.difficulty"
                  >
                    <span class="text-black">Proficiency:</span>
                    {{ fetchChallengeInfo.difficulty.toString().split(',').join(', ') }}
                  </q-item-label>
                  <q-item-label
                    class="text-subtitle1 text-weight-regular ase-roboto text-grey-7"
                    style="line-height: 20px"
                    v-if="fetchChallengeInfo.tags"
                  >
                    <span class="text-black">Tags:</span>
                    {{ fetchChallengeInfo.tags.toString().split(',').join(', ') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card>
    </div>
    <div :class="`q-pa-xs col-xs-12 col-sm-12 col-md-12 col-lg-12`">
      <p class="text-h5 ase-black-regular ase-roboto q-pa-md" style="line-height: 0.9" v-if="solutions.length > 0">Solution :</p>
      <template v-for="(data, index) of solutions" :key="data + index + 'Info'">
        <q-card class="q-pa-lg">
          <q-markdown no-line-numbers :src="data">
            {{ data }}
          </q-markdown>
          <br />
        </q-card>
      </template>
      <div
        class="text-subtitle1 q-pa-md ase-black-regular flex flex-center ase-roboto padding_7"
        style="line-height: 0.9"
        v-if="solutions.length === 0"
      >
        {{ isLoading ? 'Loading' : 'Solution not found. Please contact support Help@appsecengineer.com' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTestStore } from 'src/stores/test'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const testStore = useTestStore()

const companyId = urlSafeBase64Decode(route.params.companyId)
const labId = urlSafeBase64Decode(route.params.labId)
const testId = urlSafeBase64Decode(route.params.testId)

const fetchChallengeInfo = ref({})
const solutions = ref([])

onMounted(async () => {
  await testStore.fetchChallengeData({ challenge_id: labId })

  await testStore.fetchChallengeSolution({
    challenge_id: labId,
    lab_id: companyId,
    test_id: testId
  })
})

testStore.$subscribe((_mutation, state) => {
  fetchChallengeInfo.value = state.challengeInfo

  if (state.getSolution.data) {
    if (state.getSolution.data.instructions.length > 0) {
      for (const data of state.getSolution.data.instructions) {
        const finalResult = testStore.getMarkdownData(data)
        finalResult.then((res) => solutions.value.push(res.data))
      }
    }
  }
})

function challengePage() {
  window.history.go(-1)
  return false
}
</script>
