<template lang="pug">
div
    | hello world
    | {{ blockId}}
</template>

<script>
import blockPropertiesMixin from '@/blocks/blockPropertiesMixin.js'

export default {
  mixins: [blockPropertiesMixin],
  props: {
    blockId: {
      type: Number,
    }
  },
  methods: {
    test() {
      return 1
    }

  }
}
</script>

<style>

</style>