<template>
  <q-table
    v-if="testList.quizes?.length"
    :columns="challengeColumns"
    class="q-mt-lg"
    hide-bottom
    :rows="testList.quizes"
    :rows-per-page-options="[0]"
  >
    <template v-slot:body-cell-action="props">
      <q-td key="action" :props="props">
        <q-btn
          v-if="props.row.attempted && props.row.running"
          color="secondary"
          flat
          icon="run_circle"
          round
          @click="redirectPageData(props.row)"
        >
          <q-tooltip anchor="bottom middle" self="center middle">Running</q-tooltip>
        </q-btn>
        <q-btn v-else-if="!props.row.attempted" color="secondary" flat icon="play_circle" round @click="redirectPageData(props.row)">
          <q-tooltip anchor="bottom middle" self="center middle">Not yet started</q-tooltip>
        </q-btn>
        <q-btn v-else-if="props.row.attempted" color="secondary" flat icon="check_circle" round @click="redirectPageData(props.row)">
          <q-tooltip anchor="bottom middle" self="center middle">Attempted</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { useTestStore } from 'src/stores'
import { urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const testStore = useTestStore()

onMounted(() => {
  localStorage.removeItem('isRecording')
})

defineProps({
  testList: { type: Object, required: true }
})
const router = useRouter()

const challengeColumns = ref([
  { name: 'name', label: 'Custom Challenge Name', field: 'name', align: 'left', sortable: false },
  { name: 'language', label: 'Language', field: 'language', align: 'center', sortable: false },
  { name: 'action', label: '', field: 'action', align: 'right' }
])

function redirectPageData(data) {
  router.push(
    `/${urlSafeBase64Encode(testStore.getChallengesTestsResponse.data.quizes[0]._id)}/challenge/${urlSafeBase64Encode(
      data._key
    )}/${urlSafeBase64Encode(data.company)}`
  )
}
</script>
