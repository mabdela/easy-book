'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ParsedCommand, ContactInfo } from '@/lib/types';

const DAY_NAMES: Record<string, string> = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sunday',
};

export default function ReviewPage() {
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [resolvedContacts, setResolvedContacts] = useState<ContactInfo[]>([]);
  const [unknownContacts, setUnknownContacts] = useState<string[]>([]);
  const [contactEmails, setContactEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get parsed command from sessionStorage
    const stored = sessionStorage.getItem('parsedCommand');
    if (!stored) {
      router.push('/');
      return;
    }

    const parsed: ParsedCommand = JSON.parse(stored);
    setParsedCommand(parsed);

    // Resolve contacts
    fetch('/api/resolve-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ people: parsed.people }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResolvedContacts(data.data.resolved);
          setUnknownContacts(data.data.unknown);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  const handleEmailChange = (name: string, email: string) => {
    setContactEmails((prev) => ({ ...prev, [name]: email }));
  };

  const isValidEmail = (email: string) => {
    return email.includes('@') && email.includes('.') && email.length > 5;
  };

  const handleGenerateSlots = () => {
    // Combine resolved contacts with manually entered emails
    const allContacts: ContactInfo[] = [
      ...resolvedContacts,
      ...unknownContacts.map((name) => ({
        name,
        email: contactEmails[name] || '',
      })).filter((c) => c.email),
    ];

    // Store data for next page
    sessionStorage.setItem('parsedCommand', JSON.stringify(parsedCommand));
    sessionStorage.setItem('contacts', JSON.stringify(allContacts));
    router.push('/confirm');
  };

  if (loading) {
    return (
      <div className="min-h-screen professional-gradient p-4 sm:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto pt-12 sm:pt-16 pb-12">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10 lg:p-12 professional-card">
            <div className="flex items-center justify-center py-12">
              <div className="spinner-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!parsedCommand) {
    return null;
  }

  return (
    <div className="min-h-screen professional-gradient p-4 sm:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto pt-12 sm:pt-16 pb-12">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10 lg:p-12 animate-slide-up professional-card">
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review Booking Details</h1>
              </div>
              <span className="text-sm text-gray-500 font-medium">Step 2 of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: '66.67%' }}></div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 animate-scale-in">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {/* People Section */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Attendees</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedCommand.people.map((person, idx) => (
                  <span key={idx} className="bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-200">
                    {person}
                  </span>
                ))}
              </div>
            </div>

            {/* Days of Week Section */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Days of Week</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedCommand.daysOfWeek.map((day, idx) => (
                  <span key={idx} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold">
                    {DAY_NAMES[day] || day}
                  </span>
                ))}
              </div>
            </div>

            {/* Time Range Section */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Time Range</h2>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {parsedCommand.timeRange.start} - {parsedCommand.timeRange.end}
              </p>
            </div>

            {/* Date Range Section */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Date Range</h2>
              </div>
              <p className="text-gray-700 font-medium text-sm">
                {parsedCommand.dateRange.start} <span className="text-gray-400 mx-1">to</span> {parsedCommand.dateRange.end}
              </p>
            </div>
          </div>

          {/* Contacts Section */}
          <div className="space-y-6 mb-8">
                {/* Resolved Contacts */}
                {resolvedContacts.length > 0 && (
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Resolved Contacts
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {resolvedContacts.map((contact, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between card-hover">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 rounded-lg p-2">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                              <p className="text-xs text-gray-600">{contact.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unknown Contacts */}
                {unknownContacts.length > 0 && (
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Unknown Contacts - Please add emails
                    </h2>
                    <div className="space-y-3">
                      {unknownContacts.map((name) => {
                        const email = contactEmails[name] || '';
                        const isValid = email && isValidEmail(email);
                        return (
                          <div key={name} className={`bg-amber-50 border rounded-lg p-4 transition-all ${
                            isValid ? 'border-green-300 bg-green-50/50' : 'border-amber-200'
                          }`}>
                            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              {name}
                              {isValid && (
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => handleEmailChange(name, e.target.value)}
                              placeholder="email@example.com"
                              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm ${
                                isValid ? 'border-green-300 bg-white' : 'border-gray-300'
                              }`}
                              required
                            />
                            {email && !isValid && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Please enter a valid email
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
          </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-gray-700 flex items-center justify-center gap-2 text-sm min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleGenerateSlots}
                  disabled={
                    unknownContacts.length > 0 &&
                    unknownContacts.some((name) => !contactEmails[name] || !isValidEmail(contactEmails[name]))
                  }
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow disabled:shadow-none flex items-center justify-center gap-2 min-h-[44px] text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate Slots
                </button>
              </div>
        </div>
      </div>
    </div>
  );
}

