<template lang="pug">
v-row(no-gutters).flex-column
  v-textarea(
    v-model="local.groupBy",
    rows="5",
    filled,
    label="group by clause"
  )
  v-textarea(
    v-model="local.aggregate",
    rows="5",
    filled,
    label="aggregate"
  )
</template>

<script>
import blockPropertiesMixin from '../blockPropertiesMixin.js'
export default {
  mixins: [blockPropertiesMixin],
  props: {
    groupBy: { type: String },
    aggregate: { type: String },
  },
  data: function() {
    // only mutate local.<property>. added via mixin
    return {
    }
  },

}
</script>

<style>

</style>