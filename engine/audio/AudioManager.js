import { Howl } from "howler";
import globals from "../../globals";

class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.currentBgm = null;
  }

  muteSounds() {
    console.log("🔇 AudioManager.muteSounds() called");
    console.log("🔇 Number of sounds to mute:", this.sounds.size);
    for (const [key, sound] of this.sounds.entries()) {
      const currentVolume = sound.volume();
      sound.volume(0);
      console.log(`🔇 Muted ${key}: ${currentVolume} → 0`);
    }
  }

  unmuteSounds() {
    console.log("🔓 AudioManager.unmuteSounds() called");
    console.log("🔓 audioData available:", !!this.audioData);
    console.log("🔓 Number of sounds to unmute:", this.sounds.size);

    if (!this.audioData) {
      console.error("❌ No audioData available for unmuting!");
      return;
    }

    for (const [key, data] of Object.entries(this.audioData)) {
      const sound = this.sounds.get(key);
      if (sound) {
        const currentVolume = sound.volume();
        sound.volume(data.volume);
        console.log(`🔓 Unmuted ${key}: ${currentVolume} → ${data.volume}`);
      } else {
        console.error(`❌ Sound not found for key: ${key}`);
      }
    }
  }

  init(audioData) {
    // console.log("audioData", audioData);
    this.audioData = audioData;
    for (const [key, data] of Object.entries(audioData)) {
      this.sounds.set(
        key,
        new Howl({
          src: [data.src],
          loop: data.loop || false,
          volume: data.volume,
          preload: true,
        })
      );
    }
  }

  playBackgroundMusic(fade = false) {
    if (globals.soundDisabled) return;
    if (this.currentBgm) {
      this.stopBackgroundMusic();
    }
    // console.log("this.sounds", this.sounds);
    const sound = this.sounds.get("bgm");
    console.log("sound", sound);
    if (sound) {
      sound.loop(true);
      sound.play();
      if (fade) {
        sound.fade(0, sound.volume(), 1000);
      }
      this.currentBgm = sound;
    }

    console.log("Playing background music");
  }

  stopBackgroundMusic(fade = false) {
    if (this.currentBgm) {
      if (fade) {
        this.currentBgm.fade(this.currentBgm.volume(), 0, 1000);
      } else {
        this.currentBgm.stop();
      }
      this.currentBgm = null;
    }
  }

  playSFX(key, loop = false) {
    if (globals.soundDisabled) return;
    const sound = this.sounds.get(key);
    if (sound) {
      sound.loop(loop);
      sound.play();
    }

    return sound;
  }

  stopSFX(key, force = true) {
    const sound = this.sounds.get(key);
    if (sound) {
      if (force) {
        sound.stop();
      } else {
        sound.fade(0.5, 0, 1000);
      }
    }
  }

  stopAllSFX() {
    for (const sound of this.sounds.values()) {
      if (this.currentBgm == sound) continue;
      sound.stop();
    }
  }
}

export default new AudioManager();
