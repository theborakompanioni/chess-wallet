import * as fen from './fen'
import { toSha256, base13ToBase16, base16ToIntArray } from './utils'

describe('fen.ts', () => {
  it('should have correct start fen', () => {
    expect(fen.START_FEN).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
  })

  it('should create random fen', () => {
    const randomFen = fen.randomFen()
    expect(randomFen.split('').filter((char) => char === '/').length).toBe(7)
  })

  it('should turn fen to base13', () => {
    const test0 = fen.fenToBase13(fen.START_FEN)
    expect(test0).toBe('42365324111111110000000000000000000000000000000077777777a89cb98a')

    const test1 = fen.fenToBase13('8/8/8/8/8/8/8/8')
    expect(test1).toBe('0000000000000000000000000000000000000000000000000000000000000000')

    const test2 = fen.fenToBase13('pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp')
    expect(test2).toBe('1111111111111111111111111111111111111111111111111111111111111111')

    const test3 = fen.fenToBase13('KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK')
    expect(test3).toBe('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc')
  })

  it('should turn base13 to fen', () => {
    const test0 = fen.base13ToFen('42365324111111110000000000000000000000000000000077777777a89cb98a')
    expect(test0).toBe(fen.START_FEN)

    const test1 = fen.base13ToFen('0000000000000000000000000000000000000000000000000000000000000000')
    expect(test1).toBe('8/8/8/8/8/8/8/8')

    const test2 = fen.base13ToFen('1111111111111111111111111111111111111111111111111111111111111111')
    expect(test2).toBe('pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp')

    const test3 = fen.base13ToFen('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc')
    expect(test3).toBe('KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK/KKKKKKKK')
  })

  it('should turn fen to sha256', () => {
    const hash = fen.fenToSha256(fen.START_FEN)

    expect(hash).toBe('11e97d08cdaf27052171f423d336317ebe69e5e6993262a0b557673f62aed089')
    expect(hash).toBe(
      toSha256(base16ToIntArray(base13ToBase16('42365324111111110000000000000000000000000000000077777777a89cb98a')))
    )
  })
})
