import {CodeTemplate} from '@/core/template'
import Vue from 'vue'
import BlockType from '@/models/BlockType';
//
// traverse the block type tree and load the components
// .json - config file
// .template - render template for python code
// .vue - block properties panel
//
const requireComponent = require.context(
  // The relative path of the components folder
  '.',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /.*\.(json|template|vue)/
)
let blockTypes:{[component:string]:BlockType} = {}
requireComponent.keys().forEach( (fileName:string) => {
    // Get component config
    const componentConfig = requireComponent(fileName)
    const path:Array<string> = fileName.split("/")
    const componentName = path[path.length-2]
    let blockType = {}
    if (!(componentName in blockTypes)) {
      blockTypes[componentName] = new BlockType()
    }
    if (fileName.endsWith(".json")) {
      // json config file
      Object.assign(blockTypes[componentName],componentConfig)
    }
    else if (fileName.endsWith(".template")) {
      blockTypes[componentName].codeTemplate = new CodeTemplate(componentConfig)
    }
    else if (fileName.endsWith(".vue")) {
      console.log(componentName)
      Vue.component(
        componentName+"Properties",
        // Look for the component options on `.default`, which will
        // exist if the component was exported with `export default`,
        // otherwise fall back to module's root.
        componentConfig.default || componentConfig
      )
    }
})
export default blockTypes