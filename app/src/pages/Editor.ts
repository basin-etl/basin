import jupyterUtils from '@/core/jupyterUtils.ts'
import blockTypes from '@/core/blockTypes'
// components
import BlocksContainer from '@/components/BlocksContainer.vue'
import BlocksContainerRef from '@/components/BlocksContainer'
import BlockProperties from '@/components/BlockProperties.vue'
import BlockPropertiesRef from '@/components/BlockProperties'
import EditorBlocksBar from './EditorBlocksBar.vue'
import EditableLabel from '@/components/EditableLabel.vue'
import DataFrameViewer from '@/components/dataFrameViewer/DataFrameViewer.vue'
import jobRenderer from '@/core/jobRenderer'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch, Ref } from 'vue-property-decorator'
import Block, { BlockStatus } from '@/models/Block';
import Job, { JobStatus } from '@/models/Job';
import Link from '@/models/Link';
import JobCommand from '@/models/JobCommand';
import jobUtils from '@/core/jobUtils';
@Component({
  name: 'Editor',
  components: {
    BlocksContainer,
    BlockProperties,
    EditorBlocksBar,
    DataFrameViewer,
    EditableLabel,
  },
})
export default class Editor extends Vue {
  //
  // data
  //
  dragAdding = false
  props = {}
  interrupt = false // special flag to allow to interrupt a running job mid way
  blockTypes = blockTypes
  showPropertiesPanel = false
  jobCommands:Array<JobCommand> = null // holds the runtime commands of the job while debugging
  selectedBlock:Block = null
  selectedBlockProperties = {} // we store this separately because of reactivity issues with vue and the v-bind to the properties panel
  selectedBlockInputSchema:{[slot:string]:Array<any>} = {}
  readOnly = false
  inspectDataframeVariable = ''
  showDataframePanel = false
  error:string = null
  showError = false
  jobStatus = JobStatus.Stopped
  isRunStateDirty = true // this indicates if there have been changes since we last ran the job. used to avoid re-running the job for things live preview
  completedBlocks = -1
  blocks:Array<Block> = []
  links:Array<Link> = []
  container:any = {}
  jobName:string = "New Job"
  runMode:string = "preview"
  runModes:{text:string, value:string}[] = [
    {text:"Preview mode",value:"preview"},
    {text:"Live mode",value:"live"},
    {text:"Test mode",value:"test"},
  ]

  @Ref('container') readonly blocksContainer!: BlocksContainerRef

  async getCatalog() {
    return await this.$idb.table("catalog").toArray()
  }

  async showProperties(block:Block) {
    // clear out the old data (properties panel is a singleton and gets reused)
    this.selectedBlockInputSchema = {}
    this.selectedBlock=this.getBlockById(block.id)
    this.selectedBlockProperties=this.selectedBlock.properties
    this.showPropertiesPanel = true
    try {
      
      // get schema only if our input is connected and the block actually has an input
      if (this.blockTypes[this.selectedBlock.type].inputs.length>0 &&
          Object.values(this.selectedBlock.inputLinks)[0]!=null
      ) {
          let schema = await this.getInputSchema(this.selectedBlock)
          this.selectedBlockInputSchema = schema  
      }
      else {
        // this block type has no inputs. return an empty schema
        this.selectedBlockInputSchema = {}
        for (let inputType of this.blockTypes[this.selectedBlock.type].inputs) {
          this.selectedBlockInputSchema[inputType.id] = []
        }
      }
    }
    catch (e) {
      if (e.ename) {
          this.error = `${e.ename}: ${e.evalue}`
          this.showError = true
      }
    }
  }
  selectBlock (block:Block) {
    this.selectedBlock = block
    this.selectedBlockProperties = block.properties
  }
  deselectBlock (block:Block) {
    this.selectedBlock = null
  }
  saveProperties() {
    // find index of selected block in job contents
    let blockIndex = this.blocks.findIndex(x => x.id == this.selectedBlock.id);

    let properties = (this.$refs.propertiesPanel as BlockPropertiesRef).getProperties()
    let comment = ""
    // auto-generate a comment if needed
    if (this.selectedBlock.comment && this.selectedBlock.comment!='') {
      comment = this.selectedBlock.comment
    }
    else {
      comment = this.blockTypes[this.selectedBlock.type].commentTemplate.render({
        props: properties
      })
    }
    this.$set(
      this.blocks,
      blockIndex,
      Object.assign({},this.blocks[blockIndex],{
        "properties":properties,
        "comment":comment,
      })
    )
    this.showPropertiesPanel = false
    this.isRunStateDirty = true
    this.persist()
  }
  setBlockStatus(id:number,status:BlockStatus) {
    let blockIndex = this.getBlockIndexById(id)
    let update:any = {"status": status}
    if (status==BlockStatus.Stopped) {
      // clear the error
      update["error"] = null
    }
    this.$set(this.blocks,blockIndex,
      Object.assign(this.blocks[blockIndex],update)
    )
  }
  getBlockById(id:number) {
    return this.blocks.find( (block) => block.id===id)
  }
  getBlockIndexById(id:number) {
    return this.blocks.findIndex( (block) => block.id===id)
  }
  autoArrange() {
    (this.$refs.container as BlocksContainerRef).autoArrange()
  }
  async testSelectedBlock() {

    // we run only this block before saving. used for testing / preview
    if (this.isRunStateDirty) await this.run(true,this.selectedBlock.id,false,true)

    let draftBlock = Object.assign({},this.selectedBlock,{
        "properties":(this.$refs.propertiesPanel as BlockPropertiesRef).getProperties()
    })
    let jobCommand = this.jobCommands.find( (command) => command.blockId==this.selectedBlock.id)

    let code = blockTypes[this.selectedBlock.type].codeTemplate.render({
      comment: draftBlock.comment,
      props: draftBlock.properties,
      inputs: jobCommand.inputs,
      outputs: {'df':'df'}
    })
    console.log(code)
    try {
      await jupyterUtils.sendToPython(this.kernel,code)
      this.showDataframePanel = true
      this.inspectDataframeVariable = 'df'
    }
    catch (e) {
      if (e.ename) {
          this.error = `${e.ename}: ${e.evalue}`
          this.showError = true
      }
    }
  }
  async getInputSchema(block:Block): Promise<{[slot:string]:Array<JSON>}> {
    // we run only this block before saving. used for testing / preview to get the schema
    if (this.isRunStateDirty) {
      try {
        await this.run(true,block.id,false,true)
      }
      catch (e) {
        if (e.ename) {
            this.error = `${e.ename}: ${e.evalue}`
            this.showError = true
        }
        return {}
      }
    } 

    let jobCommand = this.jobCommands.find( (command) => command.blockId==block.id)
    console.log(jobCommand)
    let schemas:{[slot:string]:Array<JSON>} = {}
    for (let input of Object.keys(jobCommand.inputs)) {
      schemas[input] = await jupyterUtils.getSchema(this.kernel,jobCommand.inputs[input])
    }
    return schemas;
  }

