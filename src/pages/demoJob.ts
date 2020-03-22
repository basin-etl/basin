let jobContent = {
blocks: [
    {
        id: 2,
        x: -700,
        y: -69,
        type:'extract',
        name: 'extract cobol',
        title: 'extract cobol',
        properties: {}
    },
    {
        id: 4,
        x: -157,
        y: -68.5,
        type:'join',
        name: 'join',
        title: 'join a to b',
        properties: {}
    },
],
links: [
    {
        id: 3,
        originID: 2,
        originSlot: 0,
        targetID: 4,
        targetSlot: 0
    },
],
container: {
    centerX: 1042,
    centerY: 140,
    scale: 1
}
}
export default jobContent