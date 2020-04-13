export class CodeTemplate {
  template:string
  constructor(template:string) {
    this.template = template
  }
  render(values = {}) {
    const handler = new Function('values', [
      'const tagged = ( ' + Object.keys(values).join(', ') + ' ) =>',
        '`' + this.template + '`',
      'return tagged(...values)'
    ].join('\n'))
  
    const handlerValues = Object.values(values)
  
    return handler(handlerValues)  
  }
}