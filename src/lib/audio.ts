// Web Speech API Text-To-Speech and Audio Confirmation Helper
// Supports authentic natural Urdu (ur-PK) with local Pakistani humane inflection and executive English (en-US)

export interface SpeakOptions {
  lang?: 'ur' | 'en';
  voiceGender?: 'male' | 'female';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private isSpeakingState = false;
  private isMutedState = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Load voices into cache immediately
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.synth?.getVoices();
        };
      }
    }
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  // Play pleasant subtle chime/beep before speech confirmation or on action completion
  public playChime(type: 'success' | 'alert' | 'complete' | 'empathy' | 'citation' | 'scan' | 'beep' | 'action' = 'success'): void {
    if (this.isMutedState) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'complete') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.29);
      } else if (type === 'empathy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.00, now); // G4
        osc.frequency.exponentialRampToValueAtTime(493.88, now + 0.10); // B4
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.20); // D5
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.39);
      } else if (type === 'citation') {
        // Authoritative dual-tone regulatory cue
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(493.88, now + 0.09); // B4
        osc.frequency.setValueAtTime(415.30, now + 0.18); // G#4
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'scan') {
        // Modern scanner frequency sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.14); // A5
        gain.gain.setValueAtTime(0.10, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'beep') {
        // Quick subtle UI beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, now); // G5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'action') {
        // Soft double action ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(349.23, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.29);
      }
    } catch {
      // AudioContext failure is non-blocking
    }
  }

  // Musical Fanfare & Celebration Chimes for platform entry & achievements
  public playCelebrationMusic(): void {
    if (this.isMutedState) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      // Uplifting arpeggio melody: C5, E5, G5, B5, C6, G5, C6
      const notes = [
        { f: 523.25, t: 0.00, d: 0.12 }, // C5
        { f: 659.25, t: 0.09, d: 0.12 }, // E5
        { f: 783.99, t: 0.18, d: 0.14 }, // G5
        { f: 987.77, t: 0.27, d: 0.14 }, // B5
        { f: 1046.50, t: 0.36, d: 0.45 }, // C6
        { f: 1318.51, t: 0.48, d: 0.55 }, // E6 harmonic crest
      ];

      notes.forEach(note => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        gain.gain.setValueAtTime(0.001, now + note.t);
        gain.gain.linearRampToValueAtTime(0.14, now + note.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.d + 0.05);
      });
    } catch {
      // Non-blocking
    }
  }

  // Soft Inspiring Entry Music Chord
  public playEnterMusic(): void {
    if (this.isMutedState) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      // Warm layered welcoming chord: C4, G4, C5, E5
      const chordFrequencies = [261.63, 392.00, 523.25, 659.25];

      chordFrequencies.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.04 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

        osc.start(now + idx * 0.04);
        osc.stop(now + 0.8);
      });
    } catch {
      // Non-blocking
    }
  }

  public isAvailable(): boolean {
    return this.synth !== null;
  }

  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (this.isMutedState) {
      this.stop();
    }
    return this.isMutedState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState && (this.synth?.speaking ?? false);
  }

  /**
   * Pre-process Urdu text for speech synthesizers so numbers, symbols,
   * and administrative terms sound completely natural like a Pakistani local speaker.
   */
  private normalizeUrduForSpeech(text: string): string {
    return text
      .replace(/[*_#`~[\]()|]/g, ' ')
      .replace(/±3%/g, 'تین فیصد کم یا زیادہ')
      .replace(/±3/g, 'تین فیصد')
      .replace(/3%/g, 'تین فیصد')
      .replace(/%/g, ' فیصد ')
      .replace(/DC/gi, 'ڈی سی')
      .replace(/QR/gi, 'کیو آر')
      .replace(/ETA/gi, 'متوقع وقت')
      .replace(/PKR|Rs\.?/gi, 'روپے')
      .replace(/VRF\s*2026/gi, 'وینڈر ریگولیشن فریم ورک دو ہزار چھبیس')
      .replace(/CNIC/gi, 'شناختی کارڈ')
      .replace(/PERA/gi, 'پیرہ')
      .replace(/GPS/gi, 'جی پی ایس')
      .replace(/KPI/gi, 'کارکردگی')
      .replace(/ID\s*([0-9A-Za-z-]+)/gi, 'آئی ڈی $1')
      .replace(/(\d+)\s*kg/gi, '$1 کلو')
      .replace(/(\d+)\s*min/gi, '$1 منٹ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public speak(text: string, options: SpeakOptions = {}): void {
    if (!this.synth || this.isMutedState) {
      return;
    }

    this.stop();

    if (!text || text.trim() === '') return;

    const lang = options.lang || 'ur';
    const isUrdu = lang === 'ur';

    // Normalize text according to language
    const preparedText = isUrdu 
      ? this.normalizeUrduForSpeech(text)
      : text.replace(/[*_#`~[\]()|]/g, ' ').replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(preparedText);
    utterance.lang = isUrdu ? 'ur-PK' : 'en-US';
    
    // Voice preferences: warm, calm, humanized tone
    const gender = options.voiceGender || 'male';
    const basePitch = gender === 'female' ? 1.08 : 0.94;
    const baseRate = isUrdu ? 0.88 : 0.96; // slightly relaxed rate for natural Urdu cadence

    utterance.pitch = options.pitch ?? basePitch;
    utterance.rate = options.rate ?? baseRate;

    // Intelligent voice matching across platforms (Windows, Mac, Android, iOS, Chrome)
    const voices = this.synth.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (isUrdu) {
      // 1. Direct Pakistan / Urdu voices
      selectedVoice = voices.find(v => 
        (v.lang.toLowerCase().includes('ur-pk') || v.lang.toLowerCase() === 'ur_pk') &&
        (gender === 'female' ? !v.name.toLowerCase().includes('male') : true)
      );

      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('ur') || 
          v.name.toLowerCase().includes('urdu') || 
          v.name.toLowerCase().includes('pakistan') ||
          v.name.toLowerCase().includes('asad') ||
          v.name.toLowerCase().includes('gul') ||
          v.name.toLowerCase().includes('uzma')
        );
      }

      // 2. High-quality South Asian accent fallbacks if browser lacks dedicated ur-PK voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.toLowerCase().includes('hi-in') || 
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('india')
        );
      }
    } else {
      // English Voice
      selectedVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('en') && 
        (gender === 'female' 
          ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('natural')
          : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('george'))
      );
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      options.onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      options.onError?.();
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis non-fatal exception:', err);
      this.isSpeakingState = false;
    }
  }

  /**
   * Humane, local Urdu audio confirmation when a citizen submits a report
   */
  public confirmReportSubmission(lang: 'ur' | 'en', reportId: string, item: string, marketName?: string): void {
    this.playChime('empathy');
    
    const textUrdu = `السلام علیکم محترم شہری! آپ کی آواز سن لی گئی ہے۔ آپ کی شکایت برائے ${item} کامیابی کے ساتھ درج ہو چکی ہے۔ رپورٹ نمبر ہے: ${reportId}۔ آپ کی شناخت سو فیصد محفوظ اور گمنام ہے۔ ہمارا فیلڈ اسکواڈ قریباً نو منٹ کے اندر معائنے کے لیے روانہ ہو چکا ہے۔ انصاف میں تعاون کا بہت شکریہ۔`;
    
    const textEn = `Assalam-o-Alaikum! Your voice has been heard. Your report for ${item} is registered under ID ${reportId}. Your identity is 100% anonymous and protected. The nearest Price Magistrate patrol squad has been dispatched with an estimated ETA of 9 minutes. Thank you for safeguarding our community!`;

    setTimeout(() => {
      this.speak(lang === 'ur' ? textUrdu : textEn, {
        lang,
        voiceGender: 'female',
        rate: lang === 'ur' ? 0.88 : 0.96,
      });
    }, 250);
  }

  /**
   * Audio confirmation when an inspector completes a field patrol checkpoint task
   */
  public confirmTaskCompletion(lang: 'ur' | 'en', taskTitle: string, isCompleted: boolean): void {
    this.playChime('complete');

    const textUrdu = isCompleted
      ? `پیٹرول ٹاسک: ${taskTitle} مکمل ہو گیا۔ سنٹرل کمانڈ کو آپ کی فیلڈ تصدیق بروقت موصول ہو گئی ہے۔`
      : `چیک پوائنٹ دوبارہ فعال کر دیا گیا ہے۔`;

    const textEn = isCompleted
      ? `Patrol task ${taskTitle} marked as completed. Central Command has received your live field confirmation.`
      : `Checkpoint marked as pending.`;

    setTimeout(() => {
      this.speak(lang === 'ur' ? textUrdu : textEn, {
        lang,
        voiceGender: 'male',
        rate: lang === 'ur' ? 0.90 : 1.0,
      });
    }, 200);
  }

  /**
   * Audio confirmation when an inspector issues a digital citation / challan
   */
  public confirmChallanIssued(lang: 'ur' | 'en', challanId: string, vendorName: string, fine: number): void {
    this.playChime('citation');

    const textUrdu = `ڈیجیٹل چالان نمبر ${challanId} دکاندار ${vendorName} کے خلاف درج ہو گیا۔ چالان رقم ${fine} روپے ریکارڈ ہو چکی ہے۔ دکاندار کو تین دن میں ڈی سی کاؤنٹر پر اپیل کا حق حاصل ہے۔`;
    
    const textEn = `Digital citation ${challanId} for vendor ${vendorName} has been logged with fine amount ${fine} Rupees. The vendor has 3 days for administrative appeal.`;

    setTimeout(() => {
      this.speak(lang === 'ur' ? textUrdu : textEn, {
        lang,
        voiceGender: 'male',
        rate: lang === 'ur' ? 0.90 : 1.0,
      });
    }, 200);
  }

  /**
   * Audio confirmation when vendor checks in for shift or completes waste task
   */
  public confirmVendorAction(lang: 'ur' | 'en', messageUrdu: string, messageEn: string): void {
    this.playChime('success');
    setTimeout(() => {
      this.speak(lang === 'ur' ? messageUrdu : messageEn, {
        lang,
        voiceGender: 'female',
        rate: lang === 'ur' ? 0.88 : 0.96,
      });
    }, 200);
  }
}

export const speechService = new SpeechManager();


