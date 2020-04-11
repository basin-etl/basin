import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import mouseHelper from '../helpers/mouse'

import VueBlock from './blocksEditor/VueBlock.vue'
import VueLink from './VueLink.vue'
import blockTypes from '@/blocks/blockTypes.ts'
import Vue from 'vue'
import Block, { BlockStatus } from '@/models/Block';
import Link from '@/models/Link';

class vBlock extends Block {
    selected: boolean = false
    inputLinks:Object = {}
    outputLinks:any = {}
}

@Component({
  name: 'BlocksContainer',
  components: {
    VueBlock,
    VueLink
  }
})
export default class BlocksContainer extends Vue {
    $refs:any
    //
    // props
    //
    @Prop(Array)    readonly blocks: Array<any>
    @Prop(Array)    readonly links: Array<any>
    @Prop(Object)   readonly container: any
    @Prop({
        type: Boolean,
        default: false
      })            readonly readOnly: boolean
    @Prop()         readonly jobStatus: String
    //
    // data
    //
    dragging = false
    //
    centerX = 0
    centerY = 0
    scale = 1
    mouseX = 0
    mouseY = 0
    lastMouseX = 0
    lastMouseY = 0
    minScale = 0.2
    maxScale = 5
    linking = false
    linkStartData:{block: Block, slotNumber: number} = null
    inputSlotClassName = 'inputSlot'
    //
    s_blocks:Array<vBlock> = [] // internal copy
    s_links:Array<Link> = []
    //
    tempLink:any = null
    selectedBlock:vBlock = null
    hasDragged = false
    blockTypes = blockTypes

