<template lang="pug">
div
  v-row.mb-2(align="center",no-gutters)
    h3.flex-grow-1 {{title}}
    v-text-field.flex-grow-0(small,v-model="filterText",label="filter",hide-details,dense,single-line)
  SchemaChips(:schema="schema ? schema.filter( (v) => v.name.toLowerCase().indexOf(filterText.toLowerCase())>-1): []")

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import SchemaChips from '@/components/SchemaChips.vue'

@Component({
  name: "SchemaPicker",
  components: {
    SchemaChips
  }
})

export default class SchemaPicker extends Vue {
  @Prop(Array) schema: Array<JSON>
  @Prop(String) title: string
  filterText = ""

}
</script>

<style>
</style>
