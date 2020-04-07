<template lang="pug">
div
    v-text-field(v-model="local.source",label="Source name")
</template>

<script>
import blockPropertiesMixin from '../blockPropertiesMixin.js'
export default {
  mixins: [blockPropertiesMixin],
  props: {
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