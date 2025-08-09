"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const boom_1 = require("@hapi/boom")
const WAProto_1 = require("../../WAProto")

// some extra useful utilities
const getBinaryNodeChildren = (node, childTag) => {
    if (Array.isArray(node?.content)) {
        return node.content.filter(item => item.tag === childTag)
    }
    return []
}

const getAllBinaryNodeChildren = ({ content }) => {
    if (Array.isArray(content)) {
        return content
    }
    return []
}

const getBinaryNodeChild = (node, childTag) => {
    if (Array.isArray(node?.content)) {
        return node?.content.find(item => item.tag === childTag)
    }
}

const getBinaryNodeChildBuffer = (node, childTag) => {
    const child = getBinaryNodeChild(node, childTag)?.content
    if (Buffer.isBuffer(child) || child instanceof Uint8Array) {
        return child
    }
}

const getBinaryNodeChildString = (node, childTag) => {
    const child = getBinaryNodeChild(node, childTag)?.content
    if (Buffer.isBuffer(child) || child instanceof Uint8Array) {
        return Buffer.from(child).toString('utf-8')
    }
    else if (typeof child === 'string') {
        return child
    }
}

const getBinaryNodeChildUInt = (node, childTag, length) => {
    const buff = getBinaryNodeChildBuffer(node, childTag)
    if (buff) {
        return bufferToUInt(buff, length)
    }
}

const assertNodeErrorFree = (node) => {
    const errNode = getBinaryNodeChild(node, 'error')
    if (errNode) {
        const errorCode = +errNode.attrs.code
        const errorText = errNode.attrs.text || 'Unknown error'
        
        // Mejorar el manejo de errores específicos
        if (errorCode === 429) {
            throw new boom_1.Boom('Rate limit exceeded - too many requests', { 
                data: errorCode,
                statusCode: 429 
            })
        } else if (errorCode === 401) {
            throw new boom_1.Boom('Authentication failed', { 
                data: errorCode,
                statusCode: 401 
            })
        } else if (errorCode === 403) {
            throw new boom_1.Boom('Access forbidden', { 
                data: errorCode,
                statusCode: 403 
            })
        } else if (errorCode === 404) {
            throw new boom_1.Boom('Resource not found', { 
                data: errorCode,
                statusCode: 404 
            })
        } else if (errorCode === 500) {
            throw new boom_1.Boom('Internal server error', { 
                data: errorCode,
                statusCode: 500 
            })
        } else if (errorCode === 503) {
            throw new boom_1.Boom('Service temporarily unavailable', { 
                data: errorCode,
                statusCode: 503 
            })
        } else {
            throw new boom_1.Boom(errorText, { 
                data: errorCode,
                statusCode: errorCode >= 400 && errorCode < 600 ? errorCode : 500
            })
        }
    }
}

const reduceBinaryNodeToDictionary = (node, tag) => {
    const nodes = getBinaryNodeChildren(node, tag)
    const dict = nodes.reduce((dict, { attrs }) => {
        dict[attrs.name || attrs.config_code] = attrs.value || attrs.config_value
        return dict
    }, {})
    return dict
}

const getBinaryNodeMessages = ({ content }) => {
    const msgs = []
    if (Array.isArray(content)) {
        for (const item of content) {
            if (item.tag === 'message') {
                try {
                    msgs.push(WAProto_1.proto.WebMessageInfo.decode(item.content))
                } catch (error) {
                    console.warn('Error decodificando mensaje:', error.message)
                    // Continuar con otros mensajes en lugar de fallar completamente
                }
            }
        }
    }
    return msgs
}

const getBinaryFilteredButtons = (nodeContent) => {
	if (!Array.isArray(nodeContent)) return false

    return nodeContent.some(a =>
        ['native_flow'].includes(a?.content?.[0]?.content?.[0]?.tag) ||
        ['interactive', 'buttons', 'list'].includes(a?.content?.[0]?.tag) ||
        ['hsm', 'biz'].includes(a?.tag)
    )
}

const getBinaryFilteredBizBot = (nodeContent) => {
    if (!Array.isArray(nodeContent)) return false 

    return nodeContent.some(b => 
        ['bot'].includes(b?.tag) && b?.attrs?.biz_bot === '1'
    ) 
}

function bufferToUInt(e, t) {
    let a = 0
    for (let i = 0; i < t; i++) {
        a = 256 * a + e[i]
    }
    return a
}

const tabs = (n) => '\t'.repeat(n)

function binaryNodeToString(node, i = 0) {
    if (!node) {
        return node
    }
    if (typeof node === 'string') {
        return tabs(i) + node
    }
    if (node instanceof Uint8Array) {
        return tabs(i) + Buffer.from(node).toString('hex')
    }
    if (Array.isArray(node)) {
        return node.map((x) => tabs(i + 1) + binaryNodeToString(x, i + 1)).join('\n')
    }
    
    try {
        const children = binaryNodeToString(node.content, i + 1)
        const tag = `<${node.tag} ${Object.entries(node.attrs || {})
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => `${k}='${v}'`)
            .join(' ')}`
        const content = children ? `>\n${children}\n${tabs(i)}</${node.tag}>` : '/>'
        return tag + content
    } catch (error) {
        console.warn('Error en binaryNodeToString:', error.message)
        return `<error parsing node: ${error.message}>`
    }
}

module.exports = {
  getBinaryNodeChildren, 
  getAllBinaryNodeChildren, 
  getBinaryNodeChild, 
  getBinaryNodeChildBuffer, 
  getBinaryNodeChildString, 
  getBinaryNodeChildUInt, 
  assertNodeErrorFree, 
  reduceBinaryNodeToDictionary, 
  getBinaryNodeMessages, 
  getBinaryFilteredButtons, 
  getBinaryFilteredBizBot, 
  binaryNodeToString
}
