<template lang="pug">
div
  v-select(v-model="local.source",
          :items="sources"
          label="Source name")
  v-text-field(v-model="local.previewLimit",label="Row limit in preview mode")
  v-text-field(v-model="local.alias",label="Alias")
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
@Component({
})

export default class ExtractBlockProperties extends BlockProperties {
  @Prop(String) source: string
  @Prop(String) alias: string
  @Prop({default: 50000}) previewLimit: number
  sources:Array<any> = []

  async created() {
    let catalog = await this.$idb.table("catalog").toArray()
    this.sources = catalog.map( (item:any) => item.name)

  }

  @Watch('local.source', { immediate: true})
  onSourceChanged(newVal:string,oldVal:string) {
    if (!this.local.alias) {
      this.local.alias = newVal
    }
  }
}
</script>

<style>
</style>