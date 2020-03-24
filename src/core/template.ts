var fs = require('fs');
export class Template {
  template:string
  constructor(filename:string) {
    this.template = fs.readFileSync(filename, 'utf8')
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