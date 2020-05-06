import { CodeTemplate } from '@/core/template';

export default class BlockType {
    title: string // used for display in menus
    type: string // unique id
    description: string // used for display in menus
    color: string // used for display in menus
    icon: string // name of material icon
    inputs: Array<any>
    _outputs: Array<any>
    outputNameTemplate: CodeTemplate
    codeTemplate: CodeTemplate


    public constructor(init?:Partial<BlockType>) {
        Object.assign(this, init);
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
}
