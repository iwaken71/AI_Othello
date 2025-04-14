import React from 'react';
import { GameState } from '../models/GameState';
import { Position } from '../models/Position';
import Cell from './Cell';
import './Board.css';

interface BoardProps {
  gameState: GameState;
  onMove: (row: number, col: number) => void;
  isThinking?: boolean;
}

const Board: React.FC<BoardProps> = ({ gameState, onMove, isThinking = false }) => {
  // 有効な手であるかをチェックする関数
  const isValidMove = (row: number, col: number): boolean => {
    return gameState.validMoves.some(
      move => move.row === row && move.col === col
    );
  };

  // 最後に置かれた石の位置かをチェックする関数
  const isLastMove = (row: number, col: number): boolean => {
    return (
      gameState.lastMove !== null &&
      gameState.lastMove.row === row &&
      gameState.lastMove.col === col
    );
  };

  return (
    <div className="board-wrapper">
      <div className="board">
        {/* 行と列の表示 */}
        <div className="board-labels">
          <div className="corner"></div>
          {[...Array(8)].map((_, i) => (
            <div key={`col-${i}`} className="column-label">{String.fromCharCode(65 + i)}</div>
          ))}
        </div>
        
        {/* ボード */}
        <div className="board-grid">
          {gameState.board.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="board-row">
              <div className="row-label">{rowIndex + 1}</div>
              {row.map((cell, colIndex) => (
                <Cell
                  key={`cell-${rowIndex}-${colIndex}`}
                  value={cell}
                  row={rowIndex}
                  col={colIndex}
                  isValid={isValidMove(rowIndex, colIndex) && !gameState.gameOver}
                  isLastMove={isLastMove(rowIndex, colIndex)}
                  onClick={(r, c) => {
                    if (!gameState.gameOver) {
                      onMove(r, c);
                    }
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
