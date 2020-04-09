export enum BlockStatus {
    Stopped,
    Running,
    Completed,
}

export default class Block {
    id: number
    type:string
    properties:object
    status:number
    code:string
    x:number
    y:number
    comment: string

    constructor( jsonData: any) {
        this.id = jsonData.id
        this.type = jsonData.type
        this.properties = jsonData.properties ? jsonData.properties : {}
        this.status = BlockStatus.Stopped
        this.x = jsonData.x ? jsonData.x : 0
        this.y = jsonData.y ? jsonData.y : 0
        this.comment = jsonData.comment ? jsonData.comment : ''
    }
    static toJson(block:Block) {
        return {
            id: block.id,
            type: block.type,
            properties: block.properties,
            x: block.x,
            y: block.y,
            comment: block.comment
        }
    }
}
