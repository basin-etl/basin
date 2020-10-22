import { Guid } from "guid-typescript";
import jupyterUtils from '@/core/jupyterUtils'
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

function genericClass() { // we need this to have a class that extends 'any'
    return class {} as any
}

class RemotePythonObject extends genericClass() {

    constructor(kernel:IKernelConnection,objectname: string,type="class") {
        super();
        let uid = '_'+(Guid.create()).toString().replace(/-/g,"")
        this.id = uid
        this.kernel = kernel
        let handler = {
            get: function(target: RemotePythonObject, prop: string, receiver: any) {
                if (prop=='ready') {
                    return (async function() {
                        await jupyterUtils.sendToPython(kernel,`${uid} = ${objectname}${type=='class'?'()':''}`);
                        console.log("object initialized")
                    })                
                }
                else if (prop=='uid') {
                    return uid
                }
                else if (prop=='length') {
                    // special handling of length. we will run len() in python
                    return (async function() {
                        let raw = await jupyterUtils.sendToPython(kernel,`print(len(${uid}),end="")`);
                        return parseInt(raw)
                    })()
                }
                else if (prop=='then') {
                    return
                }
                else {
                    // check if this is a method
                    return (async function() {
                        let pythonExpr = `${uid}.${prop}`
                        let pythonType = await jupyterUtils.sendToPython(kernel,`print(type(${pythonExpr}).__name__,end="")`);
                        console.log(pythonType)
                        if (pythonType=='method' || 
                            pythonType=='method-wrapper') {
                            // we stick this into a temp variable and see what we got. we use a temp variable with another _ in front of the guid
                            let raw = await jupyterUtils.sendToPython(kernel,`_${uid} = ${uid}.${prop}()`);
                            // inspect the new variable
                            pythonExpr = `_${uid}`
                            pythonType = await jupyterUtils.sendToPython(kernel,`print(type(${pythonExpr}).__name__,end="")`);
                            console.log(`return type: ${pythonType}`)
                        }

                        if (pythonType=='int') {
                            let raw = await jupyterUtils.sendToPython(kernel,`print(${pythonExpr},end="")`);
                            return parseInt(raw)
                        }
                        else if (pythonType=='str') {
                            let raw = await jupyterUtils.sendToPython(kernel,`print(${pythonExpr},end="")`);
                            return raw
                        }
                        else if (pythonType=='bool') {
                            let raw = await jupyterUtils.sendToPython(kernel,`print(${pythonExpr},end="")`);
                            return raw=="True"?true:false
                        }
                        else {
                            // this is an object. we create a new remote object instance for it
                            let obj = new RemotePythonObject(kernel,pythonExpr,'object')
                            await obj.ready()
                            return obj

                        }
                    })()
                }
            }
        }
        return new Proxy(this, handler);
    }
}
export default RemotePythonObject;