    mounted () {
        document.documentElement.addEventListener('mousemove', this.handleMove, true)
        document.documentElement.addEventListener('mousedown', this.handleDown, true)
        document.documentElement.addEventListener('mouseup', this.handleUp, true)
        document.documentElement.addEventListener('wheel', this.handleWheel, true)

        this.centerX = this.$el.clientWidth / 2
        this.centerY = this.$el.clientHeight / 2

        this.importScene()
    }
    beforeDestroy () {
      document.documentElement.removeEventListener('mousemove', this.handleMove, true)
      document.documentElement.removeEventListener('mousedown', this.handleDown, true)
      document.documentElement.removeEventListener('mouseup', this.handleUp, true)
      document.documentElement.removeEventListener('wheel', this.handleWheel, true)
    }
    created () {
    }
    get optionsForChild () {
        return {
            width: 200,
            titleHeight: 20,
            scale: this.scale,
            inputSlotClassName: this.inputSlotClassName,
            center: {
                x: this.centerX,
                y: this.centerY
            }
        }
    }
    // Links calculate
    get lines () {
        let lines = []

        for (let link of this.s_links) {
          let originBlock = this.s_blocks.find(block => {
            return block.id === link.originId
          })

          let targetBlock = this.s_blocks.find(block => {
            return block.id === link.targetId
          })

          if (!originBlock || !targetBlock) {
            console.log('Remove invalid link', link)
            this.removeLink(link)
            continue
          }

          if (originBlock.id === targetBlock.id) {
            console.log('Loop detected, remove link', link)
            this.removeLink(link)
            continue
          }
          const sourceBlockComponent = this.getBlock(link.originId)
          const targetBlockComponent = this.getBlock(link.targetId)
          const originLinkPos = this.scalePosition(sourceBlockComponent.getConnectionPos('output',link.originSlot))
          const targetLinkPos = this.scalePosition(targetBlockComponent.getConnectionPos('input',link.targetSlot))

          if (!originLinkPos || !targetLinkPos) {
            console.log('Remove invalid link (slot not exist)', link)
            this.removeLink(link)
            continue
          }

          let x1 = originLinkPos.x
          let y1 = originLinkPos.y

          let x2 = targetLinkPos.x
          let y2 = targetLinkPos.y

          lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            style: {
              stroke: '#F85',
              strokeWidth: 4 * this.scale,
              fill: 'none'
            },
            outlineStyle: {
              stroke: '#666',
              strokeWidth: 6 * this.scale,
              strokeOpacity: 0.6,
              fill: 'none'
            }
          })
        }

        if (this.tempLink) {
          this.tempLink.style = {
            stroke: '#8f8f8f',
            strokeWidth: 4 * this.scale,
            fill: 'none'
          }

          lines.push(this.tempLink)
        }

        return lines
    }
    //
    // methods
    //
    blockDropped(event:DragEvent) {
        this.addNewBlock(
            event.dataTransfer.getData("text"),
            event.offsetX,
            event.offsetY
        )
    }
    dragOver(event:DragEvent) {
        event.preventDefault() 
    }
    getBlock(id:number): any {
        return (this.$refs[`block${id}`])[0]
    }
    // Events
    showProperties(e:MouseEvent) {
        // propagate the event
        this.$emit('blockproperties', e)
    }
    inspectSocket(socket:any) {
        this.$emit('inspectsocket',socket)
    }
    handleMove (e:MouseEvent) {
        let mouse = mouseHelper.getMousePosition(<HTMLElement>this.$el, e)
        this.mouseX = mouse.x
        this.mouseY = mouse.y
        if (this.dragging) {
          let diffX = this.mouseX - this.lastMouseX
          let diffY = this.mouseY - this.lastMouseY

          this.lastMouseX = this.mouseX
          this.lastMouseY = this.mouseY

          this.centerX += diffX
          this.centerY += diffY

          this.hasDragged = true
        }

        if (this.linking && this.linkStartData) {
          // let linkStartPos = this.getConnectionPos(this.linkStartData.block, this.linkStartData.slotNumber, false)
          let linkStartPos = this.scalePosition(this.getBlock(this.linkStartData.block.id).getConnectionPos('output',this.linkStartData.slotNumber))
          this.tempLink = {
            x1: linkStartPos.x,
            y1: linkStartPos.y,
            x2: this.mouseX,
            y2: this.mouseY
          }
        }
    }
    handleDown (e:MouseEvent) {
        const target = e.target || e.srcElement
        if ((target === this.$el || (<Element>target).matches('svg, svg *')) && e.which === 1) {
          this.dragging = true

          let mouse = mouseHelper.getMousePosition(<HTMLElement>this.$el, e)
          this.mouseX = mouse.x
          this.mouseY = mouse.y

          this.lastMouseX = this.mouseX
          this.lastMouseY = this.mouseY

          this.deselectAll()
          if (e.preventDefault) e.preventDefault()
        }
    }
    handleUp (e:MouseEvent) {
        const target = <HTMLElement>e.target || <HTMLElement>e.srcElement
        console.log(this.dragging)
        if (this.dragging) {
          this.dragging = false

          if (this.hasDragged) {
            this.updateScene()
            this.hasDragged = false
          }
        }

        if (this.$el.contains(target) && (typeof target.className !== 'string' || target.className.indexOf(this.inputSlotClassName) === -1)) {
          this.linking = false
          this.tempLink = null
          this.linkStartData = null
        }
    }
    handleWheel (e:MouseWheelEvent) {
        const target = <HTMLElement>e.target || <HTMLElement>e.srcElement
        if (this.$el.contains(target)) {
          if (e.preventDefault) e.preventDefault()

          let deltaScale = Math.pow(1.1, e.deltaY * -0.01)
          this.scale *= deltaScale

          if (this.scale < this.minScale) {
            this.scale = this.minScale
            return
          } else if (this.scale > this.maxScale) {
            this.scale = this.maxScale
            return
          }

          let zoomingCenter = {
            x: this.mouseX,
            y: this.mouseY
          }

          let deltaOffsetX = (zoomingCenter.x - this.centerX) * (deltaScale - 1)
          let deltaOffsetY = (zoomingCenter.y - this.centerY) * (deltaScale - 1)

          this.centerX -= deltaOffsetX
          this.centerY -= deltaOffsetY

          this.updateScene()
        }
    }
      // Processing
    scalePosition(position:any) {
        let x = position.x * this.scale
        let y = position.y * this.scale

        x += this.centerX
        y += this.centerY

        return {x:x,y:y}
    }

    // Linking
    linkingStart (block:Block, slotNumber:number) {
        this.linkStartData = {block: block, slotNumber: slotNumber}
        let linkStartPos = this.scalePosition(this.getBlock(this.linkStartData.block.id).getConnectionPos('output',this.linkStartData.slotNumber))
        this.tempLink = {
          x1: linkStartPos.x,
          y1: linkStartPos.y,
          x2: this.mouseX,
          y2: this.mouseY
        }

        this.linking = true
    }
    linkingStop (targetBlock:Block, slotNumber:number) {
        if (this.linkStartData && targetBlock && slotNumber > -1) {
          this.s_links = this.s_links.filter(value => {
            return !(value.targetId === targetBlock.id && value.targetSlot === slotNumber)
          })

          // skip if looping
          if (this.linkStartData.block.id !== targetBlock.id) {
            this.s_links.push(new Link({
              originId: this.linkStartData.block.id,
              originSlot: this.linkStartData.slotNumber,
              targetId: targetBlock.id,
              targetSlot: slotNumber
            }))
            this.updateScene()
          }
        }

        this.linking = false
        this.tempLink = null
        this.linkStartData = null
    }
    linkingBreak (targetBlock:Block, slotNumber:number) {
        if (targetBlock && slotNumber > -1) {
          let findLink = this.s_links.find(value => {
            return value.targetId === targetBlock.id && value.targetSlot === slotNumber
          })

          if (findLink) {
            let findBlock = this.s_blocks.find(value => {
              return value.id === findLink.originId
            })

            this.s_links = this.s_links.filter(value => {
              return !(value.targetId === targetBlock.id && value.targetSlot === slotNumber)
            })

            this.linkingStart(findBlock, findLink.originSlot)

            this.updateScene()
          }
        }
    }
    removeLink (link:Link) {
        this.s_links = this.s_links.filter(value => {
            return !(
                value.originId === link.originId &&
                value.targetId === link.targetId &&
                value.originSlot === link.originSlot &&
                value.targetSlot === link.targetSlot
            )
        })
    }

    // Blocks
    addNewBlock (blockType:string, x:number, y:number) {
        let maxId = Math.max(0, ...this.s_blocks.map(function (o) {
          return o.id
        }))
        let block = new vBlock({id:maxId+1,type:blockType})

        // if x or y not set, place block to center
        if (x === undefined || y === undefined) {
          x = (this.$el.clientWidth / 2 - this.centerX) / this.scale
          y = (this.$el.clientHeight / 2 - this.centerY) / this.scale
        } else {
          x = (x - this.centerX) / this.scale
          y = (y - this.centerY) / this.scale
        }

        block.x = x
        block.y = y
        this.s_blocks.push(block)

        this.updateScene()
    }
    deselectAll () {
        console.log("deselecting")
        this.s_blocks.forEach((block) => {
          this.blockDeselect(block)
        })
    }
      // Events
    blockSelect (block:vBlock) {
        block.selected = true
        this.selectedBlock = block
        this.deselectAll()
        this.$emit('blockselect', block)
    }
    blockDeselect (block:vBlock) {
        this.getBlock(block.id).deselect()
        this.$emit('blockdeselect', block)
    }
    blockDelete (block:vBlock) {
        if (block.selected) {
          this.blockDeselect(block)
        }
        this.s_links.forEach(l => {
          if (l.originId === block.id || l.targetId === block.id) {
            this.removeLink(l)
          }
        })
        this.s_blocks = this.s_blocks.filter(b => {
          return b.id !== block.id
        })
        this.updateScene()
    }
    async importScene() {
        const vm = this
        this.s_blocks = JSON.parse(JSON.stringify(this.blocks))
        await this.$nextTick()
        // set the link indications for each block object
        this.s_links = JSON.parse(JSON.stringify(this.links))
        
        let container = this.container
        if (container.centerX) {
          this.centerX = container.centerX
        }
        if (container.centerY) {
          this.centerY = container.centerY
        }
        if (container.scale) {
          this.scale = container.scale
        }
    }
    exportScene () {
        return {
            blocks: this.s_blocks,
            links: this.s_links,
            container: {
                centerX: this.centerX,
                centerY: this.centerY,
                scale: this.scale
            }
        }
    }
    updateScene () {
        this.$emit('update:scene', this.exportScene())
    }
    @Watch('blocks', { immediate: true})
    onBlocksChanged() {
        console.log("importing scene")
        this.importScene()
    }
}
