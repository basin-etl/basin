import { Prop, Component, Watch } from 'vue-property-decorator';
import Vue from 'vue';
import blockTypes from '@/core/blockTypes'
import { Bool } from 'apache-arrow';

@Component({
  name: 'BlockPicker',
  components: {
  },
})

export default class BlockPicker extends Vue {
  @Prop() inputType: String
  @Prop() open: Boolean
  blockTypes = blockTypes
  searchText = ''

  selectBlock(blockType:string) {
    // resetthe form
    this.searchText = ''
    this.$emit("selected",{type:blockType})
  }
  close() {
    this.$emit("close")
  }
  //
  // computed
  //
  get matches() {
    let vm = this
    return Object.values(this.blockTypes).filter( (block) => {
      return  (block.inputs.filter( (input) => input.type==vm.inputType || !vm.inputType).length>0) &&
              (block.description.match(vm.searchText) || vm.searchText=='')
    })
  }

}
