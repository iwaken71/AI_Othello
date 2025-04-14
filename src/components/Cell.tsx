import React from 'react';
import { Player } from '../models/Player';
import './Cell.css';

interface CellProps {
  value: Player;
  row: number;
  col: number;
  isValid: boolean;
  isLastMove: boolean;
  onClick: (row: number, col: number) => void;
}

const Cell: React.FC<CellProps> = ({ value, row, col, isValid, isLastMove, onClick }) => {
  return (
    <div 
      className={`cell ${isValid ? 'valid' : ''} ${isLastMove ? 'last-move' : ''}`}
      onClick={() => onClick(row, col)}
    >
      {value !== Player.None && (
        <div 
          className={`disc ${value === Player.Black ? 'black' : 'white'}`}
        />
      )}
      {isValid && value === Player.None && (
        <div className="valid-marker" />
      )}
    </div>
  );
};

export default Cell;
