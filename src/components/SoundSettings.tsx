import React, { useState, useEffect } from 'react';
import audioService from '../services/AudioService';
import './SoundSettings.css';

const SoundSettings: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(true);

  useEffect(() => {
    // コンポーネントマウント時にBGMを開始
    if (bgmEnabled) {
      audioService.playBGM();
    }

    // クリーンアップ
    return () => {
      audioService.stopBGM();
    };
  }, []);

  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioService.toggleSound(newState);
    
    // サウンドが無効になったら、BGMも無効にする
    if (!newState) {
      setBgmEnabled(false);
    }
  };

  const handleBgmToggle = () => {
    const newState = !bgmEnabled;
    setBgmEnabled(newState);
    audioService.toggleBGM(newState);
  };

  return (
    <div className="sound-settings">
      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={handleSoundToggle}
          />
          効果音
        </label>
      </div>
      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={bgmEnabled}
            onChange={handleBgmToggle}
            disabled={!soundEnabled}
          />
          BGM
        </label>
      </div>
    </div>
  );
};

export default SoundSettings;
