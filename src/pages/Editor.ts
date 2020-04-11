import jupyterUtils from '@/core/jupyterUtils.ts'
import blockTypes from '@/blocks/blockTypes.ts'
import BlocksContainer from '@/components/BlocksContainer.vue'
import BlockProperties from '@/components/BlockProperties.vue'
import BlockPropertiesRef from '@/components/BlockProperties'
import EditorBlocksBar from './EditorBlocksBar.vue'
import DataFrameViewer from '@/components/dataFrameViewer/DataFrameViewer.vue'
import jobRenderer from '@/core/jobRenderer'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Kernel } from "@jupyterlab/services"
import Block, { BlockStatus } from '@/models/Block';
import Job, { JobStatus } from '@/models/Job';
import Link from '@/models/Link';
import JobCommand from '@/models/JobCommand';
@Component({
  name: 'Editor',
  components: {
    BlocksContainer,
    BlockProperties,
    EditorBlocksBar,
    DataFrameViewer
  },
})
export default class Editor extends Vue {
  //
  // data
  //
  kernel:Kernel.IKernelConnection = null
  dragAdding = false
  props = {}
  interrupt = false // special flag to allow to interrupt a running job mid way
  blockTypes = blockTypes
  showPropertiesPanel = false
  jobCommands:Array<JobCommand> = null // holds the runtime commands of the job while debugging
  selectedBlock:Block = null
  selectedBlockProperties = {} // we store this separately because of reactivity issues with vue and the v-bind to the properties panel
  readOnly = false
  inspectDataframeVariable = ''
  showDataframePanel = false
  error:string = null
  showError = false
  jobStatus = JobStatus.Stopped
  completedBlocks = -1
  blocks:Array<Block> = []
  links:Array<Link> = []
  container:any = {}

  async showProperties(block:Block) {
    this.selectedBlock=block
    this.selectedBlockProperties=block.properties
    this.showPropertiesPanel = true        
    await this.$nextTick();
    (this.$refs.propertiesPanel as BlockPropertiesRef).reset()
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
    // this.selectedBlock.id,)
    let blockIndex = this.blocks.findIndex(x => x.id == this.selectedBlock.id);

    this.$set(
      this.blocks,
      blockIndex,
      Object.assign({},this.blocks[blockIndex],{
        "properties":(this.$refs.propertiesPanel as BlockPropertiesRef).getProperties(),
        "comment":this.selectedBlock.comment
      })
    )
    this.showPropertiesPanel = false
    this.persist()
  }
  setBlockStatus(id:number,status:BlockStatus) {
    let blockIndex = this.blocks.findIndex( (block) => block.id===id)
    this.$set(this.blocks,blockIndex,
      Object.assign(this.blocks[blockIndex],{"status": status})
    )
  }
  async run() {
      //
      // run this job in jupyter notebook
      //
      this.completedBlocks = -1 // will display a loading progress indicator
      this.jobStatus = JobStatus.Running
      this.interrupt = false
      this.readOnly = true
      // clear running or completed state of all blocks
      for (let block of this.blocks) {
        block.status = BlockStatus.Stopped
      }

      let commands = jobRenderer.render({blocks:this.blocks,links:this.links, container: {}})
      this.jobCommands = commands

      // start running
      console.log("running")
      console.log(commands)
      let initCode = `
import pyspark.sql.functions as F
import pyspark.sql.types as T
from pyspark.sql import SparkSession
spark = SparkSession \
  .builder \
  .appName("superglue studio") \
  .config("spark.sql.decimalOperations.allowPrecisionLoss",False) \
  .getOrCreate()
`
      await jupyterUtils.sendToPython(this.kernel,initCode)
      this.completedBlocks = 0

      for (let command of commands) {
        // check if we have a flag to inerrupt currenct execution
        if (this.interrupt) {
          this.interrupt = false
          console.log("interrupting execution")
          break
        }
        //
        // run command
        //
        console.log("running command")
        console.log(command.code)
        this.setBlockStatus(command.blockId,BlockStatus.Running)
        try {
          let response = await jupyterUtils.sendToPython(this.kernel,command.code)
          console.log(response)
        }
        catch (e) {
          console.log(e)
          if (e.ename) {
              this.error = `${e.ename}: ${e.evalue}`
              this.showError = true
          }
          return
        }
        // set the result count
        let blockIndex = this.blocks.findIndex( (block) => block.id===command.blockId)
        let block = this.blocks[blockIndex]
        console.log(block)
        if (command.output) {
          block.outputLinks[0].resultCount = await jupyterUtils.getDataframeCount(this.kernel,command.output)
        }
        // set it so it forces an update
        this.$set(this.blocks,blockIndex,block)

        // block completed
        this.setBlockStatus(command.blockId,BlockStatus.Completed)
        this.completedBlocks++
      }
      // job complete
      this.jobStatus = JobStatus.Completed

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
  updateJob(job:any) {
    let vm = this
    this.blocks = job.blocks
    this.links = job.links
    // update the block links
    this.links.forEach( (link) => {
      let originIndex = this.blocks.findIndex( (block) => block.id===link.originId)
      let targetIndex = this.blocks.findIndex( (block) => block.id===link.targetId)
      vm.blocks[originIndex].outputLinks[link.originSlot] = link
      vm.blocks[targetIndex].inputLinks[link.targetSlot] = link
    })
    this.container = job.container
    this.persist()
  }
  persist() {
    let jsonBlocks = this.blocks.map( (block) => Block.toJson(block))
    localStorage.job = JSON.stringify({
      blocks: jsonBlocks,
      links: this.links,
    })

  }
  async inspectSocket(socket:any) {
    console.log("inspecting socket")
    console.log(socket)

    // decypher the python variable name from the runtime commands
    let command:any = this.jobCommands.find( (command:any) => command.blockId==socket.id)
    let dataframe
    if (socket.type=='input') {
      dataframe = command.inputs[socket.index]
    }
    else {
      dataframe = command.output
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
    try {
      // load from local storage
      if (localStorage.job) {
        let vm = this
        let job = JSON.parse(localStorage.job)
        this.updateJob({
          blocks: job.blocks.map( (block:any) => new Block(block) ),
          links: job.links.map( (link:any) => new Link(link) ),
          container: job.container
        })
      }
    }
    catch (e) {
      console.log(e)
    }
    // start a new kernel
    this.kernel = await jupyterUtils.getKernel()    
  }
  async mounted () {
    // cleanup active kernel
    window.addEventListener('beforeunload', () => {
        console.log("shutting down kernel")
        this.kernel.shutdown()
    }, false)
  }
  beforeDestroy() {
    console.log("shutting down kernel")
    this.kernel.shutdown()
  }
}
