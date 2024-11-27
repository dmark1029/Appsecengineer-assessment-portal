<template>
  <q-page>
    <section class="q-mx-auto" style="width: 750px; max-width: 80vw">
      <q-spinner v-if="testStore._isLoading || addLongDelay" class="fixed-center z-fab" color="primary" size="4em" />

      <AssessmentCard
        v-if="labInfo.lab_name"
        :class="{ 'light-dimmed': testStore.isLoading || !labInfo.lab_name || addLongDelay }"
        :disableProvision="disableProvision"
        :label="labInfo.lab_name"
        :labTTl="lab"
        :loadingData="testStore.isLoading || addLongDelay"
        :progress="getServerProgressLocal.progress / 100"
        :progressLabel="getServerProgressLocal.message"
        :isActiveLab="lab.is_alive"
        :statusOfLab="labInfo.attempted"
        @provision.once="provisionLab"
      >
        <template v-slot:accessBtn>
          <div v-if="lab.is_alive && progress === 0" class="row">
            <div class="col-6 q-gutter-md q-pb-sm">
              <div class="inline-block">
                <q-btn
                  v-if="lab.password"
                  class="text-subtitle2 text-weight-regular ase-roboto radius-8"
                  color="secondary"
                  :label="'Access'"
                  no-caps
                  size="md"
                  text-color="white"
                  @click="accessAuthenticatedLab(lab.dns_pass_entry, lab.password)"
                />
                <q-btn
                  v-else
                  class="text-subtitle2 text-weight-regular ase-roboto radius-8"
                  color="secondary"
                  :label="'Access'"
                  no-caps
                  size="md"
                  text-color="white"
                  @click="accessLab(lab.dns_entry)"
                />
              </div>
              <div v-if="lab.challenge_id" class="inline-block">
                <ChallengeCompletionCode
                  @confirmDelete="labConfirmDeletion($event)"
                  :lab="lab"
                  :labInfo="labInfo"
                  :testId="testId"
                  :challengeId="labId"
                />
              </div>
            </div>
            <div class="col-6" align="right">
              <QuitCard
                :loading="testStore._isLoading"
                @confirmDelete="labConfirmDeletion($event)"
                @click="stopLab(lab.running_instance_id, lab.instance_id, lab)"
              />
            </div>

            <div class="col-12 q-pa-sm" v-if="lab.password">
              <div class="row">
                <div class="col-6">
                  <q-input bottom-slots v-model="labUsername" filled label="Username" disable dense>
                    <template v-slot:after>
                      <q-icon name="fas fa-copy" class="text-green" style="cursor: pointer" @click="copyUsername(labUsername)" />
                    </template>
                  </q-input>
                </div>
                <div class="col-6">
                  <q-input bottom-slots v-model="labPassword" filled label="Password" disable dense style="margin-left: 2%">
                    <template v-slot:after>
                      <q-icon name="fas fa-copy" class="text-green" style="cursor: pointer" @click="copyPassword(lab.password)" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>
          <div class="row" v-if="lab.is_alive && progress === 0">
            <div class="col-4"></div>
            <div class="col">
              <div class="row" v-if="getCloudAccountInfo.url" style="margin-top: 5%">
                <div class="col">
                  <q-card>
                    <q-card-section class="bg-primary text-white">
                      <div class="text-h6">Cloud Credentials</div>
                    </q-card-section>
                    <q-separator />
                    <div class="row" v-if="getCloudAccountInfo.url">
                      <div class="col">
                        <q-input bottom-slots v-model="labPassword" filled label="URL" disable dense>
                          <template v-slot:after>
                            <q-icon
                              name="fas fa-external-link-alt"
                              class="text-green"
                              style="cursor: pointer"
                              @click="openCloudUrl(getCloudAccountInfo.url)"
                            />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <div class="row" v-if="getCloudAccountInfo.username">
                      <div class="col-6">
                        <q-input bottom-slots v-model="labUsername" filled label="Username" disable dense>
                          <template v-slot:after>
                            <q-icon name="fas fa-copy" class="text-green" style="cursor: pointer" @click="copyUsername(labUsername)" />
                          </template>
                        </q-input>
                      </div>
                      <div class="col-6">
                        <q-input bottom-slots v-model="labPassword" filled label="Password" disable dense style="margin-left: 2%">
                          <template v-slot:after>
                            <q-icon
                              name="fas fa-copy"
                              class="text-green"
                              style="cursor: pointer"
                              @click="copyPassword(getCloudAccountInfo.password)"
                            />
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <div class="row" v-if="getCloudAccountInfo.access_key">
                      <div class="col-6">
                        <q-input bottom-slots v-model="labPassword" filled label="AccessKey" disable dense>
                          <template v-slot:after>
                            <q-icon
                              name="fas fa-copy"
                              class="text-green"
                              style="cursor: pointer"
                              @click="copyAccessKey(getCloudAccountInfo.access_key)"
                            />
                          </template>
                        </q-input>
                      </div>
                      <div class="col-6">
                        <q-input bottom-slots v-model="labPassword" filled label="SecretKey" disable dense style="margin-left: 2%">
                          <template v-slot:after>
                            <q-icon
                              name="fas fa-copy"
                              class="text-green"
                              style="cursor: pointer"
                              @click="copySecretKey(getCloudAccountInfo.secret_key)"
                            />
                          </template>
                        </q-input>
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </template>
      </AssessmentCard>
      <AssessmentCardExpired v-else :label="labInfo.lab_name" />
      <br />
      <InstructionCard :class="{ 'light-dimmed': testStore.isLoading || !labInstructions }" :instructionsData="labInstructions" />
    </section>
    <q-dialog v-model="showCongrats" persistent @escape-key="cancelCongrats()">
      <q-card class="padding_12" style="width: 800px; max-width: 80vw">
        <q-card-section class="padding_7">
          <p style="padding-top: 2%" class="badge-title text-h6 ase-roboto text-center">
            Congrats! You've successfully completed the challenge
          </p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { copyToClipboard, useQuasar } from 'quasar'
