import * as fen from './fen'
import * as sut from './utils'

import { TextEncoder } from 'util'

describe('utils.ts', () => {
  test('toSha256', () => {
    const bytes = Uint8Array.from(new TextEncoder().encode(fen.START_FEN))
    expect(sut.toSha256(bytes)).toBe('2438bf3df818266ca0a7480991ca52daaeeec55a010185a367c51c6836d35047')
  })

  test('base13ToBase16', () => {
    expect(sut.base13ToBase16('c')).toBe('c')
    expect(sut.base13ToBase16('10')).toBe('d')
    expect(sut.base13ToBase16('00000000')).toBe('0')
    expect(sut.base13ToBase16('00000001')).toBe('1')
    expect(sut.base13ToBase16('421337')).toBe('179354')
    expect(sut.base13ToBase16('0123456789abc')).toBe('1e9b6692326')
  })

  test('base16ToBase13', () => {
    expect(sut.base16ToBase13('c')).toBe('c')
    expect(sut.base16ToBase13('d')).toBe('10')
    expect(sut.base16ToBase13('00000000')).toBe('0')
    expect(sut.base16ToBase13('00000001')).toBe('1')
    expect(sut.base16ToBase13('deadbeef')).toBe('476cc321c')
    expect(sut.base16ToBase13('0123456789abcdef')).toBe('17a8c9b3017b847c')
  })

  test('reverseString', () => {
    expect(sut.reverseString('')).toBe('')
    expect(sut.reverseString(' ')).toBe(' ')
    expect(sut.reverseString('a')).toBe('a')
    expect(sut.reverseString('  ')).toBe('  ')
    expect(sut.reverseString('a ')).toBe(' a')
    expect(sut.reverseString('0123456789')).toBe('9876543210')
  })

  test('removeStartChars', () => {
    expect(sut.removeStartChars('', '')).toBe('')
    expect(sut.removeStartChars(' ', '')).toBe(' ')
    expect(sut.removeStartChars('a', 'a')).toBe('')
    expect(sut.removeStartChars('a', 'b')).toBe('a')
    expect(sut.removeStartChars('     a', ' ')).toBe('a')
    expect(sut.removeStartChars('0000001', '0')).toBe('1')
    expect(sut.removeStartChars('0001000', '0')).toBe('1000')
    expect(sut.removeStartChars('1000000', '0')).toBe('1000000')
  })
})
