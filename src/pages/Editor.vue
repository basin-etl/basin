<template lang="pug">
v-row.ma-0.fill-height.flex-column.flex-nowrap
  v-row(no-gutters).flex-grow-0.flex-column
    //-
    //- toolbar
    //-
    v-toolbar(dense,flat)
      v-toolbar-title New job
      v-spacer
      v-btn(icon,small)
        v-icon(color="green",v-if="!running",@click="run") play_circle_outline
        v-icon(color="red",v-if="running",@click="stop") stop
    v-divider
  v-row.ma-0
    //-
    //- side bar
    //-
    .flex-grow-0.block-picker-bar
      EditorBlocksBar
    //-
    //- blocks editor
    //-
    v-col.pa-0.d-flex
      BlocksContainer.flex-grow-1(v-if="links && blocks" ref='container'
        v-on:update:scene="updateJob"
        :jobStatus="jobStatus"
        :readOnly="readOnly"
        :blocks="blocks"
        :links="links"
        @blockselect='selectBlock' 
        @blockdeselect='deselectBlock'
        @blockproperties='showProperties'
        @inspectsocket='inspectSocket($event)'
        )
  //-
  //- properties panel
  //-
  v-navigation-drawer.pa-3(
      v-model="showPropertiesPanel"
      absolute
      v-if="selectedBlock",
      temporary
      stateless
      right
      width="400"
  )
    v-row(no-gutters)
      div {{selectedBlock.type}} Properties
      v-spacer
      v-btn(icon,@click="showPropertiesPanel=false")
          v-icon close
    v-row(no-gutters)
      v-textarea(v-model="selectedBlock.comment",filled,label="comment")
    component(
      ref="propertiesPanel",
      v-bind:is="`${selectedBlock.type}Properties`",v-bind="selectedBlockProperties",:blockId="selectedBlock.id")
    template(v-slot:append)
      v-row.py-3(justify="center")
        v-btn(@click.stop="saveProperties()") Save
  //-
  //- bottom sheet
  //-
  v-bottom-sheet(v-model="showDataframePanel",height="500px",transition="")
    v-sheet(height="500px",:style="{'border-radius':'0'}")
      DataFrameViewer(:kernel="kernel",:dataframe="inspectDataframeVariable",v-if="showDataframePanel && kernel && inspectDataframeVariable")

  v-snackbar(v-model="showError",bottom,right)
    | {{error}}

  </template>

<script src="./Editor.ts" lang="ts">
</script>

<style lang="less">
.block-picker-bar {
  min-width: 200px;
  padding:0;
  background-color:#EEEEEE
}
</style>