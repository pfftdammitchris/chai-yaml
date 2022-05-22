/// <reference path="./global.d.ts" />
const Chai = require('chai')
const y = require('yaml')
const isEqual = require('./isEqual')

/**
 * @typedef YAMLNode
 * @type { y.Node | y.Scalar | y.Pair | y.YAMLMap | y.YAMLSeq | y.Document }
 */

const isObj = (o) => o != null && typeof o === 'object'

const { isNode, isScalar, isPair, isMap, isSeq, isDocument: isDoc } = y

/** @returns { node is YAMLNode } */
function isYamlNode(node) {
  return [isNode, isDoc, isPair].some((fn) => fn.call(this, node))
}

function getNodeType(node) {
  if (isScalar(node)) return 'Scalar'
  if (isPair(node)) return 'Pair'
  if (isMap(node)) return 'Map'
  if (isSeq(node)) return 'Seq'
  if (isDoc(node)) return 'Document'
  return undefined
}

function pointToNodeValue(node) {
  if (isScalar(node)) return node
  if (isPair(node)) return node.value
  if (isMap(node)) return node
  if (isSeq(node)) return node
  if (isDoc(node)) return node.contents
}

function getJsValue(node) {
  if (isScalar(node)) return node.toJSON()
  if (isPair(node)) return getJsValue(node.value)
  if (isMap(node)) return node.toJSON()
  if (isSeq(node)) return node.toJSON()
  if (isDoc(node)) return node.toJSON()
  return node
}

/**
 * @param { Chai } chai
 * @param { Chai.ChaiUtils } utils
 */
function YamlChai(chai, utils) {
  const Assertion = chai.Assertion

  const setNodeFlags = function (property, value) {
    if (arguments.length > 1) {
      utils.flag(this, `yaml.${property}`, value)
    } else if (isObj(property)) {
      Object.entries(property).forEach(([key, value]) =>
        utils.flag(this, `yaml.${key}`, value),
      )
    } else {
      utils.flag(this, `yaml.${property}`)
    }
  }

  const getNodeFlags = function () {
    return {
      node: utils.flag(this, 'yaml.node'),
      property: utils.flag(this, 'yaml.property'),
    }
  }

  function assertNodeEqual(node, value) {
    let exp = getJsValue(pointToNodeValue(node))
    let act = isYamlNode(value) ? getJsValue(pointToNodeValue(value)) : value
    let assertPrefix = `expected #{this} to have`
    let negatePrefix = `expected #{this} to not have`

    let result =
      isYamlNode(node) && node === value
        ? true
        : utils.flag(this, 'deep')
        ? isEqual(act, exp)
        : act === exp

    if (utils.flag(this, 'deep')) {
      assertPrefix += ' deep'
      negatePrefix += ' deep'
    }
    this.assert(
      result,
      `${assertPrefix} value #{exp} but received #{act}`,
      `${negatePrefix} value #{exp} but received #{act}`,
      exp,
      act,
    )
  }

  /**
   *
   * @param { string } property
   * @param { (args: { _super: any, node: YAMLNode; flags: { node: string; property: string }; value: any; assertNodeEqual: typeof assertNodeEqual }) => void } fn
   */
  function overwriteProperty(property, fn) {
    Assertion.overwriteProperty(property, function (_super) {
      return function () {
        return fn.call(this, {
          flags: getNodeFlags(),
          node: this._obj,
          assertNodeEqual: assertNodeEqual.bind(this),
          next: () => _super.call(this),
        })
      }
    })
  }

  /**
   * @param { string } method
   * @param { (args: { _super: any, node: YAMLNode; flags: { node: string; property: string }; value: any; assertNodeEqual: typeof assertNodeEqual }) => void } fn
   */
  function overwriteMethod(method, fn) {
    Assertion.overwriteMethod(method, function (_super) {
      return function (value) {
        const node = utils.flag(this, 'object')
        const flags = getNodeFlags()
        fn.call(this, {
          node,
          flags,
          value,
          assertNodeEqual: assertNodeEqual.bind(this),
          next: () => _super.apply(this, arguments),
        })
      }
    })
  }

  overwriteProperty('value', function ({ next, node }) {
    if (isYamlNode(node)) {
      setNodeFlags('node', getNodeType(node))
      setNodeFlags('property', 'value')
    } else next()
  })

  overwriteMethod('eq', ({ assertNodeEqual, flags, next, node, value }) => {
    if (flags.node && flags.property === 'value') assertNodeEqual(node, value)
    else next()
  })

  overwriteProperty('null', ({ assertNodeEqual, flags, next, node }) => {
    if (flags.node && flags.property === 'value') assertNodeEqual(node, null)
    else next()
  })

  overwriteProperty('undefined', ({ assertNodeEqual, flags, next, node }) => {
    if (flags.node && flags.property === 'value') {
      assertNodeEqual(node, undefined)
    } else next()
  })
}

module.exports = YamlChai
