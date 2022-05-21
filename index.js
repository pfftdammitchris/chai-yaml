/// <reference path="./global.d.ts" />
const Chai = require('chai')
const y = require('yaml')
const isEqual = require('lodash/isEqual')

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
  if (isScalar(node)) return node.value
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
  const expect = chai.expect

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

  /**
   * @param { string } property
   * @param { YAMLNode } node
   * @param { any } value
   */
  function assertProperty(property, node, value) {
    const actualValue = getJsValue(node)
    this.assert(
      isEqual(actualValue, value),
      `expected #{this} to have ${property} #{exp} but received #{act}`,
      `expected #{this} to not have ${property} #{exp} but received #{act}`,
      value,
      actualValue,
    )
  }

  /**
   *
   * @param { string } property
   * @param { (args: { _super: any, node: YAMLNode; flags: { node: string; property: string }; value: any; assertProperty: typeof assertProperty }) => void } fn
   */
  function overwriteProperty(property, fn) {
    Assertion.overwriteProperty(property, function (_super) {
      return function () {
        return fn.call(this, {
          _super,
          flags: getNodeFlags(),
          node: this._obj,
          assertProperty: assertProperty.bind(this),
        })
      }
    })
  }

  /**
   * @param { string } method
   * @param { (args: { _super: any, node: YAMLNode; flags: { node: string; property: string }; value: any; assertProperty: typeof assertProperty }) => void } fn
   */
  function overwriteMethod(method, fn) {
    Assertion.overwriteMethod(method, function (_super) {
      return function (value) {
        const node = this._obj
        const flags = getNodeFlags()
        fn.call(this, {
          _super,
          node,
          flags,
          value,
          assertProperty: assertProperty.bind(this),
        })
      }
    })
  }

  overwriteProperty('value', function ({ _super, node }) {
    if (isYamlNode(node)) {
      setNodeFlags('node', getNodeType(node))
      setNodeFlags('property', 'value')
    } else {
      _super.call(this)
    }
  })

  overwriteMethod(
    'eq',
    function ({ _super, node, flags, value, assertProperty }) {
      const eqFlagKeys = ['value']
      if (flags.node) {
        if (flags.property.includes(eqFlagKeys)) {
          eqFlagKeys.forEach((eqFlagKey) => {
            assertProperty(eqFlagKey, pointToNodeValue(node), value)
          })
        } else {
          _super.apply(this, arguments)
        }
      } else {
        _super.apply(this, arguments)
      }
    },
  )

  overwriteProperty('null', function ({ _super, assertProperty, flags, node }) {
    if (isYamlNode(node)) {
      if (flags.property === 'value') {
        assertProperty('value', pointToNodeValue(node), null)
      } else {
        _super.call(this)
      }
    } else {
      _super.call(this)
    }
  })

  overwriteProperty(
    'undefined',
    function ({ _super, assertProperty, flags, node }) {
      if (isYamlNode(node)) {
        if (flags.property === 'value') {
          assertProperty('value', pointToNodeValue(node), undefined)
        } else {
          _super.call(this)
        }
      } else {
        _super.call(this)
      }
    },
  )
}

module.exports = YamlChai
