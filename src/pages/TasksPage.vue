<template>
  <section class="q-pa-lg">
    <h6 class="q-mb-md q-mt-none">Tournaments / Interviews</h6>
    <TableView :data="filterContentData.data ? filterContentData.data.test_assignments : []" />
    <h6 class="q-mb-md q-mt-lg">Certifications</h6>
    <TableViewCertification :data="filterContentData.data ? filterContentData.data.certifications : []" />
  </section>
</template>

<script setup>
import TableView from 'components/Tasks/TableView'
import TableViewCertification from 'components/Tasks/TableViewCertification'
import { useTestStore } from 'src/stores/test'
import { ref, watchEffect } from 'vue'

const testStore = useTestStore()

const filterContentData = ref({ data: {}, pagination: {} })

watchEffect(() => {
  filterContentData.value = testStore.getAssignedTestsResponse
})

testStore.fetchAssignedTestsInfo({ reset: true })
</script>
