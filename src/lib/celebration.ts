import confetti from 'canvas-confetti';
import { speechService } from './audio';

export type CelebrationType = 
  | 'entry' 
  | 'achievement' 
  | 'milestone' 
  | 'action'
  | 'report_submitted' 
  | 'citation_issued' 
  | 'rates_published' 
  | 'allotment_granted' 
  | 'waste_reward';

/**
 * Triggers an authentic Pakistan Emerald & Gold celebratory confetti explosion
 * accompanied by rich Web Audio synthesis chime / musical fanfare.
 */
export function triggerCelebration(type: CelebrationType = 'achievement', customTitle?: string): void {
  // 1. Play musical audio fanfare
  if (type === 'entry') {
    speechService.playEnterMusic();
  } else {
    speechService.playCelebrationMusic();
  }

  // 2. Visual Confetti Explosion with Pakistan Sovereign Colors (Emerald, Gold, White, Sage)
  try {
    const emeraldGoldColors = ['#178A52', '#E3A82B', '#04231A', '#F4D58D', '#DCEFE4', '#FFFFFF'];

    if (type === 'entry') {
      // Gentle dual-cannon celebration from bottom corners
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors: emeraldGoldColors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors: emeraldGoldColors,
        zIndex: 9999,
      });
    } else if (type === 'rates_published' || type === 'allotment_granted' || type === 'milestone') {
      // Big prestige burst from center
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: emeraldGoldColors,
        zIndex: 9999,
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 90,
          spread: 80,
          origin: { y: 0.7 },
          colors: emeraldGoldColors,
          zIndex: 9999,
        });
      }, 250);
    } else {
      // Standard task achievement burst
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: emeraldGoldColors,
        zIndex: 9999,
      });
    }
  } catch (err) {
    // Non-blocking if canvas is unavailable
    console.debug('Confetti non-critical catch:', err);
  }

  // 3. Dispatch global achievement event for UI indicators/toasts
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vrf-celebration-triggered', {
      detail: { type, title: customTitle || 'Achievement Unlocked' }
    }));
  }
}
