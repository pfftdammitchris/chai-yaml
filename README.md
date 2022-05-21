# `chai-yaml`

> YAML Assertions for Chai

## Usage

```
const chai = require('chai')
const chaiYaml = require('chai-yaml');

chai.use(chaiYaml)
```

## Peer/Dev Dependencies

| Name                                   | Version  |
| -------------------------------------- | -------- |
| [chai](https://github.com/chaijs/chai) | `^4.6.0` |
| [yaml](https://github.com/eemeli/yaml) | `^2.1.0` |

This package is a development in progress. Pull requests are welcome.

Current assertions implemented so far are `value eq`, `value deep eq`, `value null` and `value undefined` assertions:

## `value.to.eq`, `value.to.deep.eq`

### Examples:

```js
describe(`Scalar`, () => {
  it(`should equal value`, () => {
    expect(new y.Scalar('hello')).value.to.eq('hello')
    expect(new y.Scalar(null)).value.to.eq(null)
    expect(new y.Scalar(undefined)).value.to.eq(undefined)
    expect(new y.Scalar('')).value.to.eq('')
    expect(new y.Scalar('')).value.to.eq('')
  })
})

describe(`Pair`, () => {
  it(`should equal value`, () => {
    expect(new y.Pair('hi', 0)).value.to.eq(0)
    expect(new y.Pair('hi', 1)).value.to.eq(1)
    expect(new y.Pair('hi', null)).value.to.eq(null)
    expect(new y.Pair('hi', 'hello')).value.to.eq('hello')
    expect(new y.Pair('hi', 'hi')).value.to.eq('hi')
    expect(new y.Pair('hi', '0')).value.to.eq('0')
    expect(new y.Pair('hi', '1')).value.to.eq('1')
    // expect(new y.Pair('hi', undefined)).value.to.eq(undefined)
    // expect(new y.Pair('hi')).value.to.eq(undefined)
  })
})

describe(`Map`, () => {
  it(`should equal value`, () => {
    const node = new y.YAMLMap()
    node.set('hi', 'hello')
    expect(node).value.to.deep.eq({ hi: 'hello' })
    node.set('hi2', 'hello')
    expect(node).value.not.to.deep.eq({ hi: 'hello' })
    expect(node).value.to.deep.eq({ hi2: 'hello', hi: 'hello' })
    node.delete('hi')
    expect(node).value.to.deep.eq({ hi2: 'hello' })
    node.delete('hi2')
    expect(node).value.to.deep.eq({})
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
})

describe(`Document`, () => {
  it(`should equal value of document contents`, () => {
    expect(new y.Document(true)).value.to.eq(true)
    expect(new y.Document(false)).value.to.eq(false)
    expect(new y.Document('hello')).value.to.eq('hello')
    expect(new y.Document(11)).value.to.eq(11)
    expect(new y.Document({})).value.to.deep.eq({})
    expect(new y.Document([])).value.to.deep.eq([])
    expect(new y.Document([''])).value.to.deep.eq([''])
  })
})
```

## `value.to.be.null`

### Examples:

```js
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
```

## `value.to.be.undefined`

### Examples:

```js
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
```

## TypeScript

TypeScript typings are available globally which will add a new `Chai.Property` `value`:

![chai-value-property-assertion.png](https://jsmanifest.s3.us-west-1.amazonaws.com/other/chai-value-property-assertion.png)
