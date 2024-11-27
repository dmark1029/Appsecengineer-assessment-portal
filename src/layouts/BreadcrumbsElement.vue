<template>
  <q-breadcrumbs v-if="levelList.length > 0" class="text-grey-8" separator=">">
    <q-breadcrumbs-el
      v-for="(item, index) in levelList"
      :key="index"
      :label="item.title"
      :icon="item.icon"
      :to="item.path"
      @click.prevent="handleBreadcrumbClick(item)"
    />
  </q-breadcrumbs>
  <q-dialog v-model="showModal" persistent>
    <q-card style="min-width: 680px">
      <q-card-section class="padding_12">
        <q-bar class="bg-white">
          <div class="text-h5 text-weight-bold none-spacing">Warning</div>
          <q-space />
        </q-bar>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pb-xl">
        <div class="text-body1 text-center q-pa-sm ase-roboto">
          <p>
            Are you sure you want to proceed ?
            <br />
            The recording will be saved!
          </p>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn class="ase-roboto ase-md col-grow radius-8" color="secondary" size="md" label="End & Continue" @click="moveNext()" />
        <q-btn class="ase-roboto ase-md col-grow radius-8" color="secondary" size="md" label="Cancel" @click="closeModal()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { Cookies } from 'quasar'
import { useTestStore } from 'src/stores'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const testStore = useTestStore()

const route = useRoute()
const levelList = ref([])
const breadcrumbList = ref([])
const showModal = ref(false)
const itemPath = ref('')

watch(route, () => getBreadcrumb())

function checkPathExistValue(val) {
  return breadcrumbList.value.some((el) => el.title === val)
}

function handleBreadcrumbClick(item) {
  const isVariableTrue = localStorage.getItem('isRecording') === 'true'
  if (isVariableTrue) {
    showModal.value = true
    itemPath.value = item.path
  } else {
    window.location.href = item.path
  }
}

async function moveNext() {
  showModal.value = true
  testStore.setForceStop(true)
  localStorage.removeItem('isRecording')
  window.location.href = itemPath.value
}

function closeModal() {
  showModal.value = false
}

function getBreadcrumb() {
  const matched = route.matched.filter((item) => item.meta.title)
  if (matched[0] || matched[0].path) {
    const first = matched[0]
    const firstPathSplit = first.path.split(':')
    const mainPathIndex = first.path

    const pathOne = firstPathSplit[1]?.split('/')[0]
    const pathTwo = firstPathSplit[2]?.split('/')[0]
    const pathThree = firstPathSplit[3]?.split('/')[0]
    const pathFour = firstPathSplit[4]?.split('/')[0]
    const pathFive = firstPathSplit[5]?.split('/')[0]
    let pathData = mainPathIndex
      .replace(':' + pathOne, route.params[pathOne])
      .replace(':' + pathTwo, route.params[pathTwo])
      .replace(':' + pathThree, route.params[pathThree])
      .replace(':' + pathFour, route.params[pathFour])
      .replace(':' + pathFive, route.params[pathFive])

    const getBread = Cookies.get('tests_breadcrumbs')
    if (getBread?.length) {
      breadcrumbList.value = getBread
    }
    if (breadcrumbList.value.length > 0) {
      if (checkPathExistValue(first.meta.title) === false) {
        breadcrumbList.value.push({
          title: first.meta.title,
          icon: first.meta.icon,
          path: pathData
        })
      }
      if (breadcrumbList.value.length > 5) {
        breadcrumbList.value.shift()
      }
    } else {
      breadcrumbList.value.push({
        title: first.meta.title,
        icon: first.meta.icon,
        path: pathData
      })
    }
    if (breadcrumbList.value.length === 1) {
      Cookies.set('tests_breadcrumbs', JSON.stringify(breadcrumbList.value))
      const getBread = Cookies.get('tests_breadcrumbs')
      const convertedObj = getBread
      breadcrumbList.value = convertedObj
    }
    if (breadcrumbList.value.length > 1) {
      if (checkPathExistValue(first.meta.title) === false) {
        breadcrumbList.value.push({
          title: first.meta.title,
          icon: first.meta.icon,
          path: pathData
        })
      }
      if (breadcrumbList.value.length > 5) {
        breadcrumbList.value.shift()
      }
    }
    let i = 0
    breadcrumbList.value.map((item) => {
      if (item.title === first.meta.title) {
        breadcrumbList.value = breadcrumbList.value.slice(0, i + 1)
        const matched = breadcrumbList.value
        levelList.value = matched
      }
      i = i + 1
    })
    Cookies.set('tests_breadcrumbs', JSON.stringify(levelList.value))
  }
}
getBreadcrumb()
</script>
