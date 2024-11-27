<template>
  <q-table
    :columns="columns"
    :loading="testStore.isLoading"
    no-data-label="No Assessments added."
    row-key="name"
    :rows="data"
    :rows-per-page-options="[0]"
  >
    <template v-slot:body="props">
      <q-tr
        :class="{
          'cursor-not-allowed text-grey-5':
            !props.row.challenges || (!(Math.floor(Date.now() / 1000) && props.row.running_ttl) && !props.row.purchase?.credits),
          'cursor-pointer': props.row.challenges > 0 || props.row.purchase.credits > 0
        }"
        :props="props"
        @click="challengesAssigned(props.row)"
      >
        <q-td key="name" :props="props">
          <div class="flex items-center text-subtitle2">
            <div v-if="props.row.attempt_status">
              <q-icon v-if="props.row.status === 'pass'" class="q-mr-xs" color="positive" name="check_circle">
                <q-tooltip>You successfully completed this assessment</q-tooltip>
              </q-icon>
              <q-icon v-else class="q-mr-xs" color="negative" name="circle">
                <q-tooltip>You failed to complete this assessment.</q-tooltip>
              </q-icon>
            </div>
            <span>{{ props.row.name.substring(0, 90) }}{{ props.row.name.length > 90 ? '...' : '' }}</span>
          </div>
          <BadgeTimer
            v-if="Math.floor(Date.now() / 1000) && props.row.running_ttl"
            class="text-indigo-5"
            :endtime="props.row.running_ttl"
            :starttime="Math.floor(Date.now() / 1000)"
            style="color: indigo-5"
            :oneLiner="true"
            @timeUP="timeUP"
          />
          <q-tooltip v-if="props.row.name.length > 90">{{ props.row.name }}</q-tooltip>
        </q-td>
        <q-td key="duration" :props="props">
          <div class="text-subtitle2 ase-roboto cursor_pointer">{{ props.row.duration }}</div>
        </q-td>
        <q-td key="credits" :props="props">
          <q-badge :label="props.row.purchase?.credits || 0" />
        </q-td>
        <q-td key="expires" :props="props">
          {{ props.row.purchase?.expires_at ? fullDateTimeUTC(props.row.purchase.expires_at * 1000) : 'N/A' }}
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 680px">
      <q-card-section class="padding_12">
        <q-bar class="bg-white">
          <div class="text-h5 text-weight-bold none-spacing">Start Certification</div>
          <q-space />
          <q-btn dense flat icon="close" round v-close-popup />
        </q-bar>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pb-xl">
        <div class="text-body1 text-left q-pa-sm ase-roboto">
          <ul>
            <li>Once you start the certification the timer gets started and you cannot quit.</li>
            <li>After timer starts try to solve all the challenges within the duration.</li>
            <li>Once the credits expires you cannot re-take the certification.</li>
          </ul>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          class="ase-roboto ase-md col-grow radius-8"
          :disable="data?.some((row) => row.status === 'in_progress')"
          color="secondary"
          size="md"
          label="Start Certification"
          :loading="testStore.isLoading"
          @click="confirmStart()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { Notify } from 'quasar'
import BadgeTimer from 'src/components/AssessmentCard/BadgeTimer.vue'
import { useTestStore } from 'src/stores/test'
import { fullDateTimeUTC, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const testStore = useTestStore()
const router = useRouter()

defineEmits(['changeData', 'confirmWindow'])
const props = defineProps({
  data: { type: Array, default: () => [] }
})

const columns = ref([
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'duration', label: 'Duration (mins)', field: 'duration', sortable: true, align: 'center' },
  { name: 'credits', label: 'Remaining Credits', field: 'credits', sortable: true, align: 'center' },
  { name: 'expires', label: 'Expires at', field: 'expires', sortable: true, align: 'center' }
])
const show = ref(false)
const skValue = ref('')

async function challengesAssigned(row) {
  if (row.status === 'pass') {
    Notify.create({ color: 'positive', message: 'You successfully completed this assessment', position: 'top', progress: true })
    return
  }

  if (!row.purchase?.credits && row.status !== 'in_progress') {
    Notify.create({
      color: 'negative',
      icon: 'report_problem',
      message: 'You have no credits left to start this assessment',
      position: 'top',
      progress: true
    })
    return
  }

  skValue.value = row
  if (row.challenges > 0) {
    if (row.status === 'in_progress') {
      await router.push(`/user-challenges/${urlSafeBase64Encode(row.sk)}/${urlSafeBase64Encode(row.test_type)}`)
    } else if (props.data?.some((row) => row.status === 'in_progress')) {
      Notify.create({
        color: 'negative',
        icon: 'report_problem',
        message: 'You have already started a certification.\n Please complete it before starting a new one.',
        position: 'top',
        progress: true
      })
    } else {
      show.value = true
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
