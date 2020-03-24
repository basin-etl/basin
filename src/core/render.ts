import { Template } from './template'
import jobContent from '../pages/demoJob'
import TopologicalSort from 'topological-sort';
import { linkSync } from 'fs';

require.extensions['.template'] = function (module, filename) {
    module.exports = new Template(filename)
};


const sortedGraph = new TopologicalSort<Number, Object>(new Map());
jobContent.blocks.forEach( block => {
  sortedGraph.addNode(block.id,block)
})
jobContent.links.forEach( link => {
  sortedGraph.addEdge(link.originId,link.targetId)
})
const sortedBlocks = sortedGraph.sort();
//
// load all templates
//
var requireContext = require('require-context');
const requireComponent = requireContext(
  // The relative path of the components folder
  '../../src/blocks',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /.*\.template/
)
let templates = {}
requireComponent.keys().forEach(fileName => {
  // Get component config
  const blockType = fileName.split("/")[0]
  templates[blockType] = requireComponent(fileName)
})

//
// render the job
//
let jobCommands = []
sortedBlocks.forEach( block => {
  // find the inputs to this block
  const incomingLinks = jobContent.links.filter( (link) => link.targetId==block.node["id"])
  let inputs = {}
  incomingLinks.forEach( link => {
    inputs[link.targetSlot] = `output_id${link.originId}_socket${link.originSlot}`
  })
  jobCommands.push(
    templates[block.node["type"]].render({
      props: block.node["properties"],
      inputs: inputs
    })
  )
})
console.log(jobCommands.join("\n"))