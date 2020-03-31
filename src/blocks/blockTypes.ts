import {Template} from '@/core/template'
import Vue from 'vue'
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
let blockTypes:{[component:string]:{[key:string]:any}} = {}
requireComponent.keys().forEach( (fileName:string) => {
    // Get component config
    const componentConfig = requireComponent(fileName)
    const path:Array<string> = fileName.split("/")
    const componentName = path[path.length-2]
    if (!(componentName in blockTypes)) {
      blockTypes[componentName] = {}
    }
    if (fileName.endsWith(".json")) {
      // json config file
      Object.assign(blockTypes[componentName],componentConfig)
    }
    else if (fileName.endsWith(".template")) {
      blockTypes[componentName]["template"] = new Template(componentConfig)
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