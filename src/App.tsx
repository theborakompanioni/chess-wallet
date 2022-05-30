
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Buffer } from 'buffer'
import * as BIP39 from 'bip39'
import { Chessground } from 'chessground'
import { Api as ChessgroundApi } from 'chessground/api'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

import { sha256 } from '@noble/hashes/sha256'

import './App.css';

window.Buffer = Buffer

export const toSha256 = (data: string): string => {
  let eventHash = sha256.create()
    .update(Buffer.from(data))
    .digest()
  return Buffer.from(eventHash).toString('hex')
}


function App() {
  const groundRef = useRef<HTMLDivElement>(null)
  const [ground, setGround] = useState<ChessgroundApi | null>(null)
  const [changeCounter, setChangeCounter] = useState(0)
  const increaseChangeCounter = useCallback(() => setChangeCounter((current) => current + 1), [])

  const fen = useMemo(() => changeCounter >= 0 && ground?.getFen(), [ground, changeCounter])

  const entropy = useMemo(() => fen && toSha256(fen), [fen])
  const mnemonic = useMemo(() => entropy && BIP39.entropyToMnemonic(entropy), [entropy])

  const onChange = useCallback(() => {
    increaseChangeCounter()
  }, [increaseChangeCounter])

  const config = useMemo(() => ({
    movable: {
      free: true
    },
    draggable: {
      enabled: true,
      deleteOnDropOff: true,
    },
    drawable: {
      enabled: true
    },
    events: {
      change: onChange
    }
  }), [onChange])

  useEffect(() => {
    if (!groundRef || !groundRef.current) return

    const ground = Chessground(groundRef.current, config);
    setGround(ground)

    return () => {
      ground.destroy()
    }
  }, [groundRef, config])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {fen}
        </p>
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
        <p>
          {entropy}
        </p>
        <p>
          {mnemonic}
        </p>
      </header>
    </div>
  );
}

export default App;
