import * as glob from 'fast-glob'

let files = glob.sync("../src/**/*.lib.template")
console.log(files)

