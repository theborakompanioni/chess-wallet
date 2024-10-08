// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

const nodeCrypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  value: { getRandomValues: nodeCrypto.randomFillSync },
})
