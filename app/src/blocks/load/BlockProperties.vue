<template lang="pug">
div
    | hello world
    | {{ blockId}}
</template>

<script>
export default {
    props: {
      blockId: {
        type: Number,
      }
    }
}
</script>

<style>

</style>