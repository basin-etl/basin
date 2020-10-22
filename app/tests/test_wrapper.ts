function genericClass() { // we need this to have a class that extends 'any'
    return class {} as any
}

class RemotePythonObject extends genericClass() {

    constructor(objectname: string) {
        super();
        this.objectname = objectname;
        let handler = {
            get: function(target: RemotePythonObject, prop: string, receiver: any) {
                return Symbol()
            }
        }
        return new Proxy(this, handler);
    }
}

let x = new RemotePythonObject("2")
console.log(x.blabla)
let xx = Symbol()
console.log(Symbol.keyFor(xx))