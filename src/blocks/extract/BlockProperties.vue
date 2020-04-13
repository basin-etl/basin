<template lang="pug">
div
    v-text-field(v-model="local.source",label="Source name")
    v-text-field(v-model="local.alias",label="Alias")
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import blockPropertiesMixin from '../blockPropertiesMixin.js'
import Vue from 'vue'
import BlockProperties from '@/components/BlockProperties'
@Component({
})

export default class ExtractBlockProperties extends BlockProperties {
  @Prop(String) source: string
  @Prop(String) alias: string

  // for data:
  // only mutate local.<property>. added via mixin

}
</script>

<style>
</style>