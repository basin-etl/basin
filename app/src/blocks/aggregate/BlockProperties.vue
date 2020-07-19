<template lang="pug">
v-row(no-gutters).flex-column
  v-row(no-gutters)
    v-autocomplete(
      v-model="local.groupBy",
      small-chips,
      deletable-chips,
      multiple,
      :item-text="item => item.tablealias +'.'+ item.name"
      :items="inputSchema.df",
      label="Columns to group by"
    )
  v-row(no-gutters)
    span Aggregations
    v-spacer
    v-btn(icon,small,@click="addAggregationColumn")
      v-icon add
  div.mt-3
    v-row.mt-2.px-2.grey.lighten-3(
      align="center",
      no-gutters,
      v-for="(agg,index) in local.aggregations",
      :key="index"
    )
      v-col
        v-select(v-model="agg.col",small-chips,
          :item-text="item => item.tablealias +'.'+ item.name"
          :items="inputSchema.df",
          label="Column")
      v-col
        v-select.ml-1.flex-grow-1(
          v-model="agg.agg",
          label="Aggregation",
          :items="Object.entries(aggregationFunctions)",
          :item-value="item => item[0]",
          :item-text="item => item[1].title"
        )
      v-col
        v-text-field.ml-1.flex-grow-1(v-model="agg.alias",label="Alias")
      v-col.flex-grow-0
        v-btn(icon,small)
          v-icon(small,color="red",@click="removeAggregationColumn(index)") delete
  //- v-textarea(
  //-   v-model="local.aggregate",
  //-   rows="5",
  //-   filled,
  //-   label="aggregate"
  //- )
  v-text-field.mt-3(v-model="local.alias",label="Output Dataframe Alias")

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
import SchemaChips from '../../components/SchemaChips.vue'
import aggregationFunctions from './aggregationFunctions'

@Component({
  components: {SchemaChips}
})

export default class AggregateBlockProperties extends BlockProperties {
  // standard data dictionary for supported functions and mapping to pyspark
  aggregationFunctions = aggregationFunctions
  @Prop({ default: ():string[] => ([]) }) groupBy: string[]
  @Prop({ default: ():any[] => ([{"col":null,"agg":null,"alias":null}]) }) aggregations:any[]

  removeAggregationColumn(index:number) {
    this.local.aggregations.splice(index,1)
  }
  addAggregationColumn() {
    if (!this.local.aggregations) {
      this.local.aggregations = []
    }
    this.local.aggregations.push({"col":null,"agg":null,"alias":null})
  }

}
</script>

<style>

</style>