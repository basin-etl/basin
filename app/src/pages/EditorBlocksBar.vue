<template lang="pug">
.flex-column
  v-list-group(value="true",dark,
    v-for="stencil in stencils",
    :key="stencil"
  )
    template(v-slot:activator)
      v-list-item-title.stencil-header(color="white") {{stencilDictionary[stencil] ? stencilDictionary[stencil].title : stencil!='undefined' ? stencil : 'Other'}}
    div(
      :style="{'background-color':'lightgrey'}",
      draggable="true",
      v-on:dragstart="newBlockDragStart(blockType, $event)" 
      v-for="blockType in stencilBlocks[stencil]"
      :key="blockType.type"
    )
      v-list-item(link,:title="blockType.description")
        v-list-item-icon
          v-icon {{blockType.icon}}
        v-list-item-content.block-title {{blockType.title}}
      v-divider
  
  div.py-1.px-2.block-type-ghost(
    ref="newGhost",
    v-if="dragAdding",
    :style="{'background-color':newBlockType.color}"
  )
    v-icon {{newBlockType.icon}}
    span.ml-2 New {{newBlockType.type}}
  
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import blockTypes from '@/core/blockTypes.ts'
import BlockType from '@/models/BlockType'
import stencilDictionary from '@/blocks/stencils'
@Component({
})

export default class EditorBlocksBar extends Vue {
  @Prop(String) column: string

  dragAdding = false
  blockTypes = blockTypes
  stencilDictionary = stencilDictionary
  stencilBlocks:BlockType[][]
  stencils:string[]
  newBlockType:BlockType = null

  created() {
    // separate the block types into stencils
    this.stencilBlocks = this.groupBy(
      Object.values(this.blockTypes),
      "stencil"
    )
    this.stencils = Object.keys(this.stencilBlocks)

  }
  async newBlockDragStart(blockType:BlockType, event:DragEvent) {
    this.newBlockType = blockType
    this.dragAdding = true
    await this.$nextTick()
    let ghostElement = <HTMLElement>this.$refs["newGhost"]
    ghostElement.style.top = (<HTMLElement>event.srcElement).offsetTop + "px"
    event.dataTransfer.setDragImage(ghostElement, 5, 5)
    event.dataTransfer.setData("text/plain",blockType.name);
  }
  groupBy(items:any[], key:string) {
    return items.reduce( (result:any, item:any) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
      }),
      {}, //init blank
    );
  }
}
</script>

<style scoped>
.block-title {
    text-transform: capitalize;
}
.stencil-header {
    text-transform: capitalize;
}
</style>
<style>
/* this can't be scoped since it is used during dragging */
.block-type-ghost {
  position: absolute;
  z-index: -1;
  border-radius: 5px
}

</style>