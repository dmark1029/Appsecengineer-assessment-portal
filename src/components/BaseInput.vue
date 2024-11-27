<template>
  <q-input
    :autofocus="autofocus"
    :autogrow="autogrow"
    bottom-slots
    :clearable="clearable"
    color="grey"
    dense
    :disable="disable"
    :error="error"
    :hint="hint"
    :input-class="inputClass"
    :label="label"
    lazy-rules
    :min="min"
    :max="max"
    :maxlength="maxlength"
    outlined
    :readonly="readonly"
    ref="input"
    :required="required"
    :rules="rules"
    :type="type === 'date' ? 'text' : type"
    :value="value"
    @blur="!value ? $refs.input.resetValidation() : $refs.input.validate()"
    @input="$emit('update:value', $event)"
  >
    <template v-if="type === 'date'" v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
          <q-date mask="YYYY/MM/DD" :options="options" :value="value" @input="$emit('update:value', $event)">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
    <template v-slot:error>
      <div>{{ errorMessage }}</div>
    </template>
    <template v-if="sendButton" v-slot:after>
      <q-btn round dense flat icon="send" @click="$emit('send', { show: true, name: value })" />
    </template>
  </q-input>
</template>

<script>
export default {
  props: {
    autofocus: { required: false, type: Boolean, default: false },
    autogrow: { required: false, type: Boolean, default: false },
    clearable: { required: false, type: Boolean, default: false },
    disable: { required: false, type: Boolean, default: false },
    error: { required: false, type: Boolean, default: false },
    errorMessage: { required: false, type: String },
    hint: { required: false, type: String, default: '' },
    inputClass: { required: false, type: String },
    label: { required: false, type: String, default: 'Name' },
    min: { required: false, type: Number },
    max: { required: false, type: Number },
    maxlength: { required: false, type: Number, default: 50 },
    options: { required: false, type: Function },
    readonly: { required: false, type: Boolean, default: false },
    required: { required: false, type: Boolean, default: false },
    rules: { required: false, type: Array },
    sendButton: { required: false, type: Boolean, default: false },
    type: { required: false, type: String, default: 'text' },
    value: { required: false }
  }
}
</script>
