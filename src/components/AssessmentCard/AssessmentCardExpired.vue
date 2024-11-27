<template>
  <q-card>
    <q-card-section class="text-center q-pa-lg">
      <div v-if="label" class="text-h5 q-pa-lg">
        <strong class="text-positive">Attempt completed</strong>
        <br />
        {{ label }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineEmits(['provision', 'toggleAuth'])
defineProps(['label'])
</script>
