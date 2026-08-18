"use client";

import React, { useState } from 'react';
import { Search, Shield } from 'lucide-react';
import ChassisInput from '@/components/ChassisInput';
import Dashboard from '@/components/Dashboard';
import AdminPanel from '@/components/AdminPanel';

export default function Home() {
  const [activeView, setActiveView] = useState('decoder'); // 'decoder' or 'admin'
  const [decodeData, setDecodeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDecode = async (vin) => {
    setIsLoading(true);
    setErrorMsg('');
    setDecodeData(null);
    
    const len = vin.length;
    const routeType = len === 17 ? 'standard' : 'short';
    const apiUrl = `http://localhost:8000/api/v1/decode/${routeType}/${vin}?include_valuation=true`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to decode VIN.');
      }

      const data = await response.json();
      setDecodeData(data);
    } catch (e) {
      setErrorMsg(e.message || 'API is disconnected. Please check that uvicorn is running on port 8000.');
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setDecodeData(null);
    setErrorMsg('');
  };

  return (
    <main className="min-h-screen pb-16 px-4 max-w-6xl mx-auto space-y-6">
      
      {/* Top Navbar header */}
      <nav className="flex justify-between items-center py-5 border-b border-slate-200/50 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-md shadow-blue-500/10 hover:scale-105 transition-transform duration-300">
            V
          </div>
          <span className="font-extrabold text-slate-800 text-sm tracking-widest uppercase bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">VIN Sphere</span>
        </div>
        
        <div className="flex gap-1 bg-slate-200/45 backdrop-blur-md border border-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('decoder')}
            className={`px-4.5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 cursor-pointer ${
              activeView === 'decoder' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/5' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            Decoder
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`px-4.5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 cursor-pointer ${
              activeView === 'admin' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/5' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            Admin Panel
          </button>
        </div>
      </nav>

      {/* Main View Area */}
      <div className="space-y-6">
        {activeView === 'decoder' ? (
          <>
            <ChassisInput onDecode={handleDecode} isLoading={isLoading} onReset={handleReset} />
            
            {errorMsg && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <Dashboard data={decodeData} />
          </>
        ) : (
          <AdminPanel />
        )}
      </div>

    </main>
  );
}
