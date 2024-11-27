<template>
  <q-table
    v-if="testList.challenges?.length"
    :columns="challengeColumns"
    hide-bottom
    :rows="testList.challenges"
    :rows-per-page-options="[0]"
  >
    <template v-slot:body-cell-action="props">
      <q-td key="action" :props="props">
        <q-btn
          v-if="props.row.running"
          flat
          icon="run_circle"
          round
          @click="redirectPageData(props.row)"
          :style="{ color: props.row.attempted ? 'var(--q-positive)' : 'var(--q-secondary)' }"
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
import { urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

onMounted(() => {
  localStorage.removeItem('isRecording')
})

defineProps({
  testList: { type: Object, required: true }
})
const router = useRouter()

const challengeColumns = ref([
  { name: 'name', label: 'Challenge Name', field: 'challenge_name', align: 'left', sortable: false },
  { name: 'score', label: 'Score', field: 'score', align: 'center', sortable: false },
  { name: 'action', label: '', field: 'action', align: 'right' }
])

function redirectPageData(data) {
  router.push(`/${urlSafeBase64Encode(data.pk)}/${urlSafeBase64Encode(data.sk)}/${urlSafeBase64Encode(data.company)}`)
}
</script>
