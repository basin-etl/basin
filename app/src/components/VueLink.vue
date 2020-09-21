<template>
  <svg class="lines-container" id="lines" width="100%" height="100%">
    <g v-for="(p,index) in renderedPaths" :key="index">
      <path v-if="outline" :d="p.data" :style="p.outlineStyle"></path>
      <path :d="p.data" :style="p.style"></path>
    </g>
    <g>
      <path v-for="(a,index) in renderedArrows" :key="index"
        d="M -1 -1 L 0 1 L 1 -1 z"
        :style="a.style"
        :transform="a.transform"></path>
    </g>
  </svg>
</template>

<script>
  export default {
    props: {
      lines: {
        type: Array,
        default () {
          return []
        }
      },
      outline: {
        type: Boolean,
        default: false
      },
      readOnly: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      distance (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
      },
      computeConnectionPoint (x1, y1, x2, y2, t) {
        let dist = this.distance(x1, y1, x2, y2)
        let p0 = {x: x1, y: y1}
        let p1 = {x: x1 + dist * 0.25, y: y1}
        let p2 = {x: x2 - dist * 0.25, y: y2}
        let p3 = {x: x2, y: y2}

        let c1 = (1 - t) * (1 - t) * (1 - t)
        let c2 = 3 * ((1 - t) * (1 - t)) * t
        let c3 = 3 * (1 - t) * (t * t)
        let c4 = t * t * t

        let x = c1 * p0.x + c2 * p1.x + c3 * p2.x + c4 * p3.x
        let y = c1 * p0.y + c2 * p1.y + c3 * p2.y + c4 * p3.y
        return {x: x, y: y}
      }
    },
    computed: {
      renderedPaths () {
        if (!this.lines) {
          return []
        }

        let paths = []
        this.lines.forEach(l => {
          let dist = this.distance(l.x1, l.y1, l.x2, l.y2) * 0.25
          paths.push({
            data: `M ${l.x1}, ${l.y1} C ${(l.x1 + dist)}, ${l.y1}, ${(l.x2 - dist)}, ${l.y2}, ${l.x2}, ${l.y2}`,
            style: {
              stroke: this.readOnly? 'lightgray' : l.style.stroke,
              strokeWidth: l.style.strokeWidth,
              fill:'none'
            },
            outlineStyle: l.outlineStyle
          })
        })

        return paths
      },
      renderedArrows () {
        if (!this.lines) {
          return []
        }

        let arrows = []
        this.lines.forEach(l => {
          // l.x1, l.y1, l.x2, l.y2
          let pos = this.computeConnectionPoint(l.x1, l.y1, l.x2, l.y2, 0.5)
          let pos2 = this.computeConnectionPoint(l.x1, l.y1, l.x2, l.y2, 0.51)

          let angle = -Math.atan2(pos2.x - pos.x, pos2.y - pos.y)
          let degrees = (angle >= 0 ? angle : (2 * Math.PI + angle)) * 180 / Math.PI

          arrows.push({
            transform: `translate(${pos.x}, ${pos.y}) rotate(${degrees})`,
            style: {
              stroke: this.readOnly? 'lightgray' : l.style.stroke,
              strokeWidth: l.style.strokeWidth * 2,
              fill: l.style.stroke
            }
          })
        })

        return arrows
      }
    }
  }
</script>

<style scoped>
.lines-container {
  display: block;
  position: absolute;
  overflow: visible;
}
</style>
