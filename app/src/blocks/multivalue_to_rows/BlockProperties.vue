<template lang="pug">
div
  v-combobox(:return-object="false",
    v-model="local.column",small-chips,
    :items="inputSchema.df.map( (v) => { return { text: (v.tablealias ? v.tablealias + '.' : '') + v.name }})",
    label="Source Column")
  v-text-field(v-model="local.delimiter",label="Delimiter")

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
@Component({
})

export default class MultivalueToRowsBlockProperties extends BlockProperties {
  @Prop(String) column: string
  @Prop({ default: ","}) delimiter: string

}
</script>

<style>
</style>