import AssessmentCard from 'src/components/AssessmentCard/AssessmentCard.vue'
import AssessmentCardExpired from 'src/components/AssessmentCard/AssessmentCardExpired.vue'
import ChallengeCompletionCode from 'src/components/AssessmentCard/ChallengeCompletionCode.vue'
import InstructionCard from 'src/components/AssessmentCard/InstructionCard.vue'
import QuitCard from 'src/components/AssessmentCard/QuitCard'
import { useTestStore } from 'src/stores/test'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()
const testStore = useTestStore()

const testId = urlSafeBase64Decode(route.params.testId)
const labId = urlSafeBase64Decode(route.params.labId)

const addLongDelay = ref(false)
const delayLoadLabTime = ref(false)
const disableProvision = ref(false)
const getCloudAccountInfo = ref({})
const getServerProgressLocal = ref({})
const instance_id = ref('')
const isDelete = ref(false)
const lab = ref({})
const labInfo = ref({})
const labInstructions = ref('')
const labPassword = ref('******')
const labUsername = ref('appsecengineer')
const progress = ref(0)
const running_instance_id = ref('')
const showCongrats = ref(false)

onMounted(async () => {
  await testStore.fetchLabInfo({
    challenge: labId,
    test: testId
  })

  labInfo.value = testStore.getLabInfo
  await testStore.fetchLabInfoData({
    lab: labInfo.value.sk,
    test: testId
  })
  if (labInfo.value.sk) {
    await testStore.fetchLabInstruction({
      lab_id: labInfo.value.sk,
      test_id: testId
    })
    if (testStore.getLabInstructions) {
      labInstructions.value = urlSafeBase64Decode(testStore.getLabInstructions)
    }
  }
})

testStore.$subscribe((_mutation, state) => {
  lab.value = state._runningLabInfo
})

async function labConfirmDeletion() {
  await testStore.deleteLabServer({
    cloud_type: labInfo.value.cloud_type,
    server_id: lab.value.running_instance_id,
    server_instance_id: lab.value.instance_id
  })
  isDelete.value = false
  await testStore.fetchLabInfo({
    challenge: labId,
    test: testId
  })
  await testStore.fetchLabInfoData({
    lab: labInfo.value.sk,
    test: testId
  })
  await testStore.fetchLabInfoData({
    lab: labInfo.value.sk,
    test: testId
  })
}

