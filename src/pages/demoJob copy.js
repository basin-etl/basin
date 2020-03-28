let jobContent = {
    blocks: [
        {
            id: 2,
            x: -700,
            y: -69,
            type: 'extract',
            name: 'extract cobol',
            title: 'extract cobol',
            properties: {}
        },
        {
            id: 4,
            x: -157,
            y: -68.5,
            type: 'join',
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
            originId: 2,
            originSlot: 0,
            targetId: 4,
            targetSlot: 0
        },
        {
            id: 6,
            originId: 7,
            originSlot: 0,
            targetId: 8,
            targetSlot: 0
        },
        {
            id: 7,
            originId: 7,
            originSlot: 0,
            targetId: 9,
            targetSlot: 0
        },
        {
            id: 8,
            originId: 9,
            originSlot: 0,
            targetId: 10,
            targetSlot: 0
        },
        {
            id: 9,
            originId: 9,
            originSlot: 0,
            targetId: 8,
            targetSlot: 1
        },
        {
            id: 10,
            originId: 2,
            originSlot: 0,
            targetId: 6,
            targetSlot: 0
        },
        {
            id: 11,
            originId: 6,
            originSlot: 0,
            targetId: 4,
            targetSlot: 1
        },
        {
            id: 12,
            originId: 4,
            originSlot: 1,
            targetId: 5,
            targetSlot: 0
        },
        {
            id: 13,
            originId: 11,
            originSlot: 0,
            targetId: 13,
            targetSlot: 0
        },
        {
            id: 14,
            originId: 11,
            originSlot: 0,
            targetId: 12,
            targetSlot: 0
        },
        {
            id: 15,
            originId: 12,
            originSlot: 0,
            targetId: 13,
            targetSlot: 1
        },
        {
            id: 16,
            originId: 13,
            originSlot: 1,
            targetId: 15,
            targetSlot: 0
        },
        {
            id: 17,
            originId: 15,
            originSlot: 0,
            targetId: 14,
            targetSlot: 0
        },
        {
            id: 18,
            originId: 14,
            originSlot: 0,
            targetId: 16,
            targetSlot: 0
        },
        {
            id: 19,
            originId: 14,
            originSlot: 1,
            targetId: 16,
            targetSlot: 1
        },
        {
            id: 20,
            originId: 15,
            originSlot: 0,
            targetId: 17,
            targetSlot: 0
        },
        {
            id: 21,
            originId: 17,
            originSlot: 0,
            targetId: 14,
            targetSlot: 1
        }
    ],
    container: {
        centerX: 1042,
        centerY: 140,
        scale: 1
    }
};
export default jobContent;
//# sourceMappingURL=demoJob copy.js.map