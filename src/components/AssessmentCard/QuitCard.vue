<template>
  <q-btn label="End Lab" no-caps outline text-color="secondary" @click="onClick" />

  <q-dialog v-model="showDialog">
    <q-spinner v-if="loading" class="fixed-center z-fab" color="primary" size="4em" />
    <q-card style="width: 500px; max-width: 80vw">
      <q-card-section>
        <h6 class="q-my-md text-center">Do you really want to End this lab?</h6>
      </q-card-section>
      <q-card-actions>
        <q-btn class="col-grow" color="secondary" outline v-close-popup>No</q-btn>
        <q-btn class="col-grow" :disable="loading" color="primary" @click="confirmDelete()">Yes</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['click', 'confirmDelete'])
defineProps(['loading'])

const showDialog = ref(false)
const showName = ref('')

function onClick() {
  showDialog.value = true
  emit('click')
}

function confirmDelete() {
  emit('confirmDelete', { show: false, name: showName.value })
}
</script>
