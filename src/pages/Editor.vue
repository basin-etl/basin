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
        useContextMenu: false,
        contextMenu: {
          isShow: false,
          mouseX: 0,
          mouseY: 0,
          top: 0,
          left: 0
        }
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
      showContextMenu (e) {
        if (!this.useContextMenu) return
        if (e.preventDefault) e.preventDefault()

        this.contextMenu.isShow = true
        this.contextMenu.mouseX = e.x
        this.contextMenu.mouseY = e.y

        this.$nextTick(function () {
          this.setMenu(e.y, e.x)
          this.$refs.contextMenu.focus()
        })
      },
      setMenu (top, left) {
        let border = 5
        let contextMenuEl = this.$refs.contextMenu
        let containerElRect = this.$refs.container.$el.getBoundingClientRect()
        let largestWidth = containerElRect.right - contextMenuEl.offsetWidth - border
        let largestHeight = containerElRect.bottom - contextMenuEl.offsetHeight - border

        console.log(this.$refs.container)
        console.log(containerElRect)

        if (left > largestWidth) left = largestWidth
        if (top > largestHeight) top = largestHeight

        this.contextMenu.top = top
        this.contextMenu.left = left
      },
      addBlockContextMenu (name) {
        let offset = domHelper.getOffsetRect(this.$refs.container.$el)
        let x = this.contextMenu.mouseX - offset.left
        let y = this.contextMenu.mouseY - offset.top

        this.$refs.container.addNewBlock(name, x, y)
        this.closeContextMenu()
      },
      closeContextMenu () {
        this.contextMenu.isShow = false
      }
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
  #contextMenu {
    position: absolute;
    z-index: 1000;
    background: white;
    border: 1px solid black;
    padding: 5px;
    margin: 0;

    li {
      &.label {
        color: gray;
        font-size: 90%;
      }
      list-style: none;
    }

    &:focus {
      outline: none;
    }
  }
</style>