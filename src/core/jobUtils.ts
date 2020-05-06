import { Kernel, KernelManager, ServerConnection } from "@jupyterlab/services"
import { IExecuteReplyMsg, IIOPubMessage, IReplyErrorContent, IStatusMsg, IStreamMsg } from '@jupyterlab/services/lib/kernel/messages';
import jupyterUtils from './jupyterUtils';
import snakeize from 'snakeize'

async function syncCatalog(kernel:Kernel.IKernelConnection,catalogEntries:Array<any>) {
    // syncs catalog to server. index by name
    let catalog:{[name:string]:any} = catalogEntries.reduce((arr,item)=> (arr[item.name]=item,arr),{});
    await jupyterUtils.setPythonVariable(
        kernel,
        "catalog",
        snakeize(catalog)
    )
    let setMock = `
import unittest.mock
patcher = unittest.mock.patch('common.utils.get_catalog', return_value=catalog,create=True)
patcher.start()
`
    await jupyterUtils.sendToPython(kernel,setMock)
}

export default {
    syncCatalog: syncCatalog
}