function cancelCongrats() {
  showCongrats.value = false
}

function stopLab(dataInstanceId, instanceId) {
  running_instance_id.value = dataInstanceId
  instance_id.value = instanceId
}

async function provisionLab(enableAuth) {
  disableProvision.value = true
  const id = labInfo.value.sk
  const data = {
    lab_id: id,
    test_id: testId
  }
  if (enableAuth) {
    data.auth = true
  }

  try {
    const status = await testStore.startProvisioner(data)
    getServerProgressLocal.value = {
      progress: 10,
      message: status.message
    }

    if (status.success) {
      var progressStatus = await testStore.progressProvisioner({ lab_id: id, test_id: testId })

      if (progressStatus.status === 500) {
        await resetData(6000)
        await runningData()

        if (progressStatus.data) {
          $q.notify({
            type: 'negative',
            position: 'top',
            progress: true,
            icon: 'warning',
            message: progressStatus.data.message
          })
        }
      } else if (progressStatus.status === 400) {
        for (let i = 1; i <= 9; i++) {
          if (i === 9) {
            $q.notify({
              type: 'negative',
              position: 'top',
              progress: true,
              icon: 'warning',
              message: 'Something went wrong'
            })
            break // Break on the 9th iteration if it completes
          }
          try {
            if (progressStatus.status === 400) {
              getServerProgressLocal.value = {
                progress: 50 * (i * 0.5),
                message: progressStatus.data.data.status ? progressStatus.data.data.status : progressStatus.data.message
              }
            }

            await delay(i === 8 ? 12000 : 8000) // Add extra delay on the 8th iteration

            progressStatus = await testStore.progressProvisioner({ lab_id: id, test_id: testId })

            if (progressStatus.success) {
              getServerProgressLocal.value = {
                progress: 100,
                message: progressStatus.data.status
              }

              await delay(8000)
              await resetData(12000)
              await runningData()
              break
            }
          } catch (er) {
            await resetData(6000)
            break
          }
        }
      } else if (progressStatus.success) {
        getServerProgressLocal.value = {
          progress: 100,
          message: progressStatus.data.status
        }

        await testStore.fetchLabInfoData({
          lab: id,
          test: testId
        })
        await resetData(6000)
      }
    } else {
      await resetData(6000)
      if (status.response) {
        $q.notify({
          type: 'negative',
          position: 'top',
          progress: true,
          icon: 'warning',
          message: status.response.data.message
        })
      }
    }
  } catch (er) {
    await resetData(6000)
  }
}

async function resetData(time = 6000) {
  disableProvision.value = true
  delayLoadLabTime.value = false
  getServerProgressLocal.value = {}
  progress.value = 0
  addLongDelay.value = true
  await setTimeout(() => {
    addLongDelay.value = false
  }, time)
}
async function runningData() {
  await testStore.fetchLabInfo({
    challenge: labId,
    test: testId
  })

  labInfo.value = testStore.getLabInfo
  await testStore.fetchLabInfoData({
    lab: labInfo.value.sk,
    test: testId
  })
}

async function delay(ms) {
  addLongDelay.value = true
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

function accessAuthenticatedLab(dns, password) {
  const url = 'https://appsecengineer:' + password + '@' + dns
  window.open(url, '_blank')
}

function accessLab(url) {
  window.open(url, '_blank')
}

function copyUsername(name) {
  copyToClipboard(name)
    .then(() => {
      $q.notify({
        message: 'Username has been successfully copied',
        color: 'green',
        position: 'top'
      })
    })
    .catch(() => {
      $q.notify({
        message: 'Not able to copy',
        color: 'red',
        position: 'top'
      })
    })
}

function copyPassword(password) {
  copyToClipboard(password)
    .then(() => {
      $q.notify({
        message: 'Password has been successfully copied',
        color: 'green',
        position: 'top'
      })
    })
    .catch(() => {
      $q.notify({
        message: 'Not able to copy',
        color: 'red',
        position: 'top'
      })
    })
}
</script>
