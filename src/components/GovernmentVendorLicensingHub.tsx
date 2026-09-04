import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2, AlertTriangle, Search, Filter, 
  MapPin, QrCode, Plus, Check, X, Printer, Compass, Clock, Award, 
  FileText, ArrowRight, Eye, RefreshCw, Layers, Lock, UserCheck
} from 'lucide-react';
import { Language, VendorProfile, AuthorizationStatus } from '../types';

interface GovernmentVendorLicensingHubProps {
  lang: Language;
  vendors: VendorProfile[];
  onUpdateVendor: (vendorId: string, updates: Partial<VendorProfile>) => void;
  onOpenVendorAllotment: (vendorId?: string) => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
}

export const GovernmentVendorLicensingHub: React.FC<GovernmentVendorLicensingHubProps> = ({
  lang,
  vendors = [],
  onUpdateVendor,
  onOpenVendorAllotment,
  onOpenCitySlotsMap,
}) => {
  const isUrdu = lang === 'ur';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AuthorizationStatus>('all');
  const [selectedVendorForReview, setSelectedVendorForReview] = useState<VendorProfile | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showLicenseCertificateModal, setShowLicenseCertificateModal] = useState<VendorProfile | null>(null);

  // Approval form state
  const [assignSlotNumber, setAssignSlotNumber] = useState('سلاٹ 22 (Pitch Slot 22)');
  const [assignMarket, setAssignMarket] = useState('G-9 Markaz (Karachi Company), Islamabad');
  const [assignZone, setAssignZone] = useState('Zone E - Islamabad');
  const [assignHours, setAssignHours] = useState('08:00 AM - 04:00 PM');
  const [assignLat, setAssignLat] = useState('33.6895');
  const [assignLng, setAssignLng] = useState('73.0298');
  const [assignFee, setAssignFee] = useState('1500');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      v.id.toLowerCase().includes(term) ||
      (v.qrId && v.qrId.toLowerCase().includes(term)) ||
      v.name.toLowerCase().includes(term) ||
      v.shopName.toLowerCase().includes(term) ||
      v.marketName.toLowerCase().includes(term) ||
      v.cnic.includes(term);

    const status = v.authorizationStatus || 'approved';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalApproved = vendors.filter(v => (v.authorizationStatus || 'approved') === 'approved').length;
  const totalUnderReview = vendors.filter(v => v.authorizationStatus === 'under_review').length;
  const totalSuspended = vendors.filter(v => v.authorizationStatus === 'suspended').length;

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleApproveVendor = (vendor: VendorProfile) => {
    const newVendorId = `VRF-${assignZone.split(' ')[1] || 'ISB'}-SLOT-${Math.floor(10 + Math.random() * 89)}`;
    const newLicenseNo = `LIC-VRF-2026-${Math.floor(100 + Math.random() * 900)}`;

    onUpdateVendor(vendor.id, {
      authorizationStatus: 'approved',
      slotNumber: assignSlotNumber,
      marketName: assignMarket,
      zone: assignZone,
      qrId: newVendorId,
      licenseNumber: newLicenseNo,
      licenseIssuedDate: new Date().toISOString().split('T')[0],
      licenseExpiryDate: '2027-02-28',
      approvingAuthority: 'District Administration / DC Office Authorized',
      authorizedOperatingHours: assignHours,
      assignedPitchDimensions: '6ft x 4ft (Municipal Standard Cart)',
      monthlyRegulatoryFee: Number(assignFee) || 1500,
      feePaymentStatus: 'paid',
      latitude: Number(assignLat) || 33.6895,
      longitude: Number(assignLng) || 73.0298,
      isInsideGeofence: true,
      badge: 'green',
    });

    setShowApprovalModal(false);
    setSelectedVendorForReview(null);
    triggerToast(isUrdu 
      ? `وینڈر ${vendor.name} کی سرکاری منظوری مکمل! لائسنس نمبر ${newLicenseNo} اور کیو آر الاٹمنٹ جاری کر دی گئی۔` 
      : `Vendor ${vendor.name} authorized! Official license ${newLicenseNo} & QR pitch assigned.`
    );
  };

  const handleSuspendVendor = (vendor: VendorProfile) => {
    onUpdateVendor(vendor.id, {
      authorizationStatus: 'suspended',
      shiftTime: 'Suspended by Magistrate',
      isInsideGeofence: false,
    });
    triggerToast(isUrdu 
      ? `وینڈر ${vendor.name} کا لائسنس ضلعی مجسٹریٹ کے حکم سے عارضی معطل کر دیا گیا۔` 
      : `Vendor ${vendor.name} license temporarily suspended by District Magistrate order.`
    );
  };

  const handleReinstateVendor = (vendor: VendorProfile) => {
    onUpdateVendor(vendor.id, {
      authorizationStatus: 'approved',
      shiftTime: vendor.authorizedOperatingHours || '08:00 AM - 04:00 PM',
      isInsideGeofence: true,
    });
    triggerToast(isUrdu 
      ? `وینڈر ${vendor.name} کا لائسنس باقاعدہ بحال کر دیا گیا۔ وینڈر اپنے الاٹ شدہ اسٹال پر واپس جا سکتا ہے۔` 
      : `Vendor ${vendor.name} license reinstated following compliance review.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Operating Model Core Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B] shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#178A52]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              <ShieldCheck className="w-4 h-4 text-[#E3A82B]" />
              <span>VRF 2026 • SOVEREIGN GOVERNMENT AUTHORIZATION HUB</span>
            </div>

            <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
              {isUrdu ? 'سرکاری وینڈر رجسٹریشن و لائسنسنگ اتھاریٹی' : 'Government Vendor Authorization & Licensing'}
            </h2>

            <p className="text-xs sm:text-sm text-[#DCEFE4] font-urdu leading-relaxed">
              {isUrdu 
                ? 'وینڈر اپنے طور پر جگہ یا لائسنس منتخب نہیں کر سکتا۔ ضلعی حکومت وینڈر کی جانچ پڑتال کے بعد سرکاری وینڈر آئی ڈی، کیو آر کوڈ، الاٹ شدہ میپ لوکیشن اور اوقاتِ کار تفویض کرتی ہے۔'
                : 'Vendors do not self-assign locations or licenses. Under VRF 2026, the District Administration approves authorizations, assigns official Vendor IDs, maps designated pitch boundaries, and issues legal QR licenses.'}
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono font-bold text-[#E3A82B]">
              <span>Government Authorizes</span>
              <span>→</span>
              <span className="text-white">Vendor Operates</span>
              <span>→</span>
              <span className="text-white">Citizen Engages</span>
              <span>→</span>
              <span className="text-[#DCEFE4]">Inspector Verifies</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-[#04231A] p-3.5 rounded-2xl border border-[#178A52] text-center shadow">
              <span className="text-[10px] text-[#DCEFE4]/80 block font-bold">{isUrdu ? 'منظور شدہ وینڈرز' : 'Approved'}</span>
              <span className="font-sora font-extrabold text-xl sm:text-2xl text-[#178A52]">{totalApproved}</span>
              <span className="text-[9px] text-[#DCEFE4]/70 block">Licensed & Mapped</span>
            </div>

            <div className="bg-[#04231A] p-3.5 rounded-2xl border border-[#E3A82B] text-center shadow">
              <span className="text-[10px] text-[#E3A82B] block font-bold">{isUrdu ? 'زیرِ جائزہ درخواستیں' : 'Under Review'}</span>
              <span className="font-sora font-extrabold text-xl sm:text-2xl text-[#E3A82B]">{totalUnderReview}</span>
              <span className="text-[9px] text-[#DCEFE4]/70 block">Awaiting Pitch</span>
            </div>

            <div className="bg-[#04231A] p-3.5 rounded-2xl border border-rose-500/60 text-center shadow">
              <span className="text-[10px] text-rose-400 block font-bold">{isUrdu ? 'معطل شدہ' : 'Suspended'}</span>
              <span className="font-sora font-extrabold text-xl sm:text-2xl text-rose-400">{totalSuspended}</span>
              <span className="text-[9px] text-[#DCEFE4]/70 block">Action Ordered</span>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mt-4 p-3 rounded-2xl bg-[#178A52] text-white text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-[#E3A82B]" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Action Controls & Search Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#178A52]/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isUrdu ? 'وینڈر آئی ڈی، شناختی کارڈ یا نام سے تلاش کریں...' : 'Search by Vendor ID, CNIC, shop or market...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FCFAF3] border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#178A52] text-slate-800"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all' 
                ? 'bg-[#04231A] text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isUrdu ? 'تمام وینڈرز' : 'All Vendors'} ({vendors.length})
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'approved' 
                ? 'bg-[#178A52] text-white' 
                : 'bg-[#DCEFE4]/60 text-[#0B4A31] hover:bg-[#DCEFE4]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{isUrdu ? 'منظور شدہ' : 'Approved'} ({totalApproved})</span>
          </button>

          <button
            onClick={() => setStatusFilter('under_review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'under_review' 
                ? 'bg-[#E3A82B] text-[#04231A]' 
                : 'bg-[#F4D58D]/40 text-amber-900 hover:bg-[#F4D58D]/70'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{isUrdu ? 'زیرِ جائزہ درخواستیں' : 'Pending Pitch'} ({totalUnderReview})</span>
          </button>

          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'suspended' 
                ? 'bg-rose-700 text-white' 
                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{isUrdu ? 'معطل شدہ' : 'Suspended'} ({totalSuspended})</span>
          </button>

          <button
            onClick={() => onOpenVendorAllotment()}
            className="bg-[#0B4A31] hover:bg-[#178A52] text-[#E3A82B] border border-[#E3A82B] text-xs font-bold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Compass className="w-3.5 h-3.5 text-[#E3A82B]" />
            <span>{isUrdu ? 'میپ تلاش' : 'Geospatial Radar'}</span>
          </button>
        </div>
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((v) => {
          const status = v.authorizationStatus || 'approved';
          const isApproved = status === 'approved';
          const isReview = status === 'under_review';
          const isSuspended = status === 'suspended';

          return (
            <div 
              key={v.id} 
              className={`rounded-3xl p-5 border transition-all shadow-sm space-y-4 ${
                isApproved 
                  ? 'bg-white border-[#178A52]/30 hover:border-[#178A52]' 
                  : isReview
                  ? 'bg-[#FCFAF3] border-[#E3A82B] ring-2 ring-[#E3A82B]/30'
                  : 'bg-rose-50/50 border-rose-300'
              }`}
            >
              {/* Header: Name, Status Badge, ID */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sora font-extrabold text-base text-[#04231A]">
                      {isUrdu ? v.shopNameUrdu || v.shopName : v.shopName}
                    </h3>
                    {isApproved && (
                      <span className="bg-[#178A52]/10 text-[#178A52] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#178A52]/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isUrdu ? 'سرکاری منظور شدہ' : 'Govt Approved'}</span>
                      </span>
                    )}
                    {isReview && (
                      <span className="bg-[#E3A82B]/20 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#E3A82B] animate-pulse flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isUrdu ? 'زیرِ جائزہ و الاٹمنٹ' : 'Pending Allocation'}</span>
                      </span>
                    )}
                    {isSuspended && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{isUrdu ? 'معطل شدہ' : 'Suspended'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-urdu mt-0.5">
                    وینڈر: <strong className="text-slate-800">{isUrdu ? v.nameUrdu || v.name : v.name}</strong> • CNIC: {v.cnic}
                  </p>
                </div>

                <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-[#04231A] text-[#E3A82B] rounded-xl shrink-0 shadow-xs">
                  {v.qrId || v.id}
                </span>
              </div>

              {/* Location & Slot Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 block font-bold">{isUrdu ? 'نامزد مارکیٹ و سلاٹ' : 'Designated Pitch'}</span>
                  <span className="font-bold text-[#04231A] block truncate">{v.slotNumber}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{v.marketName}</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 block font-bold">{isUrdu ? 'سرکاری لائسنس نمبر' : 'License Number'}</span>
                  <span className="font-mono font-bold text-[#0B4A31] block">{v.licenseNumber || 'Under Review'}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {v.authorizedOperatingHours || v.shiftTime || '08:00 AM - 04:00 PM'}
                  </span>
                </div>
              </div>

              {/* Pitch Dimensions & Coordinates row */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 bg-[#FCFAF3] p-2 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#178A52]" />
                  <span>GPS: {v.latitude ? `${v.latitude.toFixed(4)}, ${v.longitude?.toFixed(4)}` : 'Coords Pending'}</span>
                </div>

                <span className="font-bold text-slate-700 font-urdu">
                  حدود: {v.assignedPitchDimensions || '6ft x 4ft Cart Standard'}
                </span>
              </div>

              {/* Action Buttons for Government Authority */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenVendorAllotment(v.qrId || v.id)}
                    className="text-xs text-[#0B4A31] hover:text-[#178A52] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#E3A82B]" />
                    <span>{isUrdu ? 'نقشے پر لوکیشن زوم کریں' : 'Locate on Maps'}</span>
                  </button>

                  {onOpenCitySlotsMap && (
                    <button
                      onClick={() => onOpenCitySlotsMap(v.slotNumber || v.id)}
                      className="text-xs text-[#178A52] hover:text-[#04231A] font-bold flex items-center gap-1 transition-colors bg-[#178A52]/10 px-2 py-1 rounded-lg"
                      title={isUrdu ? 'سٹی سلاٹس ریڈار پر لائیو دیکھیں' : 'View on City Slots Radar Map'}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#178A52]" />
                      <span>{isUrdu ? 'سٹی سلاٹس میپ' : 'Slots Radar'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isReview && (
                    <button
                      onClick={() => {
                        setSelectedVendorForReview(v);
                        setShowApprovalModal(true);
                      }}
                      className="bg-[#178A52] hover:bg-[#0B4A31] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#E3A82B]" />
                      <span>{isUrdu ? 'منظوری و سلاٹ تفویض کریں' : 'Approve & Assign Pitch'}</span>
                    </button>
                  )}

                  {isApproved && (
                    <>
                      <button
                        onClick={() => setShowLicenseCertificateModal(v)}
                        className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#178A52]" />
                        <span>{isUrdu ? 'سرٹیفکیٹ' : 'Permit'}</span>
                      </button>

                      <button
                        onClick={() => handleSuspendVendor(v)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors"
                        title="Suspend License"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => handleReinstateVendor(v)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'لائسنس بحال کریں' : 'Reinstate License'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: GOVERNMENT OFFICIAL APPROVAL & PITCH ALLOTMENT */}
      {showApprovalModal && selectedVendorForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border-2 border-[#178A52] shadow-2xl space-y-5 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#04231A] text-white flex items-center justify-center shadow">
                  <ShieldCheck className="w-5 h-5 text-[#E3A82B]" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-lg text-[#04231A]">
                    {isUrdu ? 'سرکاری وینڈر الاٹمنٹ و تصدیق نامہ' : 'Official Pitch Allotment & Approval'}
                  </h3>
                  <p className="text-xs text-slate-500 font-urdu">
                    ضلعی انتظامیہ کی طرف سے قانونی سلاٹ اور باضابطہ کیو آر لائسنس کا اجراء
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowApprovalModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF3] border border-[#178A52]/20 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">درخواست گزار کا نام:</span>
                <strong className="text-[#04231A]">{selectedVendorForReview.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">شناختی کارڈ:</span>
                <span className="font-mono font-bold">{selectedVendorForReview.cnic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">کاروبار کی قسم:</span>
                <span className="font-bold text-[#0B4A31]">{selectedVendorForReview.shopName}</span>
              </div>
            </div>

            {/* Allotment Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isUrdu ? 'تفویض کردہ میونسپل سلاٹ نمبر:' : 'Designated Pitch Slot Number:'}
                </label>
                <input
                  type="text"
                  value={assignSlotNumber}
                  onChange={(e) => setAssignSlotNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#178A52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isUrdu ? 'مارکیٹ و لوکیشن:' : 'Designated Market:'}
                  </label>
                  <input
                    type="text"
                    value={assignMarket}
                    onChange={(e) => setAssignMarket(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isUrdu ? 'ضلعی زون:' : 'Administrative Zone:'}
                  </label>
                  <input
                    type="text"
                    value={assignZone}
                    onChange={(e) => setAssignZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isUrdu ? 'عرض بلد (GPS Latitude):' : 'GPS Latitude:'}
                  </label>
                  <input
                    type="text"
                    value={assignLat}
                    onChange={(e) => setAssignLat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isUrdu ? 'طول بلد (GPS Longitude):' : 'GPS Longitude:'}
                  </label>
                  <input
                    type="text"
                    value={assignLng}
                    onChange={(e) => setAssignLng(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isUrdu ? 'منظور شدہ شفٹ اوقات:' : 'Authorized Hours:'}
                  </label>
                  <input
                    type="text"
                    value={assignHours}
                    onChange={(e) => setAssignHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isUrdu ? 'ماہانہ ریگولیٹری فیس (PKR):' : 'Monthly Fee (PKR):'}
                  </label>
                  <input
                    type="text"
                    value={assignFee}
                    onChange={(e) => setAssignFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Official Confirmation Statement */}
            <div className="p-3 rounded-2xl bg-[#DCEFE4]/40 border border-[#178A52]/30 text-[11px] text-[#04231A] font-urdu leading-relaxed">
              تصدیق: یہ وینڈر میونسپل نقشے پر نامزد حدود (6x4 فٹ) اور 15 میٹر جیو فینس ریڈار سے منسلک ہوگا۔ وینڈر آئی ڈی و کیو آر لائسنس فوری طور پر وینڈر کے موبائل ایپ پر نمودار ہو جائے گا۔
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                onClick={() => handleApproveVendor(selectedVendorForReview)}
                className="bg-[#178A52] hover:bg-[#0B4A31] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <Check className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'باضابطہ منظوری و کیو آر جاری کریں' : 'Issue Official Approval & QR License'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL VRF VENDOR PERMIT CERTIFICATE */}
      {showLicenseCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-4 border-[#178A52] shadow-2xl space-y-5 text-slate-800">
            <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-[#178A52]/30">
              <div className="inline-flex items-center gap-1.5 bg-[#04231A] text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold">
                <span>GOVERNMENT OF PAKISTAN • VRF 2026</span>
              </div>
              <h3 className="font-sora font-extrabold text-xl text-[#04231A] mt-2">
                OFFICIAL VENDOR AUTHORIZATION PERMIT
              </h3>
              <p className="text-xs font-urdu text-slate-600">
                ضلعی انتظامیہ و مجسٹریٹ کا باضابطہ جاری کردہ کیو آر لائسنس
              </p>
            </div>

            {/* Certificate Body */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#FCFAF3] border border-[#178A52]/20">
              <div className="w-32 h-32 bg-white rounded-2xl p-2 border-2 border-[#178A52] shadow flex flex-col items-center justify-center shrink-0">
                <QrCode className="w-20 h-20 text-[#04231A]" />
                <span className="font-mono text-[9px] font-extrabold text-[#178A52] mt-1">
                  {showLicenseCertificateModal.qrId}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-700 w-full">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">License No:</span>
                  <strong className="font-mono text-[#0B4A31]">{showLicenseCertificateModal.licenseNumber || 'LIC-VRF-2026-001'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Shop / Stall:</span>
                  <strong>{showLicenseCertificateModal.shopName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Owner:</span>
                  <span>{showLicenseCertificateModal.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Assigned Pitch:</span>
                  <span className="font-bold text-[#178A52]">{showLicenseCertificateModal.slotNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Operating Hours:</span>
                  <span>{showLicenseCertificateModal.authorizedOperatingHours || '08:00 AM - 04:00 PM'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Eviction Shield:</span>
                  <span className="font-bold text-emerald-700">100% Lawfully Protected</span>
                </div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-slate-400">
                Seal of Deputy Commissioner • Secured via AES-256
              </span>
              <button
                onClick={() => setShowLicenseCertificateModal(null)}
                className="bg-[#04231A] hover:bg-[#178A52] text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                {isUrdu ? 'بند کریں' : 'Close Permit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