  // silent - no updates of status
  // stopBeforeBlock - used to run only up to a certain block (not including)
  async run(silent:boolean=false,stopBeforeBlock:number=null,getCount:boolean=true,getSchema:boolean=false) {
      //
      // run this job in jupyter notebook
      //
      if (!silent) {
        this.completedBlocks = -1 // will display a loading progress indicator
        this.jobStatus = JobStatus.Running
        this.readOnly = true
        // clear running or completed state of all blocks
        for (let block of this.blocks) {
          block.status = BlockStatus.Stopped
        }
      }
      this.interrupt = false
      let commands = jobRenderer.render({blocks:this.blocks,links:this.links, container: {}})
      this.jobCommands = commands
      console.log(commands)
      // start running
      this.completedBlocks = 0

      // send catalog to server
      let catalog = await this.$idb.table("catalog").toArray()
      await jobUtils.syncCatalog(
        this.kernel,
        catalog
      )

      for (let command of commands) {
        // check if we have a flag to inerrupt currenct execution
        if (this.interrupt) {
          this.interrupt = false
          console.log("interrupting execution")
          break
        }
        if (command.blockId==stopBeforeBlock) break
        //
        // run command
        //
        console.log("running command")
        console.log(command.code)
        // find block
        let blockIndex = this.blocks.findIndex( (block) => block.id===command.blockId)
        let block = this.blocks[blockIndex]

        if (!silent) this.setBlockStatus(command.blockId,BlockStatus.Running)
        try {
          let response = await jupyterUtils.sendToPython(this.kernel,command.code)
          console.log(response)
        }
        catch (e) {
          console.log(e)
          if (e.ename && !silent) {
              this.error = `${e.ename}: ${e.evalue}`
              block.error = this.error
              this.showError = true
              // set it so it forces an update
              this.$set(this.blocks,blockIndex,block)
              this.jobStatus = JobStatus.Completed
              return
            }
        }
        // add caching for better response times
        // TODO only do this in preview mode and optionally take from the properties of the block
        // TODO unpersist only computations or 'isDirty' indication
        Object.keys(command.outputs).forEach( async output => {
          await jupyterUtils.sendToPython(
            this.kernel,
            `${command.outputs[output]}=${command.outputs[output]}.cache()`)
        })

        // set the result count
        if (getCount) {
          Object.keys(command.outputs).forEach( async output => {
            block.outputLinks[output].resultCount = await jupyterUtils.getDataframeCount(this.kernel,command.outputs[output])
            this.setObjectProperties(this.blocks,blockIndex,{outputLinks:block.outputLinks})
          })
        }
        console.log(block)
        // set it so it forces an update to the UI
        this.$set(this.blocks,blockIndex,block)

        // block completed
        if (!silent) {
          this.setBlockStatus(command.blockId,BlockStatus.Completed)
          this.completedBlocks++
        }
        await Vue.nextTick()
      }
      // job complete
      if (!silent) this.jobStatus = JobStatus.Completed
      this.isRunStateDirty = false
    }
  stop() {
    // stop running the job. exit 'debug' mode
    this.interrupt = true
    this.jobStatus = JobStatus.Stopped
    this.readOnly = false
    for (let block of this.blocks) {
      this.setBlockStatus(block.id,BlockStatus.Stopped)
    }
  }
  updateContainer(container:any) {
    this.container = container
    this.persist()
  }
  updateBlocks(blocks:Array<Block>) {
    this.isRunStateDirty = true
    this.blocks = blocks
    this.persist()
  }
  setObjectProperties(arr:Array<any>,index:number,assignProperty:any) {
    this.$set(arr,index,Object.assign({},arr[index],assignProperty))
  }
  updateLinks(links:Array<Link>) {
    this.isRunStateDirty = true
    let vm = this
    this.links = links
    for (let i=0; i<this.blocks.length; i++) {
      // use the block type descriptor to set empty connectors for inputs and outputs based on the block type
      let outputLinks = this.blockTypes[this.blocks[i].type].outputs.reduce( (map,obj) => { map[obj.id] = new Link({}); return map },{})            
      this.setObjectProperties(this.blocks,i,{outputLinks:outputLinks})

      let inputLinks = this.blockTypes[this.blocks[i].type].inputs.reduce( (map,obj) => { map[obj.id] = null; return map },{})            
      this.setObjectProperties(this.blocks,i,{inputLinks:inputLinks})
    }
    // update the block links
    this.links.forEach( (link) => {
      let originIndex = this.blocks.findIndex( (block) => block.id===link.originId)
      let targetIndex = this.blocks.findIndex( (block) => block.id===link.targetId)
      vm.$set(vm.blocks[originIndex].outputLinks,link.originSlot,link)
      vm.blocks[targetIndex].inputLinks[link.targetSlot] = link
    })
    this.persist()
  }
  updateJob(job:any) {
    let vm = this
    this.updateBlocks(job.blocks)
    this.updateLinks(job.links)
    this.updateContainer(job.container)
    this.persist()
  }
  persist() {
    let jsonBlocks = this.blocks.map( (block) => Block.toJson(block))
    let jsonLinks = this.links.map( (link) => Link.toJson(link))
    this.$idb.table("flows").put({
      blocks: jsonBlocks,
      links: jsonLinks,
      container: this.container,
      name: this.jobName
    })

  }
  @Watch('jobName')
  onJobNameChanged(newVal:string,oldVal:string) {
    this.persist()
    // delete the old flow. there is no rename, so put and delete
    this.$idb.table("flows").delete(oldVal)
  }

