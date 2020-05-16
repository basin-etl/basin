export default class Link {
    originId: number
    targetId: number
    originSlot: string
    targetSlot: string
    // used for display
    resultCount:number = 0

    constructor(jsonData: any) {
        this.originId = jsonData.originId
        this.targetId = jsonData.targetId
        this.originSlot = jsonData.originSlot
        this.targetSlot = jsonData.targetSlot
    }
    static toJson(link:Link) {
        return {
            originId: link.originId,
            targetId: link.targetId,
            originSlot: link.originSlot,
            targetSlot: link.targetSlot
        }
    }
}
