<template lang="pug">
v-row.mt-5(justify="center",align-items="start")
  v-col.table
    v-row(no-gutters)
      h3 Sources Catalog
      v-spacer
      v-btn(color="success",small,to="create",append) New
    v-data-table(
      :headers="headers"
      :items="items"
      hide-default-footer
    )
      template(v-slot:item="props"
      )
        tr
          td
            h3 {{props.item.name}}
          td.text-xs-right {{props.item.type}}
          td
            v-menu()
              template(v-slot:activator="{ on }")
                v-btn(icon,v-on="on")
                  v-icon() more_vert
              v-list(dense)
                v-list-item(@click="")
                  v-list-item-title() Edit
                v-list-item(@click="deleteItem(props.item.name)")
                  v-list-item-title() Delete

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'

@Component({
})

export default class CatalogIndex extends Vue {
  headers = [
    { text: 'Source', value: 'name' },
    { text: 'Type', value: 'type' },
    { 
      text: '',
      value: 'name',
      width: 50
    },
  ]
  items:Array<any> = []
  async deleteItem(id:string) {
    console.log("deleting")
    await this.$idb.table("catalog").delete(id)
    this.items.splice(this.items.findIndex( item => item.name==id), 1);
  }
  async created() {
    this.items = await this.$idb.table("catalog").toArray()
  }
}
</script>

<style scoped>
.table {
  max-width: 1150px
}
</style>