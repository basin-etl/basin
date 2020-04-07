<template lang="pug">
.vue-container(
  v-on:drop="blockDropped($event)"
  v-on:dragover="dragOver($event)"
)
  VueLink(:lines="lines",:readOnly="readOnly")
  VueBlock(v-for="block in s_blocks"
              :key="block.id"
              :ref="`block${block.id}`"
              :readOnly="readOnly"
              v-bind.sync="block"
              :options="optionsForChild"
              :jobStatus="jobStatus"
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
</template>

<script lang="ts" src="./BlocksContainer.ts">
</script>

<style lang="less" scoped>
  .vue-container {
    position: relative;
    overflow: auto;
  }
</style>
