import * as cg from 'chessground/types'

import { bytesToHex, randomBytes } from '@noble/hashes/utils'

import * as utils from './utils'
import { Base13, Base16 } from './utils'

export const START_FEN: cg.FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

// empty = ".", pawn = "P", knight = "N", bishop = "B", rook = "R", queen = "Q" and king = "K"
// White pieces are designated using uppercase letters ("PNBRQK"), while black pieces use lowercase letters ("pnbrqk").
const FEN_ALPHABET = {
  '.': '0',
  p: '1',
  n: '2',
  b: '3', // note: "b" is a valid hex char
  r: '4',
  q: '5',
  k: '6',
  P: '7',
  N: '8',
  B: '9',
  R: 'a',
  Q: 'b',
  K: 'c',
}

const toFenAlphabetString = (fen: cg.FEN): string => {
  // A set of one or more consecutive empty squares within a rank is denoted by a digit from "1" to "8", corresponding to the number of squares.
  // This must be translated to the alphabet and replaced with "." * {digit} number of times.
  return [1, 2, 3, 4, 5, 6, 7, 8]
    .reduce((acc, noOfEmptySquares) => {
      return acc.replaceAll(`${noOfEmptySquares}`, Array(noOfEmptySquares).fill('.').join(''))
    }, fen)
    .replaceAll('/', '')
}

export const fenToBase16 = (fen: cg.FEN): Base16 => utils.base13ToBase16(fenToBase13(fen))

export const fenToBase13 = (fen: cg.FEN): Base13 => {
  const fenAlphabetString = toFenAlphabetString(fen)

  const fenAlphabetStringOrdered = fenAlphabetString
    .match(/(.{1,8})/g)!
    .map((it) => utils.reverseString(it))
    .join('')

  const base13 = Object.entries(FEN_ALPHABET).reduce((acc, [key, value]) => {
    return acc.replaceAll(key, value)
  }, fenAlphabetStringOrdered)

  return base13
}

export const fenToSha256 = (fen: cg.FEN): Base16 => utils.toSha256(utils.base16ToIntArray(fenToBase16(fen)))

export const base13ToFen = (base13: Base13): cg.FEN => {
  const base13_64: Base13 = base13.padStart(64, '0')
  if (base13_64.length !== 64) {
    throw new Error('base13 value must have 64 chars to be turned into fen')
  }
  // reverse is important! as 3 -> "b" (black bishop) is a valid hex char which must be replaced first
  const fenAlphabetString = Object.entries(FEN_ALPHABET)
    .reverse()
    .reduce((acc, [key, value]) => {
      return acc.replaceAll(value, key)
    }, base13_64)

  const protoFen = fenAlphabetString
    .match(/(.{1,8})/g)!
    .map((it) => utils.reverseString(it))
    .join('/')
    .substring(0, 8 * 8 + 7)

  const fen = [8, 7, 6, 5, 4, 3, 2, 1].reduce((acc, noOfEmptySquares) => {
    return acc.replaceAll(Array(noOfEmptySquares).fill('.').join(''), `${noOfEmptySquares}`)
  }, protoFen)

  return fen
}

export const randomFen = () => {
  const random = randomBytes(32)
  const randomBase16 = bytesToHex(random)
  const randomBase13 = utils.base16ToBase13(randomBase16).padStart(64, '0')
  return base13ToFen(randomBase13.substring(randomBase13.length - 64))
}
