import { gsap } from "gsap";
import {tween } from 'femtotween'
import { linear, easeOutQuint } from 'femtotween/ease'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import mouseHelper from '../helpers/mouse'

import VueBlock from './blocksEditor/VueBlock.vue'
import VueLink from './VueLink.vue'
import blockTypes from '@/core/blockTypes'
import Vue from 'vue'
import Block, { BlockStatus } from '@/models/Block';
import Link from '@/models/Link';
import dagre from 'dagre';
import BlockPicker from '@/components/blockPicker/BlockPicker.vue'

class vBlock extends Block {
    selected: boolean = false
    inputLinks:Object = {}
    outputLinks:any = {}
}

@Component({
  name: 'BlocksContainer',
  components: {
    VueBlock,
    VueLink,
    BlockPicker
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

  // popup menu
  menuDisplayed = false
  menuX = 0
  menuY = 0
  menuOffsetX = 0
  menuOffsetY = 0
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
  breakingLink = false // indication that we are dragging to disconnect a link
  linkStartData:{block: Block, slot: string} = null
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

      this.centerX = this.$el.clientWidth / 2
      this.centerY = this.$el.clientHeight / 2

      this.importScene()
  }
  beforeDestroy () {
    document.documentElement.removeEventListener('mousemove', this.handleMove, true)
    document.documentElement.removeEventListener('mousedown', this.handleDown, true)
    document.documentElement.removeEventListener('mouseup', this.handleUp, true)
  }
  created () {
  }
  showMenu(e:MouseEvent) {
    e.preventDefault()
    console.log("menu")
    this.menuDisplayed = true
    this.menuX = e.clientX
    this.menuY = e.clientY
    this.menuOffsetX = e.offsetX
    this.menuOffsetY = e.offsetY
    this.$nextTick(() => {
      this.menuDisplayed = true
    })
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
        // validate that the link is valid
        if (!sourceBlockComponent || !targetBlockComponent) {
          console.log(`Invalid link between ${link.originId} and ${link.targetId}. Source or target not found`)
          this.removeLink(link)
          continue
        }
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
  async autoArrange() {

    // Create a new directed graph 
    var g = new dagre.graphlib.Graph();
    
    // Set an object for the graph label
    g.setGraph({
      rankdir:"LR",
      ranksep: 100
    });
    
    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function() { return {}; });
    
    // Add edges to the graph.
    
    
    for (let block of this.s_blocks) {
      g.setNode("n"+block.id,{
          width: this.optionsForChild.width,
          height: 100,
      })
      // XXX todo - use input port IDs instead of position
      for (let link of Object.keys(block.inputLinks).sort()) {
        let inputLink = (block.inputLinks as any)[link]
        if (inputLink) {
          g.setEdge("n"+inputLink.originId,`n${inputLink.targetId}`);
        }
      }
      // g.setEdge("n"+link.originId,`p_${link.targetId}_${link.targetSlot}`);
    }
    dagre.layout(g);
    let vm = this
    let timeline = gsap.timeline({
      onComplete: function() { 
        // seems there is a bug where gsap leaves artifacts attached to the object and this causes issues
        for (var i=0; i<vm.s_blocks.length; i++) {
          (<any>vm.s_blocks[i])._gsap = null
        }
      }
    })
    
    // animate using greensock
    for (let node of g.nodes()) {
      // reposition the node
      // use tween for animation
      let blockIndex = this.s_blocks.findIndex( (block) => block.id==parseInt(node.substring(1)))
      timeline.to(this.s_blocks[blockIndex],
        { duration:1.5, ease: "linear",
          x: g.node(node).x-this.container.centerX/this.scale 
        },
        0
      );
    }
  }
  setObjectProperties(arr:Array<any>,index:number,assignProperty:any) {
    this.$set(arr,index,Object.assign({},arr[index],assignProperty))
  }
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
    if (this.dragging) {
      let mouse = mouseHelper.getMousePosition(<HTMLElement>this.$el, e)
      this.mouseX = mouse.x
      this.mouseY = mouse.y
      let diffX = this.mouseX - this.lastMouseX
      let diffY = this.mouseY - this.lastMouseY

      this.lastMouseX = this.mouseX
      this.lastMouseY = this.mouseY

      // wait for refresh for better animation
      let vm = this
      requestAnimationFrame(function() {
        vm.centerX += diffX
        vm.centerY += diffY
      })

      this.hasDragged = true
    } else if (this.linking && this.linkStartData) {
      let mouse = mouseHelper.getMousePosition(<HTMLElement>this.$el, e)
      this.mouseX = mouse.x
      this.mouseY = mouse.y

      let linkStartPos = this.scalePosition(this.getBlock(this.linkStartData.block.id).getConnectionPos('output',this.linkStartData.slot))
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
      if (this.dragging && !this.linking) {
        this.dragging = false

        if (this.hasDragged) {
          this.updateScene()
          this.hasDragged = false
        }
      }

      if (this.$el.contains(target) && (typeof target.className !== 'string' || target.className.indexOf(this.inputSlotClassName) === -1)) {
        if (this.linking) {
          if (!this.breakingLink) {
            this.showMenu(e)
          }
          else {
            // dud link. did not connect to any point. discard.
            this.tempLink = null
            this.breakingLink = false
          }
        }
        this.linking = false
        this.dragging = false
        // this.linkStartData = null
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

        this.updateContainer()
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
  linkingStart (block:Block, slot:string) {
      this.linkStartData = {block: block, slot: slot}
      let linkStartPos = this.scalePosition(this.getBlock(this.linkStartData.block.id).getConnectionPos('output',this.linkStartData.slot))
      this.tempLink = {
        x1: linkStartPos.x,
        y1: linkStartPos.y,
        x2: this.mouseX,
        y2: this.mouseY
      }

      this.linking = true
  }
  linkingStop (targetBlock:Block, slot:string) {
    // check if valid link. If not, remove this link by filtering all but this one
    if (this.linkStartData && targetBlock && slot) {
      this.s_links = this.s_links.filter(value => {
        return !(value.targetId === targetBlock.id && value.targetSlot === slot)
      })

      // skip if looping
      if (this.linkStartData.block.id !== targetBlock.id) {
        this.s_links.push(new Link({
          originId: this.linkStartData.block.id,
          originSlot: this.linkStartData.slot,
          targetId: targetBlock.id,
          targetSlot: slot
        }))
        this.updateLinks()
      }
    }
    this.linking = false
    this.tempLink = null
    this.linkStartData = null
  }
  linkingBreak (targetBlock:Block, slot:string) {
      if (targetBlock && slot) {
        // indicate that we are dragging a broken link so we don't display the popup add menu
        this.breakingLink = true
        let findLink = this.s_links.find(value => {
          return value.targetId === targetBlock.id && value.targetSlot === slot
        })

        if (findLink) {
          let findBlock = this.s_blocks.find(value => {
            return value.id === findLink.originId
          })

          this.s_links = this.s_links.filter(value => {
            return !(value.targetId === targetBlock.id && value.targetSlot === slot)
          })

          this.linkingStart(findBlock, findLink.originSlot)

          this.updateLinks()
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
  async addNewBlockFromMenu(blockType:string) {
    this.menuDisplayed = false
    const BLOCKHEIGHT = 58
    let newBlock = this.addNewBlock(blockType,this.menuOffsetX,this.menuOffsetY-BLOCKHEIGHT/2)
    await Vue.nextTick()
    this.linkingStop(newBlock,"df")
  }
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

      this.updateBlocks()
      return block
  }
  deselectAll () {
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
  updateBlocks () {
    this.$emit('update:blocks', this.s_blocks)
  }
  updateLinks () {
    this.$emit('update:links', this.s_links)
  }
  updateContainer () {
    this.$emit('update:container', {
      centerX: this.centerX,
      centerY: this.centerY,
      scale: this.scale
    })
  }

  @Watch('blocks', { immediate: true})
  onBlocksChanged() {
      this.importScene()
  }
}
