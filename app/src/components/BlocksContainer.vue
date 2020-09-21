<template lang="pug">
.vue-container(
  v-on:drop="blockDropped($event)"
  v-on:dragover="dragOver($event)"
  @click.stop.prevent="clickHandler"
  @contextmenu.prevent="showMenu($event)"
  @wheel.stop="handleWheel($event)"
  id="blockscontainer"
)
  VueLink(v-if="s_blocks.length>0",:lines="lines",:readOnly="readOnly")
  VueBlock(v-for="block in s_blocks"
              :key="block.id"
              :ref="`block${block.id}`"
              :readOnly="readOnly"
              v-bind.sync="block"
              :scale="scale",
              :containerTop="top",
              :containerLeft="left",
              :jobStatus="jobStatus"
              :linking="linking"
              @update="updateScene"
              @linkingStart="linkingStart(block, $event)"
              @linkingStop="linkingStop(block, $event)"
              @linkingBreak="linkingBreak(block, $event)"
              @select="blockSelect(block)"
              @delete="blockDelete(block)"
              @click.stop="deselectAll"
              @blockproperties="showProperties($event)"
              @inspectsocket="inspectSocket($event)"
  )
  v-menu(
    absolute,
    :position-x="menuX",
    :position-y="menuY",
    v-model="menuDisplayed",
    :blockInputType="menuBlockInputType"
    :close-on-click="false",
    :close-on-content-click="false"
  )
    BlockPicker(
      @selected="addNewBlockFromMenu($event.type)"
      @close="cancelNewBlock"
      :open="menuDisplayed"
    )
  img.onboarding-arrow(v-if="s_blocks.length==0",src="@/assets/images/arrow.png")
  div.headline(v-if="s_blocks.length==0") Start by dragging you first block here. An Extract block is a good first choice
</template>

<script lang="ts" src="./BlocksContainer.ts">
</script>

<style lang="less" scoped>
  .vue-container {
    position: relative;
    overflow: auto;
    display:flex;
    align-items:flex-start;
    justify-content:flex-start;
  }
  .onboarding-arrow {
    height: 300px;
    width: 300px;
    position:absolute;
    top: 20px;
    left: 20px;
  }
</style>
