import * as fen from './fen'
import { toSha256, base13ToBase16, base16ToIntArray } from './utils'

describe('fen.ts', () => {
  it('should have correct start fen', () => {
    expect(fen.START_FEN).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
  })

  it('should have correct "empty" fen', () => {
    expect(fen.EMPTY_FEN).toBe('8/8/8/8/8/8/8/8')
  })

  it('should create random fen', () => {
    const randomFen = fen.randomFen()
    expect(randomFen.split('').filter((char) => char === '/').length).toBe(7)
  })

  it('should turn fen to base13', () => {
    const test0 = fen.fenToBase13(fen.START_FEN)
    expect(test0).toBe('42365324111111110000000000000000000000000000000077777777a89cb98a')

    const test1 = fen.fenToBase13('8/8/8/8/8/8/8/8')
    expect(test1).toBe('0')

    const test2 = fen.fenToBase13('8/8/8/8/8/8/8/p7')
    expect(test2).toBe('1')

    const test3 = fen.fenToBase13('8/8/8/8/8/8/8/7p')
    expect(test3).toBe('10000000')

    const test4 = fen.fenToBase13('pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp')
    expect(test4).toBe('1111111111111111111111111111111111111111111111111111111111111111')

    const test5 = fen.fenToBase13('KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK')
    expect(test5).toBe('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc')
  })

  it('should turn base13 to fen', () => {
    const test0 = fen.base13ToFen('42365324111111110000000000000000000000000000000077777777a89cb98a')
    expect(test0).toBe(fen.START_FEN)

    const test1 = fen.base13ToFen('0')
    expect(test1).toBe('8/8/8/8/8/8/8/8')

    const test2 = fen.base13ToFen('1')
    expect(test2).toBe('8/8/8/8/8/8/8/p7')

    const test3 = fen.base13ToFen('10000000')
    expect(test3).toBe('8/8/8/8/8/8/8/7p')

    const test4 = fen.base13ToFen('1111111111111111111111111111111111111111111111111111111111111111')
    expect(test4).toBe('pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp')

    const test5 = fen.base13ToFen('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc')
    expect(test5).toBe('KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK')
  })

  it('should turn fen to BigInt', () => {
    const test0 = fen.fenToBigInt(fen.START_FEN)
    expect(test0.toString(10)).toBe('62955972279413381820920253650503640468374239083616986870984248810148666')
    expect(test0.toString(13)).toBe('42365324111111110000000000000000000000000000000077777777a89cb98a')
    expect(test0.toString(16)).toBe('91f2ab324bd3c37ef6adb9189da5f05eeec4a38ac6b827a018af672133a')

    const test1 = fen.fenToBigInt('8/8/8/8/8/8/8/8')
    expect(test1.toString(10)).toBe('0')
    expect(test1.toString(13)).toBe('0')
    expect(test1.toString(16)).toBe('0')

    const test2 = fen.fenToBigInt('8/8/8/8/8/8/8/p7')
    expect(test2.toString(10)).toBe('1')
    expect(test2.toString(13)).toBe('1')
    expect(test2.toString(16)).toBe('1')

    const test3 = fen.fenToBigInt('8/8/8/8/8/8/8/7p')
    expect(test3.toString(10)).toBe('62748517')
    expect(test3.toString(13)).toBe('10000000')
    expect(test3.toString(16)).toBe('3bd7765')

    const test4 = fen.fenToBigInt('pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp')
    expect(test4.toString(10)).toBe('16337789702563422777554980035297167952033606667009648965799246986854080')
    expect(test4.toString(13)).toBe('1111111111111111111111111111111111111111111111111111111111111111')
    expect(test4.toString(16)).toBe('25e0096c48dafac5ecb902b27ddaff5deee44075aadb75849a2c4bdbec0')

    const test5 = fen.fenToBigInt('KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK')
    expect(test5.toString(10)).toBe('196053476430761073330659760423566015424403280004115787589590963842248960')
    expect(test5.toString(13)).toBe('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc')
    expect(test5.toString(16)).toBe('1c68071136a43c14718ac205de643f86732b30584024982373a138e4f100')
  })

  it('should turn fen to sha256', () => {
    const hash = fen.fenToSha256(fen.START_FEN)

    expect(hash).toBe('11e97d08cdaf27052171f423d336317ebe69e5e6993262a0b557673f62aed089')
    expect(hash).toBe(
      toSha256(base16ToIntArray(base13ToBase16('42365324111111110000000000000000000000000000000077777777a89cb98a')))
    )
  })
})
