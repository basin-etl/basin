export class CodeTemplate {
  template:string
  constructor(template:string) {
    this.template = template
  }
  render(values = {}) {
    const handler = new Function('values', [
      'columnNames = function(val) { return [...val.matchAll(/F.col\\([\'"](.*?)[\'"]\\)/g)].map( x => x[1]).join(", ") }',
      'const tagged = ( ' + Object.keys(values).join(', ') + ' ) =>',
        '`' + this.template + '`',
      'return tagged(...values)'
    ].join('\n'))
  
    const handlerValues = Object.values(values)
  
    return handler(handlerValues)  
  }
}