<template lang="pug">
v-row.mt-5(justify="center",align-items="start")
  v-col.table
    v-row.flex-column.pt-5(align="center",v-if="items.length==0")
        div.headline You haven't defined any source yet
        router-link.headline(to="create",append) Set up your first source!
    v-row(no-gutters,v-if="items.length>0")
      //- header toolbar
      v-toolbar.px-0(flat,color="white")
        v-toolbar-title Sources Catalog
        v-spacer
        //- search field
        v-text-field.search-field(
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        )
        v-btn.ml-3(color="success",small,to="create",append) New
    v-data-table(
      v-if="items.length>0"
      :headers="headers"
      :items="items"
      :search="search"
      hide-default-footer
    )
      template(v-slot:item="props"
      )
        router-link(
          :to="{ name: 'catalog_edit', params: { id: props.item.name } }"
          tag="tr",
          :style="{ cursor: 'pointer'}"
        )
          td
            h3 {{props.item.name}}
          td.text-xs-right {{props.item.type}}
          td
            v-menu()
              template(v-slot:activator="{ on }")
                v-btn(icon,v-on="on")
                  v-icon() more_vert
              v-list(dense)
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
  search = ''

  async deleteItem(id:string) {
    console.log("deleting")
    let response = await this.$root.$confirm.open("Delete source definition","Are you sure?")
    if (response) {
      await this.$idb.table("catalog").delete(id)
      this.items.splice(this.items.findIndex( item => item.name==id), 1);
    }
  }
  async created() {
    this.$root.$data.$loading = true
    this.items = await this.$idb.table("catalog").toArray()
    this.$root.$data.$loading = false
  }
}
</script>

<style scoped>
.table {
  max-width: 1150px;
}
.search-field {
  max-width: 300px
}
.table >>> .v-toolbar__content {
      padding: 0px !important;
}
</style>