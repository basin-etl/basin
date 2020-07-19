let jobContent = {
blocks: [
    {
        id: 2,
        x: -700,
        y: -69,
        type:'extract',
        name: 'extract cobol',
        title: 'extract cobol',
        properties: {
            source: "calendar",
        }
    },
    {
        id: 3,
        x: -700,
        y: -69,
        type:'extract',
        name: 'extract cobol2',
        title: 'extract cobol2',
        properties: {
            source: "fund",
        }
    },
    {
        id: 4,
        x: -157,
        y: -68.5,
        type:'join',
        name: 'join',
        title: 'join a to b',
        properties: {
            how: "left_outer",
            on: "a==b"
        }
    },
    {
        id: 5,
        x: -157,
        y: -68.5,
        type:'load',
        name: 'load',
        title: 'load',
        properties: {
            target: "postgres"
        }
    },
],
links: [
    {
        id: 3,
        originId: 2,
        originSlot: 0,
        targetId: 4,
        targetSlot: 0
    },
    {
        id: 2,
        originId: 3,
        originSlot: 0,
        targetId: 4,
        targetSlot: 1
    },
    {
        id: 4,
        originId: 4,
        originSlot: 0,
        targetId: 5,
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