<template lang="pug">
div
  v-row(no-gutters)
    v-select(v-model="local.column",small-chips,
      :item-text="item => item.tablealias +'.'+ item.name"
      :items="inputSchema.df",
      label="Column")
  v-row(no-gutters)
    span Add features
  div.mt-3
    v-row.mt-2.px-2(
      align="center",
      no-gutters,
    )
      v-col
        v-checkbox(label="day of week (1-7)",v-model="local.append_day")
      v-col
        v-text-field.ml-1.flex-grow-1(v-model="local.append_day_column",label="new column name")
    v-row.mt-2.px-2(
      align="center",
      no-gutters,
    )
      v-col
        v-checkbox(label="day of month (1-31)",v-model="local.append_day")
      v-col
        v-text-field.ml-1.flex-grow-1(v-model="local.append_day_column",label="new column name")
    v-row.mt-2.px-2(
      align="center",
      no-gutters,
    )
      v-col
        v-checkbox(label="week of year (1-52)",v-model="local.append_day")
      v-col
        v-text-field.ml-1.flex-grow-1(v-model="local.append_day_column",label="new column name")
    v-row.mt-2.px-2(
      align="center",
      no-gutters,
    )
      v-col
        v-checkbox(label="is public holiday (0/1)",v-model="local.append_day")
      v-col
        v-text-field.ml-1.flex-grow-1(v-model="local.append_day_column",label="new column name")
    v-row.mt-2.px-2(
      align="center",
      no-gutters,
    )
      v-col
        v-checkbox(label="season (1-4)",v-model="local.append_day")
      v-col
        v-text-field.ml-1.flex-grow-1(v-model="local.append_day_column",label="new column name")

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
@Component({
})

export default class FeDateBlockProperties extends BlockProperties {
  @Prop(String) column: string

  isDirtyColumnNames = false

  @Watch('local.column', { immediate: true})
  onColumnChanged(newVal:string,oldVal:string) {
    console.log("column changed")
    if (!this.isDirtyColumnNames) {
      // set new default values for column names
      let columnNameParts = newVal.split(".")
      let columnName = columnNameParts[columnNameParts.length-1]
      this.local.append_day_column = columnName.replace(" ","_").toLowerCase()+"_dt_day"
    }
  }
}
</script>

<style>
</style>