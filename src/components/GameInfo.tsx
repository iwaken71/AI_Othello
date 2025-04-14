import React from 'react';
import { Player } from '../models/Player';
import SoundSettings from './SoundSettings';
import './GameInfo.css';

interface GameInfoProps {
  currentPlayer: Player;
  blackCount: number;
  whiteCount: number;
  onNewGame: () => void;
  aiEnabled?: boolean;
  onAIToggle?: (enabled: boolean) => void;
  difficulty?: string;
  onDifficultyChange?: (level: string) => void;
  gameResult?: string;
  isThinking?: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({
  currentPlayer,
  blackCount,
  whiteCount,
  onNewGame,
  aiEnabled = false,
  onAIToggle,
  difficulty = 'medium',
  onDifficultyChange,
  gameResult = '',
  isThinking = false
}) => {
  const getPlayerName = (player: Player): string => {
    switch (player) {
      case Player.Black:
        return '黒';
      case Player.White:
        return '白';
      default:
        return '';
    }
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onDifficultyChange) {
      onDifficultyChange(e.target.value);
    }
  };

  const handleAiModeToggle = () => {
    if (onAIToggle) {
      onAIToggle(!aiEnabled);
    }
  };

  return (
    <div className="game-info">
      <h2>ゲーム情報</h2>
      
      <div className="score-container">
        <div className="score black-score">
          <div className="disc-sample black"></div>
          <span>{blackCount}</span>
        </div>
        <div className="score white-score">
          <div className="disc-sample white"></div>
          <span>{whiteCount}</span>
        </div>
      </div>
      
      <div className="current-player">
        <p>現在の手番: <strong>{getPlayerName(currentPlayer)}</strong></p>
        {/* 固定高さのステータス表示コンテナ */}
        <div className="status-container">
          {isThinking ? (
            <p className="thinking">AIが考え中...</p>
          ) : gameResult ? (
            <p className="game-result">{gameResult}</p>
          ) : (
            <div className="status-placeholder"></div>
          )}
        </div>
      </div>
      
      <div className="ai-settings">
        <div className="setting">
          <label>
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={handleAiModeToggle}
            />
            AIと対戦
          </label>
        </div>
        
        {aiEnabled && (
          <div className="setting">
            <label>
              難易度:
              <select value={difficulty} onChange={handleDifficultyChange}>
                <option value="easy">初級</option>
                <option value="medium">中級</option>
                <option value="hard">上級</option>
              </select>
            </label>
          </div>
        )}
      </div>
      
      <SoundSettings />

      <button className="new-game-button" onClick={onNewGame}>
        新しいゲーム
      </button>
    </div>
  );
};

export default GameInfo;
