import * as fen from './fen'
import { toSha256, base13ToBase16, base16ToIntArray } from './utils'

describe('fen.ts', () => {
  it('should have correct start fen', () => {
    expect(fen.START_FEN).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
  })

  it('should turn fen to base13', () => {
    const base = fen.fenToBase13(fen.START_FEN)
    expect(base).toBe('42365324111111110000000000000000000000000000000077777777a89cb98a')
  })

  it('should turn base13 to fen', () => {
    const base = fen.base13ToFen('42365324111111110000000000000000000000000000000077777777a89cb98a')
    expect(base).toBe(fen.START_FEN)
  })

  it('should turn fen to sha256', () => {
    const hash = fen.fenToSha256(fen.START_FEN)

    expect(hash).toBe('11e97d08cdaf27052171f423d336317ebe69e5e6993262a0b557673f62aed089')
    expect(hash).toBe(
      toSha256(base16ToIntArray(base13ToBase16('42365324111111110000000000000000000000000000000077777777a89cb98a')))
    )
  })
})
