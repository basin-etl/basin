import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import jupyterUtils from '@/core/jupyterUtils'
import blockTypes from '@/core/blockTypes'
import jobRenderer from '@/core/jobRenderer'
import snakeize from 'snakeize'
import DataFrameViewer from '@/components/dataFrameViewer/DataFrameViewer.vue'
import { ContentsManager, ServerConnection } from '@jupyterlab/services'

@Component({
    components: {
        DataFrameViewer,
    }
})

export default class CatalogCreate extends Vue {
  properties:{
    type:string,
    delimiter?:string,
    header?:boolean,
    skipHeaderLines?:number
    skipFooterLines?:number,
  } = {
    type:"delimited"
  }
  name = ""
  error:String = null
  success = false
  showError = false
  breadcrumbs:Array<any> = []
  showDataframePanel = false
  showDataframePanelExpanded = false
  files:Array<String> = []
  loadingPreview = false

  fileTypes = [
    {value:"delimited",label:"Delimited (comma or other)"},
    {value:"fixedwidth",label:"Fixed width columns"},
    {value:"json",label:"Json"},
    {value:"parquet",label:"Parquet"},
    {value:"avro",label:"Avro"},
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

  expandViewer() {
    console.log("expanding")
    this.showDataframePanelExpanded = true
  }
  contractViewer() {
    this.showDataframePanelExpanded = false
  }
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
  async preview() {
    // try to parse the file
    this.loadingPreview = true
    let kernel = this.$store.state.job.kernel
    let catalog:{[name:string]:any} = {}
    catalog[this.name] = this.properties
    await jupyterUtils.setPythonVariable(
      kernel,
      "catalog",
      snakeize(catalog)
    )
    // init kernel
    let initCode = jobRenderer.renderInitCode()
    await jupyterUtils.sendToPython(this.$store.state.job.kernel,initCode)

    // create an extract code block
    let code = blockTypes["extract"].codeTemplate.render({
      comment: "",
      props: {source:this.name},
      inputs: null,
      outputs: {'df':'df'}
    })
    let setMock = 
`
import unittest.mock
patcher = unittest.mock.patch('common.utils.get_catalog', return_value=catalog,create=True)
patcher.start()
`
    await jupyterUtils.sendToPython(kernel,setMock)
    console.log(code)
    // try {
    await jupyterUtils.sendToPython(kernel,code)
    // }
    this.showDataframePanel = true
    this.loadingPreview = false
  }

  async created() {
    this.$root.$data.$loading = true
    // TODO: take from config
    let settings = ServerConnection.makeSettings({ 'baseUrl': '/ijupyter',
    'wsUrl': `ws://${process.env.VUE_APP_JUPYTER_SERVER_HOST}:${process.env.VUE_APP_JUPYTER_SERVER_PORT}/`,
    'token': 'superglue' });
    let contentsManager = new ContentsManager({serverSettings: settings})
    console.log(contentsManager)
    let fileListResponse = await contentsManager.get("/")
    this.files = fileListResponse.content.map( (item:any) => {
      return {
        text: item.name,
        size: item.size,
        value:item.name
      }
    })

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
    this.$root.$data.$loading = false

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

  get kernel() {
    return this.$store.state.job.kernel
  }
  @Watch('properties.type', { immediate: true})
  onPropertiesTypeChanged(newVal:string,oldVal:string) {
    if (newVal=='delimited') {
      // set default values
      this.properties.delimiter = ","
      this.properties.header = true
      this.properties.skipHeaderLines = 0
      this.properties.skipFooterLines = 0
    }
  }
}
