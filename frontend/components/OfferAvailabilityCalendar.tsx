'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface OfferAvailabilityCalendarProps {
  offerId: number;
  className?: string;
  compact?: boolean;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isBooked: boolean;
  isPast: boolean;
  isToday: boolean;
}

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export default function OfferAvailabilityCalendar({ offerId, className = '', compact = false }: OfferAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookedDates();
  }, [offerId]);

  const loadBookedDates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getBookedDates(offerId);
      setBookedDates(new Set(response.bookedDates));
    } catch (error) {
      console.error('Error loading booked dates:', error);
      setError('Fehler beim Laden der gebuchten Termine');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Start from the first day of the week containing the first day of the month
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    // End at the last day of the week containing the last day of the month
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const dayDate = new Date(date);

      days.push({
        date: dayDate,
        dateString,
        isCurrentMonth: dayDate.getMonth() === month,
        isBooked: bookedDates.has(dateString),
        isPast: dayDate < today,
        isToday: dayDate.getTime() === today.getTime()
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayClassName = (day: CalendarDay): string => {
    const sizeClasses = compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    const baseClasses = `${sizeClasses} rounded-lg font-medium flex items-center justify-center transition-colors`;

    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-300 dark:text-gray-600`;
    }

    if (day.isPast) {
      return `${baseClasses} text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700`;
    }

    if (day.isBooked) {
      return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 font-semibold`;
    }

    if (day.isToday) {
      return `${baseClasses} bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-semibold border-2 border-primary-300 dark:border-primary-600`;
    }

    return `${baseClasses} text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300`;
  };

  const days = generateCalendarDays();

  if (isLoading) {
    const skeletonHeight = compact ? 'h-8' : 'h-10';
    const gridGap = compact ? 'gap-1' : 'gap-2';
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${compact ? 'p-4' : 'p-6'} ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className={`grid grid-cols-7 ${gridGap}`}>
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className={`${skeletonHeight} bg-gray-200 dark:bg-gray-700 rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${compact ? 'p-4' : 'p-6'} ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button
            onClick={loadBookedDates}
            className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${compact ? 'p-4' : 'p-6'} ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Verfügbarkeit
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 min-w-[120px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Verfügbar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">Gebucht</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50 dark:bg-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Vergangen</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 ${compact ? 'gap-1' : 'gap-1'}`}>
        {/* Weekday headers */}
        {WEEKDAYS.map(day => (
          <div key={day} className={`${compact ? 'h-8' : 'h-10'} flex items-center justify-center ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-500 dark:text-gray-400`}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <div
            key={index}
            className={getDayClassName(day)}
            title={
              day.isBooked
                ? `${day.date.getDate()}. ${MONTHS[day.date.getMonth()]} - Gebucht`
                : day.isPast
                ? `${day.date.getDate()}. ${MONTHS[day.date.getMonth()]} - Vergangen`
                : `${day.date.getDate()}. ${MONTHS[day.date.getMonth()]} - Verfügbar`
            }
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className={`mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 ${compact ? 'mt-4 pt-4' : ''}`}>
        <div className={`grid grid-cols-2 gap-4 text-center ${compact ? 'gap-2' : ''}`}>
          <div>
            <div className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-green-600 dark:text-green-400`}>
              {days.filter(d => d.isCurrentMonth && !d.isPast && !d.isBooked).length}
            </div>
            <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>Verfügbare Tage</div>
          </div>
          <div>
            <div className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-red-600 dark:text-red-400`}>
              {days.filter(d => d.isCurrentMonth && d.isBooked).length}
            </div>
            <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>Gebuchte Tage</div>
          </div>
        </div>
      </div>
    </div>
  );
}