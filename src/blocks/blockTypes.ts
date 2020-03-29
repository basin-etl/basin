import {Template} from '@/core/template'
//
// traverse the block type tree and load the components
//
const requireComponent = require.context(
  // The relative path of the components folder
  '.',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /.*\.json/
)
let blockTypes:{[component:string]:{[key:string]:any}} = {}
requireComponent.keys().forEach(fileName => {
    // Get component config
    const componentConfig = requireComponent(fileName)
    const path = fileName.split("/")
    const componentName = path[path.length-2]
    blockTypes[componentName] = componentConfig
})
//
// load templates
//
const requireTemplates = require.context(
  // The relative path of the components folder
  '.',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /.*\.template/
)
requireTemplates.keys().forEach(fileName => {
  // Get component config
  const templateContents = requireTemplates(fileName)
  const path = fileName.split("/")
  const componentName = path[path.length-2]
  blockTypes[componentName]["template"] = new Template(templateContents)
})

export default blockTypes