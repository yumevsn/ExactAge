
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Cake, 
  Star, 
  RefreshCcw, 
  Timer, 
  ChevronDown, 
  Type, 
  LayoutGrid,
  AlertCircle,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Target,
  History
} from 'lucide-react';
import { isValid, isAfter, startOfToday, parse, parseISO, format, getDaysInMonth } from 'date-fns';
import { calculateAge, getBirthdayCountdown, getZodiacSign } from './utils/dateUtils';
import { AgeResult, BirthdayCountdown, ZodiacInfo } from './types';

type InputMode = 'dropdown' | 'manual';

const App: React.FC = () => {
  const today = startOfToday();
  const currentYear = today.getFullYear();

  // Mode Selection
  const [inputMode, setInputMode] = useState<InputMode>('dropdown');

  // Birth Date States (From)
  const [birthDay, setBirthDay] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>(''); 
  const [birthYear, setBirthYear] = useState<string>('');
  const [manualBirth, setManualBirth] = useState<string>('');

  // Target Date States (To)
  const [targetDay, setTargetDay] = useState<string>(today.getDate().toString());
  const [targetMonth, setTargetMonth] = useState<string>(today.getMonth().toString());
  const [targetYear, setTargetYear] = useState<string>(today.getFullYear().toString());

  // Result States
  const [error, setError] = useState<string | null>(null);
  const [ageData, setAgeData] = useState<AgeResult | null>(null);
  const [countdown, setCountdown] = useState<BirthdayCountdown | null>(null);
  const [zodiac, setZodiac] = useState<ZodiacInfo | null>(null);

  const yearsOptions = useMemo(() => {
    const arr = [];
    for (let i = currentYear + 20; i >= 1900; i--) arr.push(i);
    return arr;
  }, [currentYear]);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to get days in a specific year/month
  const getDaysArray = (year: string, month: string) => {
    const y = parseInt(year);
    const m = parseInt(month);
    if (isNaN(y) || isNaN(m)) return Array.from({ length: 31 }, (_, i) => i + 1);
    const count = getDaysInMonth(new Date(y, m));
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  // Birth Days Options
  const birthDaysOptions = useMemo(() => getDaysArray(birthYear, birthMonth), [birthYear, birthMonth]);
  
  // Target Days Options
  const targetDaysOptions = useMemo(() => getDaysArray(targetYear, targetMonth), [targetYear, targetMonth]);

  // Adjust days if they become invalid on month/year change
  useEffect(() => {
    if (birthDay && parseInt(birthDay) > birthDaysOptions.length) {
      setBirthDay(birthDaysOptions.length.toString());
    }
  }, [birthDaysOptions, birthDay]);

  useEffect(() => {
    if (targetDay && parseInt(targetDay) > targetDaysOptions.length) {
      setTargetDay(targetDaysOptions.length.toString());
    }
  }, [targetDaysOptions, targetDay]);

  // Calculation Logic
  useEffect(() => {
    let birthDate: Date | null = null;
    let calculationDate: Date | null = null;

    // Resolve Birth Date
    if (inputMode === 'dropdown') {
      if (birthDay && birthMonth && birthYear) {
        birthDate = new Date(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay));
      }
    } else {
      const attempts = [
        () => parseISO(manualBirth),
        () => parse(manualBirth, 'yyyy-MM-dd', new Date()),
        () => parse(manualBirth, 'MM/dd/yyyy', new Date()),
        () => parse(manualBirth, 'dd/MM/yyyy', new Date()),
        () => new Date(manualBirth)
      ];
      for (const attempt of attempts) {
        try {
          const d = attempt();
          if (isValid(d)) { birthDate = d; break; }
        } catch {}
      }
    }

    // Resolve Target Date (Always from picker now)
    if (targetDay && targetMonth && targetYear) {
      calculationDate = new Date(parseInt(targetYear), parseInt(targetMonth), parseInt(targetDay));
    }

    if (!birthDate || !calculationDate || !isValid(calculationDate)) {
      setAgeData(null);
      setCountdown(null);
      setZodiac(null);
      if (inputMode === 'manual' && manualBirth.trim()) {
        setError("Invalid birth date format. Try YYYY-MM-DD.");
      } else {
        setError(null);
      }
      return;
    }

    if (isAfter(birthDate, calculationDate)) {
      setError("Birth date cannot be after the comparison date.");
      setAgeData(null);
      return;
    }

    setError(null);
    setAgeData(calculateAge(birthDate, calculationDate));
    setCountdown(getBirthdayCountdown(birthDate, calculationDate));
    setZodiac(getZodiacSign(birthDate));
  }, [birthDay, birthMonth, birthYear, manualBirth, targetDay, targetMonth, targetYear, inputMode]);

  const handleReset = () => {
    setBirthDay(''); setBirthMonth(''); setBirthYear(''); 
    setManualBirth('');
    setTargetDay(today.getDate().toString());
    setTargetMonth(today.getMonth().toString());
    setTargetYear(today.getFullYear().toString());
    setError(null); setAgeData(null);
  };

  const renderDatePicker = (
    label: string, 
    icon: React.ReactNode, 
    d: string, setD: (v: string) => void, 
    m: string, setM: (v: string) => void, 
    y: string, setY: (v: string) => void,
    daysArr: number[]
  ) => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
        {icon} {label}
      </label>
      <div className="grid grid-cols-12 gap-2">
        <div className="relative col-span-5">
          <select value={y} onChange={(e) => setY(e.target.value)} className="w-full appearance-none bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold text-slate-800 outline-none transition-all cursor-pointer text-sm">
            <option value="" disabled>Year</option>
            {yearsOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        </div>
        <div className="relative col-span-4">
          <select value={m} onChange={(e) => setM(e.target.value)} className="w-full appearance-none bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold text-slate-800 outline-none transition-all cursor-pointer text-sm">
            <option value="" disabled>Month</option>
            {monthsList.map((mon, i) => <option key={mon} value={i}>{mon.substring(0, 3)}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        </div>
        <div className="relative col-span-3">
          <select value={d} onChange={(e) => setD(e.target.value)} className="w-full appearance-none bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold text-slate-800 outline-none transition-all cursor-pointer text-sm">
            <option value="" disabled>Day</option>
            {daysArr.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-3xl shadow-sm border border-slate-100 mb-6">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Exact<span className="text-indigo-600">Age</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 tracking-wide">Precise Age Comparison</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setInputMode('dropdown')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${inputMode === 'dropdown' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                <LayoutGrid className="w-4 h-4 inline mr-2" /> Picker
              </button>
              <button 
                onClick={() => setInputMode('manual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${inputMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                <Type className="w-4 h-4 inline mr-2" /> Manual
              </button>
            </div>
            <button onClick={handleReset} className="text-slate-300 hover:text-red-400 transition-colors p-2">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Birth Date Input */}
            {inputMode === 'dropdown' ? (
              renderDatePicker("Birth Date", <History className="w-3 h-3" />, birthDay, setBirthDay, birthMonth, setBirthMonth, birthYear, setBirthYear, birthDaysOptions)
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <Type className="w-3 h-3" /> Paste Birth Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1995-12-31"
                  value={manualBirth}
                  onChange={(e) => setManualBirth(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold text-slate-800 outline-none transition-all"
                />
              </div>
            )}

            <div className="border-t border-slate-50 pt-8">
              {/* Target Date Input (Always Picker) */}
              {renderDatePicker("Calculate Age On", <Target className="w-3 h-3" />, targetDay, setTargetDay, targetMonth, setTargetMonth, targetYear, setTargetYear, targetDaysOptions)}
            </div>
          </div>

          {error && (
            <div className="mt-8 flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {ageData && countdown && !error && (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-indigo-200 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">Calculated Result</p>
                 <h2 className="text-5xl sm:text-6xl font-black leading-tight mb-2">
                   {ageData.years} <span className="text-xl font-medium opacity-60">Years</span>
                 </h2>
                 <p className="text-indigo-100 text-lg font-bold flex items-center justify-center gap-2">
                   and <span className="text-white text-4xl font-black">{ageData.months}</span> <span className="text-indigo-200">Months</span>
                 </p>
                 
                 <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-8">
                   <div className="flex items-center justify-center gap-2 opacity-60">
                     <Calendar className="w-3 h-3" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">
                       Comparison Completed
                     </p>
                   </div>
                 </div>
               </div>
               <Timer className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 -rotate-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center">
                <Cake className="w-6 h-6 text-pink-500 mx-auto mb-3" />
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Next Birthday</p>
                {countdown.isToday ? (
                  <p className="text-xl font-black text-pink-500 animate-bounce">TODAY! 🎉</p>
                ) : (
                  <p className="text-xl font-black text-slate-800">{countdown.months}m {countdown.days}d</p>
                )}
              </div>
              
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center">
                <Star className="w-6 h-6 text-amber-500 mx-auto mb-3" />
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Zodiac Sign</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-slate-800">{zodiac?.sign}</span>
                  <span className="text-xl">{zodiac?.symbol}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!ageData && !error && (
          <div className="mt-16 text-center opacity-40">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Select dates to compare</p>
          </div>
        )}

        <footer className="mt-16 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
          ExactAge Precision Accuracy Engine
        </footer>
      </div>
    </div>
  );
};

export default App;
