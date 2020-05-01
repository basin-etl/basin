<template lang="pug">
div
  v-select(v-model="local.source",
          :items="sources"
          item-text="name"
          item-value="name"
          label="Source name")
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
  sources:Array<any> = []

  async created() {
    this.sources = await this.$idb.table("catalog").toArray()
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