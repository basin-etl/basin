<template lang="pug">
v-row(no-gutters,align="center")
  div(v-show="!editMode")
    slot
  v-text-field(ref="editField",v-on:blur="finishEdit()",hide-details,v-model="localValue", v-show="editMode",v-on:keypress.enter.prevent="finishEdit()")
  v-btn(icon,v-on:click="startEdit()",small,v-show="!editMode")
    v-icon(small) edit
</template>

<script>

  export default {
    name: 'EditableLabel',
    // bind to v-model
    props: ['value'],
    data () {
      return {
        editMode: false,
        localValue: this.value,
        }
    },
    methods: {
      startEdit: function() {
        console.log('start edit');
        this.localValue = this.value;
        this.editMode=true;
        this.$nextTick(this.$refs.editField.focus)
      },
      finishEdit: function() {
        if (this.editMode) {// prevent double event trigger of blur
          console.log('blur');
          this.editMode=false;
          this.$emit('input', this.localValue)
        }
      }
    }
  }
</script>
