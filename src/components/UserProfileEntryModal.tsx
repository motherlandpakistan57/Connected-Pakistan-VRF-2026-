import React, { useState, useEffect } from 'react';
import { 
  User, Store, Shield, Building2, MapPin, Phone, 
  FileText, CheckCircle2, Sparkles, X, ArrowRight, Home,
  CreditCard, Compass, Clock, Check
} from 'lucide-react';
import { Role, Language } from '../types';

export interface UserProfileData {
  fullName: string;
  fullNameUrdu: string;
  cnic: string;
  phone: string;
  streetAddress: string;
  city: string;
  district: string;
  province: string;
  role: Role;
  // Role-Specific fields
  marketName?: string;
  familySize?: number;
  vendorId?: string;
  shopName?: string;
  commodity?: string;
  slotNumber?: string;
  shiftTiming?: string;
  inspectorBadgeNumber?: string;
  assignedBeat?: string;
  designation?: string;
  department?: string;
  completed: boolean;
  updatedAt: string;
}

interface UserProfileEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  currentName?: string;
  lang: Language;
  initialData?: UserProfileData;
  onSave?: (profile: UserProfileData) => void;
  onSaveProfile?: (profile: UserProfileData) => void;
}

export const UserProfileEntryModal: React.FC<UserProfileEntryModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentName,
  lang,
  initialData,
  onSave,
  onSaveProfile,
}) => {
  const isUrdu = lang === 'ur';
  const handleSave = onSave || onSaveProfile;

  // Form State
  const [formData, setFormData] = useState<UserProfileData>(() => {
    if (initialData) {
      return {
        ...initialData,
        role: currentRole,
      };
    }
    try {
      const saved = localStorage.getItem('cp_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...parsed,
            role: currentRole, // Keep active role in sync
          };
        }
      }
    } catch (e) {}

    // Sensible role-based defaults
    if (currentRole === 'vendor') {
      return {
        fullName: currentName || 'Muhammad Tariq Khan',
        fullNameUrdu: 'محمد طارق خان',
        cnic: '37405-1829481-3',
        phone: '0300-5519284',
        streetAddress: 'Street 4, Sector A, Raja Bazaar',
        city: 'Rawalpindi',
        district: 'Rawalpindi',
        province: 'Punjab',
        role: 'vendor',
        vendorId: 'VRF-RWP-SLOT-19',
        shopName: 'Tariq Fresh Fruit & Vegetable Stall',
        commodity: 'Fresh Produce (Vegetables & Fruits)',
        slotNumber: 'Slot # 19',
        shiftTiming: '08:00 AM - 04:00 PM',
        completed: false,
        updatedAt: new Date().toISOString(),
      };
    } else if (currentRole === 'inspector') {
      return {
        fullName: currentName || 'Insp. Asim Mehmood',
        fullNameUrdu: 'انسپکٹر عاصم محمود',
        cnic: '35201-4491029-5',
        phone: '0321-9988771',
        streetAddress: 'Civil Lines, PERA Directorate',
        city: 'Lahore',
        district: 'Lahore Central',
        province: 'Punjab',
        role: 'inspector',
        inspectorBadgeNumber: 'PERA-104',
        assignedBeat: 'Beat 3 (Anarkali - Mall Road Corridor)',
        designation: 'Price Magistrate & Enforcement Officer',
        completed: false,
        updatedAt: new Date().toISOString(),
      };
    } else if (currentRole === 'government' || currentRole === 'fakhar_master') {
      return {
        fullName: currentName || 'Hamza Siddiqui',
        fullNameUrdu: 'حمزہ صدیقی',
        cnic: '42101-3329182-1',
        phone: '0333-2109845',
        streetAddress: 'DC Office Complex, Club Road',
        city: 'Rawalpindi',
        district: 'Rawalpindi',
        province: 'Punjab',
        role: currentRole,
        designation: currentRole === 'fakhar_master' ? 'Master Architect & Visionary Lead' : 'Deputy Commissioner (DC)',
        department: 'District Administration & Municipal Directorate',
        completed: false,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Citizen default
      return {
        fullName: currentName || 'Tariq Mehmood',
        fullNameUrdu: 'طارق محمود',
        cnic: '37405-9981245-7',
        phone: '0345-5123984',
        streetAddress: 'House 14-B, Street 9, Satellite Town',
        city: 'Rawalpindi',
        district: 'Rawalpindi',
        province: 'Punjab',
        role: 'citizen',
        marketName: 'Raja Bazaar Zone A',
        familySize: 5,
        completed: false,
        updatedAt: new Date().toISOString(),
      };
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Update profile if currentRole, currentName, or initialData changes while modal is open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(prev => ({
          ...prev,
          ...initialData,
          role: currentRole,
          fullName: currentName || initialData.fullName || prev.fullName,
        }));
        return;
      }
      try {
        const saved = localStorage.getItem('cp_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            role: currentRole,
            fullName: currentName || parsed.fullName || prev.fullName,
          }));
          return;
        }
      } catch (e) {}
    }
  }, [isOpen, currentRole, currentName, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfileData = {
      ...formData,
      completed: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('cp_user_profile', JSON.stringify(updated));
      localStorage.setItem('cp_clock_city', updated.city.toLowerCase().substring(0, 3));
    } catch (err) {
      console.warn('Could not save user profile:', err);
    }

    if (typeof handleSave === 'function') {
      handleSave(updated);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleQuickFillSample = () => {
    if (currentRole === 'vendor') {
      setFormData({
        fullName: 'Muhammad Bilal',
        fullNameUrdu: 'محمد بلال',
        cnic: '37405-1234567-1',
        phone: '0300-5551234',
        streetAddress: 'Stall 19, Fresh Produce Alley, Raja Bazaar',
        city: 'Rawalpindi',
        district: 'Rawalpindi',
        province: 'Punjab',
        role: 'vendor',
        vendorId: 'VRF-RWP-SLOT-19',
        shopName: 'Bilal Organic Fruits & Vegetables',
        commodity: 'Fresh Produce (Vegetables & Fruits)',
        slotNumber: 'Slot # 19',
        shiftTiming: '08:00 AM - 04:00 PM',
        completed: true,
        updatedAt: new Date().toISOString(),
      });
    } else {
      setFormData({
        fullName: 'Zainab Bibi',
        fullNameUrdu: 'زینب بی بی',
        cnic: '37405-7788991-2',
        phone: '0312-5544332',
        streetAddress: 'House 8, Mohallah Waris Khan',
        city: 'Rawalpindi',
        district: 'Rawalpindi',
        province: 'Punjab',
        role: 'citizen',
        marketName: 'Raja Bazaar Corridor',
        familySize: 6,
        completed: true,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-600/30 max-w-2xl w-full my-auto overflow-hidden text-slate-800">
        {/* Modal Top Ribbon */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white bg-emerald-950/50 hover:bg-emerald-950 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shadow-inner">
              {currentRole === 'vendor' ? <Store className="w-6 h-6" /> :
               currentRole === 'inspector' ? <Shield className="w-6 h-6" /> :
               currentRole === 'government' ? <Building2 className="w-6 h-6" /> :
               <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {currentRole === 'vendor' ? (isUrdu ? 'ریڑھی بان و دکاندار پروفائل' : 'Vendor Registration') :
                   currentRole === 'inspector' ? (isUrdu ? 'پرائس مجسٹریٹ پروفائل' : 'Price Magistrate Registration') :
                   currentRole === 'government' ? (isUrdu ? 'سرکاری کمانڈ و ڈی سی پروفائل' : 'District Administration Registration') :
                   (isUrdu ? 'شہری و خریدار پروفائل' : 'Citizen National Access')}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold">
                  {isUrdu ? 'خودکار ذاتی تصدیق' : 'Auto-Personalized Access'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {isUrdu ? 'قومی شہری و کاروباری شناختی فارم' : 'Personalized System Entry & Civic Registration'}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {isUrdu 
                  ? 'برائے مہربانی اپنا نام، قومی شناختی کارڈ اور بنیادی پتہ درج کریں۔ یہ معلومات تمام سروسز میں خودکار طریقے سے لاگو ہو جائیں گی۔'
                  : 'Please review and confirm your name, national identity, and complete address for personalized civic and market access.'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-emerald-900 flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isUrdu 
                ? 'پروفائل کامیابی سے محفوظ ہو گئی! تمام سہولیات اور نقشہ جات کو ذاتی ڈیٹا کے ساتھ ہم آہنگ کر دیا گیا ہے۔' 
                : 'Profile verified & saved successfully! All consoles and map features are now personalized to your identity.'}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Fill Button */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">
              {isUrdu ? 'فوری جانچ کے لیے نمونہ ڈیٹا بھریں:' : 'Quick demonstration autofill:'}
            </span>
            <button
              type="button"
              onClick={handleQuickFillSample}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 shadow-xs transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isUrdu ? 'نمونہ ڈیٹا درج کریں' : 'Autofill Verified Demo Data'}</span>
            </button>
          </div>

          {/* Section 1: Basic Identity */}
          <div>
            <h4 className="text-xs uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isUrdu ? 'بنیادی شناختی معلومات' : '1. Personal Identity Credentials'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'مکمل نام (انگریزی)' : 'Full Legal Name (English)'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Muhammad Tariq Khan"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                  {isUrdu ? 'مکمل نام (اردو)' : 'Full Name (Urdu)'}
                </label>
                <input
                  type="text"
                  value={formData.fullNameUrdu}
                  onChange={(e) => setFormData({ ...formData, fullNameUrdu: e.target.value })}
                  placeholder="مثلاً: محمد طارق خان"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs font-urdu text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'قومی شناختی کارڈ (CNIC)' : 'National CNIC Number'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="37405-XXXXXXX-X"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'موبائل / واٹس ایپ نمبر' : 'Mobile / WhatsApp Number'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0300-XXXXXXX"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Complete Address */}
          <div>
            <h4 className="text-xs uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isUrdu ? 'مکمل بنیادی رہائشی / کاروباری پتہ' : '2. Complete Physical Address & Territory'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'مکان / دکان / ریڑھی کا پتہ و گلی محلہ' : 'House / Shop / Stall Address & Street'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    placeholder="e.g. Street 4, Sector A, Raja Bazaar / House 12, Mohallah Waris Khan"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'شہر (City)' : 'City / Town'} <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value, district: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs"
                >
                  <option value="Rawalpindi">Rawalpindi (راولپنڈی)</option>
                  <option value="Islamabad">Islamabad (اسلام آباد)</option>
                  <option value="Lahore">Lahore (لاہور)</option>
                  <option value="Karachi">Karachi (کراچی)</option>
                  <option value="Peshawar">Peshawar (پشاور)</option>
                  <option value="Quetta">Quetta (کوئٹہ)</option>
                  <option value="Multan">Multan (ملتان)</option>
                  <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
                  <option value="Gilgit">Gilgit (گلگت)</option>
                  <option value="Muzaffarabad">Muzaffarabad (مظفر آباد)</option>
                  <option value="Gwadar">Gwadar (گوادر)</option>
                  <option value="Sialkot">Sialkot (سیالکوٹ)</option>
                  <option value="Hyderabad">Hyderabad (حیدرآباد)</option>
                  <option value="Abbottabad">Abbottabad (ایبٹ آباد)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'ضلع / تحصیل' : 'District & Tehsil'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Rawalpindi Tehsil"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'صوبہ / علاقہ' : 'Province / Territory'}
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs"
                >
                  <option value="Punjab">Punjab (پنجاب)</option>
                  <option value="Sindh">Sindh (سندھ)</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (خیبر پختونخوا)</option>
                  <option value="Balochistan">Balochistan (بلوچستان)</option>
                  <option value="Federal Capital (ICT)">Federal Capital Islamabad (وفاقی دارالحکومت)</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan (گلگت بلتستان)</option>
                  <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir (آزاد کشمیر)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Role-Specific Customization */}
          <div>
            <h4 className="text-xs uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {currentRole === 'vendor' ? (isUrdu ? '3. ریڑھی و سرکاری الاٹمنٹ کی تفصیلات' : '3. Vendor Pitch & Government Allotment') :
                 currentRole === 'inspector' ? (isUrdu ? '3. مجسٹریٹ انفورسمنٹ دائرہ اختیار' : '3. Price Magistrate Enforcement Jurisdiction') :
                 currentRole === 'government' ? (isUrdu ? '3. سرکاری اختیارات و ڈویژن' : '3. Administration Command & Division') :
                 (isUrdu ? '3. قریبی مارکیٹ و خریداری ترجیحات' : '3. Local Market & Shopping Preferences')}
              </span>
            </h4>

            {currentRole === 'vendor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200/60">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'مخصوص شدہ وینڈر شناختی کوڈ (Vendor ID)' : 'Designated Official Vendor ID'} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vendorId || 'VRF-RWP-SLOT-19'}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    placeholder="e.g. VRF-RWP-SLOT-19 or v-101"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-mono font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'دکان یا ریڑھی کا کاروباری نام' : 'Stall / Shop Business Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.shopName || ''}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    placeholder="e.g. Bilal Fresh Vegetables & Fruit"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'اجناس کی کیٹیگری' : 'Primary Commodity Category'}
                  </label>
                  <select
                    value={formData.commodity || 'Fresh Produce (Vegetables & Fruits)'}
                    onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Fresh Produce (Vegetables & Fruits)">سبزیاں و تازہ پھل (Fresh Produce)</option>
                    <option value="Grains & Flour">غلہ و آٹا (Grains & Flour)</option>
                    <option value="Pulses & Lentils">دالیں و چنے (Pulses & Lentils)</option>
                    <option value="Dairy & Poultry">ڈیری و برائلر مرغی (Dairy & Poultry)</option>
                    <option value="General Groceries">کریانہ و کوکنگ آئل (General Groceries)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'سرکاری الاٹ شدہ سلاٹ نمبر' : 'Official Allotted Slot #'}
                  </label>
                  <input
                    type="text"
                    value={formData.slotNumber || 'Slot # 19'}
                    onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                    placeholder="e.g. Slot # 19"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {currentRole === 'citizen' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'پسندیدہ خریداری مارکیٹ / بازار' : 'Nearest Preferred Market / Bazaar'}
                  </label>
                  <input
                    type="text"
                    value={formData.marketName || 'Raja Bazaar Zone A'}
                    onChange={(e) => setFormData({ ...formData, marketName: e.target.value })}
                    placeholder="e.g. Raja Bazaar, Anarkali, Empress Market"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'گھر کے افراد کی تعداد (Family Size)' : 'Household Members Count'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={formData.familySize || 5}
                    onChange={(e) => setFormData({ ...formData, familySize: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {currentRole === 'inspector' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 bg-amber-50/50 p-3 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'مجسٹریٹ بیلٹ / بیج نمبر' : 'Magistrate Badge / Belt #'}
                  </label>
                  <input
                    type="text"
                    value={formData.inspectorBadgeNumber || 'PERA-104'}
                    onChange={(e) => setFormData({ ...formData, inspectorBadgeNumber: e.target.value })}
                    placeholder="e.g. PERA-104"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'متعلقہ بیٹ / گشت کا علاقہ' : 'Assigned Inspection Beat'}
                  </label>
                  <input
                    type="text"
                    value={formData.assignedBeat || 'Beat 1 (Produce Corridor)'}
                    onChange={(e) => setFormData({ ...formData, assignedBeat: e.target.value })}
                    placeholder="e.g. Beat 1 (Produce Corridor)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>
            )}

            {(currentRole === 'government' || currentRole === 'fakhar_master') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 bg-slate-100 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'سرکاری عہدہ (Designation)' : 'Government Official Designation'}
                  </label>
                  <input
                    type="text"
                    value={formData.designation || 'Deputy Commissioner (DC)'}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'محکمہ / ڈائریکٹوریٹ' : 'Department & Directorate'}
                  </label>
                  <input
                    type="text"
                    value={formData.department || 'District Administration & Municipal Directorate'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isUrdu ? 'بعد میں کریں' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>
                {isUrdu 
                  ? 'معلومات محفوظ کریں اور نظام تک ذاتی رسائی حاصل کریں' 
                  : 'Save Profile & Activate Personalized System Access'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
