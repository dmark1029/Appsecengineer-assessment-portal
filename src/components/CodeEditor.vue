<template>
  <div ref="editor" class="cm-editor"></div>
</template>

<script>
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup'
import { python } from '@codemirror/lang-python'
import { ViewPlugin } from '@codemirror/view'
import { onMounted, ref } from 'vue'

export default {
  name: 'code-editor',
  props: {
    modelValue: {
      type: String,
      default: () => ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editor = ref(null)
    const cm = ref(null)

    onMounted(() => {
      createEditor()
    })

    function createEditor() {
      const updateValue = (e, cm) => {
        const code = cm.state.doc.toString()
        emit('update:modelValue', code)
      }
      const events = ['blur', 'keyup', 'paste', 'cut', 'delete', 'mouseup']
      const eventHandler = ViewPlugin.define(() => null, {
        eventHandlers: Object.fromEntries(events.map((e) => [e, updateValue]))
      })
      cm.value = new EditorView({
        state: EditorState.create({
          extensions: [basicSetup, eventHandler, python()],
          doc: props.modelValue
        }),
        parent: editor.value
      })
    }

    // watch(
    //   () => props.modelValue,
    //   () => {
    //     cm.value.dispatch({
    //       changes: { from: 0, to: cm.value?.state.doc.length, insert: props.modelValue }
    //     })
    //   }
    // )

    return { editor }
  }
}
</script>
<style scoped>
.cm-editor {
  height: 100%;
  border: solid 1px #ddd;
  border-radius: 4px;
}
</style>
