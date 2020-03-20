<template lang="pug">
v-row.fill-height.flex-column.flex-nowrap
  v-row.flex-grow-0
    v-toolbar(dense)
      v-toolbar-title Title
      v-spacer
      v-btn(@click.stop='addBlock') Add
        v-icon add
  v-row
    v-col.flex-grow-0
      div(
        :style="{'background-color':'blue'}",
        draggable="true",
        v-on:dragstart="newBlockDragStart(blockType, $event)" 
        v-on:dragend="newBlockDragEnd(this, $event)" 
        v-for="blockType in blockTypes"
      )
        | {{blockType.type}}
      div.block-type-ghost(
        ref="bla"
      )
        | New {{newBlockType}} block
    v-col
      VueBlocksContainer.blocks-container(@contextmenu.native='showContextMenu' @click.native='closeContextMenu' ref='container' :blocksContent='blocks' :scene.sync='scene' 
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
        selectedBlockType: "BlockProperties",
        selectedBlockId: 20,
        blockTypes: blockTypes,
        newBlockType: null,
        showPropertiesPanel: false,
        scene: {
          blocks: [
            {
              id: 2,
              x: -700,
              y: -69,
              type:'extract',
              name: 'extract cobol',
              title: 'extract cobol',
              properties: {}
            },
            {
              id: 4,
              x: -157,
              y: -68.5,
              type:'join',
              name: 'join',
              title: 'join a to b',
              properties: {}
            },
            {
              id: 5,
              x: 136,
              y: -48.5,
              name: 'text',
              title: 'Text',
              values: {
                property: {
                  text: {
                    label: 'Text',
                    type: 'string'
                  }
                }
              }
            },
            {
              id: 6,
              x: -440,
              y: -15.5,
              name: 'delay',
              title: 'Delay',
              values: {
                property: {
                  delay: {
                    label: 'Delay (s)',
                    type: 'number',
                    value: 1
                  }
                }
              }
            },
            {
              id: 7,
              x: -694,
              y: 60.5,
              name: 'shortcuts',
              title: 'Shortcuts',
              values: {
                property: {
                  keys: {
                    label: 'Activation keys',
                    type: 'keys'
                  }
                }
              }
            },
            {
              id: 8,
              x: -163,
              y: 59.5,
              name: 'text',
              title: 'Text',
              values: {
                property: {
                  text: {
                    label: 'Text',
                    type: 'string'
                  }
                }
              }
            },
            {
              id: 9,
              x: -429,
              y: 125.5,
              name: 'delay',
              title: 'Delay',
              values: {
                property: {
                  delay: {
                    label: 'Delay (s)',
                    type: 'number',
                    value: 1
                  }
                }
              }
            },
            {
              id: 10,
              x: 126,
              y: 127.5,
              name: 'text',
              title: 'Text',
              values: {
                property: {
                  text: {
                    label: 'Text',
                    type: 'string'
                  }
                }
              }
            },
            {
              id: 11,
              x: -856,
              y: 252.5,
              name: 'shortcuts',
              title: 'Shortcuts',
              values: {
                property: {
                  keys: {
                    label: 'Activation keys',
                    type: 'keys'
                  }
                }
              }
            },
            {
              id: 12,
              x: -616,
              y: 319.5,
              name: 'delay',
              title: 'Delay',
              values: {
                property: {
                  delay: {
                    label: 'Delay (s)',
                    type: 'number',
                    value: 1
                  }
                }
              }
            },
            {
              id: 13,
              x: -381,
              y: 252.5,
              name: 'text',
              title: 'Text',
              values: {
                property: {
                  text: {
                    label: 'Text',
                    type: 'string'
                  }
                }
              }
            },
            {
              id: 14,
              x: 166,
              y: 266.5,
              name: 'text',
              title: 'Text',
              values: {
                property: {
                  text: {
                    label: 'Text',
                    type: 'string'
                  }
                }
              }
            },
            {
              id: 15,
              x: -149,
              y: 269.5,
              name: 'delay',
              title: 'Delay',
              values: {
                property: {
                  delay: {
                    label: 'Delay (s)',
                    type: 'number',
                    value: 1
                  }
                }
              }
            },
            {
              id: 16,
              x: 413,
              y: 267.5,
              name: 'animation',
              title: 'Animation',
              values: {
                property: {
                  animation: {
                    label: 'Animation',
                    type: 'animation'
                  }
                }
              }
            },
            {
              id: 17,
              x: 13,
              y: 380.5,
              name: 'delay',
              title: 'Delay',
              values: {
                property: {
                  delay: {
                    label: 'Delay (s)',
                    type: 'number',
                    value: 1
                  }
                }
              }
            }
          ],
          links: [
            {
              id: 3,
              originID: 2,
              originSlot: 0,
              targetID: 4,
              targetSlot: 0
            },
            {
              id: 6,
              originID: 7,
              originSlot: 0,
              targetID: 8,
              targetSlot: 0
            },
            {
              id: 7,
              originID: 7,
              originSlot: 0,
              targetID: 9,
              targetSlot: 0
            },
            {
              id: 8,
              originID: 9,
              originSlot: 0,
              targetID: 10,
              targetSlot: 0
            },
            {
              id: 9,
              originID: 9,
              originSlot: 0,
              targetID: 8,
              targetSlot: 1
            },
            {
              id: 10,
              originID: 2,
              originSlot: 0,
              targetID: 6,
              targetSlot: 0
            },
            {
              id: 11,
              originID: 6,
              originSlot: 0,
              targetID: 4,
              targetSlot: 1
            },
            {
              id: 12,
              originID: 4,
              originSlot: 1,
              targetID: 5,
              targetSlot: 0
            },
            {
              id: 13,
              originID: 11,
              originSlot: 0,
              targetID: 13,
              targetSlot: 0
            },
            {
              id: 14,
              originID: 11,
              originSlot: 0,
              targetID: 12,
              targetSlot: 0
            },
            {
              id: 15,
              originID: 12,
              originSlot: 0,
              targetID: 13,
              targetSlot: 1
            },
            {
              id: 16,
              originID: 13,
              originSlot: 1,
              targetID: 15,
              targetSlot: 0
            },
            {
              id: 17,
              originID: 15,
              originSlot: 0,
              targetID: 14,
              targetSlot: 0
            },
            {
              id: 18,
              originID: 14,
              originSlot: 0,
              targetID: 16,
              targetSlot: 0
            },
            {
              id: 19,
              originID: 14,
              originSlot: 1,
              targetID: 16,
              targetSlot: 1
            },
            {
              id: 20,
              originID: 15,
              originSlot: 0,
              targetID: 17,
              targetSlot: 0
            },
            {
              id: 21,
              originID: 17,
              originSlot: 0,
              targetID: 14,
              targetSlot: 1
            }
          ],
          container: {
            centerX: 1042,
            centerY: 140,
            scale: 1
          }
        },
        selectedBlock: null,
        selectedType: 'delay',
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
      newBlockDragStart(item, $event) {
        this.newBlockType = item.type
        console.log(item)
        this.$refs["bla"].style.top = $event.srcElement.offsetTop + "px"
        $event.dataTransfer.setDragImage(this.$refs["bla"], 5, 5)
      },
      newBlockDragEnd(item, $event) {
        console.log('end')
        this.$refs.container.addNewBlock(
          this.newBlockType,
          $event.offsetX-this.$refs["container"].$el.offsetLeft,
          $event.offsetY
        )
        console.log($event)
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
        console.log(this.selectedType)
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
        console.log('scene', JSON.stringify(newValue))
      }
    }
  }
</script>

<style lang="less">
  .blocks-container {
    width: 100%;
    height: ~"calc(100% - 50px)";
  }

  .block-type-ghost {
    position: absolute;
    z-index: -1;
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