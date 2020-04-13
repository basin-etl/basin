<template lang="pug">
v-row.ma-0.fill-height.flex-column.flex-nowrap
  v-row(no-gutters).flex-grow-0.flex-column
    //-
    //- toolbar
    //-
    v-toolbar(dense,flat)
      v-toolbar-title
        EditableLabel(v-model="jobName")
          | {{jobName}}
      v-spacer
      //- toolbar buttons
      div.pr-3
        v-btn(@click="exportCode",icon,small)
          v-icon(small) cloud_download
      v-divider.mx-2(vertical)
      //- status indicators
      .mx-2(:style="{'min-width':'120px'}") kernel: {{kernelStatus}}
      v-icon(small,v-if="connectionStatus=='connected'",color="green") link
      v-icon(small,v-if="connectionStatus=='connecting'",color="green") more_horiz
      v-icon(small,v-if="connectionStatus=='disconnected'",color="red") link_off
      v-divider.mx-3(vertical)
      //- run buttons
      v-btn(@click="run()",small,color="success",v-if="isJobStopped",:disabled="!kernel")
        v-icon(color="white") play_arrow
      v-btn(small,@click="stop",color="red",v-if="!isJobStopped")
          v-progress-circular(v-show="!isJobComplete",small,indeterminate,color="white",size="14",width="2")
          v-icon(color="white") stop

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
    v-col.pa-0.d-flex.flex-column
      //-
      //- progress bar
      //-
      v-progress-linear(
        :style="{'position':'absolute'}"
        :indeterminate="!isJobStopped && completedBlocks==-1"
        :value="completedBlocks==0? 5 : (completedBlocks/blocks.length)*100"
        :color="isJobComplete?'cyan':'cyan'"
        v-show="!isJobStopped"
      )
      BlocksContainer.flex-grow-1(v-if="links && blocks" ref='container'
        v-on:update:scene="updateJob"
        :jobStatus="jobStatus"
        :readOnly="readOnly"
        :blocks="blocks"
        :links="links"
        :container="container"
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
        v-btn.ml-2(@click.stop="testSelectedBlock()") Preview
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