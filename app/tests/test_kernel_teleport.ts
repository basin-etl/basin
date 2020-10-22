import jupyterUtils from '@/core/jupyterUtils'
import { Kernel, KernelManager, ServerConnection } from "@jupyterlab/services"
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';
import { IExecuteReplyMsg, IIOPubMessage, IReplyErrorContent, IStatusMsg, IStreamMsg } from '@jupyterlab/services/lib/kernel/messages';
import RemotePythonObject from './remote-python'
(async () => {

    

let kernel = await jupyterUtils.getKernel("http://localhost:8080/ijupyter")
await jupyterUtils.sendToPython(kernel,
    `class X():
        def __init__(self,num=2):
            self.value_num = num*2
            self.value_str = "str"
            self.value_bool = True
            self.value_object = [1,2,3]
    
    `);
let x = new RemotePythonObject(kernel,"X")
await x.ready()
console.log("init done")
console.log((await x.value_num)==4)
console.log((await x.value_str)=="str")
console.log((await x.value_bool)==true)
let l = await x.value_object
console.log(await l.length)
console.log("done")
// console.log(await l.__len__)
// await jupyterUtils.sendToPython(kernel,"z = X(2)");
// let x = await jupyterUtils.sendToPython(kernel,"print(z.num)");
// console.log(x)
})()
