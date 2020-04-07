const circleSize = 10
import blockTypes from '@/blocks/blockTypes.ts'

export default {
  name: 'VueBlock',
  props: {
    x: {
      type: Number,
      default: 0,
      validator: function (val) {
        return typeof val === 'number'
      }
    },
    y: {
      type: Number,
      default: 0,
      validator: function (val) {
        return typeof val === 'number'
      }
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Title'
    },
    type: String,
    id: Number,
    properties: Object,
    icon: {
      type: String,
    },
    inputLinks: {
      type: Object,
      default: () => { return {} }
    },
    outputLinks: {
      type: Object,
      default: () => { return {} }
    },
    options: {
      type: Object
    },
    jobStatus: {
      type: String
    },
    status: {
      type: String
    }

  },
  created () {
    this.mouseX = 0
    this.mouseY = 0

    this.lastMouseX = 0
    this.lastMouseY = 0

    this.linking = false
    this.dragging = false
  },
  mounted () {
    // we handle mouse move at the document level to have smooth dragging when dragging outside of container
    this.$parent.$el.addEventListener('mousemove', this.handleMove, true)
    console.log(this.id)
  },
  beforeDestroy () {
    // we handle mouse move at the document level to have smooth dragging when dragging outside of container
    this.$parent.$el.removeEventListener('mousemove', this.handleMove, true)
  },
  data () {
    return {
      state: null,
      width: this.options.width,
      blockType: blockTypes[this.type],
      hasDragged: false,
      inputs: blockTypes[this.type].inputs,
      outputs: blockTypes[this.type].outputs,
      selected: false
    }
  },
  methods: {
    select() {
      this.selected = true
    },
    deselect() {
      this.selected = false
    },
    toggleSelected() {
      this.selected = !this.selected      
    },
    getConnectionPos (socketType, socketNumber) {
      return {
        'x': this.x + this.$refs[`${socketType}${socketNumber}`][0].offsetLeft + circleSize/2,
        'y': this.y + this.$refs[`${socketType}${socketNumber}`][0].offsetTop + circleSize/2
      }
    },
    showProperties(e) {
      this.$emit('blockproperties', 
        {
          id:this.id,
          type:this.type,
          properties:this.properties
        }
      )
    },
    handleMove (e) {
      if (this.readOnly) return
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop

      if (this.dragging && !this.linking) {
        let diffX = this.mouseX - this.lastMouseX
        let diffY = this.mouseY - this.lastMouseY

        this.lastMouseX = this.mouseX
        this.lastMouseY = this.mouseY

        this.moveWithDiff(diffX, diffY)

        this.hasDragged = true
      }
    },
    handleDown (e) {
      if (this.readOnly) return
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop

      this.lastMouseX = this.mouseX
      this.lastMouseY = this.mouseY

      const target = e.target || e.srcElement
      if (this.$el.contains(target) && e.which === 1) {
        this.dragging = true
        if (e.preventDefault) e.preventDefault()
      }
    },
    handleUp (e) {
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
    },
    // Slots
    slotMouseDown (e, index) {
      if (this.readOnly) return
      this.linking = true

      this.$emit('linkingStart', index)
      if (e.preventDefault) e.preventDefault()
    },
    slotMouseUp (e, index) {
      if (this.readOnly) return
      this.$emit('linkingStop', index)
      if (e.preventDefault) e.preventDefault()
    },
    inspectSlot(type,index) {
      this.$emit('inspectsocket',{type:type,id:this.id,index:index})
    },
    slotBreak (e, index) {
      if (this.readOnly) return
      this.linking = true
      this.$delete(this.inputLinks,index)
      this.$emit('linkingBreak', index)
      if (e.preventDefault) e.preventDefault()
    },
    save () {
      this.$emit('update')
    },
    deleteBlock () {
      this.$emit('delete')
    },
    moveWithDiff (diffX, diffY) {
      let left = this.x + diffX / this.options.scale
      let top = this.y + diffY / this.options.scale

      this.$emit('update:x', left)
      this.$emit('update:y', top)
    }
  },
  computed: {
    style () {
      return {
        top: this.options.center.y + this.y * this.options.scale + 'px',
        left: this.options.center.x + this.x * this.options.scale + 'px',
        width: this.width + 'px',
        transform: 'scale(' + (this.options.scale + '') + ')',
        transformOrigin: 'top left'
      }
    },
    running() {
      return this.state=='running'
    },
    completed() {
      return this.state=='completed'
    }
  }
}
