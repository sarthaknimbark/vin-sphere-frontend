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
      <nav className="flex justify-between items-center py-4 border-b border-slate-200/80 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-base tracking-tighter">
            V
          </div>
          <span className="font-extrabold text-slate-800 text-base tracking-tight uppercase">VIN Sphere</span>
        </div>
        
        <div className="flex gap-1.5 bg-slate-200/60 border border-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('decoder')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'decoder' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Decoder
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
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

            {decodeData && <Dashboard data={decodeData} />}
          </>
        ) : (
          <AdminPanel />
        )}
      </div>

    </main>
  );
}
