'use strict'

const y = require('yaml')
const chai = require('chai')
const AssertionError = require('chai').AssertionError
const expect = chai.expect
const chaiYaml = require('.')

chai.use(chaiYaml)

describe(`Scalar`, () => {
  it(`should be true when value matches`, () => {
    process.stdout.write('\x1Bc')
    const node = new y.Scalar('hello')
    // expect(node).scalar.value.to.eq('hello')
    // expect(node).value.to.eq('f')
    expect(new y.Document()).value.to.eq('f')
  })
})

describe(`Document`, () => {
  it.only(`should match value of document contents`, () => {
    expect(new y.Document()).value.to.be.null
    expect(new y.Document('hello')).value.to.eq('hello')
    expect(new y.Document(11)).value.to.eq(11)
    console.log(new y.Document({}))
    expect(new y.Document({})).value.to.deep.eq({})
  })
})

describe(`pair`, () => {})

describe(`map`, () => {})

describe(`seq`, () => {})
