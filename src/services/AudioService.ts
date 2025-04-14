export class AudioService {
  private static instance: AudioService;
  private bgmAudio: HTMLAudioElement | null = null;
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private isBgmPlaying: boolean = false;
  private isSoundEnabled: boolean = true;

  // シングルトンパターン
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  constructor() {
    this.loadSounds();
  }

  // サウンドファイルの読み込み
  private loadSounds(): void {
    // BGM
    this.bgmAudio = new Audio('/sounds/bgm.mp3');
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.3;

    // 効果音
    const sounds = [
      { name: 'place', file: 'place.mp3', volume: 0.5 },
      { name: 'flip', file: 'flip.mp3', volume: 0.4 },
      { name: 'invalid', file: 'invalid.mp3', volume: 0.4 },
      { name: 'gameOver', file: 'game_over.mp3', volume: 0.5 },
    ];

    sounds.forEach(sound => {
      const audio = new Audio(`/sounds/${sound.file}`);
      audio.volume = sound.volume;
      this.soundEffects.set(sound.name, audio);
    });
  }

  // BGMの再生
  public playBGM(): void {
    if (this.bgmAudio && !this.isBgmPlaying && this.isSoundEnabled) {
      this.bgmAudio.play().catch(error => {
        console.error('BGM playback failed:', error);
      });
      this.isBgmPlaying = true;
    }
  }

  // BGMの停止
  public stopBGM(): void {
    if (this.bgmAudio && this.isBgmPlaying) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.isBgmPlaying = false;
    }
  }

  // 効果音の再生
  public playSoundEffect(name: string): void {
    if (!this.isSoundEnabled) return;

    const sound = this.soundEffects.get(name);
    if (sound) {
      // 再生中の場合はリセットして再生
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error(`Sound effect ${name} playback failed:`, error);
      });
    }
  }

  // すべての音を有効/無効化
  public toggleSound(enabled: boolean): void {
    this.isSoundEnabled = enabled;
    
    if (!enabled) {
      this.stopBGM();
    } else if (this.isBgmPlaying) {
      this.playBGM();
    }
  }

  // BGMの有効/無効化
  public toggleBGM(enabled: boolean): void {
    if (enabled && this.isSoundEnabled) {
      this.playBGM();
    } else {
      this.stopBGM();
    }
  }

  // 現在のBGM状態を取得
  public isBGMPlaying(): boolean {
    return this.isBgmPlaying;
  }

  // 効果音の有効状態を取得
  public isSoundEffectsEnabled(): boolean {
    return this.isSoundEnabled;
  }
}

export default AudioService.getInstance();
