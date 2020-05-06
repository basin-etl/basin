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
    :class='{selected: selected, "elevation-2":!selected&&!readOnly,"read-only":readOnly,"block-error":error }',
  )
    div.d-flex.flex-column.py-0(:style="{'min-height':'65px'}")
      //-
      //- header
      //-
      v-row.flex-grow-0.titlebar.px-2(no-gutters,align="center",
       :style="{'background-color':blockType.color,'min-height':'28px'}"
      )
        .typeicon
          v-icon(color="white",small,dense) {{blockType.icon}}
        .pl-2 {{blockType.title}}
        v-spacer
        div(v-show="!readOnly")
          //- settings button
          v-btn(icon,small,
            @mousedown.stop='$event.preventDefault()'
            @click.stop="showProperties()"
          )
            v-icon(small) settings
          //- delete button
          v-btn(icon, small, 
            @click='deleteBlock'
            @mousedown.stop='$event.preventDefault()'
          )
            v-icon(small) delete
          //- more options menu
          v-btn(icon, small)
            v-icon(small) more_vert
        v-icon(small,color="white",:title="this.error",v-if="this.error") warning
      v-row(no-gutters)
        //-
        //- input circles
        //-
        v-col.pa-0.flex-grow-0.d-flex.flex-column
          .d-flex.flex-column.inputs
            .slot-container(v-for='(slot, index) in inputs')
              //-
              //- slot
              //-
              .d-flex.flex-column.flex-grow-1.ma-0(align='center',justify="start")
                .circle.ma-0.inputSlot(
                  :ref="`input_${slot.id}`",
                  :class='{active: inputLinks[slot.id],"read-only":readOnly}',
                  :style="{visibility: stopped && !readOnly ? 'visible': 'hidden'}"
                  @mouseup='slotMouseUp($event, slot.id)',
                  @mousedown.stop="readOnly? inspectSlot('input',slot.id) : slotBreak($event, slot.id)"
                )
              //- tooltip (result counts). irrelevant since we can see if from the outputs of previous block
              //- div.slot-tooltip.input(v-show="completed") {{inputLinks[index]? inputLinks[index].resultCount : '' | numFormat}}
        //-
        //- block comment
        //-
        v-col.flex-grow-1.block-contents.py-1.px-2
          | {{comment}}
        //-
        //- output circles
        //-
        v-col.pa-0.flex-grow-0
          .outputs
            .slot-container(v-for='(slot, index) in outputs')
              .d-flex.flex-column.flex-grow-1.ma-0(align='center',justify="start")
                .circle.ma-0(
                  :ref="`output_${slot.id}`",
                  :class='{active: outputLinks[slot.id],"read-only":readOnly}',
                  :style="{visibility: pendingRun ? 'hidden': 'visible'}"
                  @mousedown.stop="readOnly? inspectSlot('output',slot.id) : slotMouseDown($event, slot.id)"
                )
              //- tooltip (result counts)
              div.slot-tooltip.output(v-show="completed") {{outputLinks[slot.id]? outputLinks[slot.id].resultCount : '' | numFormat('0a')}}
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
  .slot-container {
    margin-top: 3px;
    margin-bottom: 3px
  }
  .slot-tooltip {
    position:absolute;
    color:white;
    background-color: black;
    opacity: 0.5;
    font-size: 9px;
    border-radius: 3px;
    min-width:35px;
    margin-top: -12px;
    padding: 0 2px 0 2px;
    text-align:right;
    &.input {
      margin-left: -40px;
    }
    &.output {
      margin-left: 15px;
    }

  }
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
    &.completed {
      cursor: default
    }

    .block-error {
      box-shadow: 0 0 0 @blockBorder red;
      background-color: #ff5252
    }
    .selected {
      box-shadow: 0 0 0 @blockBorder orange;
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
