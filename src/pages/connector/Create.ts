import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import jupyterUtils from '@/core/jupyterUtils'
import blockTypes from '@/core/blockTypes'
import jobRenderer from '@/core/jobRenderer'
import snakeize from 'snakeize'
import DataFrameViewer from '@/components/dataFrameViewer/DataFrameViewer.vue'
import { Int } from 'apache-arrow';
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

  connectorTypes = [
    {value:"redshift",label:"Amazon Redshift"},
    {value:"s3",label:"Amazon S3"},
    {value:"fs",label:"Local file system"},
    {value:"azure_blob_storage",label:"Azure Blob storage"},
    {value:"azure_datalake_gen1",label:"Azure Data Lake Storage Gen1"},
    {value:"azure_datalake_gen2",label:"Azure Data Lake Storage Gen2"},
    {value:"azure_cosmos",label:"Azure Cosmos DB"},
    {value:"azure_synapse_analytics",label:"Azure Synapse Analytics"},
    {value:"jdbc",label:"SQL Databases using JDBC"},
    {value:"cassandra",label:"Cassandra"},
    {value:"couchbase",label:"Couchbase"},
    {value:"elasticsearch",label:"ElasticSearch"},
    {value:"hive_tables",label:"Hive tables"},
    {value:"mlflow_experiment",label:"MLflow experiment"},
    {value:"mongodb",label:"MongoDB"},
    {value:"neo4j",label:"Neo4j"},
    {value:"oracle",label:"Oracle"},
    {value:"redis",label:"Redis"},
    {value:"riak",label:"Riak Time Series"},
    {value:"snowflake",label:"Snowflake"},
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
      output: 'df'
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
    let settings = ServerConnection.makeSettings({ 'baseUrl': '/ijupyter',
    'wsUrl': 'ws://127.0.0.1:9007/',
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
