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
    v-on:drop="fieldDropped($event)"
    v-on:dragover="allowDrop"
    rows="5",
    filled,
    label="join condition"
  )
  h3 Left dataframe fields
  SchemaChips(:schema="inputSchema.df1",alias="df1")

  h3.mt-3 Right dataframe fields
  SchemaChips(:schema="inputSchema.df2",alias="df2")

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
import SchemaChips from '@/components/SchemaChips.vue'
@Component({
  components: {
    SchemaChips
  }
})

export default class JoinBlockProperties extends BlockProperties {
  @Prop({default:"inner"}) how: string
  @Prop(String) condition: string

  joinTypes = [
    {value:"inner",label:"Inner join - records in both dataframes"},
    {value:"left_outer",label:"Left outer join - all records in first dataframe"},
    {value:"left_anti",label:"Left anti join - all records in left that don't match a record in right "},
  ]
  fieldDropped(event:DragEvent) {
    let field = JSON.parse(event.dataTransfer.getData("text"))
    let newVal = this.local.condition ? this.local.condition : ""
    newVal += this.local.condition && this.local.condition.length>0 && !this.local.condition.endsWith(",") ? " == " : ""
    newVal += `F.col("${field.name}")`
    this.$set(this.local,"condition",newVal)

  }

}
</script>

<style>

</style>