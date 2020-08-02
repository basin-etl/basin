<template lang="pug">
div
  v-menu(
    absolute,
    :position-x="menuX",
    :position-y="menuY",
    v-model="menuDisplayed",
    :close-on-click="false",
    :close-on-content-click="false"
  )
    BlockPicker()
</template>

<script>
import BlockPicker from '@/components/blockPicker/BlockPicker.vue'
import { Prop, Component, Watch } from 'vue-property-decorator';
import Vue from 'vue';

@Component({
  components: {
    BlockPicker
  }
})
export default class BlockPickerDriver extends Vue {
    menuDisplayed = true


}
</script>

