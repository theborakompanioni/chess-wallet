import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Buffer } from 'buffer'
import * as BIP39 from 'bip39'
import { Chessground } from 'chessground'
import { Api as ChessgroundApi } from 'chessground/api'
import * as cg from 'chessground/types'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

import { sha256 } from '@noble/hashes/sha256'

import * as utils from './utils'
import './App.css'

window.Buffer = Buffer

export const toSha256 = (data: string | Uint8Array): string => {
  let eventHash = sha256.create().update(Buffer.from(data)).digest()
  return Buffer.from(eventHash).toString('hex')
}

// empty = ".", pawn = "P", knight = "N", bishop = "B", rook = "R", queen = "Q" and king = "K"
// White pieces are designated using uppercase letters ("PNBRQK"), while black pieces use lowercase letters ("pnbrqk").
const FEN_ALPHABET = {
  '.': '0',
  p: '1',
  n: '2',
  b: '3',
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

const fenToBuffer = (fen: cg.FEN): Buffer => {
  const base16 = fenToBase16(fen)
  const hex = base16.length % 2 === 0 ? base16 : `0${base16}`
  return Buffer.from(hex, 'hex')
}

const base16ToIntArray = (base16: string): Uint8Array => {
  const hex = base16.length % 2 === 0 ? base16 : `0${base16}`
  return Uint8Array.from(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
}

const fenToBase16 = (fen: cg.FEN): string => {
  const base13String = fenToBase13(fen)
  return utils.convertBaseBigInt(base13String, 13, 16)
}

const fenToBase13 = (fen: cg.FEN): string => {
  const fenAlphabetString = toFenAlphabetString(fen)

  const base13String = Object.entries(FEN_ALPHABET).reduce((acc, [key, value]) => {
    return acc.replaceAll(key, value)
  }, fenAlphabetString)

  return base13String
}

interface BitLength {
  bits: number,
  enabled: boolean
}
const toBitLength = (bits: number, enabled: boolean = true): BitLength => ({ bits, enabled })

interface BitLengthSelectorProps {
  bitLengths: BitLength[]
  onChange: (val: BitLength) => void
}

const BitLengthSelector = ({ bitLengths, onChange }: BitLengthSelectorProps) => {
  const [bitLength, setBitLength] = useState<BitLength>(bitLengths.filter((it) => it.enabled)[0])

  const _onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bits = parseInt(e.target.value, 10)
    const length = bitLengths.filter((it) => it.bits === bits)[0]
    setBitLength(length)
  }

  useEffect(() => {
    onChange(bitLength)
  }, [bitLength])

  return <>
    <select value={bitLength.bits} onChange={_onChange}>
      <>
        {bitLengths.map((it) => {
          return <option key={it.bits} value={it.bits} disabled={!it.enabled}>{Math.ceil(it.bits / 11)} words ({it.bits} bits)</option>
        })}
      </>
    </select>
  </>
}

function App() {
  const groundRef = useRef<HTMLDivElement>(null)
  const [ground, setGround] = useState<ChessgroundApi | null>(null)
  const [changeCounter, setChangeCounter] = useState(0)
  const increaseChangeCounter = useCallback(() => setChangeCounter((current) => current + 1), [])

  const bitLengths = useState<BitLength[]>([
    toBitLength(128), 
    toBitLength(160), 
    toBitLength(192), 
    toBitLength(224), 
    toBitLength(256, false)
    ])[0]
  const [bitLength, setBitLength] = useState<BitLength | null>(null)

  const initialFen = useMemo<cg.FEN | undefined>(() => undefined, [])
  const fen = useMemo<cg.FEN | null>(() => changeCounter >= 0 && ground ? ground.getFen() : null, [ground, changeCounter])

  const fen16 = useMemo<cg.FEN | null>(() => fen && fenToBase16(fen), [fen])
  const fen16Hash = useMemo(() => fen16 && toSha256(base16ToIntArray(fen16)), [fen16])
  const entropy = useMemo<string | null>(() => fen16Hash && bitLength && fen16Hash.substring(fen16Hash.length - (bitLength.bits / 4)), [fen16Hash, bitLength])

  const mnemonic = useMemo(() => entropy && BIP39.entropyToMnemonic(entropy), [entropy])
  const seed = useMemo(() => mnemonic && BIP39.mnemonicToSeedSync(mnemonic), [mnemonic])

  const onChange = useCallback(() => {
    increaseChangeCounter()
  }, [increaseChangeCounter])

  const config = useMemo(
    () => ({
      // see https://github.com/lichess-org/chessground/blob/master/src/config.ts
      movable: {
        free: true,
      },
      draggable: {
        enabled: true,
        deleteOnDropOff: true,
      },
      drawable: {
        enabled: true,
      },
      events: {
        change: onChange,
      },
    }),
    [onChange]
  )

  useEffect(() => {
    if (!groundRef || !groundRef.current) return

    const configWithFen = { ...config, fen: initialFen}

    const ground = Chessground(groundRef.current, configWithFen)
    setGround(ground)

    return () => {
      ground.destroy()
    }
  }, [initialFen, groundRef, config])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chess Bitcoin wallet</h1>
        <div ref={groundRef} style={{ height: '400px', width: '400px' }}></div>

        <h2>FEN:</h2>
        <p>{fen}</p>

        <h2>Your seed:</h2>
        <p>{mnemonic}</p>
        <BitLengthSelector bitLengths={bitLengths} onChange={setBitLength} />

        <h2>Seed hash:</h2>
        <div className="code-container">
          <code>{seed}</code>
        </div>

        <h2>FEN13:</h2>
        <div className="code-container">
          <code>{fen && fenToBase13(fen)}</code>
        </div>

        <h2>FEN16:</h2>
        <div className="code-container">
          <code>{fen && fenToBase16(fen)}</code>
        </div>

        <hr />

        <div className="code-container">
          <code>{entropy}</code>
        </div>
      </header>
    </div>
  )
}

export default App
