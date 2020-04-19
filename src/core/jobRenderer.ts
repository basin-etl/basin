import TopologicalSort from 'topological-sort';
import Block from '@/models/Block'
import Link from '@/models/Link';
import Job from '@/models/Job';
import blockTypes from '@/core/blockTypes'
import JobCommand from '@/models/JobCommand';
import { CodeTemplate } from './template';
let initCode = require("./init.pyspark.template")
function renderInitCode():string {
  return new CodeTemplate(initCode).render({})
}
function render(jobContent:Job):Array<JobCommand> {

    const sortedGraph = new TopologicalSort<Number, Object>(new Map());
    jobContent.blocks.forEach( block => {
      sortedGraph.addNode(block.id,block)
    })
    jobContent.links.forEach( link => {
      sortedGraph.addEdge(link.originId,link.targetId)
    })
    const sortedBlocks = sortedGraph.sort();

    //
    // render the job
    //
    let jobCommands:Array<JobCommand> = []
    sortedBlocks.forEach( block => {
      // find the block type
      let blockType = blockTypes[(<Block>block.node)["type"]]      
      // find the inputs to this block
      let blockNode = (<Block>block.node)
      const incomingLinks = jobContent.links.filter( (link) => link.targetId==blockNode.id)
      
      // name the inputs
      let inputs:{[slot:number]:string} = {}
      incomingLinks.forEach( link => {
        let sourceBlock = jobCommands.find( (command) => command.blockId==link.originId)
        inputs[link.targetSlot] = sourceBlock.output
      })
      let output =null

      // name the output
      if (blockType.outputs.length>0) {
        // give the output a pretty name
        output = blockType.outputNameTemplate.render({
          id: blockNode.id,
          props: blockNode.properties,
          inputs: inputs,
        })
        // handle duplicates
      }

      jobCommands.push({
        blockId: blockNode.id,
        inputs: inputs,
        output: output,
        code: blockType.codeTemplate.render({
          comment: blockNode.comment,
          props: blockNode.properties,
          inputs: inputs,
          output: output
        })
      })
    })
    return jobCommands
}
export default {
  render: render,
  renderInitCode: renderInitCode
}