<script src="./BlockPicker.ts">
</script>
<template lang="pug">
v-card.d-flex.flex-column.picker(
  @keydown.esc="close"
)
  div.pl-2.d-flex.flex-row
    //- search field
    v-text-field(
      v-model="searchText",
      placeholder="Search for blocks"
      autofocus
    )
    v-btn.mt-1.mr-1(icon,@click="close")
      v-icon close
  .flex-grow-1.d-flex.flex-column.block-results
    .not-found-wrapper(v-if="matches.length==0") No blocks found
    //- search results
    v-list(two-line,dense,v-if="matches.length>0")
      v-list-item(
        v-for="block in matches",
        @click="selectBlock(block.type)"
      )
        v-list-item-avatar
          v-icon.lighten-1.white--text(:style="{'background-color':block.color}") {{block.icon}}
        v-list-item-content
          v-list-item-title.block-title {{block.title}}
          v-list-item-subtitle.block-description {{block.description}}
</template>
<style scoped>
.picker {
  width: 400px;
  height: 300px;
}
.block-title {
    text-transform: capitalize;
}
.block-description {
    text-transform: capitalize;
}
.block-results {
  overflow-y: auto;
}
.not-found-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>