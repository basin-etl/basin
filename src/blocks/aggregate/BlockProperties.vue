<template lang="pug">
v-row(no-gutters).flex-column
  v-textarea(
    v-on:drop="fieldDropped($event)"
    v-on:dragover="allowDrop"
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
  v-text-field(v-model="local.alias",label="Alias")
  v-row(no-gutters)
    | Available fields
  SchemaChips(:schema="inputSchema.df")

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
import SchemaChips from '../../components/SchemaChips.vue'
@Component({
  components: {SchemaChips}
})

export default class AggregateBlockProperties extends BlockProperties {
  @Prop(String) groupBy: string
  @Prop(String) aggregate: string
  fieldDropped(event:DragEvent) {
    let field = JSON.parse(event.dataTransfer.getData("text"))
    let newVal = this.local.groupBy ? this.local.groupBy : ""
    newVal += this.local.groupBy && this.local.groupBy.length>0 && !this.local.groupBy.endsWith(",") ? ", " : ""
    newVal += `F.col("${field.name}")`
    this.$set(this.local,"groupBy",newVal)

  }

}
</script>

<style>

</style>