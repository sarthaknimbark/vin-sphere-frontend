"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Car, 
  CircleDollarSign, 
  Sliders, 
  Check, 
  ChevronDown, 
  Cpu, 
  Globe, 
  Calendar, 
  Users, 
  Gauge, 
  AlertTriangle, 
  Database, 
  UserCheck, 
  Code, 
  Terminal, 
  Copy, 
  Sparkles 
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedVinIndex, setSelectedVinIndex] = useState(0);
  const [previewMileage, setPreviewMileage] = useState(45000);
  const [previewAccidents, setPreviewAccidents] = useState(0);
  const [apiTab, setApiTab] = useState('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Mock VIN data matching real-world specs and DB schema
  const mockVehicles = [
    {
      vin: 'WAUZZZFF6K1028859',
      make: 'AUDI',
      model: 'A3',
      year: '2019',
      trim: '30 TFSI',
      body_type: 'SEDAN',
      cylinders: '4',
      regional_spec: 'GCC',
      no_of_passengers: '5',
      base_price_retail: 95000,
      base_price_trade: 82000,
      engine: '1.4L Turbo',
      transmission: '7-Speed S-Tronic',
      origin: 'Germany'
    },
    {
      vin: 'EE1004019201',
      make: 'TOYOTA',
      model: 'COROLLA',
      year: '2021',
      trim: '1.6 GLI',
      body_type: 'SEDAN',
      cylinders: '4',
      regional_spec: 'GCC',
      no_of_passengers: '5',
      base_price_retail: 68000,
      base_price_trade: 58000,
      engine: '1.6L Dual VVT-i',
      transmission: 'CVT',
      origin: 'Japan'
    }
  ];

  const currentVehicle = mockVehicles[selectedVinIndex];

  // Live depreciation multiplier calculation based on landing page sliders
  const mileageDiff = previewMileage - 50000;
  let mileageFactor = 1.0;
  if (mileageDiff > 0) {
    mileageFactor = Math.max(0.7, 1.0 - (mileageDiff / 10000) * 0.015);
  } else {
    mileageFactor = Math.min(1.15, 1.0 - (mileageDiff / 10000) * 0.01);
  }
  const accidentFactor = Math.max(0.6, 1.0 - (previewAccidents * 0.05));
  const totalFactor = mileageFactor * accidentFactor;

  const adjustedRetail = Math.round(currentVehicle.base_price_retail * totalFactor);
  const adjustedTrade = Math.round(currentVehicle.base_price_trade * totalFactor);

  // FAQ Accordion items
  const faqs = [
    {
      q: "How does the multi-engine valuation calculate prices?",
      a: "VIN Sphere queries multiple pricing mechanisms in real-time, including our proprietary CatBoost machine learning model (trained on historical regional transactions), direct database index lookups, manufacturer-specific valuation parameters (e.g., Toyota Engine), and historical DriveArabia depreciation metrics. We then weigh these models depending on data density and confidence scores."
    },
    {
      q: "Why is GCC Regional Specification validation critical?",
      a: "Vehicles imported to the GCC have specific engineering modifications (enhanced cooling systems, dust filters, specific trim levels). Normal US/EU VIN decoders fail to identify GCC specs, leading to appraisal errors up to 25%. VIN Sphere is purpose-built to validate regional specification indicators directly from chassis details."
    },
    {
      q: "What is the Human Verification Queue?",
      a: "For rare imports or newly introduced models where machine learning confidence falls below 85%, decodes are automatically routed to our Admin Verification Panel. Automotive experts review, enrich, and approve the details, ensuring 100% database fidelity and reinforcing future ML model training cycles."
    },
    {
      q: "Can I integrate VIN Sphere into my existing CRM or ERP?",
      a: "Absolutely. We offer a high-performance, developer-friendly REST API. Complete with standard responses, authentication keys, and sub-second response times, you can query both standard 17-character VINs and short frame numbers seamlessly."
    }
  ];

  // API Code Snippets matching active mock vehicle
  const codeSnippets = {
    curl: `curl -X 'GET' \\
  'https://api.vinsphere.ae/api/v1/decode/standard/${currentVehicle.vin}?include_valuation=true' \\
  -H 'accept: application/json' \\
  -H 'X-API-Key: vs_live_9b83a04f2f01'`,
    python: `import requests

url = "https://api.vinsphere.ae/api/v1/decode/standard/${currentVehicle.vin}"
headers = {
    "X-API-Key": "vs_live_9b83a04f2f01",
    "accept": "application/json"
}
params = {"include_valuation": "true"}

response = requests.get(url, headers=headers, params=params)
vehicle_data = response.json()
print(f"Decoded {vehicle_data['decode_result']['make']} {vehicle_data['decode_result']['model']}")`,
    javascript: `const headers = new Headers({
  'X-API-Key': 'vs_live_9b83a04f2f01',
  'accept': 'application/json'
});

fetch('https://api.vinsphere.ae/api/v1/decode/standard/${currentVehicle.vin}?include_valuation=true', {
  headers
})
.then(res => res.json())
.then(data => console.log(\`Valuation: AED \${data.ml_valuation.retail_price.average}\`));`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[apiTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50/50 selection:bg-blue-500 selection:text-white">
      
      {/* 1. Header / Navbar */}
      <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-md shadow-blue-500/10 hover:scale-105 transition-transform duration-300">
                V
              </div>
              <span className="font-extrabold text-slate-800 text-sm tracking-widest uppercase bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">VIN Sphere</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Features</a>
              <a href="#demo" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Interactive Demo</a>
              <a href="#api" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Developer API</a>
              <a href="#usecases" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Use Cases</a>
              <a href="#faq" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/decoder" className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-2 px-4.5 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]">
                <span>Launch Decoder</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-10 left-10 w-[200px] h-[200px] bg-blue-400/10 blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-400/10 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/70">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest">GCC Automotive Intelligence</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Decenter Vehicle Spec Valuation & <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">VIN Intelligence</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed max-w-xl">
                The ultimate platform for regional GCC specification identification, instant check-digit checksum verification, and multi-engine algorithmic valuation estimates tailored for the Middle East market.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/decoder" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-[0.98]">
                  <span>Try Interactive Decoder</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#api" className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
                  <span>Developer API Docs</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/50 max-w-md">
                <div>
                  <h4 className="text-xl font-black text-slate-800">100%</h4>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Checksum Rigor</p>
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">4+</h4>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Valuation Engines</p>
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">&lt; 800ms</h4>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Query Latency</p>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Preview Mockup */}
            <div className="lg:col-span-6" id="demo">
              <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-xl relative overflow-hidden bg-white/95">
                {/* Visual frame header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Instant Decoder Preview</span>
                  </div>
                  
                  {/* Selector tab */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                    {mockVehicles.map((car, idx) => (
                      <button
                        key={car.vin}
                        onClick={() => setSelectedVinIndex(idx)}
                        className={`text-[9px] font-extrabold px-2.5 py-1.5 rounded-md uppercase tracking-wider transition-all ${
                          selectedVinIndex === idx ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {car.make}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Results Content */}
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex justify-between items-center">
                    <div>
                      <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Active Chassis</span>
                      <span className="text-xs font-bold text-slate-800 font-mono tracking-wider">{currentVehicle.vin}</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {currentVehicle.regional_spec} SPEC
                    </span>
                  </div>

                  {/* Title specs */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                        {currentVehicle.make} · {currentVehicle.model} · {currentVehicle.year}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold">Body: {currentVehicle.body_type} | Trim: {currentVehicle.trim}</p>
                    </div>
                    <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded uppercase">
                      Decoded
                    </span>
                  </div>

                  {/* Spec Grid Mockup */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="border border-slate-100 rounded-lg p-2 bg-slate-50/20 text-left">
                      <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Specs</span>
                      <span className="text-[11px] font-extrabold text-slate-700">{currentVehicle.regional_spec}</span>
                    </div>
                    <div className="border border-slate-100 rounded-lg p-2 bg-slate-50/20 text-left">
                      <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Cylinders</span>
                      <span className="text-[11px] font-extrabold text-slate-700">{currentVehicle.cylinders} Cyl</span>
                    </div>
                    <div className="border border-slate-100 rounded-lg p-2 bg-slate-50/20 text-left">
                      <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Seats</span>
                      <span className="text-[11px] font-extrabold text-slate-700">{currentVehicle.no_of_passengers} seats</span>
                    </div>
                    <div className="border border-slate-100 rounded-lg p-2 bg-slate-50/20 text-left">
                      <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Origin</span>
                      <span className="text-[11px] font-extrabold text-slate-700">{currentVehicle.origin}</span>
                    </div>
                  </div>

                  {/* Valuation Inputs Preview Sliders */}
                  <div className="border border-slate-100 rounded-xl p-3 bg-indigo-50/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-indigo-500" /> Interactive Appraisal Factors
                      </span>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Live Adjustment</span>
                    </div>

                    <div className="space-y-2">
                      {/* Mileage Slider */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>Mileage: {previewMileage.toLocaleString()} km</span>
                          <span>Factor: {mileageFactor >= 1.0 ? `+${Math.round((mileageFactor-1)*100)}%` : `-${Math.round((1-mileageFactor)*100)}%`}</span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="150000"
                          step="5000"
                          value={previewMileage}
                          onChange={(e) => setPreviewMileage(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      {/* Accident Selector */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-slate-600">Accident History:</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((acc) => (
                            <button
                              key={acc}
                              onClick={() => setPreviewAccidents(acc)}
                              className={`text-[10px] font-extrabold w-6 h-6 rounded flex items-center justify-center transition-all ${
                                previewAccidents === acc 
                                  ? 'bg-red-500 text-white font-black' 
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {acc}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Output Cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="border border-blue-100/60 rounded-xl p-3 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 text-left">
                      <span className="block text-[8px] text-blue-600 font-extrabold uppercase">Retail Estimate</span>
                      <span className="text-base font-black text-blue-700">AED {adjustedRetail.toLocaleString()}</span>
                    </div>
                    <div className="border border-emerald-100/60 rounded-xl p-3 bg-gradient-to-br from-emerald-50/20 to-teal-50/20 text-left">
                      <span className="block text-[8px] text-emerald-600 font-extrabold uppercase">Trade Appraisal</span>
                      <span className="text-base font-black text-emerald-700">AED {adjustedTrade.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-center">
                  <Link href="/decoder" className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                    <span>Try Real-time Lookup with a Chassis Number</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Problem vs Solution Section */}
      <section className="py-20 bg-slate-100/40 border-y border-slate-200/45 relative" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Market Context</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Solving the GCC Automotive Valuation Gap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Standard decoders and appraisal metrics ignore GCC market realities, leading to transaction bottlenecks, inaccurate insurance quotes, and direct financial losses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* The Problem */}
            <div className="bg-white border border-red-100 rounded-2xl p-6.5 text-left space-y-4 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">The Traditional Appraisal Bottleneck</h3>
              
              <ul className="space-y-3.5 text-xs text-slate-500 font-medium">
                <li className="flex gap-2.5 items-start">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span><strong>Generic Global DBs:</strong> US and European databases don't decode GCC specs, completely missing regional engine cooling & air filter attributes.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span><strong>Static Depreciation:</strong> Calculators use basic yearly depreciation percentages without adapting to mileage, wear, and local transactional indices.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span><strong>High Manual Error:</strong> Manually reviewing and looking up individual chassis sheets results in typing typos and slower transaction cycles.</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="bg-gradient-to-br from-white to-blue-50/20 border border-blue-100 rounded-2xl p-6.5 text-left space-y-4 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">The VIN Sphere Intelligence</h3>
              
              <ul className="space-y-3.5 text-xs text-slate-500 font-semibold">
                <li className="flex gap-2.5 items-start">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span><strong>Dedicated GCC Spec Engine:</strong> Direct algorithmic validation to identify regional trims, spec markers, and Middle East country parameters.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span><strong>4x Dynamic Valuation engines:</strong> Simultaneous estimates from CatBoost AI Model, database indexes, Toyota parameters, and depreciation metrics.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span><strong>Expert Validation Queue:</strong> Integrates a human verification panel where automotive experts audit edge-case decodes and commit them to the master database.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Production-Grade Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              No fake claims. We expose real platform features built directly inside the active VIN Sphere decoder interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5 lg:gap-8">
            
            {/* Feature 1: Chassis Number Validation */}
            <div className="border border-slate-200/50 rounded-2xl p-6 text-left space-y-3 bg-slate-50/10 hover:bg-slate-50/30 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                <Check className="w-4 h-4 font-black" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Flexible Chassis Lengths</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Accepts standard 17-character VINs and short frame chassis numbers (9, 10, 11, 12, or 13 characters) typical of Japanese and classic regional imports.
              </p>
            </div>

            {/* Feature 2: Mathematical Check-Digit Validation */}
            <div className="border border-slate-200/50 rounded-2xl p-6 text-left space-y-3 bg-slate-50/10 hover:bg-slate-50/30 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-600 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">ISO Check-Digit Checksum</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Applies the mathematical check-digit algorithm at the 9th position of the 17-character VIN, flagging mismatches or prohibited letters (I, O, Q) in real-time.
              </p>
            </div>

            {/* Feature 3: Dynamic Valuation Sliders */}
            <div className="border border-slate-200/50 rounded-2xl p-6 text-left space-y-3 bg-slate-50/10 hover:bg-slate-50/30 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Interactive Adjustments</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Recalculates appraisal values in real-time based on interactive input parameters, adjusting overall retail and trade estimates based on mileage and accidents.
              </p>
            </div>

            {/* Feature 4: Four Valuation Engines */}
            <div className="border border-slate-200/50 rounded-2xl p-6 text-left space-y-3 bg-slate-50/10 hover:bg-slate-50/30 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                <CircleDollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Valuation Multi-Engine</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Provides modular valuation tabs for CatBoost ML models, Database direct indexes, Toyota engine indicators, and DriveArabia depreciation models.
              </p>
            </div>

            {/* Feature 5: Expert Verification Panel */}
            <div className="border border-slate-200/50 rounded-2xl p-6 text-left space-y-3 bg-slate-50/10 hover:bg-slate-50/30 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100/50 flex items-center justify-center text-purple-600 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Admin Approval Queue</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Includes an authenticated verification queue for automotive administrators to edit specs draft and commit edge-case models straight to the database.
              </p>
            </div>

            {/* Feature 6: Developer API and JSON Export */}
            <div className="border border-slate-200/50 rounded-2xl p-6 text-left space-y-3 bg-slate-50/10 hover:bg-slate-50/30 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-600 shrink-0">
                <Code className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Developer-First Architecture</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Exposes raw JSON copyable responses (excluding redundant data lengths) and offers copyable scripts to fetch specs via web API.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="py-20 bg-slate-100/40 border-y border-slate-200/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              How the Validation System Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Step-by-step overview of how the VIN Sphere chassis decoder validates, analyzes, and estimates value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col text-left space-y-3.5 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/10">
                1
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Input Chassis</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Submit a standard 17-character VIN or a short frame number (9 to 13 digits) into the lookup card.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col text-left space-y-3.5 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/10">
                2
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">ISO Code Validation</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                The client-side engine checks length rules and computes the mathematical checksum to prevent typo lookup queries.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col text-left space-y-3.5 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/10">
                3
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Valuation Query</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Queries CatBoost ML models, databases, and DriveArabia to evaluate retail & trade values.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col text-left space-y-3.5 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/10">
                4
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Report Export</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Adjust appraisal values based on actual mileage and accidents, then copy the raw JSON report.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. API Showcase Section */}
      <section className="py-20 bg-white" id="api">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Developers</span>
              
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Integrate Our VIN Intelligence API
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                Expose high-performance vehicle specification decoding and valuation indices directly inside your dealer CRM, insurance pricing engines, or logistics trackers.
              </p>

              <div className="space-y-4.5 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <span>GCC regional trim specifications returned instantly.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span>High-speed responses (under 800ms) with CatBoost ML metrics.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span>ISO check-digit validation results included.</span>
                </div>
              </div>
            </div>

            {/* Right Terminal Panel */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative text-left">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-slate-950 px-5 py-3 border-b border-slate-900/60">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Chassis Query Endpoint</span>
                  </div>
                  
                  {/* Copy Button */}
                  <button 
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-bold font-mono border border-slate-800 px-2.5 py-1 rounded-lg bg-slate-900 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-950/40 border-b border-slate-900/60 px-5">
                  {['curl', 'python', 'javascript'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setApiTab(tab)}
                      className={`py-2 px-3 text-[10px] font-bold font-mono border-b-2 uppercase tracking-wider transition-all cursor-pointer ${
                        apiTab === tab 
                          ? 'border-blue-500 text-blue-400' 
                          : 'border-transparent text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Code viewport */}
                <div className="p-5 font-mono text-[11px] text-slate-300 overflow-x-auto select-all leading-relaxed min-h-[160px] bg-slate-950/20">
                  <pre className="whitespace-pre-wrap">{codeSnippets[apiTab]}</pre>
                </div>

                {/* Response Preview */}
                <div className="border-t border-slate-900 bg-slate-950/40 p-4">
                  <span className="block text-[8px] text-slate-500 font-extrabold uppercase font-mono tracking-widest mb-2.5">Example JSON Response Output</span>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 max-h-[180px] overflow-y-auto text-[10px] text-slate-400 font-mono scrollbar-thin">
                    <pre>{JSON.stringify({
                      vin: currentVehicle.vin,
                      decode_result: {
                        make: currentVehicle.make,
                        model: currentVehicle.model,
                        year: currentVehicle.year,
                        trim: currentVehicle.trim,
                        body_type: currentVehicle.body_type,
                        cylinders: currentVehicle.cylinders,
                        regional_spec: currentVehicle.regional_spec,
                        no_of_passengers: currentVehicle.no_of_passengers,
                        origin: currentVehicle.origin,
                        description: `${currentVehicle.trim} - ${currentVehicle.cylinders} cyls - ${currentVehicle.body_type} - GCC`
                      },
                      ml_valuation: {
                        retail_price: { average: currentVehicle.base_price_retail, minimum: currentVehicle.base_price_retail - 5000, maximum: currentVehicle.base_price_retail + 5000 },
                        trade_price: { average: currentVehicle.base_price_trade, minimum: currentVehicle.base_price_trade - 4000, maximum: currentVehicle.base_price_trade + 4000 }
                      }
                    }, null, 2)}</pre>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Use Cases Section */}
      <section className="py-20 bg-slate-100/40 border-y border-slate-200/45" id="usecases">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Applications</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Designed For The Automotive Industry
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Custom-built workflows optimized for regional automotive players and retail buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5">
            
            {/* Dealerships */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 hover:shadow-md transition-all duration-300 text-left space-y-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Car className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-tight">Dealerships</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Instantly appraise trade-in vehicles based on real GCC specification filters, adjust metrics live for mileage or crashes, and eliminate typing errors.
              </p>
            </div>

            {/* Insurance Companies */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 hover:shadow-md transition-all duration-300 text-left space-y-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-tight">Insurance Underwriters</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Verify check-digit validation to spot cloned VINs, evaluate realistic retail premiums via multi-engine index feeds, and confirm passenger configurations.
              </p>
            </div>

            {/* Individual Buyers */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 hover:shadow-md transition-all duration-300 text-left space-y-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CircleDollarSign className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-tight">Automotive Buyers</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Confirm whether a private import has true GCC specifications, and evaluate fair local trade prices using independent, algorithmic valuation metrics.
              </p>
            </div>

            {/* Logistics & Fleet Managers */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 hover:shadow-md transition-all duration-300 text-left space-y-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Gauge className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-tight">Fleet Managers</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Appraise commercial values over time with DriveArabia depreciation percentages, tracking vehicle cylinder, weight, and specifications automatically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion Section */}
      <section className="py-20 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Inquiries</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Everything you need to know about the VIN Sphere decoding & appraisal platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-300 bg-slate-50/10 hover:bg-slate-50/30"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 focus:outline-none text-left cursor-pointer"
                >
                  <span className="font-extrabold text-slate-800 text-sm">{faq.q}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200/50 transition-transform duration-300 ${
                    activeFaq === idx ? 'rotate-180 text-blue-600' : 'text-slate-400'
                  }`}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1.5 border-t border-slate-200/40">
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final CTA Section */}
      <section className="relative py-20 overflow-hidden bg-slate-950 text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Decode Your First Chassis?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed max-w-xl mx-auto">
            Get instant Middle East specification evaluations, check-digit calculations, and pricing comparisons under one second.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/decoder" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-4.5 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-[0.98]">
              <span>Open Vehicle Decoder</span>
              <ArrowRight className="w-4 h-4 font-bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Footer Section */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-base tracking-tighter">
                V
              </div>
              <span className="font-extrabold text-white text-xs tracking-widest uppercase">VIN Sphere</span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-wider">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
              <a href="#api" className="hover:text-white transition-colors">Developer API</a>
              <a href="#usecases" className="hover:text-white transition-colors">Use Cases</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>

            {/* Rights */}
            <div className="text-[10px] font-semibold tracking-wide">
              &copy; {new Date().getFullYear()} VIN Sphere. All rights reserved. Regional spec indices and valuation indicators.
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
