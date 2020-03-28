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
      BlocksContainer.flex-grow-1(ref='container' :scene.sync='job' 
        @blockselect='selectBlock' 
        @blockdeselect='deselectBlock'
        @blockproperties='showProperties'
        )
  //-
  //- properties panel
  //-
  v-navigation-drawer(
      v-model="showPropertiesPanel"
      absolute
      v-if="selectedBlock",
      temporary
      stateless
      right
      width="400"
  )
      component(
        v-bind:is="selectedBlockType",:blockId="selectedBlock.id")
      template(v-slot:append)
        v-row.py-3(justify="center")
          v-btn(@click.stop="saveProperties()") Save

  </template>

<script>
import jupyterUtils from '@/core/jupyterUtils.ts'
import blockTypes from '@/blocks/blockTypes.ts'
import jobContent from './demoJob.ts'
import BlocksContainer from '@/components/BlocksContainer'
import BlockProperties from '@/components/BlockProperties'
import domHelper from '@/helpers/dom'
import EditorBlocksBar from './EditorBlocksBar'
export default {
    name: 'App',
    components: {
      BlocksContainer,
      BlockProperties,
      EditorBlocksBar
    },
    data: function () {
      return {
        kernel: null,
        dragAdding: false,
        selectedBlockType: "BlockProperties",
        selectedBlockId: 20,
        blockTypes: blockTypes,
        showPropertiesPanel: false,
        job: jobContent,  // holds the job content
        selectedBlock: null,
        running: false,
      }
    },
    methods: {
      showProperties(block) {
        this.showPropertiesPanel = true
      },
      selectBlock (block) {
        console.log('select', block)
        this.selectedBlock = block
      },
      deselectBlock (block) {
        console.log('deselect', block)
        this.selectedBlock = null
      },
      saveProperties() {
        this.showPropertiesPanel = false
      },
      run() {
        this.running = true
        console.log("running")
      },
      stop() {
        this.running = false
      }
    },
    watch: {
      job(newJob) {
        localStorage.job = JSON.stringify(newJob)
      }
    },
    async mounted () {
      try {
        if (localStorage.job) this.job = JSON.parse(localStorage.job)
      }
      catch (e) {
        console.log(e)
      }
      this.kernel = await jupyterUtils.getKernel()
    },
  }
</script>

<style lang="less">
.block-picker-bar {
  min-width: 200px;
  padding:0;
  background-color:#EEEEEE
}
</style>