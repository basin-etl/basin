//
// read the lib templates and concatenate into one bug utils py that can be imported
// aggregates the imports separate of the 
//
import * as glob from 'fast-glob'
import fs from 'fs'
let files = glob.sync("./src/**/*.lib.template")
let moduleText = ''
let importText = ''
console.log("compiling python lib for blocks")
for (let file of files) {
    let contents = fs.readFileSync(file, 'utf8')
    let code = contents.split("\n").filter( (line) => !line.startsWith('import')).join('\n')
    let imports = contents.split("\n").filter( (line) => line.startsWith('import')).join('\n')
    moduleText += code+'\n\n'
    importText += imports+'\n'
}
fs.writeFileSync('./lib/block_utils.py',importText+'\n' +moduleText)
