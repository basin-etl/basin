<template lang="pug">
.flex-column
      v-list-group(value="true",dark)
        template(v-slot:activator)
          v-list-item-title(color="white") Dataframe
        div(
          :style="{'background-color':'lightgrey'}",
          draggable="true",
          v-on:dragstart="newBlockDragStart(blockType, $event)" 
          v-for="blockType in blockTypes"
          :key="blockType.type"
        )
          v-list-item(link,:title="blockType.description")
            v-list-item-icon
              v-icon {{blockType.icon}}
            v-list-item-content.block-title {{blockType.title}}
          v-divider
      v-list-group()
        template(v-slot:activator)
          v-list-item-title Column
        v-list-item(link) add column
        v-list-item(link) drop column
        v-list-item(link) test
      
      div.py-1.px-2.block-type-ghost(
        ref="newGhost",
        v-if="dragAdding",
        :style="{'background-color':newBlockType.color}"
      )
        v-icon {{newBlockType.icon}}
        span.ml-2 New {{newBlockType.type}}
  
</template>

<script>
import blockTypes from '@/core/blockTypes.ts'
export default {
    name: 'EditorBlocksBar',
    data: function () {
      return {
        dragAdding: false,
        blockTypes: blockTypes,
        newBlockType: null,
      }
    },
    methods: {
      async newBlockDragStart(blockType, event) {
        this.newBlockType = blockType
        this.dragAdding = true
        await this.$nextTick()
        let ghostElement = this.$refs["newGhost"]
        ghostElement.style.top = event.srcElement.offsetTop + "px"
        event.dataTransfer.setDragImage(ghostElement, 5, 5)
        event.dataTransfer.setData("text/plain",blockType.type);
      },

    }

}
</script>
<style scoped>
.block-title {
    text-transform: capitalize;
}
</style>
<style>
  .block-type-ghost {
    position: absolute;
    z-index: -1;
    border-radius: 5px
  }

</style>