import { Player, getOpponent } from './Player';
import { Position, DIRECTIONS } from './Position';

export class GameState {
  board: Player[][];
  currentPlayer: Player;
  gameOver: boolean;
  passCount: number;
  lastMove: Position | null;
  validMoves: Position[];

  constructor(
    board?: Player[][],
    currentPlayer?: Player,
    gameOver?: boolean,
    passCount?: number,
    lastMove?: Position | null
  ) {
    // デフォルト値または渡された値で初期化
    this.board = board ? this.cloneBoard(board) : this.createInitialBoard();
    this.currentPlayer = currentPlayer || Player.Black;
    this.gameOver = gameOver || false;
    this.passCount = passCount || 0;
    this.lastMove = lastMove || null;
    
    // 有効な手を計算
    this.validMoves = this.calculateValidMoves();
  }

  // 初期ボードを作成
  private createInitialBoard(): Player[][] {
    const board = Array(8).fill(null).map(() => Array(8).fill(Player.None));
    
    // 初期配置（中央の4マス）
    board[3][3] = Player.White;
    board[3][4] = Player.Black;
    board[4][3] = Player.Black;
    board[4][4] = Player.White;
    
    return board;
  }

  // ボードの深いコピーを作成
  private cloneBoard(board: Player[][]): Player[][] {
    return board.map(row => [...row]);
  }

  // 指定した位置が盤面の範囲内かチェック
  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  // 指定した位置に石を置けるかチェック
  canPlaceAt(row: number, col: number, player: Player): boolean {
    // すでに石がある場合は置けない
    if (this.board[row][col] !== Player.None) return false;

    // 8方向にチェック
    return DIRECTIONS.some(dir => {
      return this.wouldFlip(row, col, dir.row, dir.col, player).length > 0;
    });
  }

  // 特定の方向に反転する石を探す
  wouldFlip(row: number, col: number, dRow: number, dCol: number, player: Player): Position[] {
    const opponent = getOpponent(player);
    const flips: Position[] = [];
    
    let r = row + dRow;
    let c = col + dCol;
    
    // 隣が相手の石でなければ反転なし
    if (!this.isValidPosition(r, c) || this.board[r][c] !== opponent) {
      return [];
    }
    
    // 相手の石を記録しながら進む
    flips.push(new Position(r, c));
    
    while (true) {
      r += dRow;
      c += dCol;
      
      // 盤外に出たら反転なし
      if (!this.isValidPosition(r, c)) {
        return [];
      }
      
      // 空のマスがあれば反転なし
      if (this.board[r][c] === Player.None) {
        return [];
      }
      
      // 自分の石があれば、ここまでの石を反転
      if (this.board[r][c] === player) {
        return flips;
      }
      
      // 相手の石を記録
      flips.push(new Position(r, c));
    }
  }

  // 有効な手を計算
  calculateValidMoves(): Position[] {
    const moves: Position[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.canPlaceAt(row, col, this.currentPlayer)) {
          moves.push(new Position(row, col));
        }
      }
    }
    
    return moves;
  }

  // 手を実行し、新しいゲーム状態を返す
  makeMove(row: number, col: number): GameState | null {
    // 既に終了している場合
    if (this.gameOver) return null;
    
    // 無効な位置の場合
    if (!this.isValidPosition(row, col)) return null;
    
    // 有効な手でない場合
    if (!this.validMoves.some(move => move.row === row && move.col === col)) {
      return null;
    }
    
    // 新しいボードを作成
    const newBoard = this.cloneBoard(this.board);
    newBoard[row][col] = this.currentPlayer;
    
    // すべての方向について石を反転
    let flipped = false;
    DIRECTIONS.forEach(dir => {
      const flips = this.wouldFlip(row, col, dir.row, dir.col, this.currentPlayer);
      if (flips.length > 0) {
        flipped = true;
        flips.forEach(pos => {
          newBoard[pos.row][pos.col] = this.currentPlayer;
        });
      }
    });
    
    // 次のプレイヤー
    const nextPlayer = getOpponent(this.currentPlayer);
    
    // 新しいゲーム状態を作成
    const newGameState = new GameState(
      newBoard,
      nextPlayer,
      false,
      0,
      new Position(row, col)
    );
    
    // 次のプレイヤーに有効な手がない場合
    if (newGameState.validMoves.length === 0) {
      // 現在のプレイヤーが再び手番になる
      newGameState.currentPlayer = this.currentPlayer;
      newGameState.passCount = this.passCount + 1;
      
      // 再計算
      newGameState.validMoves = newGameState.calculateValidMoves();
      
      // 両方のプレイヤーがパスした場合、ゲーム終了
      if (newGameState.validMoves.length === 0 || newGameState.passCount >= 2) {
        newGameState.gameOver = true;
      }
    }
    
    return newGameState;
  }

  // 特定のプレイヤーの石の数を取得
  getCount(player: Player): number {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === player) {
          count++;
        }
      }
    }
    return count;
  }

  // 勝者を取得
  getWinner(): Player | null {
    if (!this.gameOver) return null;
    
    const blackCount = this.getCount(Player.Black);
    const whiteCount = this.getCount(Player.White);
    
    if (blackCount > whiteCount) return Player.Black;
    if (whiteCount > blackCount) return Player.White;
    return null; // 引き分け
  }
}
