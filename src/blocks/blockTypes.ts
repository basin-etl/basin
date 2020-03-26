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
let blockTypes:{[component:string]:object} = {}
requireComponent.keys().forEach(fileName => {
    // Get component config
    const componentConfig = requireComponent(fileName)
    const path = fileName.split("/")
    const componentName = path[path.length-2]
    blockTypes[componentName] = componentConfig
})

export default blockTypes