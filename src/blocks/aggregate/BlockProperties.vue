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
  v-row(no-gutters)
    | Available fields
  v-row(no-gutters)
    v-row(no-gutter,align="center",justify="center",v-if="!inputSchema.df")
      v-progress-circular(indeterminate,color="primary")
    v-chip.ma-1(v-for="field in inputSchema.df",
      small,
      draggable
      v-on:dragstart="dragChip($event,field.name)"
    )
      v-icon(small,v-if="field.type=='string'") format_quote
      | {{field.name}}

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
@Component({
})

export default class AggregateBlockProperties extends BlockProperties {
  @Prop(String) groupBy: string
  @Prop(String) aggregate: string
  fieldDropped(event:DragEvent) {
    let newVal = this.local.groupBy ? this.local.groupBy : ""
    newVal += this.local.groupBy && this.local.groupBy.length>0 && !this.local.groupBy.endsWith(",") ? ", " : ""
    newVal += `F.col("${event.dataTransfer.getData("text")}")`
    this.$set(this.local,"groupBy",newVal)
    console.log(event.dataTransfer.getData("text"))

  }
  dragChip(event:DragEvent,text:string) {
    event.dataTransfer.setData("text/plain",text);
  }

  allowDrop(event:DragEvent) {
    event.preventDefault();
  }
}
</script>

<style>

</style>