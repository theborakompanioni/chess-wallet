import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Buffer } from 'buffer'
import * as BIP39 from 'bip39'
import { Chessground } from 'chessground'
import { Api as ChessgroundApi } from 'chessground/api'
import * as cg from 'chessground/types'

import { START_FEN, randomFen, fenToBase13, fenToBase16, fenToSha256 } from './fen'

import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'
import './App.css'

window.Buffer = Buffer

interface BitLength {
  bits: number
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
  }, [onChange, bitLength])

  return (
    <>
      <select className="bitlength-selector" value={bitLength.bits} onChange={_onChange}>
        <>
          {bitLengths.map((it) => {
            return (
              <option key={it.bits} value={it.bits} disabled={!it.enabled}>
                {Math.ceil(it.bits / 11)} words ({it.bits} bits)
              </option>
            )
          })}
        </>
      </select>
    </>
  )
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
    toBitLength(256, false),
  ])[0]
  const [bitLength, setBitLength] = useState<BitLength | null>(null)

  const [initialFen, setInitialFen] = useState<cg.FEN | null>(null)
  const fen = useMemo<cg.FEN | null>(
    () => (changeCounter >= 0 && ground ? ground.getFen() : null),
    [ground, changeCounter]
  )

  const fen16Hash = useMemo(() => fen && fenToSha256(fen), [fen])
  const entropy = useMemo<string | null>(
    () => fen16Hash && bitLength && fen16Hash.substring(fen16Hash.length - bitLength.bits / 4),
    [fen16Hash, bitLength]
  )

  const mnemonic = useMemo<string | null>(() => entropy && BIP39.entropyToMnemonic(entropy), [entropy])
  const words = useMemo<string[] | null>(() => (mnemonic ? mnemonic.split(' ') : null), [mnemonic])
  const seed = useMemo<Buffer | null>(() => (mnemonic ? BIP39.mnemonicToSeedSync(mnemonic) : null), [mnemonic])

  const onChange = useCallback(() => {
    increaseChangeCounter()
  }, [increaseChangeCounter])

  const randomizeFen = () => setInitialFen(randomFen())
  const startFen = () => setInitialFen(START_FEN)

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

    const fen = initialFen || randomFen()
    const configWithFen = { ...config, fen }

    const ground = Chessground(groundRef.current, configWithFen)
    setGround(ground)

    return () => {
      ground.destroy()
    }
  }, [initialFen, groundRef, config])

  return (
    <div className="App min-w-xs">
      <a href="https://github.com/theborakompanioni/chess-wallet">
        <img alt="Fork me on GitHub" title="Fork me on GitHub" src="fork_me.png" id="forkme" />
      </a>
      <header className="App-container">
        <h1>Bitcoin Chess Wallet</h1>
        <div ref={groundRef} style={{ height: '400px', width: '400px' }}></div>

        <div className="mt-1">
          <button type="button" className="btn" onClick={() => randomizeFen()}>
            New
          </button>
          <button type="button" className="btn ml-1" onClick={() => startFen()}>
            Start
          </button>
        </div>

        <div className="mt-1">
          <BitLengthSelector bitLengths={bitLengths} onChange={setBitLength} />
        </div>

        <div className="mt-1">
          <h2>Your seed:</h2>
          <p className="mnemonic mono">
            {words?.map((it, index) => (
              <span key={index} className="mnemonic-word">
                <span className="highlight">{it.substring(0, 4)}</span>
                {it.length > 4 && it.substring(4, it.length)}
                {index === words.length - 1 ? '' : ' '}
              </span>
            ))}
          </p>
        </div>

        <div className={`details-container d-none`}>
          <h2>FEN:</h2>
          <p>{fen}</p>

          <h2>FEN13:</h2>
          <div className="code-container">
            <code>{fen && fenToBase13(fen)}</code>
          </div>

          <h2>FEN16:</h2>
          <div className="code-container">
            <code>{fen && fenToBase16(fen)}</code>
          </div>

          <h2>Entropy:</h2>
          <div className="code-container">
            <code>{entropy}</code>
          </div>

          <h2>Seed:</h2>
          <div className="code-container">
            <code>{seed}</code>
          </div>
        </div>

        <div className="mt-1">
          <h2>Contribute</h2>
          <p>
            Fork me on <a href="https://github.com/theborakompanioni/chess-wallet">GitHub</a>
          </p>
        </div>
      </header>
    </div>
  )
}

export default App
