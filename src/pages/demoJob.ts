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
    {
        id: 5,
        x: 136,
        y: -48.5,
        name: 'text',
        title: 'Text',
        values: {
        property: {
            text: {
            label: 'Text',
            type: 'string'
            }
        }
        }
    },
    {
        id: 6,
        x: -440,
        y: -15.5,
        name: 'delay',
        title: 'Delay',
        values: {
        property: {
            delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
            }
        }
        }
    },
    {
        id: 7,
        x: -694,
        y: 60.5,
        name: 'shortcuts',
        title: 'Shortcuts',
        values: {
        property: {
            keys: {
            label: 'Activation keys',
            type: 'keys'
            }
        }
        }
    },
    {
        id: 8,
        x: -163,
        y: 59.5,
        name: 'text',
        title: 'Text',
        values: {
        property: {
            text: {
            label: 'Text',
            type: 'string'
            }
        }
        }
    },
    {
        id: 9,
        x: -429,
        y: 125.5,
        name: 'delay',
        title: 'Delay',
        values: {
        property: {
            delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
            }
        }
        }
    },
    {
        id: 10,
        x: 126,
        y: 127.5,
        name: 'text',
        title: 'Text',
        values: {
        property: {
            text: {
            label: 'Text',
            type: 'string'
            }
        }
        }
    },
    {
        id: 11,
        x: -856,
        y: 252.5,
        name: 'shortcuts',
        title: 'Shortcuts',
        values: {
        property: {
            keys: {
            label: 'Activation keys',
            type: 'keys'
            }
        }
        }
    },
    {
        id: 12,
        x: -616,
        y: 319.5,
        name: 'delay',
        title: 'Delay',
        values: {
        property: {
            delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
            }
        }
        }
    },
    {
        id: 13,
        x: -381,
        y: 252.5,
        name: 'text',
        title: 'Text',
        values: {
        property: {
            text: {
            label: 'Text',
            type: 'string'
            }
        }
        }
    },
    {
        id: 14,
        x: 166,
        y: 266.5,
        name: 'text',
        title: 'Text',
        values: {
        property: {
            text: {
            label: 'Text',
            type: 'string'
            }
        }
        }
    },
    {
        id: 15,
        x: -149,
        y: 269.5,
        name: 'delay',
        title: 'Delay',
        values: {
        property: {
            delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
            }
        }
        }
    },
    {
        id: 16,
        x: 413,
        y: 267.5,
        name: 'animation',
        title: 'Animation',
        values: {
        property: {
            animation: {
            label: 'Animation',
            type: 'animation'
            }
        }
        }
    },
    {
        id: 17,
        x: 13,
        y: 380.5,
        name: 'delay',
        title: 'Delay',
        values: {
        property: {
            delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
            }
        }
        }
    }
],
links: [
    {
        id: 3,
        originID: 2,
        originSlot: 0,
        targetID: 4,
        targetSlot: 0
    },
    {
        id: 6,
        originID: 7,
        originSlot: 0,
        targetID: 8,
        targetSlot: 0
    },
    {
        id: 7,
        originID: 7,
        originSlot: 0,
        targetID: 9,
        targetSlot: 0
    },
    {
        id: 8,
        originID: 9,
        originSlot: 0,
        targetID: 10,
        targetSlot: 0
    },
    {
        id: 9,
        originID: 9,
        originSlot: 0,
        targetID: 8,
        targetSlot: 1
    },
    {
        id: 10,
        originID: 2,
        originSlot: 0,
        targetID: 6,
        targetSlot: 0
    },
    {
        id: 11,
        originID: 6,
        originSlot: 0,
        targetID: 4,
        targetSlot: 1
    },
    {
        id: 12,
        originID: 4,
        originSlot: 1,
        targetID: 5,
        targetSlot: 0
    },
    {
        id: 13,
        originID: 11,
        originSlot: 0,
        targetID: 13,
        targetSlot: 0
    },
    {
        id: 14,
        originID: 11,
        originSlot: 0,
        targetID: 12,
        targetSlot: 0
    },
    {
        id: 15,
        originID: 12,
        originSlot: 0,
        targetID: 13,
        targetSlot: 1
    },
    {
        id: 16,
        originID: 13,
        originSlot: 1,
        targetID: 15,
        targetSlot: 0
    },
    {
        id: 17,
        originID: 15,
        originSlot: 0,
        targetID: 14,
        targetSlot: 0
    },
    {
        id: 18,
        originID: 14,
        originSlot: 0,
        targetID: 16,
        targetSlot: 0
    },
    {
        id: 19,
        originID: 14,
        originSlot: 1,
        targetID: 16,
        targetSlot: 1
    },
    {
        id: 20,
        originID: 15,
        originSlot: 0,
        targetID: 17,
        targetSlot: 0
    },
    {
        id: 21,
        originID: 17,
        originSlot: 0,
        targetID: 14,
        targetSlot: 1
    }
],
container: {
    centerX: 1042,
    centerY: 140,
    scale: 1
}
}
export default jobContent