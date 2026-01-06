
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
  Target,
  History,
  Sun,
  Moon
} from 'lucide-react';
import { isValid, isAfter, startOfToday, parse, parseISO, format, getDaysInMonth } from 'date-fns';
import { calculateAge, getBirthdayCountdown, getZodiacSign } from './utils/dateUtils.ts';
import { AgeResult, BirthdayCountdown, ZodiacInfo } from './types.ts';

type InputMode = 'dropdown' | 'manual';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const today = startOfToday();
  const currentYear = today.getFullYear();

  // Theme State
  const [theme, setTheme] = useState<Theme>('light');

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

  // Sync theme with document for Tailwind dark: utility
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const yearsOptions = useMemo(() => {
    const arr = [];
    for (let i = currentYear + 20; i >= 1900; i--) arr.push(i);
    return arr;
  }, [currentYear]);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysArray = (year: string, month: string) => {
    const y = parseInt(year);
    const m = parseInt(month);
    if (isNaN(y) || isNaN(m)) return Array.from({ length: 31 }, (_, i) => i + 1);
    const count = getDaysInMonth(new Date(y, m));
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  const birthDaysOptions = useMemo(() => getDaysArray(birthYear, birthMonth), [birthYear, birthMonth]);
  const targetDaysOptions = useMemo(() => getDaysArray(targetYear, targetMonth), [targetYear, targetMonth]);

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

  useEffect(() => {
    let birthDate: Date | null = null;
    let calculationDate: Date | null = null;

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

    if (targetDay && targetMonth && targetYear) {
      calculationDate = new Date(parseInt(targetYear), parseInt(targetMonth), parseInt(targetDay));
    }

    if (!birthDate || !calculationDate || !isValid(calculationDate)) {
      setAgeData(null);
      setCountdown(null);
      setZodiac(null);
      if (inputMode === 'manual' && manualBirth.trim()) {
        setError("Invalid date format. Use YYYY-MM-DD.");
      } else {
        setError(null);
      }
      return;
    }

    if (isAfter(birthDate, calculationDate)) {
      setError("Birth date cannot be in the future relative to comparison.");
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

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const inputClasses = "w-full appearance-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 rounded-2xl p-4 font-bold text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer text-sm shadow-sm hover:border-slate-300 dark:hover:border-slate-600";

  const renderDatePicker = (
    label: string, 
    icon: React.ReactNode, 
    d: string, setD: (v: string) => void, 
    m: string, setM: (v: string) => void, 
    y: string, setY: (v: string) => void,
    daysArr: number[]
  ) => (
    <div className="space-y-4 group">
      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-indigo-500 transition-colors">
        {icon} {label}
      </label>
      <div className="grid grid-cols-12 gap-3">
        <div className="relative col-span-5">
          <select value={y} onChange={(e) => setY(e.target.value)} className={inputClasses}>
            <option value="" disabled className="dark:bg-slate-900">Year</option>
            {yearsOptions.map(yr => <option key={yr} value={yr} className="dark:bg-slate-900">{yr}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative col-span-4">
          <select value={m} onChange={(e) => setM(e.target.value)} className={inputClasses}>
            <option value="" disabled className="dark:bg-slate-900">Month</option>
            {monthsList.map((mon, i) => <option key={mon} value={i} className="dark:bg-slate-900">{mon.substring(0, 3)}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative col-span-3">
          <select value={d} onChange={(e) => setD(e.target.value)} className={inputClasses}>
            <option value="" disabled className="dark:bg-slate-900">Day</option>
            {daysArr.map(day => <option key={day} value={day} className="dark:bg-slate-900">{day}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-start mb-10 w-full px-2">
          <div className="text-left">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Clock className="w-6 h-6 text-white" />
              </div>
              Exact<span className="text-indigo-600 dark:text-indigo-400">Age</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-xs uppercase tracking-widest">Precision Chronology</p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            )}
          </button>
        </div>

        {/* Main Input Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 mb-8 transition-colors duration-300">
          <div className="flex items-center justify-between mb-10">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button 
                onClick={() => setInputMode('dropdown')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${inputMode === 'dropdown' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <LayoutGrid className="w-3 h-3 inline mr-1.5" /> Picker
              </button>
              <button 
                onClick={() => setInputMode('manual')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${inputMode === 'manual' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <Type className="w-3 h-3 inline mr-1.5" /> Manual
              </button>
            </div>
            <button onClick={handleReset} className="text-slate-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-2">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-10">
            {/* Birth Date Section */}
            {inputMode === 'dropdown' ? (
              renderDatePicker("Birth Date", <History className="w-3 h-3" />, birthDay, setBirthDay, birthMonth, setBirthMonth, birthYear, setBirthYear, birthDaysOptions)
            ) : (
              <div className="space-y-4 group">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 group-focus-within:text-indigo-500 transition-colors">
                   <Type className="w-3 h-3" /> Manual Input
                </label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={manualBirth}
                  onChange={(e) => setManualBirth(e.target.value)}
                  className={inputClasses}
                />
              </div>
            )}

            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              <div className="relative bg-white dark:bg-slate-900 px-4">
                <Target className="w-5 h-5 text-slate-200 dark:text-slate-700" />
              </div>
            </div>

            {/* Target Date Section */}
            <div className="pt-2">
              {renderDatePicker("Calculate Age On", <Target className="w-3 h-3" />, targetDay, setTargetDay, targetMonth, setTargetMonth, targetYear, setTargetYear, targetDaysOptions)}
            </div>
          </div>

          {error && (
            <div className="mt-8 flex items-center gap-3 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-100 dark:border-red-900 animate-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
          )}
        </div>

        {/* Results Visualizer */}
        {ageData && countdown && !error && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-indigo-600 dark:bg-indigo-700 rounded-[2.5rem] p-10 text-center text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-indigo-200 dark:text-indigo-300 font-black text-[10px] uppercase tracking-[0.4em] mb-6">Age Breakdown</p>
                 <div className="space-y-2">
                    <h2 className="text-6xl sm:text-7xl font-black leading-none flex items-baseline justify-center gap-2">
                      {ageData.years} <span className="text-xl font-bold opacity-50 uppercase tracking-widest">Years</span>
                    </h2>
                    <div className="flex items-center justify-center gap-4 py-4">
                      <div className="h-px w-8 bg-white/20"></div>
                      <p className="text-indigo-100 text-lg font-bold flex items-center gap-2">
                        & <span className="text-white text-5xl font-black">{ageData.months}</span> <span className="opacity-60 uppercase text-xs tracking-tighter">Months</span>
                      </p>
                      <div className="h-px w-8 bg-white/20"></div>
                    </div>
                 </div>
                 
                 <div className="mt-8 pt-8 border-t border-white/10">
                   <div className="flex items-center justify-center gap-2 opacity-50">
                     <Calendar className="w-3 h-3" />
                     <p className="text-[10px] font-black uppercase tracking-widest">
                       Computed instantly
                     </p>
                   </div>
                 </div>
               </div>
               <Timer className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-center transition-colors">
                <Cake className="w-6 h-6 text-pink-500 dark:text-pink-400 mx-auto mb-3" />
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Upcoming</p>
                {countdown.isToday ? (
                  <p className="text-xl font-black text-pink-500 dark:text-pink-400 animate-bounce">TODAY! 🎉</p>
                ) : (
                  <p className="text-xl font-black text-slate-800 dark:text-slate-200">{countdown.months}m {countdown.days}d</p>
                )}
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-center transition-colors">
                <Star className="w-6 h-6 text-amber-500 dark:text-amber-400 mx-auto mb-3" />
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Celestial</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-slate-800 dark:text-slate-200">{zodiac?.sign}</span>
                  <span className="text-xl filter drop-shadow-sm">{zodiac?.symbol}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!ageData && !error && (
          <div className="mt-16 text-center opacity-30 dark:opacity-20">
            <div className="bg-slate-200 dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
              <History className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-black uppercase tracking-[0.3em]">Awaiting Input</p>
          </div>
        )}

        <footer className="mt-20 text-slate-300 dark:text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] text-center">
          ExactAge Platform &copy; {currentYear}
        </footer>
      </div>
    </div>
  );
};

export default App;
