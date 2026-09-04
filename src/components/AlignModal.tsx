import React, { useState } from 'react';
import { UserCheck, Globe, Volume2, Smile, Heart, Check, Sparkles } from 'lucide-react';
import { Language, AIVoice, Mood, UserPreferences } from '../types';

interface AlignModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
}

export const AlignModal: React.FC<AlignModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [lang, setLang] = useState<Language>(preferences.lang);
  const [voice, setVoice] = useState<AIVoice>(preferences.voice);
  const [mood, setMood] = useState<Mood>(preferences.mood);
  const [voiceEnabled, setVoiceEnabled] = useState(preferences.voiceEnabled);

  const isUrdu = lang === 'ur';

  const handleSave = () => {
    const updated: UserPreferences = {
      lang,
      voice,
      mood,
      voiceEnabled,
    };
    try {
      localStorage.setItem('cp_prefs', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    onSavePreferences(updated);
    onClose();
    if (typeof (window as any).__onAlignDone === 'function') {
      const cb = (window as any).__onAlignDone;
      (window as any).__onAlignDone = null;
      cb();
    }
  };

  const handleSkip = () => {
    onClose();
    if (typeof (window as any).__onAlignDone === 'function') {
      const cb = (window as any).__onAlignDone;
      (window as any).__onAlignDone = null;
      cb();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#04231A] border-2 border-[#E3A82B] rounded-3xl p-6 max-w-md w-full text-white shadow-2xl animate-fadeUp">
        {/* Header (Matching Video 0:19) */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#0B4A31]">
          <div className="w-10 h-10 rounded-2xl bg-[#178A52] flex items-center justify-center text-white shadow">
            <UserCheck className="w-5 h-5 text-[#E3A82B]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#FCFAF3] font-sora">
              Let's align the platform to you
            </h3>
            <p className="text-xs text-[#E3A82B] font-urdu leading-tight mt-0.5">
              آپ کے مطابق — آسان، خودکار اور پُرسکون
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Language Selection */}
          <div>
            <label className="text-xs font-bold text-[#E3A82B] mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'زبان کی ترجیح (Primary Language):' : 'Language Priority:'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLang('ur')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  lang === 'ur'
                    ? 'bg-[#178A52] border-[#E3A82B] text-white shadow-md'
                    : 'bg-[#0B4A31] border-[#178A52]/40 text-[#DCEFE4] hover:bg-[#0B4A31]/80'
                }`}
              >
                <span className="font-urdu text-sm">اردو (Urdu-First)</span>
                {lang === 'ur' && <Check className="w-4 h-4 text-[#E3A82B]" />}
              </button>

              <button
                type="button"
                onClick={() => setLang('en')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  lang === 'en'
                    ? 'bg-[#178A52] border-[#E3A82B] text-white shadow-md'
                    : 'bg-[#0B4A31] border-[#178A52]/40 text-[#DCEFE4] hover:bg-[#0B4A31]/80'
                }`}
              >
                <span>English-First</span>
                {lang === 'en' && <Check className="w-4 h-4 text-[#E3A82B]" />}
              </button>
            </div>
          </div>

          {/* AI Voice Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#E3A82B] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'اے آئی گائیڈ آواز (Voice Profile):' : 'AI Voice Profile:'}</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#DCEFE4] cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="accent-[#178A52] rounded"
                />
                <span className="text-[11px]">{isUrdu ? 'آواز فعال رکھیں' : 'Enable Voice'}</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVoice('male')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  voice === 'male'
                    ? 'bg-[#0B4A31] border-[#E3A82B] text-[#FCFAF3]'
                    : 'bg-[#04231A] border-[#178A52]/40 text-[#DCEFE4]/70'
                }`}
              >
                <span>{isUrdu ? 'نرم مردانہ آواز (Soft Male)' : 'Soft Male Voice'}</span>
                {voice === 'male' && <Check className="w-3.5 h-3.5 text-[#E3A82B]" />}
              </button>

              <button
                type="button"
                onClick={() => setVoice('female')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  voice === 'female'
                    ? 'bg-[#0B4A31] border-[#E3A82B] text-[#FCFAF3]'
                    : 'bg-[#04231A] border-[#178A52]/40 text-[#DCEFE4]/70'
                }`}
              >
                <span>{isUrdu ? 'نرم زنانہ آواز (Soft Female)' : 'Soft Female Voice'}</span>
                {voice === 'female' && <Check className="w-3.5 h-3.5 text-[#E3A82B]" />}
              </button>
            </div>
          </div>

          {/* Mood Check-In */}
          <div>
            <label className="text-xs font-bold text-[#E3A82B] mb-2 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'آپ کا موجودہ موڈ / کیفیت (Mood Check-in):' : 'Current Mood Check-in:'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMood('theek')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  mood === 'theek'
                    ? 'bg-[#178A52] border-[#E3A82B] text-white shadow'
                    : 'bg-[#0B4A31] border-[#178A52]/30 text-[#DCEFE4]'
                }`}
              >
                <div className="text-lg mb-1">😊</div>
                <div className="text-xs font-bold">{isUrdu ? 'ٹھیک ہوں' : 'Happy'}</div>
              </button>

              <button
                type="button"
                onClick={() => setMood('normal')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  mood === 'normal'
                    ? 'bg-[#178A52] border-[#E3A82B] text-white shadow'
                    : 'bg-[#0B4A31] border-[#178A52]/30 text-[#DCEFE4]'
                }`}
              >
                <div className="text-lg mb-1">😐</div>
                <div className="text-xs font-bold">{isUrdu ? 'معمول' : 'Normal'}</div>
              </button>

              <button
                type="button"
                onClick={() => setMood('pareshan')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  mood === 'pareshan'
                    ? 'bg-[#C4572D] border-[#F4D58D] text-white shadow animate-pulse'
                    : 'bg-[#0B4A31] border-[#178A52]/30 text-[#DCEFE4]'
                }`}
              >
                <div className="text-lg mb-1">😟</div>
                <div className="text-xs font-bold">{isUrdu ? 'پریشان' : 'Stressed'}</div>
              </button>
            </div>
            {mood === 'pareshan' && (
              <p className="text-[11px] text-[#F4D58D] mt-2 font-urdu bg-[#C4572D]/20 p-2 rounded-lg border border-[#C4572D]/40">
                ❤️ {isUrdu ? 'ہم آپ کے ساتھ ہیں۔ اے آئی گائیڈ آپ کے سوالات کا پرسکون انداز میں جواب دے گا۔' : 'We are with you. The AI guide will provide gentle assistance.'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons (Matching Video 0:19) */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-5 py-3 rounded-xl bg-[#0B4A31] hover:bg-[#178A52]/60 text-[#DCEFE4] text-xs font-bold transition-colors"
          >
            {isUrdu ? 'چھوڑیں (Skip)' : 'Skip'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#178A52] hover:bg-[#178A52]/90 text-white text-xs font-bold font-sora shadow-lg border border-[#E3A82B]/60 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span className="font-urdu text-sm">جاری رکھیں</span>
            <span>•</span>
            <span>Continue</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
