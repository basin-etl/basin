<template lang="pug">
div
    div {{ blockId}}
    div source: {{source}} 
    div local source: {{local.source}}
    v-text-field(v-model="local.source")
</template>

<script>
import blockPropertiesMixin from '../blockPropertiesMixin.js'
export default {
  mixins: [blockPropertiesMixin],
  props: {
    blockId: {
      type: Number,
    },
    source: {
      type: String
    }
  },
  data: function() {
    // only mutate local.<property>. added via mixin
    return {}
  },

}
</script>

<style>

</style>