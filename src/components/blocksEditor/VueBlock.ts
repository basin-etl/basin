const circleSize = 10
import blockTypes from '@/blocks/blockTypes.ts'
import { Prop, Component } from 'vue-property-decorator';
import Vue from 'vue';
import { BlockStatus } from '@/models/Block';
import { JobStatus } from '@/models/Job';

@Component({
  name: 'VueBlock',
  components: {
  },
})
export default class Editor extends Vue {
  @Prop({
      type: Number,
      default: 0,
      validator: function (val) {
        return typeof val === 'number'
      }}) x:number
  @Prop({
      type: Number,
      default: 0,
      validator: function (val) {
        return typeof val === 'number'
      }
    }) y:number
  @Prop({
      type: Boolean,
      default: false
    }) readOnly: boolean
  @Prop() type: string
  @Prop() id: Number
  @Prop() properties: Object
  @Prop() options: any
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
  
  // data
  mouseX = 0
  mouseY = 0
  lastMouseX = 0
  lastMouseY = 0
  linking = false
  dragging = false

  blockType = blockTypes[this.type]
  hasDragged = false
  inputs = blockTypes[this.type].inputs
  outputs = blockTypes[this.type].outputs
  selected = false

  mounted () {
    // we handle mouse move at the document level to have smooth dragging when dragging outside of container
    this.$parent.$el.addEventListener('mousemove', this.handleMove, true)
  }
  beforeDestroy () {
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
  getConnectionPos (socketType:string, socketNumber:number) {
    return {
      'x': this.x + (<Array<HTMLElement>>this.$refs[`${socketType}${socketNumber}`])[0].offsetLeft + circleSize/2,
      'y': this.y + (<Array<HTMLElement>>this.$refs[`${socketType}${socketNumber}`])[0].offsetTop + circleSize/2
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

        this.moveWithDiff(diffX, diffY)

        this.hasDragged = true
      }
    }
    handleDown (e:MouseEvent) {
      if (this.readOnly) return
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop

      this.lastMouseX = this.mouseX
      this.lastMouseY = this.mouseY

      const target = <HTMLElement>e.target || <HTMLElement>e.srcElement
      if (this.$el.contains(target) && e.which === 1) {
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

      if (this.linking) {
        this.linking = false
      }
      e.preventDefault()
    }
    // Slots
    slotMouseDown (e:MouseEvent, index:number) {
      if (this.readOnly) return
      this.linking = true

      this.$emit('linkingStart', index)
      if (e.preventDefault) e.preventDefault()
    }
    slotMouseUp (e:MouseEvent, index:number) {
      if (this.readOnly) return
      this.$emit('linkingStop', index)
      if (e.preventDefault) e.preventDefault()
    }
    inspectSlot(type:string,index:number) {
      this.$emit('inspectsocket',{type:type,id:this.id,index:index})
    }
    slotBreak (e:MouseEvent, index:number) {
      if (this.readOnly) return
      this.linking = true
      this.$delete(this.inputLinks,index)
      this.$emit('linkingBreak', index)
      if (e.preventDefault) e.preventDefault()
    }
    save () {
      this.$emit('update')
    }
    deleteBlock () {
      this.$emit('delete')
    }
    moveWithDiff (diffX:number, diffY:number) {
      let left = this.x + diffX / this.options.scale
      let top = this.y + diffY / this.options.scale

      this.$emit('update:x', left)
      this.$emit('update:y', top)
    }
    get style() {
      return {
        top: this.options.center.y + this.y * this.options.scale + 'px',
        left: this.options.center.x + this.x * this.options.scale + 'px',
        width: this.options.width + 'px',
        transform: 'scale(' + (this.options.scale + '') + ')',
        transformOrigin: 'top left'
      }
    }
    get running() {
      return this.status==BlockStatus.Running
    }
    get completed() {
      return this.status==BlockStatus.Completed
    }
    get pending_run() {
      return this.jobStatus==JobStatus.Running && this.status!=BlockStatus.Completed
    }
  }
