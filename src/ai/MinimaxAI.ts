import { GameState } from '../models/GameState';
import { Player } from '../models/Player';
import { Position } from '../models/Position';
import { Evaluator } from './Evaluator';

export class MinimaxAI {
  // 探索の深さ（難易度別）
  private static readonly DEPTH_MAP = {
    easy: 2,
    medium: 4,
    hard: 6
  };

  // 探索時間の上限（ミリ秒）
  private static readonly TIME_LIMIT = 3000;

  /**
   * AIの手を計算する
   * @param gameState 現在のゲーム状態
   * @param difficulty 難易度 ('easy', 'medium', 'hard')
   * @returns 最適な手の位置（見つからない場合はnull）
   */
  public static findBestMove(
    gameState: GameState,
    difficulty: string = 'medium'
  ): Position | null {
    // 有効な手がない場合
    if (gameState.validMoves.length === 0) {
      return null;
    }
    
    // 有効な手が1つしかない場合はそれを返す
    if (gameState.validMoves.length === 1) {
      return gameState.validMoves[0];
    }
    
    // 残りの石の数
    const totalDiscs = gameState.getCount(Player.Black) + gameState.getCount(Player.White);
    const remainingDiscs = 64 - totalDiscs;
    
    // 終盤では深さを増やす（より深く読む）
    let depth = this.DEPTH_MAP[difficulty as keyof typeof this.DEPTH_MAP] || this.DEPTH_MAP.medium;
    
    // 残り石が少ない場合は終局まで読む
    if (remainingDiscs <= depth * 2) {
      depth = remainingDiscs;
    }
    
    // 探索の開始時間
    const startTime = Date.now();
    
    // 初期値設定
    let bestScore = -Infinity;
    let bestMove: Position | null = null;
    
    // アルファベータ探索
    for (const move of gameState.validMoves) {
      // この手を実行した新しいゲーム状態を取得
      const newGameState = gameState.makeMove(move.row, move.col);
      
      if (newGameState) {
        // ミニマックス探索を実行
        const score = this.minimax(
          newGameState,
          depth - 1,
          -Infinity,
          Infinity,
          false,
          gameState.currentPlayer,
          difficulty,
          startTime
        );
        
        // より良いスコアが見つかった場合は更新
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      
      // 時間制限をチェック
      if (Date.now() - startTime > this.TIME_LIMIT) {
        console.log('AI thinking time limit reached');
        break;
      }
    }
    
    return bestMove;
  }

  /**
   * ミニマックスアルゴリズム（アルファベータ枝刈り付き）
   * @param gameState 評価するゲーム状態
   * @param depth 残りの探索深さ
   * @param alpha アルファ値
   * @param beta ベータ値
   * @param isMaximizing 最大化プレイヤーか
   * @param player AIプレイヤー
   * @param difficulty 難易度
   * @param startTime 探索開始時間
   * @returns 評価値
   */
  private static minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    player: Player,
    difficulty: string,
    startTime: number
  ): number {
    // 探索時間の制限をチェック
    if (Date.now() - startTime > this.TIME_LIMIT) {
      return isMaximizing ? -Infinity : Infinity;
    }
    
    // 終了条件：深さ0に達した場合、または終了状態
    if (depth === 0 || gameState.gameOver) {
      return Evaluator.evaluate(gameState, player, difficulty);
    }
    
    // 有効な手がない場合はパスする
    if (gameState.validMoves.length === 0) {
      // 現在のプレイヤーを交代して再帰的に評価
      const tempGameState = new GameState(
        gameState.board,
        gameState.currentPlayer === Player.Black ? Player.White : Player.Black,
        gameState.gameOver,
        gameState.passCount + 1,
        gameState.lastMove
      );
      
      return this.minimax(
        tempGameState,
        depth - 1,
        alpha,
        beta,
        !isMaximizing,
        player,
        difficulty,
        startTime
      );
    }
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      
      for (const move of gameState.validMoves) {
        const newGameState = gameState.makeMove(move.row, move.col);
        
        if (newGameState) {
          const score = this.minimax(
            newGameState,
            depth - 1,
            alpha,
            beta,
            false,
            player,
            difficulty,
            startTime
          );
          
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          
          // アルファベータ枝刈り
          if (beta <= alpha) {
            break;
          }
        }
      }
      
      return maxScore;
    } else {
      let minScore = Infinity;
      
      for (const move of gameState.validMoves) {
        const newGameState = gameState.makeMove(move.row, move.col);
        
        if (newGameState) {
          const score = this.minimax(
            newGameState,
            depth - 1,
            alpha,
            beta,
            true,
            player,
            difficulty,
            startTime
          );
          
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          
          // アルファベータ枝刈り
          if (beta <= alpha) {
            break;
          }
        }
      }
      
      return minScore;
    }
  }
}
