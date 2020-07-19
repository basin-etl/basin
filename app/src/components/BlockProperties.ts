import Component from 'vue-class-component'

import Vue from 'vue'
import { Prop } from 'vue-property-decorator';
import SchemaChips from '@/components/SchemaChips.vue'

@Component({
  name: 'BlockProperties',
  components: {SchemaChips}
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
  // general utilities
  allowDrop(event:DragEvent) {
    event.preventDefault();
  }
  fieldDropped(event:DragEvent,property:string) {
    let field = JSON.parse(event.dataTransfer.getData("text"))
    let newVal = this.local.filter ? this.local.filter : ""
    newVal += this.local.filter && this.local.filter.length>0 && !this.local.filter.endsWith(",") ? ", " : ""
    newVal += `F.col("${field.name}")`
    this.$set(this.local,property,newVal)

  }

}
