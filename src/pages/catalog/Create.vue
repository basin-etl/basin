<template lang="pug">
v-row.mt-5(justify="center",align="start")
  v-row.flex-column.table(align="start",no-gutters)
    v-breadcrumbs.pl-0(:items="breadcrumbs",divider=">")
    v-form(
      v-model="valid"
    )
  
      v-text-field.form-field.flex-grow-0(@keydown.space.prevent,v-model="name",label="source name",:rules="[rules.required]")
      v-select.flex-grow-0(v-model="properties.type",
              :items="fileTypes"
              item-text="label"
              item-value="value"
              label="Type of file")
        
      template(v-if="properties.type=='delimited'")
        v-text-field.form-field.flex-grow-0(v-model="properties.Delimiter",label="Delimiter")
        v-text-field.form-field.flex-grow-0(v-model="properties.SkipHeader",label="# of header rows to skip")
        v-text-field.form-field.flex-grow-0(v-model="properties.SkipFooter",label="# of footer rows to ignore")
        v-switch(v-model="properties.HasHeader",label="File has a header")
    div
      v-btn(:disabled="!valid",@click="test") Test
      v-btn.ml-3(color="success",:disabled="!valid",@click="save") Save
  v-snackbar(color="success",right,
    v-model="success")
    | Saved successfully
  v-snackbar(color="error",right,
    v-model="showError")
    | {{ error }}

</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import jupyterUtils from '@/core/jupyterUtils'
import blockTypes from '@/core/blockTypes'
import jobRenderer from '@/core/jobRenderer'

@Component({
})

export default class CatalogCreate extends Vue {
  properties = {
  }
  name = ""
  error:String = null
  success = false
  showError = false
  breadcrumbs:Array<any> = []

  fileTypes = [
    {value:"delimited",label:"Delimited (comma or other)"},
    {value:"fixedwidth",label:"Fixed width columns"},
    {value:"VSAM",label:"VSAM (cobol generated) with Copybook template"},
    {value:"custom",label:"Custom"},
  ]
  id:string = ""
  rules = {
    required: (value:string) => {
      return !!value || 'Required'
    },
  }

  valid:boolean = false

  async validate() {
    let existing = await this.$idb.table("catalog").get(this.name)
    if (existing) {
      this.error = 'Name already exists in catalog'
      this.showError = true
      return false
    }
    else {
      this.showError = false
      return true
    }
  }
  async test() {
    // try to parse the file
    let catalog:{[name:string]:any} = {}
    catalog[this.name] = this.properties
    await jupyterUtils.setPythonVariable(
      this.$store.state.job.kernel,
      "catalog",
      catalog
    )
    let kernel = this.$store.state.job.kernel
    // init kernel
    let initCode = jobRenderer.renderInitCode()
    await jupyterUtils.sendToPython(this.$store.state.job.kernel,initCode)

    // create an extract code block
    let code = blockTypes["extract"].codeTemplate.render({
      comment: "",
      props: {source:this.name},
      inputs: null,
      output: 'df'
    })
    let setMock = 
`
import unittest.mock
patcher = unittest.mock.patch('lib.common.utils.get_catalog', return_value=catalog,create=True)
patcher.start()
`
    await jupyterUtils.sendToPython(kernel,setMock)
    console.log(code)
    // try {
    //   await jupyterUtils.sendToPython(this.kernel,code)
    //   this.showDataframePanel = true
    //   this.inspectDataframeVariable = 'df'
    // }
  }

  async created() {
    this.breadcrumbs = [
      {
        text: 'Catalog',
        disabled: false,
        to: '/catalog',
        exact: true,
      },
      {
        text: this.$route.path.endsWith("edit")?'Edit Source':'New Source',
        disabled: true,
        href: '',
      },
    ]

    this.id = this.$route.params["id"]
    if (this.$route.path.endsWith("edit")) {
      // we are editing. fetch the record
      this.name = this.$route.params["id"]
      this.properties = await this.$idb.table("catalog").get(this.name)
    }
  }
  async save() {
    // check if we are changing the name
    if (this.id && this.id!=this.name) {
      if (!(await this.validate())) {
        return
      }
      else {
        // delete the old entry before putting this new entry
        this.$idb.table("catalog").delete(this.$route.params["id"])
      }
    }
    this.$idb.table("catalog").put(Object.assign({name:this.name},this.properties))
    this.id = this.name
    this.success = true
  }
}
</script>

<style scoped>
.table {
  max-width: 1150px
}
.form-field {
  max-width: 300px
}
</style>