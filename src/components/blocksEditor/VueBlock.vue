<script src="./VueBlock.ts">
</script>
<template lang="pug">
.vue-block(
  :class='{selected: selected,running: running,completed:completed && readOnly}',
  :style='style',
  @mousedown.stop="handleDown",
  @mouseup.stop="handleUp"
)
  v-sheet(
    :class='{selected: selected, "elevation-2":!selected&&!readOnly,"read-only":readOnly }',
  )
    div.d-flex.flex-column.py-0(:style="{'min-height':'65px'}")
      //-
      //- header
      //-
      v-row.flex-grow-0.titlebar.pl-2(no-gutters,align="center",
       :style="{'background-color':blockType.color}"
      )
        .typeicon
          v-icon(color="white",small,dense) {{blockType.icon}}
        .pl-2 {{blockType.title}}
        v-spacer
        v-btn(icon,small,
          @mousedown.stop='$event.preventDefault()'
          @click.stop="showProperties()"
        )
          v-icon(small) settings
        v-btn(icon, small, @click='deleteBlock')
          v-icon(small) delete
        v-btn(icon, small)
          v-icon(small) more_vert
      v-row(no-gutters)
        //-
        //- input and output circles
        //-
        v-col.pa-0.flex-grow-0.d-flex.flex-column
          .d-flex.flex-column.inputs
            .d-flex.flex-column.flex-grow-1.ma-0(align='center',justify="start",v-for='(slot, index) in inputs', :key='index')
              .circle.mt-1.inputSlot(
                :ref="`input${index}`",
                :class='{active: inputLinks[index],"read-only":readOnly}',
                :style="{visibility: pending_run ? 'hidden': 'visible'}"
                @mouseup='slotMouseUp($event, index)',
                @mousedown="readOnly? inspectSlot('input',index) : slotBreak($event, index)"
              )
        //-
        //- block comment
        //-
        v-col.flex-grow-1.block-contents.py-1.px-2
          | {{comment}}
        v-col.pa-0.flex-grow-0
          .outputs
            v-row.ma-0(align='center',justify="end",v-for='(slot, index) in outputs', :key='index')
              //- .pr-1 {{slot.label}}
              .circle.mt-1(
                :ref="`output${index}`",
                :class='{active: outputLinks[index],"read-only":readOnly}',
                :style="{visibility: pending_run ? 'hidden': 'visible'}"
                @mousedown="readOnly? inspectSlot('output',index) : slotMouseDown($event, index)"
              )

</template>


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
  .block-contents{
    font-size: 12px;
    z-index: 5;
    color: #666
  }
  .titlebar {
    border-radius: 4px 4px 0 0 
  }
  .vue-block {
    user-select:none;
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

      z-index:20;

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
        &.read-only {
          cursor: pointer
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
.read-only {
  border: 1px solid lightgray
}
.completed {
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    background: rgba(#ffffff,0.5);
    background-size: 200px 100%;
    content: '';
  }
}
.running {
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
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
