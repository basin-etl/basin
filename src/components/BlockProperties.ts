import Component from 'vue-class-component'

import Vue from 'vue'
@Component({
  name: 'BlockProperties',
  components: {
  }
})
export default class BlockProperties extends Vue {
  local = {...this.$props}
  getProperties() {
    return this.local
  }
  reset() {
    this.local = {...this.$props}  
  }
}
