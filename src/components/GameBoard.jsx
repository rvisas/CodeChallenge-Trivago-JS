import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { cellsSelected, colorChanged } from '../store';

const GameBoard = () => {
  const dispatch = useDispatch();
  const { matrix, columns, rows, color, colorMap } = useSelector(
    (state) => state.game
  );

  // Create color class map
  const colorClasses = useMemo(
    () => ({
      1: 'cell--color-1', // Blue
      2: 'cell--color-2', // Orange
      3: 'cell--color-3', // Red
    }),
    []
  );

  const handleCellMouseDown = (x, y) => {
    dispatch(cellsSelected([x, y]));
  };

  const handleCellMouseEnter = (x, y) => {
    // For drawing while dragging
    // We'll use a ref to track if mouse is down
  };

  return (
    <div className="grid-container" role="grid" aria-label="Game of Life grid">
      {matrix.map((col, x) =>
        col.map((cell, y) => {
          const isActive = cell[0] === 1;
          const cellColor = cell[1];
          const key = `x${x}y${y}`;

          return (
            <div
              key={key}
              id={key}
              className={`cell ${isActive ? colorClasses[cellColor] : ''}`}
              onMouseDown={() => handleCellMouseDown(x, y)}
              onMouseEnter={() => {
                // Handle drag drawing - we check if mouse is down via event.buttons
                // This is a simplified approach
              }}
              role="gridcell"
              aria-label={`Cell at ${x}, ${y} - ${isActive ? 'alive' : 'dead'}`}
            />
          );
        })
      )}
    </div>
  );
};

export default GameBoard;