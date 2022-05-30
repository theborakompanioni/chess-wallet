
import React from 'react';
import Chessground from '@react-chess/chessground';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div style={{ height: '400px', width: '400px' }}>
          <Chessground contained={true} config={{
            movable: {
              free: true
            },
            draggable: {
              enabled: true,
              deleteOnDropOff: true,
            },
            drawable: {
              enabled: true
            }}}/>
        </div>
      </header>
    </div>
  );
}

export default App;
