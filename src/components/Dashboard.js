"use client";

import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, Check, ShieldCheck, Calendar, Globe, Gauge, Cpu, Fuel, Users, Settings, Car, Wrench, AlertTriangle, Sliders, CircleDollarSign, ClipboardCheck } from 'lucide-react';

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState('ml');
  const [copied, setCopied] = useState(false);
  const [evaluationInputsOpen, setEvaluationInputsOpen] = useState(false); // Collapsed by default
  const [valuationOpen, setValuationOpen] = useState(true);
  const [evaluateChassisOpen, setEvaluateChassisOpen] = useState(true);
  const [rawJsonOpen, setRawJsonOpen] = useState(false); // Collapsed by default to keep dashboard clean
  const [specsOpen, setSpecsOpen] = useState(true); // Open by default
  
  // Interactive inputs state (Mileage and Accidents)
  const [mileage, setMileage] = useState('50000');
  const [accidents, setAccidents] = useState('0');

  const decode = data?.decode_result;
  const hasData = !!decode;

  // Auto-switch to first available pricing tab when data changes
  React.useEffect(() => {
    if (data) {
      if (data.ml_valuation) {
        setActiveTab('ml');
      } else if (data.lookup_valuation) {
        setActiveTab('lookup');
      } else if (data.toyota_valuation) {
        setActiveTab('toyota');
      } else if (data.depreciated_valuations?.DriveArabia || Object.keys(data.depreciated_valuations || {}).length > 0) {
        setActiveTab('depreciation');
      }
    }
  }, [data]);

  // Valuation dynamic factors calculation based on input boxes
  const currentMileage = mileage ? Number(mileage) : 50000;
  const mileageDiff = currentMileage - 50000;
  let mileageFactor = 1.0;
  if (mileageDiff > 0) {
    mileageFactor = Math.max(0.7, 1.0 - (mileageDiff / 10000) * 0.015);
  } else {
    mileageFactor = Math.min(1.15, 1.0 - (mileageDiff / 10000) * 0.01);
  }

  const accidentCount = accidents ? Number(accidents) : 0;
  const accidentFactor = Math.max(0.6, 1.0 - (accidentCount * 0.05));
  const totalFactor = mileageFactor * accidentFactor;

  const formatAdjustedPrice = (val) => {
    if (!val) return 0;
    return Math.round(val * totalFactor);
  };

  // Generate description based on specs matching the screenshot
  const getGeneratedDescription = () => {
    if (!hasData) return '';
    const specs = [
      decode.trim !== 'UNKNOWN' ? decode.trim : 'STD',
      decode.cylinders !== 'UNKNOWN' ? `${decode.cylinders} cyls` : '4 cyls',
      decode.body_type !== 'UNKNOWN' ? decode.body_type : 'SEDAN',
      decode.no_of_passengers !== 'UNKNOWN' ? `${decode.no_of_passengers} SEATS` : '5 SEATS'
    ].filter(Boolean).join(' ');
    
    return specs ? `${specs} - GCC` : 'Vehicle specifications decoded successfully.';
  };

  // Pricing values helper
  const getValuationSource = () => {
    if (!hasData) return null;
    switch (activeTab) {
      case 'ml': return data.ml_valuation;
      case 'lookup': return data.lookup_valuation;
      case 'toyota': return data.toyota_valuation;
      case 'depreciation': 
        return data.depreciated_valuations?.DriveArabia || Object.values(data.depreciated_valuations || {})[0];
      default: return null;
    }
  };

  const activeVal = getValuationSource();

  const getAdjustedJson = () => {
    if (!hasData) return {};
    const cleanData = JSON.parse(JSON.stringify(data));
    if (cleanData.decode_result) {
      delete cleanData.decode_result.length;
      cleanData.decode_result.description = getGeneratedDescription();
    }
    
    // Set custom inputs in raw response too
    cleanData.mileage = mileage;
    cleanData.noOfAccidentsNonGcc = accidents;
    
    const adjustValuation = (val) => {
      if (!val) return null;
      return {
        retail_price: {
          average: formatAdjustedPrice(val.retail_price.average),
          minimum: formatAdjustedPrice(val.retail_price.minimum),
          maximum: formatAdjustedPrice(val.retail_price.maximum)
        },
        trade_price: {
          average: formatAdjustedPrice(val.trade_price.average),
          minimum: formatAdjustedPrice(val.trade_price.minimum),
          maximum: formatAdjustedPrice(val.trade_price.maximum)
        }
      };
    };

    if (cleanData.ml_valuation) cleanData.ml_valuation = adjustValuation(cleanData.ml_valuation);
    if (cleanData.lookup_valuation) cleanData.lookup_valuation = adjustValuation(cleanData.lookup_valuation);
    if (cleanData.toyota_valuation) cleanData.toyota_valuation = adjustValuation(cleanData.toyota_valuation);
    if (cleanData.depreciated_valuations) {
      const adjustedDep = {};
      for (const k in cleanData.depreciated_valuations) {
        adjustedDep[k] = adjustValuation(cleanData.depreciated_valuations[k]);
      }
      cleanData.depreciated_valuations = adjustedDep;
    }
    return cleanData;
  };

  const handleCopyReport = () => {
    if (!hasData) return;
    navigator.clipboard.writeText(JSON.stringify(getAdjustedJson(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-5">
      
      {/* 1. Vehicle Summary Bar */}
      {hasData && (
        <div className="w-full glass-card rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Vehicle summary</span>
            </div>
            <span className="text-sm font-bold text-slate-800 font-mono tracking-widest">{decode.vin}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {decode.regional_spec && decode.regional_spec !== 'UNKNOWN' && (
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-3 py-1.5 rounded-full uppercase tracking-wider">
                {decode.regional_spec}
              </span>
            )}
            <button
              onClick={handleCopyReport}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              title="Copies the raw API JSON response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>Copy report</span>
              <ChevronDown className="w-3 h-3 text-slate-400 border-l border-slate-200 pl-1.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Subtitle Header */}
      {hasData && (
        <div className="flex items-center gap-3.5 pl-2 mt-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm shadow-blue-500/5">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent uppercase tracking-tight">
              {decode.make} · {decode.model} · {decode.year}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Body type: {decode.body_type}</p>
          </div>
        </div>
      )}

      {/* 3. Collapsible Vehicle Specifications Card */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setSpecsOpen(!specsOpen)}
          className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Vehicle specifications</h3>
              <p className="text-[11px] text-slate-500 font-medium">Auto-filled after chassis lookup</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all duration-300">
            {specsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {specsOpen && (
          <div className="p-5 border-t border-slate-200/50 space-y-4">
            {hasData ? (
              <>
                {/* Main Grid of cards (12 total boxes) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Year */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" /> Year
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 tracking-tight">{decode.year}</span>
                  </div>

                  {/* Make */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Car className="w-3 h-3 text-blue-500" /> Make
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{decode.make}</span>
                  </div>

                  {/* Model */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Car className="w-3 h-3 text-blue-500" /> Model
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{decode.model}</span>
                  </div>

                  {/* Regional Specs */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-500" /> Regional specs
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{decode.regional_spec}</span>
                  </div>

                  {/* Body Type */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Car className="w-3 h-3 text-blue-500" /> Body type
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{decode.body_type}</span>
                  </div>

                  {/* Spec (Trim) */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Settings className="w-3 h-3 text-blue-500" /> Spec
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{decode.trim}</span>
                  </div>

                  {/* Cylinders */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-blue-500" /> Cylinders
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 tracking-tight">{decode.cylinders}</span>
                  </div>

                  {/* Seats */}
                  <div className="border border-slate-200/50 rounded-xl p-3.5 flex flex-col gap-1 bg-slate-50/20 hover:bg-slate-50/60 transition-all duration-300">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-500" /> Seats
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 tracking-tight">{decode.no_of_passengers !== 'UNKNOWN' ? `${decode.no_of_passengers} SEATS` : 'UNKNOWN'}</span>
                  </div>

                </div>

                {/* Description Section */}
                <div className="border border-slate-200/50 rounded-xl p-4 bg-slate-50/30">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Description</span>
                  <p className="text-xs text-slate-700 font-bold mt-1.5 uppercase tracking-wide">
                    {getGeneratedDescription()}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-2.5">
                <p className="text-xs text-slate-500 font-semibold pl-1">
                  Run a chassis lookup to populate vehicle specifications.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Collapsible RAW JSON Card */}
      {hasData && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <button
            onClick={() => setRawJsonOpen(!rawJsonOpen)}
            className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer"
          >
            <div className="flex flex-col gap-0.5 text-left">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Raw JSON</h3>
              <p className="text-[11px] text-slate-500 font-medium">Collapsible raw API response (length parameter removed)</p>
            </div>
            <div className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all duration-300">
              {rawJsonOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>
          
          {rawJsonOpen && (
            <div className="p-4 border-t border-slate-200/50 bg-slate-50/30">
              <div className="font-mono text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap select-all p-3 bg-white border border-slate-200/80 rounded-xl shadow-inner">
                {JSON.stringify(getAdjustedJson(), null, 2)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Collapsible Evaluation Inputs */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setEvaluationInputsOpen(!evaluationInputsOpen)}
          className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Evaluation inputs</h3>
              <p className="text-[11px] text-slate-500 font-medium">Optional – used when evaluating chassis value</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all duration-300">
            {evaluationInputsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>
        {evaluationInputsOpen && (
          <div className="p-5 border-t border-slate-200/50 bg-slate-50/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Mileage Box */}
              <div className={`input-outline-container py-2 px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] ${!hasData ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}>
                <span className="floating-label">Mileage (km)</span>
                <div className="flex items-center gap-2.5 mt-1">
                  <Gauge className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    className="w-full bg-transparent text-slate-800 text-sm font-semibold focus:outline-none placeholder:text-slate-300 disabled:cursor-not-allowed"
                    placeholder="Enter Mileage"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    disabled={!hasData}
                  />
                </div>
              </div>

              {/* Accidents Box */}
              <div className={`input-outline-container py-2 px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] ${!hasData ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}>
                <span className="floating-label">No. of accidents</span>
                <div className="flex items-center gap-2.5 mt-1">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    className="w-full bg-transparent text-slate-800 text-sm font-semibold focus:outline-none placeholder:text-slate-300 disabled:cursor-not-allowed"
                    placeholder="Enter No. of Accidents"
                    value={accidents}
                    onChange={(e) => setAccidents(e.target.value)}
                    disabled={!hasData}
                  />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 6. Collapsible Vehicle Valuation Details */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setValuationOpen(!valuationOpen)}
          className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Vehicle valuation</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {hasData ? "Evaluated values in AED" : "Run evaluate chassis to load retail & trade values"}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all duration-300">
            {valuationOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>
        
        {valuationOpen && (
          <div className="p-5 border-t border-slate-200/50 space-y-6">
            
            {hasData && (
              /* Tab switch selector */
              <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5">
                <span className="text-xs font-bold text-slate-500">Select Valuation Source:</span>
                <div className="flex gap-1 bg-slate-100 border border-slate-200/60 p-1 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                  {[
                    { id: 'ml', name: 'CatBoost ML', available: !!data.ml_valuation },
                    { id: 'lookup', name: 'DB Lookup', available: !!data.lookup_valuation },
                    { id: 'toyota', name: 'Toyota Engine', available: !!data.toyota_valuation },
                    { id: 'depreciation', name: 'DriveArabia', available: !!(data.depreciated_valuations?.DriveArabia || Object.values(data.depreciated_valuations || {}).length > 0) },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        !tab.available ? 'opacity-30 cursor-not-allowed' :
                        activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                      }`}
                      onClick={() => tab.available && setActiveTab(tab.id)}
                      disabled={!tab.available}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasData && activeVal ? (
              <div className="space-y-6">
                
                {/* Big Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Retail Average */}
                  <div className="border border-blue-100/70 rounded-2xl p-5 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 flex flex-col gap-1.5 shadow-[inset_0_2px_4px_rgba(59,130,246,0.01)] hover:scale-[1.01] transition-transform duration-300">
                    <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-widest">Retail Average</span>
                    <span className="text-3xl font-black text-blue-700 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">AED {formatAdjustedPrice(activeVal.retail_price.average).toLocaleString()}</span>
                  </div>

                  {/* Trade Average */}
                  <div className="border border-emerald-100/70 rounded-2xl p-5 bg-gradient-to-br from-emerald-50/20 to-teal-50/20 flex flex-col gap-1.5 shadow-[inset_0_2px_4px_rgba(16,185,129,0.01)] hover:scale-[1.01] transition-transform duration-300">
                    <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-widest">Trade Average</span>
                    <span className="text-3xl font-black text-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">AED {formatAdjustedPrice(activeVal.trade_price.average).toLocaleString()}</span>
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm bg-white/50">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="py-3.5 px-5">Price Type</th>
                        <th className="py-3.5 px-5 text-center">Average</th>
                        <th className="py-3.5 px-5 text-center">Maximum</th>
                        <th className="py-3.5 px-5 text-center">Minimum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      <tr className="hover:bg-slate-50/30 transition-all">
                        <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-2">
                          <CircleDollarSign className="w-3.5 h-3.5 text-blue-500" />
                          <span>Retail</span>
                        </td>
                        <td className="py-3.5 px-5 text-center font-bold text-slate-800">{formatAdjustedPrice(activeVal.retail_price.average).toLocaleString()}</td>
                        <td className="py-3.5 px-5 text-center text-slate-500">{formatAdjustedPrice(activeVal.retail_price.maximum).toLocaleString()}</td>
                        <td className="py-3.5 px-5 text-center text-slate-500">{formatAdjustedPrice(activeVal.retail_price.minimum).toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/30 transition-all">
                        <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-2">
                          <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Trade</span>
                        </td>
                        <td className="py-3.5 px-5 text-center font-bold text-emerald-600">{formatAdjustedPrice(activeVal.trade_price.average).toLocaleString()}</td>
                        <td className="py-3.5 px-5 text-center text-slate-500">{formatAdjustedPrice(activeVal.trade_price.maximum).toLocaleString()}</td>
                        <td className="py-3.5 px-5 text-center text-slate-500">{formatAdjustedPrice(activeVal.trade_price.minimum).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            ) : hasData ? (
              <div className="text-slate-400 text-center py-8 text-xs font-semibold">
                No pricing model estimation matched this chassis combination.
              </div>
            ) : (
              /* Skeleton Table before Search */
              <div className="border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm bg-white/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-3.5 px-5">Price Type</th>
                      <th className="py-3.5 px-5 text-center">Average</th>
                      <th className="py-3.5 px-5 text-center">Maximum</th>
                      <th className="py-3.5 px-5 text-center">Minimum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    <tr>
                      <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-2">
                        <CircleDollarSign className="w-3.5 h-3.5 text-blue-400/80" />
                        <span>Retail</span>
                      </td>
                      <td className="py-3.5 px-5 text-center font-bold text-slate-400">-</td>
                      <td className="py-3.5 px-5 text-center text-slate-400">-</td>
                      <td className="py-3.5 px-5 text-center text-slate-400">-</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-2">
                        <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400/80" />
                        <span>Trade</span>
                      </td>
                      <td className="py-3.5 px-5 text-center font-bold text-slate-400">-</td>
                      <td className="py-3.5 px-5 text-center text-slate-400">-</td>
                      <td className="py-3.5 px-5 text-center text-slate-400">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>

      {/* 7. Collapsible Evaluate Chassis footer bar */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setEvaluateChassisOpen(!evaluateChassisOpen)}
          className="w-full flex items-center justify-between p-5 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100/50 flex items-center justify-center text-purple-600 shrink-0">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Evaluate chassis</h3>
              <p className="text-[11px] text-slate-400 font-semibold text-slate-500 flex items-center gap-1">
                {hasData ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Evaluation complete</span>
                  </>
                ) : (
                  "Lookup a chassis number to begin"
                )}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all duration-300">
            {evaluateChassisOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>
        {evaluateChassisOpen && (
          <div className="p-5 border-t border-slate-200/50 flex items-center gap-2 bg-slate-50/10">
            {hasData ? (
              <button className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/5 cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Evaluation complete</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 py-1 pl-1">
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 border border-slate-200 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-60"
                >
                  Evaluate chassis
                </button>
                <span className="text-xs text-slate-500 font-bold">Lookup a chassis number to begin.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
