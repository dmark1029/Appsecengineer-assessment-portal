<template>
  <section>
    <q-table
      :columns="columns"
      :loading="testStore.isLoading"
      no-data-label="No Assessments added."
      row-key="name"
      :rows="data"
      :rows-per-page-options="[0]"
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click="props.row.challenges_count !== 0 && challengesAssigned(props.row)">
          <q-td
            :props="props"
            key="Name"
            :class="{
              'light-dimmed cursor-not-allowed': props.row.challenges_count === 0,
              'cursor-pointer': props.row.test_type === 'test'
            }"
          >
            <div class="text-subtitle2 ase-roboto cursor_pointer">
              {{ props.row.name }}
              <BadgeTimer
                v-if="Math.floor(Date.now() / 1000) && props.row.running_ttl"
                class="text-indigo-5"
                :endtime="props.row"
                :starttime="Math.floor(Date.now() / 1000)"
                style="color: indigo-5"
                @timeUP="timeUP"
              />
              <q-tooltip>{{ props.row.name }}</q-tooltip>
            </div>
          </q-td>
          <q-td
            key="start_date"
            :class="{
              'light-dimmed cursor-not-allowed': props.row.challenges_count === 0,
              'cursor-pointer': props.row.test_type === 'test'
            }"
            :props="props"
          >
            <div class="text-subtitle2 ase-roboto cursor_pointer">
              <q-icon name="event" />
              {{ dateFormatReadable(props.row.start_date) }}
            </div>
          </q-td>
          <q-td
            key="end_date"
            :class="{
              'light-dimmed cursor-not-allowed': props.row.challenges_count === 0,
              'cursor-pointer': props.row.test_type === 'test'
            }"
            :props="props"
          >
            <div class="text-subtitle2 ase-roboto cursor_pointer">
              <q-icon name="event" />
              {{ dateFormatReadable(props.row.end_date) }}
            </div>
          </q-td>
          <q-td
            key="duration"
            :class="{
              'light-dimmed cursor-not-allowed': props.row.challenges_count === 0,
              'cursor-pointer': props.row.challenges_count > 0
            }"
            :props="props"
          >
            <div class="text-subtitle2 ase-roboto cursor_pointer">{{ props.row.duration }}</div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="show" persistent>
      <q-card style="min-width: 680px">
        <q-card-section class="padding_12">
          <q-bar class="bg-white">
            <div class="text-h5 text-weight-bold none-spacing">Start Assessment</div>
            <q-space />
            <q-btn dense flat icon="close" round v-close-popup />
          </q-bar>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pb-xl">
          <div class="text-body1 text-left q-pa-sm ase-roboto">
            <ul>
              <li>Once you start the assessment the timer gets started and you cannot quit.</li>
              <li>After timer starts try to solve all the challenges within the duration.</li>
              <li>Once the duration expires you cannot re-take the assessment.</li>
            </ul>
          </div>
          <div class="text-center">
            <q-btn class="ase-roboto ase-md radius-8" color="indigo-6" size="md" label="Start Assessment" @click="confirmStart()" />
          </div>
          <div class="text-center q-pt-md" v-if="testStore.isLoading">
            <q-spinner color="primary" size="3em" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import BadgeTimer from 'src/components/AssessmentCard/BadgeTimer.vue'
import { useTestStore } from 'src/stores/test'
import { dateFormatReadable, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const testStore = useTestStore()
const router = useRouter()

defineEmits(['changeData', 'confirmWindow'])
const props = defineProps({
  data: { type: Array, default: () => [] }
})
const dataInfo = ref([])
watchEffect(() => {
  dataInfo.value = props.data
})

const columns = ref([
  { name: 'Name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'start_date', label: 'Start date', field: 'start_date', sortable: true, align: 'center' },
  { name: 'end_date', label: 'End date', field: 'end_date', sortable: true, align: 'center' },
  { name: 'duration', label: 'Duration (mins)', field: 'duration', sortable: true, align: 'center' }
])
const show = ref(false)
const skValue = ref('')

async function challengesAssigned(row) {
  skValue.value = row
  if (row.challenges_count > 0 || row.test_type === 'test') {
    if (row.status !== 'in_progress') {
      show.value = true
    } else {
      await router.push(`/user-challenges/${urlSafeBase64Encode(row.sk)}/${urlSafeBase64Encode(row.test_type)}`)
    }
  }
}

const confirmStart = async () => {
  await testStore.fetchStartExam({ test: skValue.value.sk })

  if (testStore.getStartExamResponse.data?.success && !testStore.isLoading) {
    show.value = false
    await router.push(`/user-challenges/${urlSafeBase64Encode(skValue.value.sk)}/${urlSafeBase64Encode(skValue.value.test_type)}`)
  }
}

function timeUP() {
  router.push('/tasks')
}
</script>
