<template>
  <q-card class="my-card">
    <q-card-section>
      <h2 class="q-my-none text-left text-h5 text-weight-regular">Instructions</h2>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <QMarkdown :src="instructionsB64" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import { ref, watchEffect } from 'vue'

const props = defineProps({
  instructionsData: String
})

const instructionsB64 = ref('')

watchEffect(() => {
  instructionsB64.value = props.instructionsData
})
</script>

<style src="@quasar/quasar-ui-qmarkdown/dist/index.css" />
