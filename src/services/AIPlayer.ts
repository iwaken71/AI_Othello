import { GameState } from '../models/GameState';
import { Player } from '../models/Player';
import { Position } from '../models/Position';
import { MinimaxAI } from '../ai/MinimaxAI';

export class AIPlayer {
  /**
   * AIの手を計算して返す
   * @param gameState 現在のゲーム状態
   * @param difficulty 難易度 ('easy', 'medium', 'hard')
   * @returns AIの手の位置、またはnull（有効な手がない場合）
   */
  public static getMove(
    gameState: GameState,
    difficulty: string = 'medium'
  ): Promise<Position | null> {
    return new Promise((resolve) => {
      // 難易度に応じた思考時間を設定
      let thinkingTime = 800; // デフォルト
      
      switch(difficulty) {
        case 'easy':
          thinkingTime = 600; // 簡単な難易度では短め
          break;
        case 'medium':
          thinkingTime = 1000; // 中級では少し長め
          break;
        case 'hard':
          thinkingTime = 1500; // 難しい難易度ではさらに長め
          break;
      }
      
      // AIの「思考時間」
      setTimeout(() => {
        const move = MinimaxAI.findBestMove(gameState, difficulty);
        resolve(move);
      }, thinkingTime);
    });
  }

  /**
   * AIが現在のプレイヤーかどうかチェック
   * @param gameState 現在のゲーム状態
   * @param aiPlayer AIのプレイヤー（黒または白）
   * @returns AIのターンかどうか
   */
  public static isAITurn(
    gameState: GameState,
    aiPlayer: Player
  ): boolean {
    // 現在のプレイヤーがAIかつゲーム終了していない場合
    return gameState.currentPlayer === aiPlayer && !gameState.gameOver;
  }
}
