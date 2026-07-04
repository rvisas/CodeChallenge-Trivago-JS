import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startStop,
  reset,
  storePattern,
  patternSelected,
  colorChanged,
  frameRateChange,
} from '../store';

const Controls = ({
  running,
  frameRate,
  onStartStop,
  onFrameRateChange,
}) => {
  const dispatch = useDispatch();
  const { color, patterns } = useSelector((state) => state.game);
  const isMouseDown = useRef(false);

  const handleMouseDown = () => {
    isMouseDown.current = true;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const handleMouseLeave = () => {
    isMouseDown.current = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <>
      <nav className="channel" role="group" aria-label="Frame rate control">
        <input
          type="range"
          className="range"
          min="1"
          max="500"
          value={frameRate}
          onChange={(e) => dispatch(frameRateChange(Number(e.target.value)))}
          aria-label="Frame rate"
        />
      </nav>
      <nav className="color" role="group" aria-label="Color selection">
        <button
          type="button"
          className={`color__switch ${color === 1 ? 'color__1--active' : ''} ${color === 2 ? 'color__2--active' : ''} ${color === 3 ? 'color__3--active' : ''}`}
          onClick={() => dispatch(colorChanged())}
          aria-label="Change color"
        ></button>
        <span className="color__1" role="option" aria-selected={color === 1}>
          {color === 1 && '▸'} Blue
        </span>
        <span className="color__2" role="option" aria-selected={color === 2}>
          {color === 2 && '▸'} Orange
        </span>
        <span className="color__3" role="option" aria-selected={color === 3}>
          {color === 3 && '▸'} Red
        </span>
        <span className="on-btn-text">Color</span>
      </nav>
      <nav className="reset" role="group" aria-label="Reset game">
        <button
          type="button"
          onClick={() => dispatch(reset())}
          aria-label="Reset game"
        ></button>
        <span className="on-btn-text">Reset</span>
      </nav>
      <nav className={`power ${running ? 'power--active' : ''}`} role="group" aria-label="Power control">
        <button
          type="button"
          onClick={() => dispatch(startStop())}
          aria-label={running ? 'Stop game' : 'Start game'}
        ></button>
        <span className="on-btn-text">{running ? 'Stop' : 'Power'}</span>
      </nav>
      <nav className="store" role="group" aria-label="Pattern storage">
        <button
          type="button"
          onClick={() => dispatch(storePattern())}
          aria-label="Store current pattern"
        >
          Store
        </button>
        <select
          onChange={(e) => dispatch(patternSelected(Number(e.target.value)))}
          aria-label="Select stored pattern"
        >
          {patterns.map((_, index) => (
            <option key={index} value={index}>
              Pattern {index + 1}
            </option>
          ))}
        </select>
      </nav>
      <footer className="footer" />
    </>
  );
};

export default Controls;