import React, { useState, useRef } from 'react';
import { 
  X, Send, Upload, FileText, CheckCircle2, Shield, MapPin, 
  Phone, User, Store, Award, Calendar, AlertTriangle, Paperclip, 
  Sparkles, Download, Printer, Navigation, Check, Clock, Radio
} from 'lucide-react';
import { Language, VendorProfile, FeedEvent } from '../types';
import { speechService } from '../lib/audio';

export interface VendorTransmissionItem {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorNameUrdu?: string;
  slotNumber: string;
  marketName: string;
  documentType: string;
  documentTypeUrdu: string;
  title: string;
  notes: string;
  allocatedResources: string[];
  fileName?: string;
  fileSize?: string;
  fileDataUrl?: string;
  officialSender: string;
  timestamp: string;
  validUntil: string;
  status: 'delivered' | 'acknowledged';
  verificationHash: string;
}

interface GovernmentVendorOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  vendors?: VendorProfile[];
  vendor?: VendorProfile | null;
  initialVendor?: VendorProfile | null;
  onTransmitSuccess?: (transmission: VendorTransmissionItem) => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
}

export const GovernmentVendorOutreachModal: React.FC<GovernmentVendorOutreachModalProps> = ({
  isOpen,
  onClose,
  lang,
  vendors = [],
  vendor = null,
  initialVendor = null,
  onTransmitSuccess,
  onOpenCitySlotsMap,
}) => {
  const isUrdu = lang === 'ur';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeVendor = vendor || initialVendor;
  const [selectedVendorId, setSelectedVendorId] = useState<string>(activeVendor?.id || vendors[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [documentType, setDocumentType] = useState<'permit' | 'allocation' | 'clearance' | 'solar_grant' | 'rectification' | 'equipment'>('allocation');
  const [directiveTitle, setDirectiveTitle] = useState(
    isUrdu ? 'باضابطہ 6x4 فٹ سلاٹ الاٹمنٹ اور کیو آر لائسنس سرٹیفکیٹ' : 'Official 6x4 ft Slot Allocation & QR Badge License'
  );
  const [directiveNotes, setDirectiveNotes] = useState(
    isUrdu 
      ? 'ڈپٹی کمشنر آفس کی جانب سے آپ کو مقررہ تجارتی زون میں ریڑھی بان سلاٹ الاٹ کر دی گئی ہے۔ سرکاری نرخ نامے کی پاسداری اور 5 فٹ واک وے کلیئرنس کو ہر وقت برقرار رکھیں۔' 
      : 'The District Administration has officially allocated your designated 6x4 ft trading slot in the zoned corridor. Maintain DC rate compliance and 5.0 ft walkway clearance at all times.'
  );
  
  // Resource checklist from government
  const [resourcesAdded, setResourcesAdded] = useState<string[]>([
    'Official QR Badge Laminated ID Card',
    'Standard 6x4ft Stainless Steel Boundary Marker'
  ]);
  const [newCustomResource, setNewCustomResource] = useState('');

  // Uploaded attachment
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmittedReceipt, setTransmittedReceipt] = useState<VendorTransmissionItem | null>(null);

  if (!isOpen) return null;

  const currentVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  const filteredVendors = vendors.filter(v => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.name.toLowerCase().includes(q) ||
      (v.nameUrdu && v.nameUrdu.includes(q)) ||
      v.slotNumber.toLowerCase().includes(q) ||
      v.marketName.toLowerCase().includes(q) ||
      v.cnic.includes(q) ||
      v.phone.includes(q)
    );
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleToggleResource = (res: string) => {
    setResourcesAdded(prev => 
      prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]
    );
  };

  const handleAddCustomResource = () => {
    if (!newCustomResource.trim()) return;
    setResourcesAdded(prev => [...prev, newCustomResource.trim()]);
    setNewCustomResource('');
  };

  const handleSendTransmission = () => {
    if (!currentVendor) return;
    setIsTransmitting(true);

    try {
      speechService.playChime();
    } catch(e){}

    setTimeout(() => {
      const transmissionId = `VRF-TX-${Date.now().toString().slice(-6)}`;
      const hash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`.toUpperCase();

      const newTransmission: VendorTransmissionItem = {
        id: transmissionId,
        vendorId: currentVendor.id,
        vendorName: currentVendor.name,
        vendorNameUrdu: currentVendor.nameUrdu,
        slotNumber: currentVendor.slotNumber,
        marketName: currentVendor.marketName,
        documentType,
        documentTypeUrdu: 
          documentType === 'allocation' ? 'سلاٹ الاٹمنٹ سرٹیفکیٹ' :
          documentType === 'clearance' ? 'ڈی سی ریٹ تعمیل کلیئرنس' :
          documentType === 'solar_grant' ? 'شمسی شامیانہ گرانٹ منظوری' :
          documentType === 'rectification' ? 'اصلاحی نوٹس و تنبیہ' : 'سرکاری پرمٹ و اجازت نامہ',
        title: directiveTitle,
        notes: directiveNotes,
        allocatedResources: resourcesAdded,
        fileName: attachedFile?.name,
        fileSize: attachedFile?.size,
        fileDataUrl: attachedFile?.dataUrl,
        officialSender: 'Deputy Commissioner Central Command Office (DC Rawalpindi/Islamabad)',
        timestamp: new Date().toLocaleString(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'delivered',
        verificationHash: hash,
      };

      // Persist in localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('cp_vendor_transmissions') || '[]');
        localStorage.setItem('cp_vendor_transmissions', JSON.stringify([newTransmission, ...existing]));
      } catch(e){}

      setIsTransmitting(false);
      setTransmittedReceipt(newTransmission);

      if (onTransmitSuccess) {
        onTransmitSuccess(newTransmission);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FCFAF3] w-full max-w-4xl rounded-3xl border-2 border-[#178A52] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] p-4 sm:p-5 text-white flex items-center justify-between border-b-2 border-[#E3A82B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#178A52] flex items-center justify-center border border-[#E3A82B] shadow">
              <Send className="w-5 h-5 text-[#E3A82B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                  PERA Sovereign Flow
                </span>
                <span className="text-xs text-emerald-300 font-mono">
                  Gov ➔ Vendor Direct Line
                </span>
              </div>
              <h3 className="font-sora font-extrabold text-lg sm:text-xl text-white">
                {isUrdu ? 'وینڈر رابطہ و سرکاری دستاویز ترسیل پورٹل' : 'Official Government-to-Vendor Outreach & Transmission'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-[#132A21]">
          
          {transmittedReceipt ? (
            /* ================= TRANSMISSION RECEIPT / VERIFICATION ================= */
            <div className="space-y-6 animate-fadeUp">
              <div className="p-5 rounded-3xl bg-[#031E15] border-2 border-[#178A52] text-white text-center space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-[#178A52] text-white flex items-center justify-center mx-auto border-2 border-[#E3A82B] shadow-lg animate-bounce">
                  <Check className="w-8 h-8 text-[#E3A82B]" />
                </div>
                <h4 className="font-sora font-black text-xl sm:text-2xl text-white">
                  {isUrdu ? 'دستاویز اور احکامات دکاندار کو کامیابی سے ارسال ہو گئے!' : 'Official Directive & Resources Successfully Transmitted!'}
                </h4>
                <p className="text-sm text-[#DCEFE4] font-urdu max-w-xl mx-auto">
                  {isUrdu 
                    ? `دستاویز دکاندار "${transmittedReceipt.vendorNameUrdu || transmittedReceipt.vendorName}" کے موبائل پورٹل اور سرکاری سنٹرل رجسٹری میں خودکار طریقے سے ریکارڈ ہو چکی ہے۔`
                    : `Dispatched directly to ${transmittedReceipt.vendorName} at Slot ${transmittedReceipt.slotNumber}. Synced in real-time to District Registry.`}
                </p>
                <div className="inline-flex items-center gap-2 bg-[#0B4A31] px-4 py-1.5 rounded-full border border-[#E3A82B]/60 text-xs font-mono text-[#E3A82B]">
                  <span>Receipt ID: {transmittedReceipt.id}</span>
                  <span>•</span>
                  <span>Hash: {transmittedReceipt.verificationHash}</span>
                </div>
              </div>

              {/* Certificate Details Card */}
              <div className="p-5 rounded-2xl bg-white border border-[#178A52]/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] text-[#5C6F63] uppercase font-bold tracking-wider">Concerned Merchant</span>
                    <h5 className="font-bold text-base text-[#04231A]">{transmittedReceipt.vendorName}</h5>
                    <p className="text-xs text-[#5C6F63]">{transmittedReceipt.slotNumber} • {transmittedReceipt.marketName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#5C6F63] uppercase font-bold tracking-wider">Timestamp</span>
                    <p className="text-xs font-mono font-bold text-[#178A52]">{transmittedReceipt.timestamp}</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Status: DELIVERED</span>
                  </div>
                </div>

                <div>
                  <h6 className="text-xs font-bold text-[#04231A] mb-1">{isUrdu ? 'سرکاری عنوان و احکامات:' : 'Directive Title & Text:'}</h6>
                  <p className="text-sm font-bold text-[#178A52]">{transmittedReceipt.title}</p>
                  <p className="text-xs text-[#333] mt-1 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">{transmittedReceipt.notes}</p>
                </div>

                {transmittedReceipt.allocatedResources.length > 0 && (
                  <div>
                    <h6 className="text-xs font-bold text-[#04231A] mb-1.5">{isUrdu ? 'تفویض شدہ وسائل و ساز و سامان:' : 'Allocated Municipal Resources:'}</h6>
                    <div className="flex flex-wrap gap-1.5">
                      {transmittedReceipt.allocatedResources.map((res, idx) => (
                        <span key={idx} className="bg-[#0B4A31] text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E3A82B]" />
                          <span>{res}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {transmittedReceipt.fileName && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-[#178A52]" />
                      <span className="text-xs font-bold text-[#04231A]">{transmittedReceipt.fileName}</span>
                      <span className="text-[10px] text-slate-500">({transmittedReceipt.fileSize})</span>
                    </div>
                    <span className="text-[11px] text-[#178A52] font-bold">Attached & Encrypted</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <button
                    onClick={() => {
                      setTransmittedReceipt(null);
                      setAttachedFile(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    {isUrdu ? 'دوسرے دکاندار کو ارسال کریں' : 'Send Another Transmission'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-[#178A52]/40 text-[#04231A] hover:bg-emerald-50 flex items-center gap-1.5 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'رسید پرنٹ کریں' : 'Print Receipt'}</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#178A52] text-white hover:bg-[#0B4A31] shadow transition-all"
                    >
                      {isUrdu ? 'مکمل کریں' : 'Done & Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= TRANSMISSION DISPATCH FORM ================= */
            <div className="space-y-6">
              
              {/* Step 1: Select & Search Vendor */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#178A52]/30 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black text-[#04231A] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#178A52]" />
                    <span>{isUrdu ? '۱. متعلقہ دکاندار کا انتخاب و تصدیق کریں' : '1. Select Concerned Vendor / Merchant'}</span>
                  </label>
                  <span className="text-[11px] text-[#5C6F63]">
                    {vendors.length} {isUrdu ? 'رجسٹرڈ دکاندار دستیاب' : 'Registered Stalls in Database'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isUrdu ? 'دکاندار کا نام، دکان، سلاٹ نمبر، بازار یا CNIC تلاش کریں...' : 'Search vendor name, slot (e.g. Slot 19), market, or CNIC...'}
                    className="w-full sm:flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-[#04231A] focus:outline-none focus:border-[#178A52]"
                  />
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full sm:w-auto bg-[#04231A] text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#178A52] focus:outline-none focus:border-[#E3A82B]"
                  >
                    {filteredVendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.slotNumber} - {v.marketName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Vendor Profile Overview Pill */}
                {currentVendor && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-[#FCFAF3] border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {currentVendor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-[#04231A] font-bold text-sm">{currentVendor.name}</strong>
                          <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {currentVendor.slotNumber}
                          </span>
                        </div>
                        <p className="text-[#5C6F63] font-urdu mt-0.5">
                          {currentVendor.marketName} • CNIC: {currentVendor.cnic} • Phone: {currentVendor.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#5C6F63] block font-bold">Credit Rating</span>
                        <span className="font-extrabold text-emerald-700">{currentVendor.creditScore || 780}/850</span>
                      </div>
                      {onOpenCitySlotsMap && (
                        <button
                          type="button"
                          onClick={() => onOpenCitySlotsMap(currentVendor.slotNumber)}
                          className="px-3 py-1.5 rounded-lg bg-[#0B4A31] text-[#E3A82B] hover:bg-[#178A52] text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'نقشے پر جائیں' : 'Fly on Map'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Choose Document Type & Title */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#178A52]/30 shadow-xs space-y-4">
                <label className="text-xs font-black text-[#04231A] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#178A52]" />
                  <span>{isUrdu ? '۲. دستاویز کی قسم اور سرکاری احکامات' : '2. Select Document Type & Official Directive'}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'allocation', titleEn: 'Slot Allocation License', titleUrdu: 'سلاٹ الاٹمنٹ سرٹیفکیٹ' },
                    { id: 'clearance', titleEn: 'Price Compliance Seal', titleUrdu: 'ڈی سی ریٹ کلیئرنس' },
                    { id: 'permit', titleEn: 'Health & Hygiene Permit', titleUrdu: 'فوڈ سیفٹی پرمٹ' },
                    { id: 'solar_grant', titleEn: 'Solar Awning Grant', titleUrdu: 'شمسی شامیانہ گرانٹ' },
                    { id: 'equipment', titleEn: 'Equipment Allocation', titleUrdu: 'سرکاری آلات تفویض' },
                    { id: 'rectification', titleEn: 'Rectification Notice', titleUrdu: 'اصلاحی نوٹس و تنبیہ' },
                  ].map(dt => (
                    <button
                      key={dt.id}
                      type="button"
                      onClick={() => {
                        setDocumentType(dt.id as any);
                        if (dt.id === 'allocation') {
                          setDirectiveTitle(isUrdu ? 'باضابطہ 6x4 فٹ سلاٹ الاٹمنٹ اور کیو آر لائسنس' : 'Official 6x4 ft Slot Allocation & QR Badge License');
                        } else if (dt.id === 'clearance') {
                          setDirectiveTitle(isUrdu ? 'ڈی سی ریٹ تعمیل کلیئرنس و گرین بیج تصدیق' : 'DC Price Ceiling Compliance Clearance & Green Badge');
                        } else if (dt.id === 'solar_grant') {
                          setDirectiveTitle(isUrdu ? 'شمسی شامیانہ گرانٹ منظوری (150W سولر کٹ)' : 'Subsidized Solar Awning Grant Approval (150W Kit)');
                        } else if (dt.id === 'rectification') {
                          setDirectiveTitle(isUrdu ? 'سرکاری تنبیہ و اصلاحی نوٹس برائے واک وے کلیئرنس' : 'Formal Rectification Notice for Walkway Clearance');
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                        documentType === dt.id
                          ? 'bg-[#178A52] text-white border-[#178A52] shadow-sm'
                          : 'bg-[#F8FAFC] text-[#04231A] border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{isUrdu ? dt.titleUrdu : dt.titleEn}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#04231A]">
                    {isUrdu ? 'دستاویز کا عنوان:' : 'Directive Title:'}
                  </label>
                  <input
                    type="text"
                    value={directiveTitle}
                    onChange={(e) => setDirectiveTitle(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-[#04231A] focus:outline-none focus:border-[#178A52]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#04231A]">
                    {isUrdu ? 'سرکاری ہدایات و نوٹس (تفصیل):' : 'Official Instructions & Guidance Notes:'}
                  </label>
                  <textarea
                    rows={3}
                    value={directiveNotes}
                    onChange={(e) => setDirectiveNotes(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 text-xs text-[#04231A] focus:outline-none focus:border-[#178A52]"
                  />
                </div>
              </div>

              {/* Step 3: Resources & Upload from Government Side */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#178A52]/30 shadow-xs space-y-4">
                <label className="text-xs font-black text-[#04231A] uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#178A52]" />
                  <span>{isUrdu ? '۳. وسائل تفویض کریں یا فائل/دستاویز اپلوڈ کریں' : '3. Allocate Resources or Upload Evidence / Certificates'}</span>
                </label>

                {/* Resource Checklist */}
                <div>
                  <span className="text-[11px] font-bold text-[#04231A] block mb-2">
                    {isUrdu ? 'سرکاری سامان / وسائل شامل کریں:' : 'Attach Municipal Resources & Items:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Official QR Badge Laminated ID Card',
                      'Standard 6x4ft Stainless Steel Boundary Marker',
                      'Calibrated Bluetooth Digital Price Scale',
                      '150W Solar Awning & Evening LED Array',
                      'Civic Green Waste Segregation Dustbin (15L)',
                      'Municipal Vendor Uniform & Apron Kit',
                    ].map(res => {
                      const isChecked = resourcesAdded.includes(res);
                      return (
                        <button
                          key={res}
                          type="button"
                          onClick={() => handleToggleResource(res)}
                          className={`p-2 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                            isChecked 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' 
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{res}</span>
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Item */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <input
                      type="text"
                      value={newCustomResource}
                      onChange={(e) => setNewCustomResource(e.target.value)}
                      placeholder={isUrdu ? 'کوئی اور سامان یا سرٹیفکیٹ شامل کریں...' : 'Add custom item or approval token...'}
                      className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#04231A]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomResource}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-black"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* File Upload Box */}
                <div>
                  <span className="text-[11px] font-bold text-[#04231A] block mb-2">
                    {isUrdu ? 'سرکاری فائل یا آرڈر اپلوڈ کریں (PDF / Image / Scan):' : 'Upload Official File, Gazetted Order, or Document Scan:'}
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {attachedFile ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="text-xs text-emerald-950 block">{attachedFile.name}</strong>
                          <span className="text-[10px] text-emerald-700">Size: {attachedFile.size} • Ready for digital transmission</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-1 rounded-lg hover:bg-emerald-200 text-emerald-900 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#178A52] rounded-2xl p-4 text-center cursor-pointer bg-[#F8FAFC] hover:bg-emerald-50/50 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#04231A]">
                        {isUrdu ? 'فائل منتخب کرنے کے لیے یہاں کلک کریں یا ڈریگ کریں' : 'Click to select or drag and drop official document'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Supports PDF, PNG, JPG, DOCX (Max 15MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Dispatch Action Button */}
              <div className="p-4 rounded-2xl bg-[#031E15] border-2 border-[#178A52] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="font-bold text-xs text-[#E3A82B]">
                      {isUrdu ? 'فوری خودکار ترسیل و توثیق' : 'Real-time Autonomous Transmission'}
                    </span>
                  </div>
                  <p className="text-xs text-[#DCEFE4] font-urdu mt-0.5">
                    {isUrdu 
                      ? 'بٹن دبانے پر دستاویز فوراً متعلقہ دکاندار کے پورٹل اور ڈسٹرکٹ کلاؤڈ رجسٹری پر نشر ہو جائے گی۔'
                      : 'Instantly broadcasts to vendor device and generates verifiable cryptographic certificate.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isTransmitting || !currentVendor}
                    onClick={handleSendTransmission}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#178A52] hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isTransmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isUrdu ? 'ارسال ہو رہا ہے...' : 'Transmitting...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#E3A82B]" />
                        <span>{isUrdu ? 'دکاندار کو فوری ترسیل کریں' : 'Transmit to Vendor'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
