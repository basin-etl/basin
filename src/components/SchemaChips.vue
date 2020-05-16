<template lang="pug">
  v-row(no-gutters)
    v-row(no-gutter,align="center",justify="center",v-if="!schema")
      v-progress-circular(indeterminate,color="primary")
    v-chip.ma-1(v-for="field in schema",:key="field.name",
      x-small,
      draggable
      v-on:dragstart="dragChip($event,field.name,field.tablealias)"
    )
      v-icon(small,v-if="field.type=='string'") format_quote
      | {{field.tablealias}}.{{field.name}}

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'

@Component({
  name: "SchemaChips"
})

export default class SchemaChips extends Vue {
  @Prop(Array) schema: Array<JSON>
  @Prop(String) alias: string

  dragChip(event:DragEvent,name:string,tablealias:string) {
    let fullname = ""
    if (tablealias!="") {
      fullname += tablealias+"."
    }
    fullname += name
    event.dataTransfer.setData("text/plain",JSON.stringify({"name":fullname,"alias":this.alias}));
  }
}
</script>

<style>
</style>
