<template lang="pug">
v-row(no-gutters).flex-column
  v-select(v-model="local.how",
          :items="joinTypes"
          item-text="label"
          item-value="value"
          label="Type of join")
    template(v-slot:selection="{ item, index }")
      | {{item.label.split("-")[0]}}
  v-textarea(
    v-model="local.condition",
    rows="5",
    filled,
    label="join condition"
  )
</template>

<script>
import blockPropertiesMixin from '../blockPropertiesMixin.js'
export default {
  mixins: [blockPropertiesMixin],
  props: {
    how: { type: String },
    condition: { type: String },
  },
  data: function() {
    // only mutate local.<property>. added via mixin
    return {
      joinTypes: [
        {value:"inner",label:"Inner join - records in both dataframes"},
        {value:"left_outer",label:"Left outer join - all records in first dataframe"},
        {value:"left_anti",label:"Left anti join - all records in left that don't match a record in right "},
      ]
    }
  },

}
</script>

<style>

</style>