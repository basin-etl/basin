//
// read the lib templates and concatenate into one big utils py that can be imported
// aggregates the imports separate of the 
//
import * as glob from 'fast-glob'
import fs from 'fs'
let files = glob.sync("./src/**/*.lib.template")
let moduleText = ''
let importArr = new Set()
console.log("compiling python lib for blocks")
for (let file of files) {
    let contents = fs.readFileSync(file, 'utf8')
    let code = contents.split("\n").filter( (line) => !line.startsWith('import')).join('\n')
    let imports = contents.split("\n").filter( (line) => line.startsWith('import'))
    moduleText += code+'\n\n'
    imports.forEach( (i) => importArr.add(i))
}
// dedupe the imports
const importText = [...importArr].join("\n")
fs.writeFileSync('./lib/block_utils.py',importText+'\n' +moduleText)
