import { CodeTemplate } from '@/core/template';

export default class BlockType {
    title: string // used for display in menus
    name: string // unique id
    stencil: string // stencil (category) id
    description: string // used for display in menus
    color: string // used for display in menus
    icon: string // name of material icon
    inputs: Array<any>
    _outputs: Array<any>
    outputNameTemplate: CodeTemplate
    codeTemplate: CodeTemplate
    commentTemplate: CodeTemplate
    comment_template: string // default comment to use in block

    public constructor(init?:Partial<BlockType>) {
      if (init) this.setProperties(init)
    }
    public setProperties(init?:Partial<BlockType>) {
      Object.assign(this, init);
      this.commentTemplate = new CodeTemplate(this.comment_template ? this.comment_template : this.name)
    }
    set outputs(newOutputs:Array<any>) {
      this._outputs = newOutputs
      this._outputs.forEach( (output, index) => {
        // see if we have a custom name
        if (output.name) {
          this._outputs[index].outputNameTemplate = new CodeTemplate(output.name_template)
        }
        else {
          this._outputs[index].outputNameTemplate = new CodeTemplate("output_id${id}_"+output.id)
        }

      })
    }
    get outputs(): Array<any> {
        return this._outputs
    }
    get type(): string {
      return this.name
    }
    set type(type:string) {
      return
    }
}
