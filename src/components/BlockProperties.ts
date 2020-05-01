import Component from 'vue-class-component'

import Vue from 'vue'
import { Prop } from 'vue-property-decorator';
@Component({
  name: 'BlockProperties',
  components: {
  }
})
export default class BlockProperties extends Vue {
  @Prop(Array) inputSchema: Array<any>

  local = {}
  created() {
    console.log("created")
    this.local = {...this.$props}  
  }
  getProperties() {
    return this.local
  }
}
