<template lang="pug">
div
  v-text-field(v-model="local.location",label="File name")
  v-select(v-model="local.format",
          :items="formats"
          label="File format")
  //-
  //- column mapping selector
  //-
  v-row(no-gutters)
    span Columns
    v-spacer
    v-btn(icon,small,@click="addColumn",v-if="inputSchema.df")
      v-icon add
  div.mt-3
    v-row(no-gutter,align="center",justify="center",v-if="!inputSchema.df")
      v-progress-circular(indeterminate,color="primary")
    v-row.mt-2.px-2.grey.lighten-3(
      v-if="inputSchema.df",
      align="center",
      no-gutters,
      v-for="(agg,index) in local.columns",
      :key="index"
    )
      v-col
        v-select(v-model="agg.source",small-chips,
          :item-text="item => item.tablealias +'.'+ item.name"
          :items="inputSchema.df",
          label="Source Column")
      v-col
        v-text-field.ml-1.flex-grow-1(v-model="agg.target",label="Target")
      v-col.flex-grow-0
        v-btn(icon,small)
          v-icon(small,color="red",@click="removeColumn(index)") delete

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
@Component({
})

export default class LoadBlockProperties extends BlockProperties {
  @Prop(String) location: string
  @Prop({ default: ():any[] => ([]) }) columns:any[]
  @Prop({ default: "csv"}) format: string
  formats:Array<any> = [
    {"text":"Delimited (csv)","value":"csv"},
    {"text":"Apache Parquet","value":"parquet"},
    {"text":"JSON","value":"json"},
    {"text":"Apache Avro","value":"avro"},
  ]

  removeColumn(index:number) {
    this.local.columns.splice(index,1)
  }
  addColumn() {
    if (!this.local.columns) {
      this.local.columns = []
    }
    this.local.columns.push({"source":null,"target":null,"isDirty":false})
  }

  @Watch('inputSchema', { immediate: true})
  onInputSchemaChanged(newVal:string,oldVal:string) {
    if (this.local.columns && this.local.columns.length==0 && this.inputSchema.df) {
      // set a default value by adding all columns with alias
      this.local.columns = this.inputSchema.df.map( field => {
        return {
          "source":field.tablealias + '.' + field.name,
          "target":field.name,
          "isDirty":false
        }
      })
    }
  }
}
</script>

<style>
</style>