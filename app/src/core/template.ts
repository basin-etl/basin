import * as Handlebars from 'handlebars'

export class CodeTemplate {
  template:Handlebars.TemplateDelegate
  constructor(template:string) {
    // register template helpers
    Handlebars.registerHelper('input', function (this:Handlebars.HelperDelegate,id:string) {
      return (<any>this).inputs[id]
    });

    Handlebars.registerHelper('columnNames', function (this:Handlebars.HelperDelegate,obj:any) {
      let val = obj
      console.log(val)
      let retVal:string = [...val.matchAll(/F\.col\([\'"](.*?)[\'"]\)/g)].map( x => x[1]).join(", ")
      return new Handlebars.SafeString(retVal)
    });


    this.template = Handlebars.compile(template,{noEscape: true})
  }
  render(values = {}) {
    return this.template(values)
    // const handler = new Function('values', [
    //   'const tagged = ( ' + Object.keys(values).join(', ') + ' ) =>',
    //     '`' + this.template + '`',
    //   'return tagged(...values)'
    // ].join('\n'))
  
    // const handlerValues = Object.values(values)
  
    // return handler(handlerValues)  
  }
}