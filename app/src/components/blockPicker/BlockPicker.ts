import { Prop, Component, Watch } from 'vue-property-decorator';
import Vue from 'vue';
import blockTypes from '@/core/blockTypes'

@Component({
  name: 'BlockPicker',
  components: {
  },
})

export default class BlockPicker extends Vue {
  blockTypes = blockTypes
  searchText = ''

  selectBlock(blockType:string) {
    this.$emit("selected",{type:blockType})
  }
  //
  // computed
  //
  get matches() {
    let vm = this
    if (vm.searchText!='') {
      return Object.values(this.blockTypes).filter( (block) => {
        return block.description.match(vm.searchText)
      })
    }
    else {
      return Object.values(this.blockTypes)
    }
  }
}
