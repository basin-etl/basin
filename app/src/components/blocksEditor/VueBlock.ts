const circleSize = 10
import blockTypes from '@/core/blockTypes'
import { Prop, Component, Watch } from 'vue-property-decorator';
import Vue from 'vue';
import { BlockStatus } from '@/models/Block';
import { JobStatus } from '@/models/Job';

@Component({
  name: 'VueBlock',
  components: {
  },
})
export default class VueBlock extends Vue {
  @Prop({
    type: Number,
    default: 0}) x:number
  @Prop({
      type: Number,
      default: 0}) y:number
  @Prop({
      type: Number,
      default: 0}) containerTop:number
  @Prop({
    type: Number,
    default: 0}) containerLeft:number
  @Prop({
      type: Number,
      default: 1}) scale:number
  @Prop({
      type: Boolean,
      default: false
    }) readOnly: boolean
  @Prop() type: string
  @Prop() id: Number
  @Prop() properties: Object
  @Prop() comment: String
  @Prop() error: String
  @Prop({
      type: Object,
      default: () => { return {} }
    })   inputLinks: Object
  @Prop({
      type: Object,
      default: () => { return {} }
    })   outputLinks: Object
  @Prop() jobStatus: Number
  @Prop() status: Number
  @Prop() linking: Boolean

  // data
  mouseX = 0
  mouseY = 0
  lastMouseX = 0
  lastMouseY = 0
  dragging = false

  blockType = blockTypes[this.type]
  hasDragged = false
  inputs = blockTypes[this.type].inputs
  outputs = blockTypes[this.type].outputs
  selected = false
  showCounts = true

  mounted () {
    // we handle mouse move at the document level to have smooth dragging when dragging outside of container
    this.$parent.$el.addEventListener('mousemove', this.handleMove, true)
  }
  beforeDestroy () {
    // cleanup
    // we handle mouse move at the document level to have smooth dragging when dragging outside of container
    this.$parent.$el.removeEventListener('mousemove', this.handleMove, true)
  }
  select() {
    this.selected = true
  }
  deselect() {
    this.selected = false
  }
  toggleSelected() {
    this.selected = !this.selected      
  }
  getConnectionPos (socketType:string, socket:string) {
    return {
      'x': (this.containerLeft + this.x + (<Array<HTMLElement>>this.$refs[`${socketType}_${socket}`])[0].offsetLeft + circleSize/2)*this.scale,
      'y': (this.containerTop + this.y + (<Array<HTMLElement>>this.$refs[`${socketType}_${socket}`])[0].offsetTop + circleSize/2)*this.scale
    }
  }
    showProperties(e:Event) {
      this.$emit('blockproperties', 
        {
          id:this.id,
          type:this.type,
          properties:this.properties
        }
      )
    }
    handleMove (e:Event) {
      if (this.readOnly) return
      this.mouseX = (<MouseEvent>e).pageX || (<MouseEvent>e).clientX + document.documentElement.scrollLeft
      this.mouseY = (<MouseEvent>e).pageY || (<MouseEvent>e).clientY + document.documentElement.scrollTop

      if (this.dragging && !this.linking) {
        let diffX = this.mouseX - this.lastMouseX
        let diffY = this.mouseY - this.lastMouseY

        this.lastMouseX = this.mouseX
        this.lastMouseY = this.mouseY
        let vm = this
        requestAnimationFrame(function() {
          vm.moveWithDiff(diffX, diffY)
        })

        this.hasDragged = true
      }
      return false
    }
    handleDown (e:MouseEvent) {
      if (this.readOnly) return
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop

      this.lastMouseX = this.mouseX
      this.lastMouseY = this.mouseY

      const target = <HTMLElement>e.target || <HTMLElement>e.srcElement
      if (this.$el.contains(target) && e.which === 1) {
        console.log("block drag")
        this.dragging = true
        if (e.preventDefault) e.preventDefault()
      }
    }
    handleUp (e:MouseEvent) {
      if (this.readOnly) return
      if (this.dragging) {
        this.dragging = false

        if (this.hasDragged) {
          this.save()
          this.hasDragged = false
        }
        else {
          // regular click. toggle selected state
          this.toggleSelected()
        }
      }
      e.preventDefault()
    }
    // Slots
    slotMouseDown (e:MouseEvent, slot:string) {
      if (this.readOnly) return
      this.$emit('linkingStart', slot)
    }
    slotMouseUp (e:MouseEvent, slot:string) {
      if (this.readOnly) return
      this.$emit('linkingStop', slot)
      if (e.preventDefault) e.preventDefault()
    }
    inspectSlot(type:string,id:string) {
      this.$emit('inspectsocket',{type:type,id:this.id,socketId:id})
    }
    slotBreak (e:MouseEvent, slot:string) {
      if (this.readOnly) return
      this.$delete(this.inputLinks,slot)
      this.$emit('linkingBreak', slot)
      if (e.preventDefault) e.preventDefault()
    }
    save () {
      this.$emit('update')
    }
    deleteBlock () {
      this.$emit('delete')
    }
    moveWithDiff (diffX:number, diffY:number) {
      let left = this.x + diffX / this.scale
      let top = this.y + diffY / this.scale

      this.$emit('update:x', left)
      this.$emit('update:y', top)
    }
    get style() {
      let newTop = (this.y)+this.containerTop
      let newLeft = (this.x)+this.containerLeft
      return {
        transform: `scale(${this.scale}) translate(${newLeft}px,${newTop}px)`,
        transformOrigin: 'top left'
      }
    }
    get running() {
      return this.status==BlockStatus.Running && !this.error
    }
    get completed() {
      return this.status==BlockStatus.Completed
    }
    get stopped() {
      return this.jobStatus==JobStatus.Stopped
    }
    get pendingRun() {
      return this.jobStatus==JobStatus.Running && this.status!=BlockStatus.Completed
    }
  }
