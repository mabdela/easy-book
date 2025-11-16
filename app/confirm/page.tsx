'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { generateSlots } from '@/lib/generateSlots';
import type { ParsedCommand, ContactInfo, Slot } from '@/lib/types';

export default function ConfirmPage() {
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedCommand = sessionStorage.getItem('parsedCommand');
    const storedContacts = sessionStorage.getItem('contacts');

    if (!storedCommand || !storedContacts) {
      router.push('/');
      return;
    }

    const parsed: ParsedCommand = JSON.parse(storedCommand);
    const contactList: ContactInfo[] = JSON.parse(storedContacts);

    setParsedCommand(parsed);
    setContacts(contactList);

    // Generate slots
    const generatedSlots = generateSlots(parsed);
    setSlots(generatedSlots);
  }, [router]);

  const handleBook = async () => {
    if (!parsedCommand) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedCommand,
          contacts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book meetings');
      }

      // Store result and redirect to success
      sessionStorage.setItem('bookingResult', JSON.stringify(data.data));
      router.push('/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (!parsedCommand || slots.length === 0) {
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

  return (
    <div className="min-h-screen professional-gradient p-4 sm:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto pt-12 sm:pt-16 pb-12">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10 lg:p-12 animate-slide-up professional-card">
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Confirm Meeting Slots</h1>
              </div>
              <span className="text-sm text-gray-500 font-medium">Step 3 of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
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

          {/* Summary Section */}
          <div className="bg-indigo-50 rounded-lg p-6 mb-8 border border-indigo-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 rounded-lg p-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {slots.length} slot{slots.length !== 1 ? 's' : ''} will be created
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {contacts.length} attendee{contacts.length !== 1 ? 's' : ''}: {contacts.map((c) => c.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-5 card-hover shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-indigo-100 rounded-md px-2.5 py-1">
                      <span className="text-xs font-bold text-indigo-700">#{idx + 1}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-semibold">{format(slot.start, 'EEEE, MMM d')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <div className="flex flex-wrap gap-1">
                          {contacts.map((contact, cIdx) => (
                            <span key={cIdx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                              {contact.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:border-gray-200 transition-all duration-200 text-gray-700 flex items-center justify-center gap-2 text-sm min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <button
              onClick={handleBook}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow disabled:shadow-none flex items-center justify-center gap-2 min-h-[44px] text-sm"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Book Meetings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

