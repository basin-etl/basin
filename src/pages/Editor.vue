<template lang="pug">
v-row.ma-0.fill-height.flex-column.flex-nowrap
  v-row.flex-grow-0.flex-column
    v-toolbar(dense,flat)
      v-toolbar-title New job
      v-spacer
      v-btn(icon,small,@click.stop='addBlock')
        v-icon(small) save
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
      BlocksContainer.flex-grow-1(@contextmenu.native='showContextMenu' @click.native='closeContextMenu' ref='container' :scene.sync='scene' 
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
import jupyterUtils from './jupyterUtils.ts'
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
        dragAdding: false,
        selectedBlockType: "BlockProperties",
        selectedBlockId: 20,
        blockTypes: blockTypes,
        showPropertiesPanel: false,
        scene: jobContent,
        selectedBlock: null,
      }
    },
    computed: {
      selectBlocksType () {
        return Object.entries(blockTypes).map(b => b.type)
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
      addBlock () {
        this.$refs.container.addNewBlock("extract")
      },
      saveProperties() {
        this.showPropertiesPanel = false
      },
    },
    async mounted () {
      console.log("mounted")
      console.log(jupyterUtils)
      await jupyterUtils.getKernel()
    },
    watch: {
      scene (newValue) {
        // console.log('scene', JSON.stringify(newValue))
        console.log('scene changed')
      }
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