<template lang="pug">
div
  v-autocomplete(:return-object="true",
    v-model="selectedColumn",small-chips,
    :items="inputSchema.df ? inputSchema.df.map( (v) => (v.tablealias ? v.tablealias + '.' : '') + v.name): []",
    label="Source Column")
  v-text-field(v-model="local.delimiter",label="Delimiter")
  v-text-field(v-model="local.targetColumn",label="Target column")

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import BlockProperties from '@/components/BlockProperties'
@Component({
})

export default class MultivalueToRowsBlockProperties extends BlockProperties {
  @Prop(String) sourceColumn: string
  @Prop(String) targetColumn: string
  @Prop({ default: ","}) delimiter: string
  selectedColumn:string = null
  mounted() {
    this.selectedColumn = this.sourceColumn
  }
  @Watch('selectedColumn', { immediate: true})
  onSelectedColumnChanged(newVal:string) {
    this.local.sourceColumn = newVal
    this.local.targetColumn = newVal? newVal.split(".").reverse()[0] : '';
  }
}
</script>

<style>
</style>