<template lang="pug">
.vue-container(
  v-on:drop="blockDropped($event)"
  v-on:dragover="dragOver($event)"
  @wheel.stop="handleWheel($event)"
  id="blockscontainer"
)
  VueLink(v-if="s_blocks.length>0",:lines="lines",:readOnly="readOnly")
  VueBlock(v-for="block in s_blocks"
              :key="block.id"
              :ref="`block${block.id}`"
              :readOnly="readOnly"
              v-bind.sync="block"
              :options="optionsForChild"
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
    align-items:center;
    justify-content:center;
  }
  .onboarding-arrow {
    height: 300px;
    width: 300px;
    position:absolute;
    top: 20px;
    left: 20px;
  }
</style>
