import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import { tick, startStop, frameRateChange } from './store';

const App = () => {
  const dispatch = useDispatch();
  const { running, frameRate } = useSelector((state) => state.game);

  // Handle game loop
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      dispatch(tick());
    }, frameRate);

    return () => clearInterval(interval);
  }, [running, frameRate, dispatch]);

  const handleStartStop = () => {
    dispatch(startStop());
  };

  const handleFrameRateChange = (e) => {
    dispatch(frameRateChange(Number(e.target.value)));
  };

  return (
    <div className="tv" data-testid="game-root">
      <main className="main">
        <div className="noise">
          <div className="effect">
            <div className="content">
              <div className="stage">
                <GameBoard />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Controls
        running={running}
        frameRate={frameRate}
        onStartStop={handleStartStop}
        onFrameRateChange={handleFrameRateChange}
      />
    </div>
  );
};

export default App;