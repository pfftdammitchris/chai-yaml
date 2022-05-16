/// <reference types="chai" />

declare global {
  namespace Chai {
    interface Assertion {
      scalar: Assertion
      pair: Assertion
      map: Assertion
      seq: Assertion
      value: Assertion
    }
  }
}

declare const ChaiYaml: Chai.ChaiPlugin
declare namespace ChaiYaml {}
export = ChaiYaml
