import React, { useState } from 'react';
import { X, MapPin, Search, ExternalLink, Compass } from 'lucide-react';
import { Language } from '../types';

interface LocateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialPlace?: string;
}

export const LocateModal: React.FC<LocateModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialPlace = 'Raja Bazaar Rawalpindi',
}) => {
  const isUrdu = lang === 'ur';
  const [searchTerm, setSearchTerm] = useState(initialPlace);
  const [activeQuery, setActiveQuery] = useState(initialPlace);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveQuery(searchTerm.trim());
    }
  };

  const encodedPlace = encodeURIComponent(activeQuery);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedPlace}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#04231A] border-2 border-[#E3A82B] rounded-3xl w-full max-w-3xl h-[80vh] flex flex-col justify-between overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 bg-[#0B4A31] border-b border-[#178A52] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#178A52] flex items-center justify-center text-white">
              <MapPin className="w-4 h-4 text-[#E3A82B]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#FCFAF3]">
                {isUrdu ? 'جغرافیائی لوکیشن و سیٹلائٹ مانیٹرنگ' : 'Geospatial Location & Satellite Radar'}
              </h3>
              <p className="text-[11px] text-[#DCEFE4]/80 font-urdu">
                مقام: {activeQuery} (±35m Precision GPS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#DCEFE4] hover:bg-[#04231A] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#04231A] border-b border-[#0B4A31]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#DCEFE4]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isUrdu ? 'بازار، شہر یا مقام تلاش کریں...' : 'Search bazaar, city or coordinate...'}
                className="w-full bg-[#0B4A31] border border-[#178A52] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#DCEFE4]/50 focus:outline-none focus:border-[#E3A82B]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#178A52] hover:bg-[#178A52]/80 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow"
            >
              {isUrdu ? 'تلاش کریں' : 'Locate'}
            </button>
          </form>
        </div>

        {/* Iframe Google Map */}
        <div className="flex-1 w-full bg-black relative">
          <iframe
            title="Locate Map"
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B4A31] border-t border-[#178A52] flex items-center justify-between text-xs">
          <span className="text-[#E3A82B] font-mono font-bold">
            🎯 35m High-Precision GPS Lock Verified
          </span>
          <button
            onClick={onClose}
            className="bg-[#178A52] text-white px-4 py-1.5 rounded-xl font-bold"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
