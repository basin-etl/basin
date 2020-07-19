<template lang="pug">
v-row.mt-5(justify="center",align-items="start")
  v-col.table
    v-row.flex-column.pt-5(align="center",v-if="items.length==0")
        div.headline You haven't created any flow yet
        a.create-link.headline(@click="newItem") Create your first flow!
    v-row(no-gutters,v-if="items.length>0")
      //- header toolbar
      v-toolbar.px-0(flat,color="white")
        v-toolbar-title Flows
        v-spacer
        //- search field
        v-text-field.search-field(
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        )
        v-btn.ml-3(color="success",small,@click="newItem",append) New
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
          :to="{ name: 'flow_edit', params: { id: props.item.name } }"
          tag="tr",
          :style="{ cursor: 'pointer'}"
        )
          td
            h3 {{props.item.name}}
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
import Job from '@/models/Job'

@Component({
})

export default class FlowIndex extends Vue {
  headers = [
    { text: 'Source', value: 'name' },
    { 
      text: '',
      value: 'name',
      width: 50
    },
  ]
  items:Array<any> = []
  search = ''

  async deleteItem(id:string) {
    let response = await this.$root.$confirm.open("Delete flow","Are you sure?")
    if (response) {
      await this.$idb.table("flows").delete(id)
      this.items.splice(this.items.findIndex( item => item.name==id), 1);
    }
  }
  async newItem() {
    // create a new job. find an available name
    let newJobPrefix = "new_flow"
    let jobNames = await this.$idb.table("flows").where("name").startsWith(newJobPrefix).primaryKeys()
    let i = 1
    while (true) {
      if (!jobNames.includes(`${newJobPrefix}_${i}`)) {
        break
      }
      i++
    }
    let newJobName = `${newJobPrefix}_${i}`
    let newJob = new Job()
    await this.$idb.table("flows").put(Object.assign(newJob,{name:newJobName}))
    this.$router.push({name:'flow_edit',append:true,params:{id:newJobName}})
  }
  async created() {
    this.$root.$data.$loading = true
    this.items = await this.$idb.table("flows").toArray()
    this.$root.$data.$loading = false
  }
}
</script>

<style scoped>
.table {
  max-width: 1150px
}
.search-field {
  max-width: 300px
}
.table >>> .v-toolbar__content {
      padding: 0px !important;
}
.create-link {
  text-decoration: underline;
}
</style>