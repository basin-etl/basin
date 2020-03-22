<template lang="pug">
v-row.fill-height.flex-column.flex-nowrap
  v-row.flex-grow-0
    v-toolbar(dense)
      v-toolbar-title Title
      v-spacer
      v-btn(@click.stop='addBlock') Add
        v-icon add
  v-row
    v-col.flex-grow-0.block-picker-bar
      v-list-group(value="true",dark)
        template(v-slot:activator)
          v-list-item-title(color="white") Dataframe
        div(
          :style="{'background-color':'lightgrey'}",
          draggable="true",
          v-on:dragstart="newBlockDragStart(blockType, $event)" 
          v-for="blockType in blockTypes"
          :key="blockType.type"
        )
          v-list-item(link)
            v-list-item-icon
              v-icon {{blockType.icon}}
            v-list-item-content {{blockType.type}}
          v-divider
      v-list-group()
        template(v-slot:activator)
          v-list-item-title Column
        v-list-item(link) add column
        v-list-item(link) drop column
        v-list-item(link) test
      
      transition(name="revert")
      div.py-1.px-2.block-type-ghost(
        ref="newGhost",
        v-if="dragAdding",
        :style="{'background-color':newBlockType.color}"
      )
        v-icon {{newBlockType.icon}}
        span.ml-2 New {{newBlockType.type}}
    v-col
      VueBlocksContainer.blocks-container(@contextmenu.native='showContextMenu' @click.native='closeContextMenu' ref='container' :scene.sync='scene' 
        @blockselect='selectBlock' 
        @blockdeselect='deselectBlock'
        @blockproperties='showProperties'
        )
  label(for='useContextMenu')
    input#useContextMenu(type='checkbox' v-model='useContextMenu')
    | Use right click for Add blocks
  ul#contextMenu(ref='contextMenu' tabindex='-1' v-show='contextMenu.isShow' @blur='closeContextMenu' :style="{top: contextMenu.top + 'px', left: contextMenu.left + 'px'}")
    template(v-for='type in selectBlocksType')
      li.label(:key='type') {{type}}
      //- li(v-for='block in filteredBlocks(type)' :key='block.id' @click='addBlockContextMenu(block.name)')
      //-   | {{block.title || block.name}}
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
import VueBlocksContainer from '@/components/VueBlocksContainer'
import BlockProperties from '@/components/BlockProperties'
import domHelper from '@/helpers/dom'

  export default {
    name: 'App',
    components: {
      VueBlocksContainer,
      BlockProperties
    },
    data: function () {
      return {
        dragAdding: false,
        scolor:"blue",
        selectedBlockType: "BlockProperties",
        selectedBlockId: 20,
        blockTypes: blockTypes,
        newBlockType: null,
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
      async newBlockDragStart(blockType, event) {
        this.newBlockType = blockType
        this.dragAdding = true
        await this.$nextTick()
        let ghostElement = this.$refs["newGhost"]
        ghostElement.style.top = event.srcElement.offsetTop + "px"
        event.dataTransfer.setDragImage(ghostElement, 5, 5)
        event.dataTransfer.setData("text/plain",blockType.type);
      },
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
  .blocks-container {
    width: 100%;
    height: ~"calc(100% - 50px)";
  }
  .revert-enter-active {
    transition: opacity 1s
  }
  .revert-enter {
    opacity: 0
  }
  .block-type-ghost {
    position: absolute;
    z-index: -1;
    border-radius: 5px
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