/// <reference path="./global.d.ts" />
const Chai = require('chai')
const y = require('yaml')

/**
 * Unwraps a YAML Scalar or Document node
 * @param node YAML Node
 * @returns The unwrapped value from node if Scalar or YAML Document. Otherwise the original argument is returned
 */
function unwrap(node) {
  if (node !== null && typeof node === 'object') {
    if (y.isScalar(node)) return node.value
    if (y.isDocument(node)) return unwrap(node.contents)
  }
  return node
}

function isYamlNode(node) {
  return y.isNode(node) || y.isDocument(node) || y.isPair(node)
}

function getNodeType(node) {
  if (y.isScalar(node)) return 'Scalar'
  if (y.isPair(node)) return 'Pair'
  if (y.isMap(node)) return 'Map'
  if (y.isSeq(node)) return 'Seq'
  if (y.isDocument(node)) return 'Document'
  return undefined
}

/**
 * @param { Chai } chai
 * @param { Chai.ChaiUtils } utils
 */
function YamlChai(chai, utils) {
  const Assertion = chai.Assertion
  const expect = chai.expect

  const yamlFlag = function (property, value) {
    if (value) utils.flag(this, `yaml.${property}`, value)
    else utils.flag(this, `yaml.${property}`)
  }

  const yamlFlags = function (values) {
    if (values) {
      for (const [flag, value] of Object.entries(values)) {
        yamlFlag(flag, value)
      }
    } else {
      return {
        node: utils.flag(this, 'yaml.node'),
        property: utils.flag(this, 'yaml.property'),
      }
    }
  }

  /**
   * @this { Chai.AssertionStatic }
   */
  const yamlAssert = function (cond, msg1, msg2, exp, act) {
    this.assert(cond, msg1, msg2, exp, act)
  }

  function createAssertNode(Instance) {
    return (node) => expect(node).to.be.instanceOf(Instance)
  }

  const assertIs = {
    Scalar: createAssertNode(y.Scalar),
    Pair: createAssertNode(y.Pair),
    YAMLMap: createAssertNode(y.YAMLMap),
    YAMLSeq: createAssertNode(y.YAMLSeq),
    Document: createAssertNode(y.Document),
  }

  /**
   *
   * @param { string } property
   * @param { (this: Chai.AssertionStatic, node: N) => void } fn
   */
  function yamlProperty(property, fn) {
    Assertion.addProperty(property, function () {
      const node = this._obj
      fn.call(this, node)
    })
  }

  /**
   *
   * @param { string } method
   * @param { (this: Chai.AssertionStatic, node: any, ...args: any[]) => void } fn
   */
  function yamlMethod(method, fn) {
    Assertion.addMethod(method, function (...args) {
      const node = this._obj
      fn.call(this, node, ...args)
    })
  }

  function overwriteProperty(property, fn) {
    Assertion.overwriteProperty(property, function (_super) {
      return function () {
        return fn.call(this, _super, this._obj)
      }
    })
  }

  overwriteProperty('deep', function (_super, node) {
    const flags = yamlFlags()
    if (isYamlNode(node) && flags.property === 'value') {
      yamlFlags({ node: getNodeType(node) })
    } else {
      _super.call(this)
    }
  })

  overwriteProperty('null', function (_super, node) {
    const flags = yamlFlags()
    if (isYamlNode(node) && flags.property === 'value') {
      if (flags.node === 'Scalar') {
        new Assertion(node.value).to.be.null
      } else if (flags.node === 'Document') {
        new Assertion(node.contents).to.be.null
      } else {
        _super.call(this)
      }
    } else {
      _super.call(this)
    }
  })

  overwriteProperty('value', function (_super, node) {
    if (isYamlNode(node)) {
      yamlFlags({ node: getNodeType(node), property: 'value' })
    } else {
      _super.call(this)
    }
  })

  Assertion.overwriteMethod('eq', function (_super) {
    return function (value) {
      const node = this._obj
      const flags = yamlFlags()

      console.log(`[eq]`, { flags, contents: node.contents, value })

      if (flags.property === 'value') {
        if (flags.node === 'Scalar') {
          new Assertion(node).to.have.property('value', value)
        } else if (flags.node === 'Document') {
          if (!node.contents) {
            this.assert(
              node.contents === value,
              `expected #{this} to have value #{exp} but received #{act}`,
              `expected #{this} to not have value #{exp} but received #{act}`,
              value,
              node.contents,
            )
          } else {
            if (y.isMap(node.contents)) {
              if (isYamlNode(value)) {
                expect(node.contents.toJSON()).to.deep.eq(value)
                // this.assert(
                //   node.contents.toJSON() === value,
                //   `expected #{this} to have value #{exp}`,
                //   `expected #{this} to not have value #{exp}`,
                //   value,
                //   node.contents.toJSON(),
                // )
              } else {
                expect(node.contents.toJSON()).to.deep.eq(value)
              }

              // this.assert(
              //   unwrap(node.contents) === value,
              //   `expected #{this} to have value #{exp}`,
              //   `expected #{this} to not have value #{exp}`,
              //   value,
              //   node.contents,
              // )
            } else if (y.isScalar(node.contents)) {
              this.assert(
                unwrap(node.contents) === value,
                `expected #{this} to have value #{exp} but received #{act}`,
                `expected #{this} to not have value #{exp} but received #{act}`,
                value,
                unwrap(node.contents),
              )
            } else {
              _super.apply(this, arguments)
            }
          }
        }
      } else {
        _super.apply(this, arguments)
      }
    }
  })

  // yamlMethod('value', function (node, value) {
  //   console.log({ node, value })
  //   if (y.isMap(node)) {
  //     this.assert(
  //       node.items.some((pair) => {
  //         if (isYAMLNode(pair.value)) return is.equalTo(pair.value, value)
  //         return unwrap(pair.value) === value
  //       }),
  //       `expected #{this} to have value #{exp}`,
  //       `expected #{this} to not have value #{exp}`,
  //       value,
  //     )
  //   }

  //   if (y.isPair(node)) {
  //     this.assert(
  //       unwrap(node.value) === value,
  //       `expected Pair #{this} to have value #{exp} but got #{act}`,
  //       `expected Pair #{this} to not have value #{exp} but got #{act}`,
  //       value,
  //       node.value,
  //     )
  //   }

  //   if (y.isScalar(node)) {
  //     this.assert(
  //       unwrap(node) === value,
  //       `expected #{this} to have value #{exp} but got #{act}`,
  //       `expected #{this} to not have value #{exp} but got #{act}`,
  //       value,
  //       node.value,
  //     )
  //   }

  //   if (y.isSeq(node)) {
  //     this.assert(
  //       unwrap(node.get(value)) === value,
  //       `expected YAMLSeq #{this} to have value #{exp}`,
  //       `expected YAMLSeq #{this} to not have value #{exp}`,
  //       value,
  //     )
  //   }
  // })
}

module.exports = YamlChai
