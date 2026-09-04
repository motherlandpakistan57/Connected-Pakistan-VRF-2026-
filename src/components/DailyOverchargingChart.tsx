import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, 
  Filter, Calendar, Info, MapPin, CheckCircle2, ChevronRight,
  Flame, BarChart2
} from 'lucide-react';
import { Language, CitizenReport, ZoneItem } from '../types';

interface DailyOverchargingChartProps {
  reports: CitizenReport[];
  zones?: ZoneItem[];
  lang: Language;
  onSelectZoneFilter?: (zoneName: string) => void;
}

type MetricView = 'severity' | 'variance' | 'zones';
type TimeRange = '7d' | '14d';

export const DailyOverchargingChart: React.FC<DailyOverchargingChartProps> = ({
  reports = [],
  zones = [],
  lang,
  onSelectZoneFilter,
}) => {
  const isUrdu = lang === 'ur';

  const [metricView, setMetricView] = useState<MetricView>('severity');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Available unique market zones from reports and zones prop
  const marketZonesList = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.zone) set.add(r.zone);
      else if (r.marketName) {
        if (r.marketName.includes('راولپنڈی') || r.marketName.includes('راجہ بازار')) set.add('Zone A - Rawalpindi');
        else if (r.marketName.includes('لاہور') || r.marketName.includes('انارکلی')) set.add('Zone B - Lahore');
        else if (r.marketName.includes('کراچی') || r.marketName.includes('ایمپریس')) set.add('Zone C - Karachi');
        else if (r.marketName.includes('اسلام آباد') || r.marketName.includes('ایف ٹین')) set.add('Zone D - Islamabad');
        else if (r.marketName.includes('پشاور') || r.marketName.includes('قصہ خوانی')) set.add('Zone E - Peshawar');
        else set.add(r.marketName);
      }
    });
    // Add default primary zones if not present
    ['Zone A - Rawalpindi', 'Zone B - Lahore', 'Zone C - Karachi', 'Zone D - Islamabad', 'Zone E - Peshawar'].forEach(z => set.add(z));
    return Array.from(set);
  }, [reports]);

  // Aggregate daily data
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : 14;
    // Anchor date: 2026-09-02 (current simulated time)
    const baseDate = new Date(2026, 8, 2); // Month index 8 is September
    
    // Generate day keys in chronological order
    const days: { dateStr: string; labelEn: string; labelUrdu: string }[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const isToday = i === 0;
      const isYesterday = i === 1;

      let labelEn = `${monthShort} ${dayNum}`;
      let labelUrdu = `${dayNum} ${d.getMonth() === 7 ? 'اگست' : 'ستمبر'}`;

      if (isToday) {
        labelEn = `Today (${dayNum} Sep)`;
        labelUrdu = `آج (${dayNum} ستمبر)`;
      } else if (isYesterday) {
        labelEn = `Y'day (${dayNum} Sep)`;
        labelUrdu = `گزشتہ کل (${dayNum} ستمبر)`;
      }

      days.push({ dateStr, labelEn, labelUrdu });
    }

    // Filter reports by selected zone if specified
    const zoneFilteredReports = reports.filter((r) => {
      if (selectedZone === 'all') return true;
      if (r.zone === selectedZone) return true;
      if (r.marketName && r.marketName.toLowerCase().includes(selectedZone.toLowerCase())) return true;
      if (selectedZone === 'Zone A - Rawalpindi' && (r.marketName.includes('راولپنڈی') || r.marketName.includes('راجہ بازار'))) return true;
      if (selectedZone === 'Zone B - Lahore' && (r.marketName.includes('لاہور') || r.marketName.includes('انارکلی'))) return true;
      if (selectedZone === 'Zone C - Karachi' && (r.marketName.includes('کراچی') || r.marketName.includes('ایمپریس'))) return true;
      if (selectedZone === 'Zone D - Islamabad' && (r.marketName.includes('اسلام آباد') || r.marketName.includes('ایف ٹین'))) return true;
      if (selectedZone === 'Zone E - Peshawar' && (r.marketName.includes('پشاور') || r.marketName.includes('قصہ خوانی'))) return true;
      return false;
    });

    return days.map((dayItem, index) => {
      // Find matching reports for this day
      const dayReports = zoneFilteredReports.filter((r) => {
        if (r.date && r.date === dayItem.dateStr) return true;
        // Fallback relative timestamp checks
        if (dayItem.dateStr === '2026-09-02' && (r.timestamp?.includes('Mins') || r.timestamp?.includes('Hour') || r.timestamp?.includes('Today') || r.timestamp === 'Just now')) return true;
        if (dayItem.dateStr === '2026-09-01' && r.timestamp?.includes('Yesterday')) return true;
        if (r.timestamp && r.timestamp.includes(dayItem.labelEn)) return true;
        return false;
      });

      // Calculate aggregated metrics
      const totalReports = dayReports.length;
      let severeViolations = 0; // >15% overcharge
      let moderateViolations = 0; // 0-15% overcharge
      let resolvedCount = 0;
      let dispatchedCount = 0;
      let totalVariancePct = 0;
      let totalExcessPkr = 0;

      // Track items and zones
      const itemFrequency: Record<string, number> = {};
      const zoneBreakdown: Record<string, number> = {
        rawalpindi: 0,
        lahore: 0,
        karachi: 0,
        islamabad: 0,
        peshawar: 0,
        other: 0,
      };

      dayReports.forEach((r) => {
        const variance = r.dcRate > 0 ? ((r.chargedPrice - r.dcRate) / r.dcRate) * 100 : 0;
        const excess = Math.max(0, r.chargedPrice - r.dcRate);

        totalVariancePct += variance;
        totalExcessPkr += excess;

        if (variance > 15) {
          severeViolations++;
        } else if (variance > 0) {
          moderateViolations++;
        }

        if (r.status === 'resolved') resolvedCount++;
        if (r.status === 'dispatched') dispatchedCount++;

        // Frequency of items
        const itemKey = r.item.split('(')[0].trim();
        itemFrequency[itemKey] = (itemFrequency[itemKey] || 0) + 1;

        // Zone mapping
        const loc = (r.zone || r.marketName || '').toLowerCase();
        if (loc.includes('rawalpindi') || loc.includes('راجہ بازار')) zoneBreakdown.rawalpindi++;
        else if (loc.includes('lahore') || loc.includes('انارکلی')) zoneBreakdown.lahore++;
        else if (loc.includes('karachi') || loc.includes('ایمپریس')) zoneBreakdown.karachi++;
        else if (loc.includes('islamabad') || loc.includes('ایف ٹین')) zoneBreakdown.islamabad++;
        else if (loc.includes('peshawar') || loc.includes('قصہ خوانی')) zoneBreakdown.peshawar++;
        else zoneBreakdown.other++;
      });

      // Most frequently violated item
      let topItem = isUrdu ? 'متنوع اشیاء' : 'Various Goods';
      let maxCount = 0;
      Object.entries(itemFrequency).forEach(([item, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topItem = item;
        }
      });

      const avgVariancePct = totalReports > 0 ? Number((totalVariancePct / totalReports).toFixed(1)) : 0;
      // In compliance or resolved
      const compliantOrResolved = resolvedCount;

      return {
        dateStr: dayItem.dateStr,
        displayLabel: isUrdu ? dayItem.labelUrdu : dayItem.labelEn,
        totalReports,
        severeViolations,
        moderateViolations,
        compliantOrResolved,
        dispatchedCount,
        avgVariancePct,
        totalExcessPkr,
        topItem,
        // Zone-wise breakdown for grouped/stacked charts
        rawalpindiViolations: zoneBreakdown.rawalpindi,
        lahoreViolations: zoneBreakdown.lahore,
        karachiViolations: zoneBreakdown.karachi,
        islamabadViolations: zoneBreakdown.islamabad,
        peshawarViolations: zoneBreakdown.peshawar,
        totalViolations: severeViolations + moderateViolations,
      };
    });
  }, [reports, timeRange, selectedZone, isUrdu]);

  // Executive KPI summary calculations
  const kpis = useMemo(() => {
    let peakDay = chartData[0];
    let totalAllReports = 0;
    let totalSevere = 0;
    let totalExcess = 0;
    let totalResolved = 0;

    chartData.forEach((d) => {
      totalAllReports += d.totalReports;
      totalSevere += d.severeViolations;
      totalExcess += d.totalExcessPkr;
      totalResolved += d.compliantOrResolved;
      if (!peakDay || d.totalReports > peakDay.totalReports) {
        peakDay = d;
      }
    });

    const currentDay = chartData[chartData.length - 1];
    const previousDay = chartData[chartData.length - 2] || currentDay;
    const dayTrendPct = previousDay.avgVariancePct > 0 
      ? ((currentDay.avgVariancePct - previousDay.avgVariancePct) / previousDay.avgVariancePct) * 100 
      : 0;

    const resolutionRate = totalAllReports > 0 ? Math.round((totalResolved / totalAllReports) * 100) : 100;

    return {
      peakDay,
      totalAllReports,
      totalSevere,
      totalExcess,
      resolutionRate,
      dayTrendPct,
      currentAvgVariance: currentDay?.avgVariancePct || 0,
    };
  }, [chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-[#04231A] text-white p-3.5 rounded-2xl shadow-2xl border border-[#178A52] text-xs font-sans max-w-xs space-y-2">
        <div className="flex items-center justify-between border-b border-[#178A52]/40 pb-1.5">
          <span className="font-extrabold text-[#E3A82B] text-sm">{data.displayLabel}</span>
          <span className="bg-[#178A52]/40 text-[#DCEFE4] px-2 py-0.5 rounded-full text-[10px] font-mono">
            {data.dateStr}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[#DCEFE4]/70 block">{isUrdu ? 'مجموعی شکایات:' : 'Total Reports:'}</span>
            <span className="font-bold text-white text-base">{data.totalReports}</span>
          </div>
          <div>
            <span className="text-[#DCEFE4]/70 block">{isUrdu ? 'اوسط زائد شرح:' : 'Avg Overcharge:'}</span>
            <span className={`font-bold text-base ${data.avgVariancePct > 15 ? 'text-[#FF6B6B]' : data.avgVariancePct > 5 ? 'text-[#E3A82B]' : 'text-[#7BA66B]'}`}>
              +{data.avgVariancePct}%
            </span>
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-[#178A52]/30 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-[#FF6B6B]">
              <span className="w-2 h-2 rounded-full bg-[#E53935]" />
              {isUrdu ? 'شدید خلاف ورزی (>15%):' : 'Severe Overcharge (>15%):'}
            </span>
            <span className="font-mono font-bold text-white">{data.severeViolations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-[#E3A82B]">
              <span className="w-2 h-2 rounded-full bg-[#E3A82B]" />
              {isUrdu ? 'معمولی تجاوز (≤15%):' : 'Moderate Overcharge:'}
            </span>
            <span className="font-mono font-bold text-white">{data.moderateViolations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-[#7BA66B]">
              <span className="w-2 h-2 rounded-full bg-[#178A52]" />
              {isUrdu ? 'حل شدہ / نوٹس جاری:' : 'Resolved / Actioned:'}
            </span>
            <span className="font-mono font-bold text-white">{data.compliantOrResolved}</span>
          </div>
        </div>

        {data.topItem && (
          <div className="bg-[#0B4A31]/80 rounded-lg p-1.5 text-[10px] text-[#DCEFE4] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#E3A82B] shrink-0" />
            <span>
              {isUrdu ? 'سب سے زیادہ رپورٹ شدہ جنس: ' : 'Top Overcharged: '}
              <strong className="text-white">{data.topItem}</strong>
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#178A52]/20 shadow-md space-y-6 text-[#132A21]">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F6F2E7]">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#DCEFE4] text-[#0B4A31] px-3 py-1 rounded-full text-xs font-extrabold mb-2">
            <BarChart2 className="w-3.5 h-3.5 text-[#178A52]" />
            <span>{isUrdu ? 'شہری شکایات ڈیٹا گرڈ' : 'Citizen Intelligence Grid'}</span>
          </div>

          <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-[#04231A] flex items-center gap-2">
            <span>{isUrdu ? 'روزانہ گراں فروشی کے رجحانات (Daily Overcharging Trends)' : 'Daily Overcharging Trends'}</span>
          </h3>
          <p className="text-xs text-[#5C6F63] font-urdu mt-0.5 max-w-2xl">
            {isUrdu
              ? 'شہریوں کی جانب سے جمع کروائی گئی شکایات کا روزانہ تجزیہ، مارکیٹ زوننگ خلاف ورزیاں اور ڈی سی ریٹ سے انحراف کا حقیقی وقت کا مانیٹرنگ چارٹ۔'
              : 'Aggregated citizen report analytics showing daily price ceiling violations, zone severity breakdown, and variance above official DC rates.'}
          </p>
        </div>

        {/* View & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Market Zone Dropdown */}
          <div className="relative flex items-center">
            <MapPin className="w-3.5 h-3.5 text-[#178A52] absolute left-2.5 pointer-events-none" />
            <select
              value={selectedZone}
              onChange={(e) => {
                setSelectedZone(e.target.value);
                if (onSelectZoneFilter && e.target.value !== 'all') {
                  onSelectZoneFilter(e.target.value);
                }
              }}
              className="bg-[#FCFAF3] border border-[#178A52]/30 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#04231A] focus:outline-none focus:border-[#178A52] shadow-sm cursor-pointer"
            >
              <option value="all">{isUrdu ? 'تمام مارکیٹ زونز (All Zones)' : 'All Market Zones'}</option>
              {marketZonesList.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* Time Horizon Toggle */}
          <div className="flex items-center bg-[#FCFAF3] p-1 rounded-xl border border-[#178A52]/30">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                timeRange === '7d' ? 'bg-[#178A52] text-white shadow-sm' : 'text-[#5C6F63] hover:text-[#04231A]'
              }`}
            >
              {isUrdu ? '7 دن' : '7 Days'}
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                timeRange === '14d' ? 'bg-[#178A52] text-white shadow-sm' : 'text-[#5C6F63] hover:text-[#04231A]'
              }`}
            >
              {isUrdu ? '14 دن' : '14 Days'}
            </button>
          </div>

          {/* Metric View Tabs */}
          <div className="flex items-center bg-[#04231A] p-1 rounded-xl border border-[#178A52]/40">
            <button
              onClick={() => setMetricView('severity')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                metricView === 'severity' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4] hover:text-white'
              }`}
              title="View violation volume by severity"
            >
              {isUrdu ? 'حجم و شدت' : 'Severity Stack'}
            </button>
            <button
              onClick={() => setMetricView('variance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                metricView === 'variance' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4] hover:text-white'
              }`}
              title="View average overcharging percentage"
            >
              {isUrdu ? 'اوسط زائد شرح %' : 'Avg Variance %'}
            </button>
            <button
              onClick={() => setMetricView('zones')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                metricView === 'zones' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4] hover:text-white'
              }`}
              title="View market zones comparison"
            >
              {isUrdu ? 'زون وائز تقابل' : 'Zone Breakdown'}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Analytical KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FCFAF3] border border-[#178A52]/20 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#5C6F63] text-[11px] font-bold">
            <span>{isUrdu ? 'مجموعی شکایات (رپورٹس)' : 'Total Reports'}</span>
            <Info className="w-3.5 h-3.5 text-[#178A52]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sora font-extrabold text-2xl text-[#04231A]">{kpis.totalAllReports}</span>
            <span className="text-[10px] text-[#5C6F63] font-mono">({timeRange.toUpperCase()})</span>
          </div>
          <span className="text-[10px] text-[#178A52] font-semibold block">
            {kpis.totalSevere} {isUrdu ? 'شدید خلاف ورزیاں' : 'Severe Violations'}
          </span>
        </div>

        <div className="bg-[#FCFAF3] border border-[#178A52]/20 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#5C6F63] text-[11px] font-bold">
            <span>{isUrdu ? 'آج کی اوسط زائد شرح' : "Today's Avg Overcharge"}</span>
            <Flame className="w-3.5 h-3.5 text-[#E3A82B]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-sora font-extrabold text-2xl ${kpis.currentAvgVariance > 15 ? 'text-[#E53935]' : 'text-[#E3A82B]'}`}>
              +{kpis.currentAvgVariance}%
            </span>
            <span className="text-[10px] text-[#5C6F63] font-urdu">{isUrdu ? 'ڈی سی ریٹ سے اوپر' : 'above DC'}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#178A52] font-bold">
            {kpis.dayTrendPct <= 0 ? (
              <>
                <TrendingDown className="w-3 h-3 text-[#178A52]" />
                <span>{Math.abs(kpis.dayTrendPct).toFixed(1)}% {isUrdu ? 'بہتری (کمی)' : 'reduction'}</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 text-[#E53935]" />
                <span className="text-[#E53935]">+{kpis.dayTrendPct.toFixed(1)}% {isUrdu ? 'اضافہ' : 'increase'}</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#FCFAF3] border border-[#178A52]/20 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#5C6F63] text-[11px] font-bold">
            <span>{isUrdu ? 'انتہائی خلاف ورزی کا دن' : 'Peak Violation Day'}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#E53935]" />
          </div>
          <div className="font-sora font-extrabold text-lg text-[#04231A] truncate">
            {kpis.peakDay?.displayLabel || 'N/A'}
          </div>
          <span className="text-[10px] text-[#E53935] font-semibold block">
            {kpis.peakDay?.totalReports || 0} {isUrdu ? 'شکایات درج ہوئیں' : 'reports recorded'}
          </span>
        </div>

        <div className="bg-[#FCFAF3] border border-[#178A52]/20 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#5C6F63] text-[11px] font-bold">
            <span>{isUrdu ? 'حل شدہ تناسب (PERA)' : 'Enforcement Rate'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#178A52]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sora font-extrabold text-2xl text-[#178A52]">{kpis.resolutionRate}%</span>
            <span className="text-[10px] text-[#178A52] font-bold">Actioned</span>
          </div>
          <span className="text-[10px] text-[#5C6F63] font-urdu block">
            {isUrdu ? 'مجسٹریٹ فیلڈ چالان و تصحیح' : 'Fines & Price Corrected'}
          </span>
        </div>
      </div>

      {/* Main Recharts BarChart Canvas */}
      <div className="bg-[#FCFAF3] border border-[#178A52]/20 rounded-2xl p-4 sm:p-6 shadow-inner">
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'severity' ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
                onMouseMove={(state: any) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setActiveBarIndex(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setActiveBarIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" vertical={false} />
                <XAxis 
                  dataKey="displayLabel" 
                  tick={{ fill: '#04231A', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#B2D5C3' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#5C6F63', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => {
                    if (value === 'severeViolations') return isUrdu ? 'شدید گراں فروشی (>15%)' : 'Severe Overcharge (>15%)';
                    if (value === 'moderateViolations') return isUrdu ? 'معتدل اضافہ (≤15%)' : 'Moderate Overcharge (≤15%)';
                    if (value === 'compliantOrResolved') return isUrdu ? 'کارروائی مکمل / ریگولرائزڈ' : 'Resolved / Regularized';
                    return value;
                  }}
                />
                <Bar 
                  dataKey="severeViolations" 
                  name="severeViolations" 
                  stackId="a" 
                  fill="#E53935" 
                  radius={[0, 0, 0, 0]} 
                />
                <Bar 
                  dataKey="moderateViolations" 
                  name="moderateViolations" 
                  stackId="a" 
                  fill="#E3A82B" 
                  radius={[0, 0, 0, 0]} 
                />
                <Bar 
                  dataKey="compliantOrResolved" 
                  name="compliantOrResolved" 
                  stackId="a" 
                  fill="#178A52" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            ) : metricView === 'variance' ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" vertical={false} />
                <XAxis 
                  dataKey="displayLabel" 
                  tick={{ fill: '#04231A', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#B2D5C3' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#5C6F63', fontSize: 11 }}
                  unit="%" 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#178A52" strokeWidth={2} label={{ value: 'Official DC Ceiling (0%)', fill: '#178A52', fontSize: 10, position: 'insideTopLeft' }} />
                <ReferenceLine y={10} stroke="#E3A82B" strokeDasharray="3 3" label={{ value: 'Warning Alert (+10%)', fill: '#E3A82B', fontSize: 10, position: 'insideTopRight' }} />
                <Bar 
                  dataKey="avgVariancePct" 
                  name="avgVariancePct" 
                  radius={[8, 8, 0, 0]}
                >
                  {chartData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.avgVariancePct > 15 ? '#E53935' : entry.avgVariancePct > 8 ? '#E3A82B' : '#178A52'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" vertical={false} />
                <XAxis 
                  dataKey="displayLabel" 
                  tick={{ fill: '#04231A', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#B2D5C3' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#5C6F63', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => {
                    if (value === 'rawalpindiViolations') return 'Zone A (Rawalpindi)';
                    if (value === 'lahoreViolations') return 'Zone B (Lahore)';
                    if (value === 'karachiViolations') return 'Zone C (Karachi)';
                    if (value === 'islamabadViolations') return 'Zone D (Islamabad)';
                    if (value === 'peshawarViolations') return 'Zone E (Peshawar)';
                    return value;
                  }}
                />
                <Bar dataKey="rawalpindiViolations" stackId="z" fill="#0B4A31" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lahoreViolations" stackId="z" fill="#178A52" radius={[0, 0, 0, 0]} />
                <Bar dataKey="karachiViolations" stackId="z" fill="#3D7EA6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="islamabadViolations" stackId="z" fill="#E3A82B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="peshawarViolations" stackId="z" fill="#E53935" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Context Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#178A52]/15 text-[11px] text-[#5C6F63]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
              <span>{isUrdu ? 'شدید انحراف (>15%)' : 'Critical Spike (>15%)'}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3A82B]" />
              <span>{isUrdu ? 'وارننگ زون (5-15%)' : 'Warning Margin (5-15%)'}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#178A52]" />
              <span>{isUrdu ? 'ڈی سی ریٹ تعمیل / تصفیہ' : 'Ceiling Compliant / Resolved'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#0B4A31] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#178A52]" />
            <span>{isUrdu ? 'ڈیٹا سورس: تصدیق شدہ شہری شکایات و فیلڈ پیٹرول لاگ' : 'Source: Verified Citizen Reports & Field Patrol Logs'}</span>
          </div>
        </div>
      </div>

      {/* Zoning Violations Analysis & Actionable Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-[#FCFAF3] border border-[#178A52]/20 space-y-2">
          <div className="flex items-center gap-2 text-[#04231A] font-extrabold text-xs">
            <MapPin className="w-4 h-4 text-[#178A52]" />
            <span>{isUrdu ? 'حساس ترین مارکیٹ زونز' : 'Hot-Spot Market Zones'}</span>
          </div>
          <p className="text-xs text-[#5C6F63] font-urdu leading-relaxed">
            {isUrdu
              ? 'راجہ بازار زون اے (راولپنڈی) اور انارکلی بازار (لاہور) میں دالوں اور آٹے کے نرخوں پر سب سے زیادہ انحراف نوٹ کیا گیا ہے۔ فیلڈ پیٹرول اسکواڈز کو ان مقامات پر ترجیحی ڈسپیچ جاری ہے۔'
              : 'Raja Bazaar Zone A (Rawalpindi) and Anarkali Bazaar (Lahore) show the highest frequency of pulse & flour rate violations. Patrol squads prioritize these coordinates.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FCFAF3] border border-[#178A52]/20 space-y-2">
          <div className="flex items-center gap-2 text-[#04231A] font-extrabold text-xs">
            <AlertTriangle className="w-4 h-4 text-[#E3A82B]" />
            <span>{isUrdu ? 'سب سے زیادہ زائد نرخ کی اشیاء' : 'Top Overpriced Commodities'}</span>
          </div>
          <p className="text-xs text-[#5C6F63] font-urdu leading-relaxed">
            {isUrdu
              ? 'پیاز درجہ اول (+30.4%)، کھلا تازہ دودھ (+11.3%) اور ٹماٹر فارمی (+31.8%) شہری شکایات میں سرفہرست اشیاء ہیں۔ ڈی سی ہول سیل منڈیوں پر بھی چیک پوسٹس فعال ہیں۔'
              : 'Onion First Grade (+30.4%), Fresh Loose Milk (+11.3%), and Farm Tomatoes (+31.8%) account for 64% of overcharge reports.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FCFAF3] border border-[#178A52]/20 space-y-2">
          <div className="flex items-center gap-2 text-[#04231A] font-extrabold text-xs">
            <ShieldCheck className="w-4 h-4 text-[#178A52]" />
            <span>{isUrdu ? 'پالیسی و نفاذی کارروائی' : 'Enforcement & Correction'}</span>
          </div>
          <p className="text-xs text-[#5C6F63] font-urdu leading-relaxed">
            {isUrdu
              ? 'رپورٹ موصول ہونے کے بعد اوسط حل کا وقت 9 منٹ ریکارڈ کیا گیا ہے۔ 92% شکایات میں دکاندار نے موقع پر سرکاری ڈی سی نرخ تسلیم کر کے اضافی قیمت واپس کی۔'
              : 'Average magistrate squad response time is 9 minutes. In 92% of cases, vendors complied and refunded overcharged amounts on spot.'}
          </p>
        </div>
      </div>
    </div>
  );
};
