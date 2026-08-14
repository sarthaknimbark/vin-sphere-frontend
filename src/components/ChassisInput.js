"use client";

import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, AlertTriangle, ShieldCheck, Car } from 'lucide-react';

export default function ChassisInput({ onDecode, isLoading, onReset }) {
  const [vin, setVin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [warnMsg, setWarnMsg] = useState('');

  useEffect(() => {
    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleanVin.length === 0) {
      setErrorMsg('');
      setWarnMsg('');
      return;
    }

    const validLengths = [9, 10, 11, 12, 13, 17];
    if (!validLengths.includes(cleanVin.length)) {
      setErrorMsg(`Chassis number must be 9, 10, 11, 12, 13, or 17 characters (currently ${cleanVin.length}).`);
      setWarnMsg('');
      return;
    }

    setErrorMsg('');

    if (cleanVin.length === 17) {
      const checkResult = validate17CharVin(cleanVin);
      if (!checkResult.isValid) {
        setWarnMsg(checkResult.error);
      } else {
        setWarnMsg('');
      }
    } else {
      setWarnMsg('');
    }
  }, [vin]);

  function validate17CharVin(vinStr) {
    if (/[IOQ]/i.test(vinStr)) {
      return { isValid: false, error: "VIN cannot contain prohibited letters I, O, or Q." };
    }
    
    const transMap = {
      A:1, B:2, C:3, D:4, E:5, F:6, G:7, h:8, J:1, K:2, L:3, M:4, N:5, P:7, R:9,
      S:2, T:3, U:4, V:5, W:6, X:7, Y:8, Z:9
    };
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vinStr[i];
      let val = 0;
      if (/\d/.test(char)) {
        val = parseInt(char, 10);
      } else if (transMap[char] !== undefined) {
        val = transMap[char];
      } else {
        return { isValid: false, error: `Invalid character '${char}' in VIN.` };
      }
      sum += val * weights[i];
    }
    
    const remainder = sum % 11;
    const expected = remainder === 10 ? "X" : String(remainder);
    const actual = vinStr[8];
    if (expected !== actual) {
      return { isValid: false, error: `Check-digit mismatch at 9th position (calculated '${expected}', but found '${actual}').` };
    }
    
    return { isValid: true, error: "" };
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if ([9, 10, 11, 12, 13, 17].includes(cleanVin.length)) {
      onDecode(cleanVin);
    }
  };

  const handleClear = () => {
    setVin('');
    setErrorMsg('');
    setWarnMsg('');
    onReset();
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-800 text-sm tracking-tight">Chassis lookup</h2>
        </div>
        <p className="text-xs text-slate-400">Enter chassis number to lookup vehicle details</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

          {/* Chassis Number */}
          <div className="md:col-span-9 input-outline-container py-1.5 px-3">
            <span className="floating-label">Chassis number</span>
            <div className="flex items-center gap-2 mt-1">
              <Car className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full bg-transparent text-slate-800 text-sm font-semibold focus:outline-none uppercase tracking-widest placeholder:text-slate-300"
                placeholder="Enter Chassis Number"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3.5 px-4 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !!errorMsg || vin.length === 0}
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Lookup</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-3.5 transition-all"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Validation Output alerts */}
        {errorMsg && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {warnMsg && !errorMsg && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{warnMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
}
