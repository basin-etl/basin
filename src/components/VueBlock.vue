<template lang="pug">
.vue-block(:class='{selected: selected,running: running}',:style='style')
  v-sheet(
    :class='{selected: selected, "elevation-2":!selected }',
  )
    v-col.pt-0
      v-row.titlebar.pl-2(align="center",
        :style="{'background-color':color}"
      )
        .typeicon
          v-icon(color="white",small,dense) {{icon}}
        .pl-2 {{title}}
        v-spacer
        v-btn(icon, small, @click='deleteBlock')
          v-icon(small) delete
        v-btn(icon, small)
          v-icon(small) more_vert
      v-row
        v-col.pa-0
          .inputs
            v-row.ma-0(align='center',justify="start",v-for='(slot, index) in inputs', :key='index')
              .circle.inputSlot(
                :ref="`input${index}`",
                :class='{active: inputLinks[index]}',
                @mouseup='slotMouseUp($event, index)', @mousedown='slotBreak($event, index)')
              .pl-1 {{slot.label}}
        v-col.pa-0
          .outputs
            v-row.ma-0(align='center',justify="end",v-for='(slot, index) in outputs', :key='index')
              .pr-1 {{slot.label}}
              .circle(:ref="`output${index}`",:class='{active: outputLinks[index]}', @mousedown='slotMouseDown($event, index)')

</template>

<script>
const circleSize = 10

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
    selected: Boolean,
    running: Boolean,
    title: {
      type: String,
      default: 'Title'
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
      default: 'white'
    },
    inputs: {
      type: Array,
    },
    outputs: {
      type: Array,
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
    document.documentElement.addEventListener('mousemove', this.handleMove, true)
    document.documentElement.addEventListener('mousedown', this.handleDown, true)
    document.documentElement.addEventListener('mouseup', this.handleUp, true)
  },
  beforeDestroy () {
    document.documentElement.removeEventListener('mousemove', this.handleMove, true)
    document.documentElement.removeEventListener('mousedown', this.handleDown, true)
    document.documentElement.removeEventListener('mouseup', this.handleUp, true)
  },
  data () {
    return {
      width: this.options.width,
      hasDragged: false,
    }
  },
  methods: {
    getConnectionPos (socketType, socketNumber) {
      return {
        'x': this.x + this.$refs[`${socketType}${socketNumber}`][0].offsetLeft + circleSize/2,
        'y': this.y + this.$refs[`${socketType}${socketNumber}`][0].offsetTop + circleSize/2
      }
    },
    handleMove (e) {
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
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop

      this.lastMouseX = this.mouseX
      this.lastMouseY = this.mouseY

      const target = e.target || e.srcElement
      if (this.$el.contains(target) && e.which === 1) {
        this.dragging = true

        this.$emit('select')

        if (e.preventDefault) e.preventDefault()
      }
    },
    handleUp () {
      if (this.dragging) {
        this.dragging = false

        if (this.hasDragged) {
          this.save()
          this.hasDragged = false
        }
      }

      if (this.linking) {
        this.linking = false
      }
    },
    // Slots
    slotMouseDown (e, index) {
      this.linking = true

      this.$emit('linkingStart', index)
      if (e.preventDefault) e.preventDefault()
    },
    slotMouseUp (e, index) {
      this.$emit('linkingStop', index)
      if (e.preventDefault) e.preventDefault()
    },
    slotBreak (e, index) {
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
  }
}
</script>

<style lang="less" scoped>

  @circleBorder: 1px;
  @blockBorder: 1px;
  @circleSize: 10px;
  @circleMargin: 2px; // left/right

  @circleEmptyColor: #FFFFFF;
  @circleNewColor: #00FF00;
  @circleRemoveColor: #FF0000;
  @circleConnectedColor: #FFFF00;
  .typeicon {
    height: 16px;
    width: 16px;
    display:flex
  }
  .titlebar {
    border-radius: 4px 4px 0 0 
  }
  .vue-block {
    position: absolute;
    box-sizing: border-box;
    z-index: 1;
    cursor: move;
    &.selected {
      z-index: 2;
    }

    .selected {
      box-shadow: 0 0 0 @blockBorder red;
    }

    .circle {
      box-sizing: border-box;

      width: @circleSize;
      height: @circleSize;

      border: @circleBorder solid rgba(0, 0, 0, 0.5);
      border-radius: 100%;
      background: @circleEmptyColor;

      cursor: crosshair;
      &.active {
        background: @circleConnectedColor;
      }
      &:hover {
        background: @circleNewColor;

        &.active {
          background: @circleRemoveColor;
        }
      }
    }

    .inputs {
      margin-left: -(@circleSize/2 + @blockBorder);
    }

    .outputs {
      margin-right: -(@circleSize/2 + @blockBorder);
    }


  }
.running {
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(to right, 
      rgba(#ffffff,0), 
      rgba(#ffffff,0) 10%,
      rgba(#ffffff,.75) 50%,
      rgba(#ffffff,0) 90%,
      rgba(#ffffff,0),
    );
    background-size: 200px 100%;
    animation: shimmer 2s linear infinite;
    content: '';
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: 200px 0;
    }
  }
}
</style>
