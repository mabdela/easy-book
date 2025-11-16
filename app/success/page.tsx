'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import type { BookingResult } from '@/lib/types';

export default function SuccessPage() {
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [animate, setAnimate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingResult');
    if (!stored) {
      router.push('/');
      return;
    }

    const result: BookingResult = JSON.parse(stored);
    setBookingResult(result);
    // Trigger celebration animation
    setAnimate(true);
  }, [router]);

  if (!bookingResult) {
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
          {/* Success Header with Animation */}
          <div className="text-center mb-10">
            <div className={`inline-block bg-green-100 rounded-lg p-6 mb-6 ${animate ? 'animate-scale-in' : ''}`}>
              <div className="bg-green-600 rounded-lg p-4">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Bookings Created Successfully
            </h1>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 font-semibold text-sm">
                {bookingResult.meetingCount} meeting{bookingResult.meetingCount !== 1 ? 's' : ''} created
              </p>
            </div>
          </div>

          {/* Meetings Grid */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Created Meetings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {bookingResult.meetings.map((meeting, idx) => (
                <div
                  key={meeting.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 card-hover shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="bg-indigo-100 rounded-md px-2.5 py-1">
                        <span className="text-xs font-bold text-indigo-700">#{idx + 1}</span>
                      </div>
                      {meeting.googleEventId && (
                        <div className="bg-green-100 rounded-md p-1.5">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                      {meeting.title}
                    </h3>

                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">{format(new Date(meeting.start), 'EEEE, MMM d')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium">
                          {format(new Date(meeting.start), 'h:mm a')} - {format(new Date(meeting.end), 'h:mm a')}
                        </span>
                      </div>
                    </div>

                    {meeting.googleEventLink && (
                      <a
                        href={meeting.googleEventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 w-full justify-center mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Open in Calendar
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                sessionStorage.clear();
                router.push('/');
              }}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2 min-h-[44px] text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Another Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

