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
      // 短い遅延を入れて、AIが「考えている」ように見せる
      setTimeout(() => {
        const move = MinimaxAI.findBestMove(gameState, difficulty);
        resolve(move);
      }, 500);
    });
  }

  /**
   * AIが現在のプレイヤーなら手を打つ
   * @param gameState 現在のゲーム状態
   * @param aiPlayer AIのプレイヤー（黒または白）
   * @param difficulty 難易度
   * @param callback AIが手を打った後に呼び出されるコールバック関数
   */
  public static async makeMove(
    gameState: GameState,
    aiPlayer: Player,
    difficulty: string,
    callback: (newGameState: GameState | null) => void
  ): Promise<void> {
    // 現在のプレイヤーがAIでない場合は何もしない
    if (gameState.currentPlayer !== aiPlayer) {
      callback(null);
      return;
    }
    
    // ゲーム終了している場合は何もしない
    if (gameState.gameOver) {
      callback(null);
      return;
    }
    
    // AIの手を取得
    const move = await this.getMove(gameState, difficulty);
    
    if (move) {
      // 手を実行
      const newGameState = gameState.makeMove(move.row, move.col);
      callback(newGameState);
    } else {
      // 有効な手がない場合はパス
      callback(null);
    }
  }
}
