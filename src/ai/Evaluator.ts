import { GameState } from '../models/GameState';
import { Player } from '../models/Player';

export class Evaluator {
  // 盤面の位置評価表（静的評価）
  private static readonly POSITION_WEIGHTS = [
    [100, -10, 11, 6, 6, 11, -10, 100],
    [-10, -20, 1, 2, 2, 1, -20, -10],
    [10, 1, 5, 4, 4, 5, 1, 10],
    [6, 2, 4, 2, 2, 4, 2, 6],
    [6, 2, 4, 2, 2, 4, 2, 6],
    [10, 1, 5, 4, 4, 5, 1, 10],
    [-10, -20, 1, 2, 2, 1, -20, -10],
    [100, -10, 11, 6, 6, 11, -10, 100]
  ];

  // 序盤、中盤、終盤の判定に使用するしきい値
  private static readonly EARLY_GAME_THRESHOLD = 20; // 序盤：石が20個未満
  private static readonly MID_GAME_THRESHOLD = 40;   // 中盤：石が20〜40個
  // 終盤：石が40個以上

  /**
   * ゲームの状態を評価し、スコアを返す
   * @param gameState 評価するゲーム状態
   * @param player 評価するプレイヤー
   * @param difficulty 難易度 ('easy', 'medium', 'hard')
   * @returns プレイヤーにとっての評価値（高いほど有利）
   */
  public static evaluate(
    gameState: GameState,
    player: Player,
    difficulty: string = 'medium'
  ): number {
    const opponent = player === Player.Black ? Player.White : Player.Black;
    
    // 石の総数を取得
    const totalDiscs = gameState.getCount(Player.Black) + gameState.getCount(Player.White);
    
    // ゲームのフェーズを判断
    let phase: 'early' | 'mid' | 'late';
    if (totalDiscs < this.EARLY_GAME_THRESHOLD) {
      phase = 'early';
    } else if (totalDiscs < this.MID_GAME_THRESHOLD) {
      phase = 'mid';
    } else {
      phase = 'late';
    }
    
    // 難易度による評価の調整
    let positionWeight = 1.0;
    let mobilityWeight = 1.0;
    let cornerWeight = 1.0;
    let stabilityWeight = 0.0;
    let discDiffWeight = 0.0;
    
    switch (difficulty) {
      case 'easy':
        // 初級：ほぼランダムに近い選択（位置評価のみで弱く）
        positionWeight = 0.3;
        mobilityWeight = 0.0;
        cornerWeight = 0.2;
        break;
      
      case 'medium':
        // 中級：バランスの良い評価関数
        // フェーズによる重みの調整
        if (phase === 'early') {
          positionWeight = 0.7;
          mobilityWeight = 1.5;
          cornerWeight = 2.0;
          discDiffWeight = 0.0;
        } else if (phase === 'mid') {
          positionWeight = 1.0;
          mobilityWeight = 1.0;
          cornerWeight = 2.0;
          stabilityWeight = 0.5;
          discDiffWeight = 0.5;
        } else { // 終盤
          positionWeight = 0.5;
          mobilityWeight = 0.5;
          cornerWeight = 1.0;
          stabilityWeight = 1.0;
          discDiffWeight = 2.0;
        }
        break;
      
      case 'hard':
        // 上級：より強力な評価関数
        // フェーズによる重みの調整
        if (phase === 'early') {
          positionWeight = 0.5;
          mobilityWeight = 2.0;
          cornerWeight = 3.0;
          stabilityWeight = 0.0;
          discDiffWeight = -0.5; // 石数を少なく保つ
        } else if (phase === 'mid') {
          positionWeight = 1.0;
          mobilityWeight = 1.5;
          cornerWeight = 2.5;
          stabilityWeight = 1.0;
          discDiffWeight = 0.0;
        } else { // 終盤
          positionWeight = 0.5;
          mobilityWeight = 0.5;
          cornerWeight = 1.0;
          stabilityWeight = 1.5;
          discDiffWeight = 3.0;
        }
        break;
    }
    
    // ゲームが終了している場合は最終スコアを返す
    if (gameState.gameOver) {
      const playerCount = gameState.getCount(player);
      const opponentCount = gameState.getCount(opponent);
      
      if (playerCount > opponentCount) {
        return 10000; // 勝利
      } else if (playerCount < opponentCount) {
        return -10000; // 敗北
      } else {
        return 0; // 引き分け
      }
    }
    
    // 位置の評価
    let positionScore = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = gameState.board[row][col];
        if (cell === player) {
          positionScore += this.POSITION_WEIGHTS[row][col];
        } else if (cell === opponent) {
          positionScore -= this.POSITION_WEIGHTS[row][col];
        }
      }
    }
    
    // 機動性（有効な手の数）の評価
    const playerMobility = this.countValidMoves(gameState, player);
    const opponentMobility = this.countValidMoves(gameState, opponent);
    let mobilityScore = 0;
    if (playerMobility + opponentMobility > 0) {
      mobilityScore = 100 * (playerMobility - opponentMobility) / (playerMobility + opponentMobility);
    }
    
    // 角の評価
    const cornerScore = this.evaluateCorners(gameState, player);
    
    // 安定性の評価（上級難易度のみ）
    const stabilityScore = stabilityWeight > 0 ? 
      this.evaluateStability(gameState, player) : 0;
    
    // 石数差の評価
    const playerCount = gameState.getCount(player);
    const opponentCount = gameState.getCount(opponent);
    let discDiffScore = 0;
    if (playerCount + opponentCount > 0) {
      discDiffScore = 100 * (playerCount - opponentCount) / (playerCount + opponentCount);
    }
    
    // 総合評価
    return (
      positionWeight * positionScore +
      mobilityWeight * mobilityScore +
      cornerWeight * cornerScore +
      stabilityWeight * stabilityScore +
      discDiffWeight * discDiffScore
    );
  }

  // プレイヤーが持つ有効な手の数を数える
  private static countValidMoves(gameState: GameState, player: Player): number {
    // 現在のプレイヤーが評価対象のプレイヤーなら、既に計算済みの有効な手を使用
    if (gameState.currentPlayer === player) {
      return gameState.validMoves.length;
    }
    
    // そうでなければ、一時的にゲーム状態をコピーして計算
    const tempGameState = new GameState(
      gameState.board,
      player,
      gameState.gameOver,
      gameState.passCount,
      gameState.lastMove
    );
    
    return tempGameState.validMoves.length;
  }

  // 角の評価
  private static evaluateCorners(gameState: GameState, player: Player): number {
    const opponent = player === Player.Black ? Player.White : Player.Black;
    const corners = [
      [0, 0], [0, 7], [7, 0], [7, 7]
    ];
    
    let playerCorners = 0;
    let opponentCorners = 0;
    
    for (const [row, col] of corners) {
      if (gameState.board[row][col] === player) {
        playerCorners++;
      } else if (gameState.board[row][col] === opponent) {
        opponentCorners++;
      }
    }
    
    if (playerCorners + opponentCorners === 0) {
      return 0;
    }
    
    return 100 * (playerCorners - opponentCorners) / (playerCorners + opponentCorners);
  }

  // 安定性の評価（取られない石の数）
  private static evaluateStability(gameState: GameState, player: Player): number {
    const opponent = player === Player.Black ? Player.White : Player.Black;
    
    let playerStable = 0;
    let opponentStable = 0;
    
    // 安定した石の判定（単純な実装）
    // 角、および角から連続した石を安定した石とみなす
    const stableDiscs = this.findStableDiscs(gameState);
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (stableDiscs[row][col]) {
          if (gameState.board[row][col] === player) {
            playerStable++;
          } else if (gameState.board[row][col] === opponent) {
            opponentStable++;
          }
        }
      }
    }
    
    if (playerStable + opponentStable === 0) {
      return 0;
    }
    
    return 100 * (playerStable - opponentStable) / (playerStable + opponentStable);
  }

  // 安定した石（取られない石）を見つける
  private static findStableDiscs(gameState: GameState): boolean[][] {
    const stableDiscs = Array(8).fill(null).map(() => Array(8).fill(false));
    
    // 角は常に安定
    const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
    for (const [row, col] of corners) {
      if (gameState.board[row][col] !== Player.None) {
        stableDiscs[row][col] = true;
      }
    }
    
    // 安定した石から連続して同じ色の石も安定
    let changed = true;
    while (changed) {
      changed = false;
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (gameState.board[row][col] !== Player.None && !stableDiscs[row][col]) {
            // 全方向に安定性を確認
            if (this.isStableDirection(gameState, stableDiscs, row, col)) {
              stableDiscs[row][col] = true;
              changed = true;
            }
          }
        }
      }
    }
    
    return stableDiscs;
  }

  // 特定の位置の石が安定しているか方向ごとに確認
  private static isStableDirection(
    gameState: GameState,
    stableDiscs: boolean[][],
    row: number,
    col: number
  ): boolean {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    // 各方向のペアで安定性を確認
    for (let d = 0; d < 4; d++) {
      const dir1 = directions[d];
      const dir2 = directions[d + 4];
      
      const stable1 = this.isStableInLine(gameState, stableDiscs, row, col, dir1[0], dir1[1]);
      const stable2 = this.isStableInLine(gameState, stableDiscs, row, col, dir2[0], dir2[1]);
      
      if (!stable1 && !stable2) {
        return false;
      }
    }
    
    return true;
  }

  // 特定の方向に安定性があるか確認
  private static isStableInLine(
    gameState: GameState,
    stableDiscs: boolean[][],
    row: number,
    col: number,
    dRow: number,
    dCol: number
  ): boolean {
    const player = gameState.board[row][col];
    
    // 端に到達するまたは安定した石に到達
    let r = row + dRow;
    let c = col + dCol;
    
    if (!gameState.isValidPosition(r, c)) {
      return true; // 端に到達
    }
    
    return stableDiscs[r][c] && gameState.board[r][c] === player;
  }
}
