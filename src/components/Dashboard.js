"use client";

import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, Check, ShieldCheck, Calendar, Globe, Gauge, Cpu, Fuel, Users, Settings, Car, Wrench, AlertTriangle } from 'lucide-react';

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState('ml');
  const [copied, setCopied] = useState(false);
  const [evaluationInputsOpen, setEvaluationInputsOpen] = useState(true);
  const [valuationOpen, setValuationOpen] = useState(true);
  const [evaluateChassisOpen, setEvaluateChassisOpen] = useState(true);
  const [rawJsonOpen, setRawJsonOpen] = useState(false); // Collapsed by default to keep dashboard clean
  const [specsOpen, setSpecsOpen] = useState(true); // Open by default
  
  // Interactive inputs state (Mileage and Accidents)
  const [mileage, setMileage] = useState('50000');
  const [accidents, setAccidents] = useState('0');

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

  const decode = data?.decode_result;
  if (!decode) return null;

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
    navigator.clipboard.writeText(JSON.stringify(getAdjustedJson(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* 1. Vehicle Summary Bar */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 tracking-wide">Vehicle summary</span>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono tracking-widest">{decode.vin}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {decode.regional_spec && decode.regional_spec !== 'UNKNOWN' && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {decode.regional_spec}
            </span>
          )}
          <button
            onClick={handleCopyReport}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Copies the raw API JSON response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy report</span>
            <ChevronDown className="w-3 h-3 text-slate-400 border-l border-slate-200 pl-1 ml-1" />
          </button>
        </div>
      </div>

      {/* 2. Subtitle Header */}
      <div className="flex items-start gap-3 pl-1 mt-3">
        <Car className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            {decode.make} · {decode.model} · {decode.year}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Body type: {decode.body_type}</p>
        </div>
      </div>

      {/* 3. Collapsible Vehicle Specifications Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setSpecsOpen(!specsOpen)}
          className="w-full flex items-center justify-between p-4 border-b border-slate-100 focus:outline-none"
        >
          <div className="flex flex-col gap-0.5 text-left">
            <h3 className="font-bold text-slate-800 text-sm">Vehicle specifications</h3>
            <p className="text-[11px] text-slate-400">Auto-filled after chassis lookup</p>
          </div>
          {specsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {specsOpen && (
          <div className="p-4 space-y-4">
            {/* Main Grid of cards (12 total boxes) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Year */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500" /> Year
                </span>
                <span className="text-sm font-extrabold text-slate-800">{decode.year}</span>
              </div>

              {/* Make */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Car className="w-3 h-3 text-blue-500" /> Make
                </span>
                <span className="text-sm font-extrabold text-slate-800 uppercase">{decode.make}</span>
              </div>

              {/* Model */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Car className="w-3 h-3 text-blue-500" /> Model
                </span>
                <span className="text-sm font-extrabold text-slate-800 uppercase">{decode.model}</span>
              </div>

              {/* Regional Specs */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-500" /> Regional specs
                </span>
                <span className="text-sm font-extrabold text-slate-800 uppercase">{decode.regional_spec}</span>
              </div>

              {/* Body Type */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Car className="w-3 h-3 text-blue-500" /> Body type
                </span>
                <span className="text-sm font-extrabold text-slate-800 uppercase">{decode.body_type}</span>
              </div>

              {/* Spec (Trim) */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Settings className="w-3 h-3 text-blue-500" /> Spec
                </span>
                <span className="text-sm font-extrabold text-slate-800 uppercase">{decode.trim}</span>
              </div>

              {/* Cylinders */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-blue-500" /> Cylinders
                </span>
                <span className="text-sm font-extrabold text-slate-800 uppercase">{decode.cylinders}</span>
              </div>

              {/* Seats */}
              <div className="border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" /> Seats
                </span>
                <span className="text-sm font-extrabold text-slate-800 uppercase">{decode.no_of_passengers !== 'UNKNOWN' ? `${decode.no_of_passengers} SEATS` : 'UNKNOWN'}</span>
              </div>

            </div>

            {/* Description Section */}
            <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/30">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Description</span>
              <p className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wide">
                {getGeneratedDescription()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Collapsible RAW JSON Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setRawJsonOpen(!rawJsonOpen)}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <div className="flex flex-col gap-0.5 text-left">
            <h3 className="font-bold text-slate-800 text-sm">Raw JSON</h3>
            <p className="text-[11px] text-slate-400">Collapsible raw API response (length parameter removed)</p>
          </div>
          {rawJsonOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        {rawJsonOpen && (
          <div className="p-4 border-t border-slate-100 bg-[#f8fafc]">
            <div className="font-mono text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap select-all">
              {JSON.stringify(getAdjustedJson(), null, 2)}
            </div>
          </div>
        )}
      </div>

      {/* 5. Collapsible Evaluation Inputs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setEvaluationInputsOpen(!evaluationInputsOpen)}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <div className="flex flex-col gap-0.5 text-left">
            <h3 className="font-bold text-slate-800 text-sm">Evaluation inputs</h3>
            <p className="text-[11px] text-slate-400">Optional – used when evaluating chassis value</p>
          </div>
          {evaluationInputsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {evaluationInputsOpen && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Mileage Box */}
              <div className="input-outline-container py-1.5 px-3">
                <span className="floating-label">Mileage (km)</span>
                <div className="flex items-center gap-2 mt-1">
                  <Gauge className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    className="w-full bg-transparent text-slate-800 text-sm font-semibold focus:outline-none placeholder:text-slate-300"
                    placeholder="Enter Mileage"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                  />
                </div>
              </div>

              {/* Accidents Box */}
              <div className="input-outline-container py-1.5 px-3">
                <span className="floating-label">No. of accidents</span>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    className="w-full bg-transparent text-slate-800 text-sm font-semibold focus:outline-none placeholder:text-slate-300"
                    placeholder="Enter No. of Accidents"
                    value={accidents}
                    onChange={(e) => setAccidents(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 6. Collapsible Vehicle Valuation Details */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setValuationOpen(!valuationOpen)}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <div className="flex flex-col gap-0.5 text-left">
            <h3 className="font-bold text-slate-800 text-sm">Vehicle valuation</h3>
            <p className="text-[11px] text-slate-400">Evaluated values in AED</p>
          </div>
          {valuationOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        {valuationOpen && (
          <div className="p-4 border-t border-slate-100 space-y-6">
            
            {/* Tab switch selector */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500">Select Valuation Source:</span>
              <div className="flex gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
                {[
                  { id: 'ml', name: 'CatBoost ML', available: !!data.ml_valuation },
                  { id: 'lookup', name: 'DB Lookup', available: !!data.lookup_valuation },
                  { id: 'toyota', name: 'Toyota Engine', available: !!data.toyota_valuation },
                  { id: 'depreciation', name: 'DriveArabia', available: !!(data.depreciated_valuations?.DriveArabia || Object.values(data.depreciated_valuations || {}).length > 0) },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      !tab.available ? 'opacity-30 cursor-not-allowed' :
                      activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    onClick={() => tab.available && setActiveTab(tab.id)}
                    disabled={!tab.available}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {activeVal ? (
              <div className="space-y-6">
                
                {/* Big Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Retail Average */}
                  <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/20 flex flex-col gap-1">
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider">Retail Average</span>
                    <span className="text-2xl font-black text-blue-700">AED {formatAdjustedPrice(activeVal.retail_price.average).toLocaleString()}</span>
                  </div>

                  {/* Trade Average */}
                  <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/20 flex flex-col gap-1">
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Trade Average</span>
                    <span className="text-2xl font-black text-emerald-700">AED {formatAdjustedPrice(activeVal.trade_price.average).toLocaleString()}</span>
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Price Type</th>
                        <th className="py-3 px-4 text-center">Average</th>
                        <th className="py-3 px-4 text-center">Maximum</th>
                        <th className="py-3 px-4 text-center">Minimum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          Retail
                        </td>
                        <td className="py-3 px-4 text-center font-bold">{formatAdjustedPrice(activeVal.retail_price.average).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{formatAdjustedPrice(activeVal.retail_price.maximum).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{formatAdjustedPrice(activeVal.retail_price.minimum).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          Trade
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">{formatAdjustedPrice(activeVal.trade_price.average).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{formatAdjustedPrice(activeVal.trade_price.maximum).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{formatAdjustedPrice(activeVal.trade_price.minimum).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              <div className="text-slate-400 text-center py-6 text-xs">
                No pricing model estimation matched this chassis combination.
              </div>
            )}

          </div>
        )}
      </div>

      {/* 7. Collapsible Evaluate Chassis footer bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setEvaluateChassisOpen(!evaluateChassisOpen)}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <div className="flex flex-col gap-0.5 text-left">
            <h3 className="font-bold text-slate-800 text-sm">Evaluate chassis</h3>
            <p className="text-[11px] text-slate-400 font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Evaluation complete
            </p>
          </div>
          {evaluateChassisOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {evaluateChassisOpen && (
          <div className="p-4 border-t border-slate-100 flex items-center gap-2">
            <button className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all">
              <ShieldCheck className="w-3.5 h-3.5" /> Evaluation complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
