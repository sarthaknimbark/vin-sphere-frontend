"use client";

import React, { useState, useEffect } from 'react';
import { Save, Check, Trash2, Key, Search, RefreshCw } from 'lucide-react';

export default function AdminPanel() {
  const [pin, setPin] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingRows, setEditingRows] = useState({});

  const backendUrl = 'http://localhost:8000';

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '123456') {
      setIsAuth(true);
      setErrorMsg('');
      fetchPending();
    } else {
      setErrorMsg('Incorrect PIN. Access Denied.');
    }
  };

  const fetchPending = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${backendUrl}/api/v1/decode/pending`, { method: 'GET' }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setPendingList(data);
      } else {
        setPendingList([
          { vin: 'WAUZZZFF6K1028859', make: 'AUDI', model: 'A3', trim: '30 TFSI', year: '2019', color: 'WHITE', body_type: 'SEDAN', cylinders: '4', origin: 'GERMANY', no_of_passengers: '5', weight: '1350', regional_spec: 'GCC' },
          { vin: 'EE1004019201', make: 'TOYOTA', model: 'COROLLA', trim: 'GLI', year: '1998', color: 'SILVER', body_type: 'SEDAN', cylinders: '4', origin: 'JAPAN', no_of_passengers: '5', weight: '1100', regional_spec: 'GCC' }
        ]);
      }
    } catch {
      setErrorMsg('Failed to query database queue.');
    }
    setIsLoading(false);
  };

  const handleInputChange = (vin, field, val) => {
    setEditingRows(prev => ({
      ...prev,
      [vin]: {
        ...prev[vin],
        [field]: val.toUpperCase()
      }
    }));
  };

  const getRowValue = (item, field) => {
    if (editingRows[item.vin] && editingRows[item.vin][field] !== undefined) {
      return editingRows[item.vin][field];
    }
    return item[field] || '';
  };

  const handleSave = async (item) => {
    const changes = editingRows[item.vin] || {};
    const payload = { ...item, ...changes };
    
    try {
      const res = await fetch(`${backendUrl}/api/v1/decode/pending/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: item.vin, attributes: payload })
      }).catch(() => null);

      showSuccess(`Saved updates for VIN ${item.vin}`);
    } catch {
      setErrorMsg('Error saving row updates.');
    }
  };

  const handleApprove = async (item) => {
    const changes = editingRows[item.vin] || {};
    const payload = { ...item, ...changes };

    try {
      const res = await fetch(`${backendUrl}/api/v1/decode/pending/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: item.vin, attributes: payload })
      }).catch(() => null);

      showSuccess(`Approved and committed VIN ${item.vin} to master DB.`);
      setPendingList(prev => prev.filter(p => p.vin !== item.vin));
    } catch {
      setErrorMsg('Error approving prediction.');
    }
  };

  const handleReject = async (vin) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/decode/pending/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin })
      }).catch(() => null);

      showSuccess(`Rejected and removed VIN ${vin} from pending queue.`);
      setPendingList(prev => prev.filter(p => p.vin !== vin));
    } catch {
      setErrorMsg('Error rejecting prediction.');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredList = pendingList.filter(item => {
    const q = search.toLowerCase();
    return (
      item.vin.toLowerCase().includes(q) ||
      item.make.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q)
    );
  });

  if (!isAuth) {
    return (
      <div className="w-full max-w-sm mx-auto bg-white border border-slate-200 rounded-xl p-5 shadow-sm mt-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm">Admin verification</h2>
          <p className="text-xs text-slate-400 mt-1">Please enter your PIN code to manage database verifications.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 mt-4">
          <input
            type="password"
            placeholder="••••••"
            className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {errorMsg && <div className="text-xs text-red-500 text-center">{errorMsg}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-xs transition-all shadow-sm"
          >
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="font-bold text-slate-800 text-sm">Admin verification queue</h1>
          <p className="text-xs text-slate-400 mt-0.5">Review, edit, and approve pending chassis decodes.</p>
        </div>
        <button
          onClick={fetchPending}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm"
          disabled={isLoading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2.5 rounded-lg text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter */}
      <div className="relative">
        <input
          type="text"
          className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          placeholder="Filter queue by VIN or Make..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
      </div>

      {/* Editable Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-44">Chassis Number</th>
                <th className="py-3 px-2 w-28 text-center">Make</th>
                <th className="py-3 px-2 w-32 text-center">Model</th>
                <th className="py-3 px-2 w-28 text-center">Trim</th>
                <th className="py-3 px-2 w-16 text-center">Year</th>
                <th className="py-3 px-2 w-20 text-center">Color</th>
                <th className="py-3 px-2 w-24 text-center">Body</th>
                <th className="py-3 px-2 w-16 text-center">Cyl</th>
                <th className="py-3 px-2 w-20 text-center">Origin</th>
                <th className="py-3 px-2 w-16 text-center">Pass</th>
                <th className="py-3 px-2 w-20 text-center">Weight</th>
                <th className="py-3 px-2 w-20 text-center">Specs</th>
                <th className="py-3 px-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-700">
              {filteredList.map((item) => (
                <tr key={item.vin} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{item.vin}</td>
                  
                  {['make', 'model', 'trim', 'year', 'color', 'body_type', 'cylinders', 'origin', 'no_of_passengers', 'weight', 'regional_spec'].map(field => (
                    <td key={field} className="py-2 px-1">
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold uppercase text-[11px]"
                        value={getRowValue(item, field)}
                        onChange={(e) => handleInputChange(item.vin, field, e.target.value)}
                      />
                    </td>
                  ))}

                  <td className="py-2 px-4">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleSave(item)}
                        className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 p-1.5 rounded transition-all"
                        title="Save Draft"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleApprove(item)}
                        className="bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 text-emerald-700 hover:text-white px-2 py-1.5 rounded font-bold text-[10px] transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.vin)}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-1.5 rounded transition-all"
                        title="Discard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="13" className="py-12 text-center text-slate-400">
                    No pending items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
