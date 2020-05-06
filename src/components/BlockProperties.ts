import Component from 'vue-class-component'

import Vue from 'vue'
import { Prop } from 'vue-property-decorator';
@Component({
  name: 'BlockProperties',
  components: {
  }
})
export default class BlockProperties extends Vue {
  @Prop(Object) inputSchema: {[slot:string]:Array<any>}

  local:any = {}
  created() {
    console.log("created")
    this.local = {...this.$props}  
  }
  getProperties() {
    return this.local
  }
}
