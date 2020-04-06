import {Module, VuexModule, MutationAction, Mutation, Action} from 'vuex-module-decorators'
import jobContent from '@/pages/demoJob';
import Block from '@/models/Block';
import jobRenderer from '@/core/jobRenderer';
import Job from '@/models/Job';
import Link from '@/models/Link';
import { Kernel } from '@jupyterlab/services';
import jupyterUtils from '@/core/jupyterUtils';

@Module({
    namespaced: true,
})
export default class JobModule extends VuexModule {
    status = 'stopped'
    blocks:Array<Block> = []
    links:Array<Link> = []

    @Mutation
    stop() {
        this.status = 'stopped'
    }
    @Mutation
    running() {
        this.status = 'stopped'
    }
    @Mutation
    completed() {
        this.status = 'completed'
    }
    @Mutation
    changeBlockStatus( payload:{id:number,status:string} ) {
        let index = this.blocks.findIndex( (block) => block.id == payload.id)
        this.blocks[index].status = payload.status
    }

    @Action
    async run(payload: {kernel: Kernel.IKernelConnection}) {
        this.context.commit('running')
        // create a Job
        let job = new Job()
        job.blocks = this.blocks
        job.links = this.links
        let commands = jobRenderer.render(job)
        console.log(commands)
        let initCode = `
from pyspark.sql import SparkSession
spark = SparkSession \
.builder \
.appName("superglue studio") \
.config("spark.sql.decimalOperations.allowPrecisionLoss",False) \
.getOrCreate()
`
        await jupyterUtils.sendToPython(payload.kernel,initCode)

        //
        // run the commands
        //
        for (let command of commands) {
            // check if we have a flag to inerrupt current execution
            // if (this.interrupt) {
            // this.interrupt = false
            // console.log("interrupting execution")
            // break
            // }
            console.log("running command")
            console.log(command.code)
            this.context.commit('changeBlockStatus',{id:command.blockId,status:"running"})
            try {
                let response = await jupyterUtils.sendToPython(payload.kernel,command.code)
                console.log(response)
            }
            catch (e) {
                console.log(e)
                // if (e.ename) {
                //     this.error = `${e.ename}: ${e.evalue}`
                //     this.showError = true
                // }
                return
            }

            this.context.commit('changeBlockStatus',{id:command.blockId,status:"completed"})
        }

        // for (let block of this.blocks) {
        //     this.context.commit('changeBlockStatus',{id:block.id,status:"running"})
        //     await new Promise(resolve => setTimeout(()=>resolve(), 1000)).then(()=>console.log("fired"));
        //     this.context.commit('changeBlockStatus',{id:block.id,status:"completed"})
        // }
        this.context.commit('completed')
    }
    @MutationAction({ mutate: ['blocks'] })
    async initialize() {
        let job = JSON.parse(localStorage.job)
        for (let i=0; i<job.blocks.length; i++) {
            job.blocks[i].status = "not started"
        }
        return {"blocks":job.blocks}
    }
    get isRunning() {
        return this.status=='running'
    }
    get isCompleted() {
        return this.status=='completed'
    }
    get getBlockById() {
        return (id: number) => {
            return this.blocks.find( (block) => block.id == id)
        }
    }
}