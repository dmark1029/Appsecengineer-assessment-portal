<template>
  <div class="row no-wrap wrap-tablet">
    <div class="q-mb-md file-upload" v-if="!testStore._iisLoading">
      <div class="file-upload-part column items-center">
        <div class="upload-field q-mb-sm">
          <BaseFile
            accept=".zip"
            label="Click here to upload Zip File *"
            outlined
            :rules="required"
            v-model="uploadedFile"
            @update:model-value="onFileSelected"
            style="width: 300px"
            class="q-pb-none q-mb-none file-input"
            flat
          />
          <div v-if="uploadedFile || uploadedFileName" class="uploaded-file-detail">
            <span>{{ uploadedFileName }}</span>
            <span v-if="uploadedFileSize">{{ uploadedFileSize }}KB</span>
          </div>
        </div>
        <q-btn color="secondary" label="Submit" @click="getURL" />
      </div>
    </div>

    <section v-else class="upload-spin">
      <transition name="fade">
        <q-spinner fade="none" :thickness="3" class="absolute-center" color="primary" size="6em" />
      </transition>
    </section>

    <ol>
      <li class="text-subtitle2">
        Please feel free to submit an attachment file (in zip format) containing artifacts, steps, and relevant images showcasing your work
        and experience in addressing the project requirements. This allows us to gain a comprehensive understanding of your approach and
        accomplishments.
      </li>
      <li class="text-subtitle2">When upload finished, click "Submit" button and your attachment will automatically be sent to us</li>
      <li class="text-subtitle2">Please ensure that you upload a file smaller than 100MB.</li>
      <li class="text-subtitle2">Once done, you can continue using the "Continue" button below.</li>
    </ol>
  </div>
</template>

<script setup>
import BaseFile from 'components/BaseFile.vue'
import { Notify } from 'quasar'
import { useTestStore } from 'src/stores'
import { required } from 'src/utils/rules'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
defineProps({
  testList: { type: Object, required: true }
})

const route = useRoute()
const testStore = useTestStore()
const status = ref({})
const b64logo = ref('')
const imageData = ref('')
const uploadedFile = ref({})
const uploadedFileSize = ref('')
const uploadedFileName = ref('')

onMounted(async () => {
  const status_payload = {
    test: atob(route.params.id)
  }
  status.value = await testStore.viewStatus(status_payload)
  const temp = status.value.data?.attachment?.[0]?.url;
  uploadedFileName.value = temp?.split('/').pop()
})

async function getURL() {
  if (!uploadedFile.value.name || Object.keys(uploadedFile.value).length === 0) {
    Notify.create({
      color: 'negative',
      icon: 'report_problem',
      message: 'Please upload zip file first and submit !',
      position: 'top',
      timeout: 1100,
      progress: true
    })
    return
  }
  const status_payload = {
    test: atob(route.params.id),
    filename: uploadedFile.value.name
  }
  status.value = await testStore.getUrl(status_payload)
  const form = {}
  Object.entries(status.value.data.post_url.fields).forEach(([field, value]) => {
    form[field] = value
  })
  form.file = uploadedFile.value
  const signedUrl = status.value.data.post_url.url
  await testStore.fileUpload({ signedUrl, form })
  // showAnswerState.value = true
}

function onFileSelected(event) {
  const size = (event.size / (1024 * 1024)).toFixed(3)
  if (size >= 100) {
    Notify.create({
      color: 'negative',
      message: 'zip file size should be smaller than 100MB',
      position: 'top',
      progress: true,
      timeout: 1100
    })
    uploadedFile.value = {}
    uploadedFileSize.value = ''
    return
  }
  uploadedFileSize.value = (event.size / (1024 * 1024)).toFixed(3)
  uploadedFile.value = event
  uploadedFileName.value = event.name
  if (event) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageData.value = e.target.result
      const imageSplit = e.target.result.split(';')
      const getOnlyB64Val = imageSplit[1].split(',')
      b64logo.value = getOnlyB64Val[1]
    }
    reader.readAsDataURL(event)
  }
}
</script>
<style lang="scss">
.warning-text {
  text-align: center;
  margin: 0px 20px;
}
.file-upload {
  width: 80%;
  margin: 0px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.file-upload-part {
  margin-top: 20px;
}
.upload-field {
  background-color: white;
  width: 300px;
  border-radius: 4px;
  border: 1px dashed gray;
  .q-field__control {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
  }
}
.file-upload-part button {
  height: 30px;
}
.uploaded-file-detail {
  color: black;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.upload-spin {
  height: 105px;
}

.wrap-tablet {
  @media (max-width: 800px) {
    flex-direction: column;
  }
}
</style>
