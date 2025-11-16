'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);

  const checkConnection = () => {
    fetch('/api/auth/google/status')
      .then((res) => res.json())
      .then((data) => {
        setIsConnected(data.connected || false);
        setChecking(false);
      })
      .catch(() => {
        setIsConnected(false);
        setChecking(false);
      });
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setIsConnected(false);
        setShowDisconnectMenu(false);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-indigo-600 rounded-lg p-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Easy Book</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1 ml-6">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {checking ? (
              <div className="h-9 w-9 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin flex items-center justify-center">
                <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
              </div>
            ) : isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowDisconnectMenu(!showDisconnectMenu)}
                  className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="relative">
                    <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 h-2.5 w-2.5 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm font-semibold text-green-700 group-hover:text-green-800">Connected</span>
                  <svg
                    className={`w-4 h-4 text-green-600 transition-transform duration-200 ${showDisconnectMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDisconnectMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
                      onClick={() => setShowDisconnectMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-scale-in">
                      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Google Calendar</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Successfully connected</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleDisconnect}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-all duration-150 flex items-center gap-2.5 group"
                        >
                          <svg
                            className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Disconnect Calendar</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/api/auth/google"
                className="flex items-center gap-2.5 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-indigo-400 hover:text-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="hidden sm:inline">Connect Calendar</span>
                <span className="sm:hidden">Connect</span>
                <svg
                  className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

