'use client';
import { useState } from 'react';
import { API_BASE_URL } from '../constants';

export default function DebugPage() {
    const [status, setStatus] = useState<any>({ initial: true });
    
    const testConnection = async () => {
        setStatus({ testing: true });
        try {
            const start = Date.now();
            const res = await fetch(`${API_BASE_URL}/ping`);
            const text = await res.text();
            setStatus({ 
                success: true, 
                message: text, 
                latency: `${Date.now() - start}ms`,
                apiUrl: API_BASE_URL,
                hostname: window.location.hostname,
                userAgent: navigator.userAgent
            });
        } catch (err: any) {
            setStatus({ 
                success: false, 
                error: err.message,
                apiUrl: API_BASE_URL,
                hostname: window.location.hostname,
                type: err.name,
                hint: "If this says 'Failed to fetch', the phone cannot reach port 5050."
            });
        }
    };

    return (
        <div className="p-8 bg-[#0f172a] text-white min-h-screen font-mono">
            <div className="max-w-2xl mx-auto border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-400">📡 Network Diagnostic</h1>
                    <span className="text-xs text-slate-400">SusuPay v1.0</span>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <p className="text-sm text-slate-400 mb-1">Current Base URL:</p>
                        <code className="text-green-400">{API_BASE_URL}</code>
                    </div>

                    <button 
                        onClick={testConnection} 
                        className="w-full bg-blue-600 hover:bg-blue-500 transition-colors py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20"
                    >
                        {status.testing ? "🌀 TESTING..." : "⚡ TEST CONNECTION TO API"}
                    </button>

                    <div className="bg-black p-4 rounded-lg border border-slate-800 min-h-[200px]">
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-black">Test Results</p>
                        <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(status, null, 2)}
                        </pre>
                    </div>

                    <div className="text-xs text-slate-500">
                        <p className="font-bold text-slate-400 mb-1">Troubleshooting Checklist:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Is the laptop on the same Wi-Fi?</li>
                            <li>Is Windows Firewall set to 'Private'?</li>
                            <li>Is there a 3rd party antivirus active?</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
