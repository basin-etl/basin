import {CodeTemplate} from '@/core/template'
import Vue from 'vue'
import BlockType from '@/models/BlockType';
import * as path from 'path';

let blockTypes:{[component:string]:BlockType} = {}
let blockFolders:{[component:string]:BlockType} = {}
//
// traverse the block type tree and load the components
// .json - config file
// .template - render template for python code
// .vue - block properties panel
//
const requireComponent = require.context(
  // The relative path of the components folder
  '../blocks',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /(descriptor.json)/
)
// first we load all of the descriptor.json files
requireComponent.keys().forEach( (fileName:string) => {
    // Get component config
    const componentConfig = requireComponent(fileName)
    let blockType:BlockType = new BlockType(componentConfig)
    const componentPaths:Array<string> = fileName.split("/")
    const componentPath = componentPaths[componentPaths.length-2]
    blockFolders[componentPath] = new BlockType(componentConfig)
  })

//
// load all of the vue and template files from the blocks folder and add to the dict
//
const requireSubComponents = require.context(
  '../blocks',
  // path.join('..','blocks',componentPath),
  // '.', // we are already in the context of the block folder
  true,
  // The regular expression used to match base component filenames
  /.*\.(template|vue)/
)

// traverse the files and load templates and vue components
requireSubComponents.keys().forEach( (fileName:string) => {
  const componentConfig = requireSubComponents(fileName)

  const componentPaths:Array<string> = fileName.split("/")
  const componentPath = componentPaths[componentPaths.length-2]
  // Get component config
  if (fileName.endsWith(".template")) {
    blockFolders[componentPath].codeTemplate = new CodeTemplate(componentConfig)
  }
  else if (fileName.endsWith(".vue")) {
    // register the vue component for properties panel
    Vue.component(
      blockFolders[componentPath].name+"Properties",
      // Look for the component options on `.default`, which will
      // exist if the component was exported with `export default`,
      // otherwise fall back to module's root.
      componentConfig.default || componentConfig
    )
  }
})
// rename the blocktypes by the .name property instead of the folder name
blockTypes = Object.values(blockFolders).reduce( 
  (result:{[component:string]:BlockType}, item:BlockType) => {
    result[item.name] = item;
    return result;
  },{}
)
console.log(blockTypes)
export default blockTypes
