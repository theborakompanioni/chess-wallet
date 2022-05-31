import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Buffer } from 'buffer'
import * as BIP39 from 'bip39'
import { Chessground } from 'chessground'
import { Api as ChessgroundApi } from 'chessground/api'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

import { sha256 } from '@noble/hashes/sha256'

import * as utils from './utils'
import './App.css'

window.Buffer = Buffer

export const toSha256 = (data: string): string => {
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

const toFenAlphabetString = (fen: string): string => {
  // A set of one or more consecutive empty squares within a rank is denoted by a digit from "1" to "8", corresponding to the number of squares.
  // This must be translated to the alphabet and replaced with "." * {digit} number of times.
  return [1, 2, 3, 4, 5, 6, 7, 8]
    .reduce((acc, noOfEmptySquares) => {
      return acc.replaceAll(`${noOfEmptySquares}`, Array(noOfEmptySquares).fill('.').join(''))
    }, fen)
    .replaceAll('/', '')
}

const fenToBuffer = (fen: string): Buffer => {
  return Buffer.from(fenToBase16(fen), 'hex')
}

const fenToBase16 = (fen: string): string => {
  const base13String = fenToBase13(fen)
  return utils.convertBaseBigInt(base13String, 13, 16)
}

const fenToBase13 = (fen: string): string => {
  const fenAlphabetString = toFenAlphabetString(fen)

  const base13String = Object.entries(FEN_ALPHABET).reduce((acc, [key, value]) => {
    return acc.replaceAll(key, value)
  }, fenAlphabetString)

  return base13String
}

function App() {
  const groundRef = useRef<HTMLDivElement>(null)
  const [ground, setGround] = useState<ChessgroundApi | null>(null)
  const [changeCounter, setChangeCounter] = useState(0)
  const increaseChangeCounter = useCallback(() => setChangeCounter((current) => current + 1), [])

  const fen = useMemo(() => changeCounter >= 0 && ground?.getFen(), [ground, changeCounter])

  const entropy = useMemo<string | null>(() => (fen && toSha256(fen)) || null, [fen])
  const entropy2 = useMemo<string | null>(() => entropy && entropy.substring(0, 32), [entropy])

  const entropy3 = useMemo<Buffer | null>(() => (fen && fenToBuffer(fen)) || null, [fen])

  //const entropy = useMemo(() => fen && convertBaseBigInt(toSha256(fen), 16, 16), [fen])
  //const mnemonic = useMemo(() => entropy && BIP39.entropyToMnemonic(entropy), [entropy])
  const mnemonic = useMemo(() => entropy2 && BIP39.entropyToMnemonic(entropy2), [entropy2])
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

    const ground = Chessground(groundRef.current, config)
    setGround(ground)

    return () => {
      ground.destroy()
    }
  }, [groundRef, config])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chess Bitcoin wallet</h1>
        <div style={{ height: '400px', width: '400px' }}>
          <div ref={groundRef} style={{ height: '400px', width: '400px' }}></div>
          {/*<ChessgroundReact contained={true} config={{
            movable: {
              free: true
            },
            draggable: {
              enabled: true,
              deleteOnDropOff: true,
            },
            drawable: {
              enabled: true
            }}}/>*/}
        </div>
        <h2>FEN:</h2>
        <p>{fen}</p>
        <h2>Your seed:</h2>
        <p>{mnemonic}</p>
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
        <hr />
        <div className="code-container">
          <code>{entropy2}</code>
        </div>
        <hr />
        <div className="code-container">
          <code>{entropy3?.toString('hex')}</code>
        </div>
      </header>
    </div>
  )
}

export default App
