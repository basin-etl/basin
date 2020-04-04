// import { Template } from './template'
import TopologicalSort from 'topological-sort';
interface Block {
  id: number
  type:string
  properties:object
}
interface Link {
  originId: number,
  targetId: number,
  originSlot: number,
  targetSlot: number
}
interface Job {
  blocks: Array<Block>,
  links: Array<Link>
}
import blockTypes from '../blocks/blockTypes'
import { isClearOutputMsg } from '@jupyterlab/services/lib/kernel/messages';
function render(jobContent:Job):Array<Object> {

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
    let jobCommands:Array<Object> = []
    sortedBlocks.forEach( block => {
      // find the inputs to this block
      const incomingLinks = jobContent.links.filter( (link) => link.targetId==(<Block>block.node)["id"])
      let inputs:{[slot:number]:string} = {}
      incomingLinks.forEach( link => {
        inputs[link.targetSlot] = `output_id${link.originId}_socket${link.originSlot}`
      })
      let output = `output_id${(<Block>block.node)["id"]}_socket0`

      jobCommands.push({
        blockId: (<Block>block.node)["id"],
        inputs: inputs,
        output: output,
        code: blockTypes[(<Block>block.node)["type"]].template.render({
          props: (<Block>block.node)["properties"],
          inputs: inputs,
          output: output
        })
      })
    })
    return jobCommands
}
export default {
  render: render
}