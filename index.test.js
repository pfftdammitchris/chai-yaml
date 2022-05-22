'use strict'

const y = require('yaml')
const chai = require('chai')
const expect = chai.expect
const chaiYaml = require('.')

chai.use(chaiYaml)

describe(`value eq`, () => {
  describe(`Scalar`, () => {
    it(`should equal value`, () => {
      expect(new y.Scalar('hello')).value.to.eq('hello')
      expect(new y.Scalar('hello')).value.to.eq(new y.Scalar('hello'))
      expect(new y.Scalar(null)).value.to.eq(null)
      expect(new y.Scalar(undefined)).value.to.eq(undefined)
      expect(new y.Scalar('')).value.to.eq('')
      expect(new y.Scalar('')).value.to.eq(new y.Scalar(''))
    })
  })

  describe(`Pair`, () => {
    it(`should equal value`, () => {
      expect(new y.Pair('hi', 0)).value.to.eq(0)
      expect(new y.Pair('', 0)).value.to.eq(new y.Scalar(0))
      expect(new y.Pair('hi', 1)).value.to.eq(1)
      expect(new y.Pair('apple', 1)).value.to.eq(new y.Scalar(1))
      expect(new y.Pair('apple', null)).value.to.eq(null)
      expect(new y.Pair('hi', null)).value.to.eq(new y.Scalar(null))
      expect(new y.Pair('hi', 'hello')).value.to.eq('hello')
      expect(new y.Pair('hi', 'hello')).value.to.eq(new y.Scalar('hello'))
      expect(new y.Pair('hi', '0')).value.to.eq('0')
      expect(new y.Pair('hi', '1')).value.to.eq(new y.Scalar('1'))
      expect(new y.Pair('hi', 'false')).value.to.eq(new y.Scalar('false'))
      expect(new y.Pair('hi', false)).value.to.eq(new y.Scalar(false))
      // expect(new y.Pair('hi', undefined)).value.to.eq(undefined)
      // expect(new y.Pair('hi')).value.to.eq(undefined)
    })
  })

  describe(`Map`, () => {
    it(`should equal value if same node`, () => {
      const node = new y.YAMLMap()
      expect(node).value.to.eq(node)
    })

    it(`should not equal value if different node`, () => {
      const node = new y.YAMLMap()
      const node2 = new y.YAMLMap()
      expect(node).value.not.to.eq(node2)
    })

    it(`should equal deep value`, () => {
      const node = new y.YAMLMap()
      node.set('hi', 'hello')
      expect(node).value.to.deep.eq({ hi: 'hello' })
      node.set('hi2', 'hello')
      expect(node).value.to.deep.eq({ hi: 'hello', hi2: 'hello' })
      node.delete('hi')
      expect(node).value.to.deep.eq({ hi2: 'hello' })
      node.delete('hi2')
      expect(node).value.to.deep.eq({})
      const node2 = new y.YAMLMap()
      node.set('hi', 'hello')
      node.set('hi2', 'hello')
      node2.set('hi', 'hello')
      node2.set('hi2', 'hello')
      expect(node).value.to.deep.eq(node2)
    })

    it(`should equal deep jsonified value`, () => {
      const node = new y.YAMLMap()
      const node2 = new y.YAMLMap()
      node.set('hi', 'hello')
      node.set('hi2', 'hello')
      node2.set('hi', 'hello')
      node2.set('hi2', 'hello')
      const res2 = node2.toJSON()
      expect(node).value.to.deep.eq(res2)
    })

    it(`should not equal value`, () => {
      const node = new y.YAMLMap()
      node.set('hi', 'hello')
      node.set('hi2', 'hello')
      expect(node).value.not.to.deep.eq({ hi: 'hello' })
      expect(node).value.not.to.deep.eq({ h2: 'hello' })
      expect(node).value.not.to.deep.eq({})
      expect(node).value.not.to.deep.eq(undefined)
      expect(node).value.not.to.deep.eq(null)
      expect(node).value.not.to.deep.eq('hello')
      expect(node).value.not.to.deep.eq('')
      expect(node).value.not.to.deep.eq(false)
      expect(node).value.not.to.deep.eq([])
    })
  })

  describe(`Seq`, () => {
    const node = new y.YAMLSeq()
    expect(node).value.to.deep.eq([])
    node.set(0, 'hello')
    expect(node).value.to.deep.eq(['hello'])
    node.set(0, 'hi')
    expect(node).value.to.deep.eq(['hi'])
    node.add('hello2')
    expect(node).value.to.deep.eq(['hi', 'hello2'])
    expect(node.items).to.have.lengthOf(2)
    node.items.length = 0
    expect(node).value.to.deep.eq([])
    expect(node).value.to.deep.eq(new y.YAMLSeq())
  })

  describe(`Document`, () => {
    it(`should equal value of document contents`, () => {
      expect(new y.Document(true)).value.to.eq(true)
      expect(new y.Document(false)).value.to.eq(false)
      expect(new y.Document(false)).value.to.eq(new y.Scalar(false))
      expect(new y.Document('hello')).value.to.eq('hello')
      expect(new y.Document('hello')).value.to.eq(new y.Scalar('hello'))
      expect(new y.Document(11)).value.to.eq(11)
      expect(new y.Document(11)).value.to.eq(new y.Scalar(11))
      expect(new y.Document({})).value.to.deep.eq({})
      expect(new y.Document({})).value.to.deep.eq(new y.YAMLMap())
      expect(new y.Document([])).value.to.deep.eq([])
      expect(new y.Document([])).value.to.deep.eq(new y.YAMLSeq())
      expect(new y.Document([''])).value.to.deep.eq([''])
    })
  })
  // })

  describe(`value null`, () => {
    describe(`Scalar`, () => {
      it(`should be null`, () => {
        expect(new y.Scalar(null)).value.to.be.null
      })
    })

    describe(`Document`, () => {
      it(`should be null`, () => {
        expect(new y.Document()).value.to.be.null
        expect(new y.Document(null)).value.to.be.null
      })
    })

    describe(`Pair`, () => {
      it(`should be null`, () => {
        expect(new y.Pair('hello', null)).value.to.be.null
      })
    })

    describe(`YAMLMap`, () => {
      it(`should not be null`, () => {
        expect(new y.YAMLMap()).value.not.to.be.null
      })
    })

    describe(`YAMLSeq`, () => {
      it(`should not be null`, () => {
        expect(new y.YAMLSeq()).value.not.to.be.null
      })
    })
  })

  describe(`value undefined`, () => {
    describe(`Scalar`, () => {
      it(`should be undefined`, () => {
        expect(new y.Scalar(undefined)).value.to.be.undefined
        expect(new y.Scalar()).value.to.be.undefined
      })
    })

    describe(`Document`, () => {
      xit(`should be undefined`, () => {
        expect(new y.Document(undefined)).value.to.be.undefined
      })
    })

    describe(`Pair`, () => {
      it(`should be undefined`, () => {
        expect(new y.Pair('hello', null)).value.to.be.null
      })
    })

    describe(`YAMLMap`, () => {
      it(`should not be undefined`, () => {
        expect(new y.YAMLMap()).value.not.to.be.undefined
      })
    })

    describe(`YAMLSeq`, () => {
      it(`should not be undefined`, () => {
        expect(new y.YAMLSeq()).value.not.to.be.undefined
      })
    })
  })
})
