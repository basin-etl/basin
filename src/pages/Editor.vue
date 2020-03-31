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
        :readOnly="readOnly"
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
    component(
      ref="propertiesPanel",
      v-bind:is="`${selectedBlock.type}Properties`",v-bind="selectedBlockProperties",:blockId="selectedBlock.id")
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
import jobRenderer from '@/core/jobRenderer'
import Vue from 'vue'
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
        props: {},
        blockTypes: blockTypes,
        showPropertiesPanel: false,
        job: jobContent,  // holds the job content
        selectedBlock: null,
        selectedBlockProperties: {}, // we store this separately because of reactivity issues with vue and the v-bind to the properties panel
        running: false,
        readOnly: false
      }
    },
    methods: {
      async showProperties(block) {
        this.selectedBlock=block
        this.selectedBlockProperties=block.properties
        this.showPropertiesPanel = true        
        await this.$nextTick()
        this.$refs["propertiesPanel"].reset()
      },
      selectBlock (block) {
        console.log('select', block)
        this.selectedBlock = block
        this.selectedBlockProperties = block.properties
      },
      deselectBlock (block) {
        console.log('deselect', block)
        this.selectedBlock = null
      },
      saveProperties() {
        // find index of selected block in job contents
        this.$refs["container"].setProperties(this.selectedBlock.id,this.$refs["propertiesPanel"].getProperties())
        this.showPropertiesPanel = false
      },
      getContainer() {
        // returns the handle to the blocks container
        return this.$refs["container"]
      },
      async run() {
        //
        // run this job in jupyter notebook
        //
        this.running = true
        this.readOnly = true
        let commands = jobRenderer.render(this.job)
        console.log("running")
        console.log(commands)
        for (let command of commands) {
          console.log(command)
          this.$refs["container"].getBlock(command.blockId).setState('running')
          await jupyterUtils.sendToPython(this.kernel,commands[0].code)
          this.$refs["container"].getBlock(command.blockId).setState('completed')
        }
      },
      stop() {
        // stop running the job. exit 'debug' mode
        this.running = false
        this.readOnly = false
        for (block of this.jobContent.blocks) {
          this.getContainer().getBlock(block.id).setState('')
        }
      }
    },
    watch: {
      job(newJob) {
        localStorage.job = JSON.stringify(newJob)
      }
    },
    async mounted () {
      // cleanup active kernel
      window.addEventListener('beforeunload', () => {
          console.log("shutting down kernel")
          this.kernel.shutdown()
      }, false)
      try {
        if (localStorage.job) this.job = JSON.parse(localStorage.job)
      }
      catch (e) {
        console.log(e)
      }
      this.kernel = await jupyterUtils.getKernel()
    },
    beforeDestroy() {
      console.log("shutting down kernel")
      this.kernel.shutdown()
    }
  }
</script>

<style lang="less">
.block-picker-bar {
  min-width: 200px;
  padding:0;
  background-color:#EEEEEE
}
</style>