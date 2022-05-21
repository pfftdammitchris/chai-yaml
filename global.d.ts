/// <reference types="chai" />

declare global {
  namespace Chai {
    interface Assertion {
      value: Assertion
    }
  }
}

declare const ChaiYaml: Chai.ChaiPlugin
declare namespace ChaiYaml {}
export = ChaiYaml
