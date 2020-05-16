export default class JobCommand {
  blockId: number
  inputs: {[slot:string]:string}
  outputs: {[slot:string]:string}
  code: string
}
