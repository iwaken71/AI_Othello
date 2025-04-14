import { useState, useEffect } from 'react'
import './App.css'
import Board from './components/Board'
import GameInfo from './components/GameInfo'
import { GameState } from './models/GameState'
import { Player } from './models/Player'
import { AIPlayer } from './services/AIPlayer'
import audioService from './services/AudioService'

function App() {
  const [gameState, setGameState] = useState<GameState>(new GameState());
  const [aiEnabled, setAIEnabled] = useState<boolean>(false);
  const [aiPlayer, setAIPlayer] = useState<Player>(Player.White);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string>('');

  // AIのターンの処理
  useEffect(() => {
    if (!aiEnabled || isThinking || gameState.gameOver) return;

    // AIのターンかチェック
    if (gameState.currentPlayer === aiPlayer) {
      setIsThinking(true);
      
      // AIに手を考えさせる
      AIPlayer.getMove(gameState, difficulty).then(move => {
        if (move) {
          // AIが選んだ手を少し遅延して実行
          setTimeout(() => {
            const newGameState = gameState.makeMove(move.row, move.col);
            
            if (newGameState) {
              setGameState(newGameState);
              
              // ゲーム終了チェック
              if (newGameState.gameOver) {
                updateGameResult(newGameState);
              }
            }
            
            setIsThinking(false);
          }, 300); // 石を置くアクションの遅延
        } else {
          // 有効な手がない場合
          setIsThinking(false);
        }
      });
    }
  }, [gameState, aiEnabled, aiPlayer, difficulty, isThinking]);

  // ゲーム終了時の結果を更新
  const updateGameResult = (state: GameState) => {
    if (!state.gameOver) {
      setGameResult('');
      return;
    }
    
    const blackCount = state.getCount(Player.Black);
    const whiteCount = state.getCount(Player.White);
    
    if (blackCount > whiteCount) {
      setGameResult('黒の勝利！');
    } else if (whiteCount > blackCount) {
      setGameResult('白の勝利！');
    } else {
      setGameResult('引き分け！');
    }
  };

  // プレイヤーが手を打った時の処理
  const handlePlayerMove = (row: number, col: number) => {
    if (isThinking) return; // AI思考中は操作を無効化
    
    const newGameState = gameState.makeMove(row, col);
    if (newGameState) {
      setGameState(newGameState);
      
      // ゲーム終了チェック
      if (newGameState.gameOver) {
        updateGameResult(newGameState);
      }
    } else {
      // 無効な手の場合の音
      audioService.playSoundEffect('invalid');
    }
  };

  const handleNewGame = () => {
    setGameState(new GameState());
    setGameResult('');
    setIsThinking(false);
    
    // 新しいゲーム開始時にBGMを開始
    audioService.playBGM();
  };

  const handleAIToggle = (enabled: boolean) => {
    setAIEnabled(enabled);
  };

  const handleDifficultyChange = (level: string) => {
    setDifficulty(level);
  };

  return (
    <div className="app">
      <h1>オセロゲーム</h1>
      <div className="game-container">
        <GameInfo 
        currentPlayer={gameState.currentPlayer}
        blackCount={gameState.getCount(Player.Black)}
        whiteCount={gameState.getCount(Player.White)}
        onNewGame={handleNewGame}
          aiEnabled={aiEnabled}
        onAIToggle={handleAIToggle}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        gameResult={gameResult}
        isThinking={isThinking}
      />
        <Board 
        gameState={gameState}
        onMove={handlePlayerMove}
        isThinking={isThinking}
        />
      </div>
    </div>
  )
}

export default App