  exportCode() {
    let commands = jobRenderer.render({blocks:this.blocks,links:this.links, container: {}})
    let text = commands.map( (command) => command.code).join("\n\n")
    let encodedUri = 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(text)
    let link = document.createElement('a');
    link.download = `${this.jobName}.py`;
    link.href = encodedUri
    link.click();
  }
  async inspectSocket(socket:any) {
    console.log("inspecting socket")
    console.log(socket)

    // decypher the python variable name from the runtime commands
    let command:any = this.jobCommands.find( (command:any) => command.blockId==socket.id)
    let dataframe
    if (socket.type=='input') {
      dataframe = command.inputs[socket.socketId]
    }
    else {
      dataframe = command.outputs[socket.socketId]
    }
    console.log(`inspect ${dataframe}`)

    this.showDataframePanel = true
    this.inspectDataframeVariable = dataframe
  }
  get isJobRunning() {
    return this.jobStatus==JobStatus.Running
  }
  get isJobStopped() {
    return this.jobStatus==JobStatus.Stopped
  }
  get isJobComplete() {
    return this.jobStatus==JobStatus.Completed
  }
  //
  // lifecycle events
  //
  async created() {
    this.$root.$data.$loading = true
    // initialize kernel
    // this.$store.dispatch('job/initialize')
    // take job name from route
    this.jobName = this.$route.params["id"]
    let job = await this.$idb.table("flows").get(this.jobName)
    try {
      let vm = this
      job.blocks = job.blocks.filter( (block:Block) => {
        return typeof(block.type)=="string"
      })
      this.updateJob({
        blocks: job.blocks.map( (block:any) => new Block(block) ),
        links: job.links.map( (link:any) => new Link(link) ),
        container: job.container
      })
    }
    catch (e) {
      console.log(e)
    }
    finally {
      this.$root.$data.$loading = false
    }
  }
  //
  // computed
  //
  get connectionStatus() {
    return this.$store.state.job.connectionStatus
  }
  get kernelStatus() {
    return this.$store.state.job.kernelStatus
  }
  get kernel() {
    return this.$store.state.job.kernel
  }
}
