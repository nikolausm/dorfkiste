'use client';

import { useState, useEffect } from 'react';
import { apiClient, BookingAvailability } from '@/lib/api';
// Using simple SVG icons instead of heroicons

interface BookingCalendarProps {
  offerId: number;
  onDateRangeSelect: (startDate: string, endDate: string) => void;
  onAvailabilityCheck?: (availability: BookingAvailability) => void;
  className?: string;
}

// Using BookingAvailability interface from API client

export default function BookingCalendar({
  offerId,
  onDateRangeSelect,
  onAvailabilityCheck,
  className = ''
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Get dates for the calendar grid
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Check if date is today or in the past
  const isPastDate = (date: Date): boolean => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentHour = now.getHours();

    // Same-day bookings only allowed before 18:00
    const isToday = date.getTime() === today.getTime();
    if (isToday && currentHour >= 18) {
      return true;
    }

    return date < today;
  };

  // Check if date is unavailable
  const isDateUnavailable = (date: Date): boolean => {
    return unavailableDates.has(formatDate(date));
  };

  // Check if date is in selected range
  const isInSelectedRange = (date: Date): boolean => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const dateStr = formatDate(date);
    return dateStr >= selectedStartDate && dateStr <= selectedEndDate;
  };

  // Check if date is in hover range
  const isInHoverRange = (date: Date): boolean => {
    if (!selectedStartDate || !hoveredDate || selectedEndDate) return false;
    const dateStr = formatDate(date);
    const start = selectedStartDate;
    const end = hoveredDate;
    // Since date strings are in YYYY-MM-DD format, we can compare them directly
    const minDate = start <= end ? start : end;
    const maxDate = start <= end ? end : start;
    return dateStr >= minDate && dateStr <= maxDate;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isPastDate(date) || isDateUnavailable(date)) return;

    const dateStr = formatDate(date);

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(dateStr);
      setSelectedEndDate(null);
      setHoveredDate(null);
    } else {
      // Complete selection
      const start = selectedStartDate;
      const end = dateStr;

      if (end < start) {
        setSelectedStartDate(end);
        setSelectedEndDate(start);
        onDateRangeSelect(end, start);
      } else {
        setSelectedEndDate(end);
        onDateRangeSelect(start, end);
      }
      setHoveredDate(null);
    }
  };

  // Handle date hover
  const handleDateHover = (date: Date) => {
    if (!selectedStartDate || selectedEndDate || isPastDate(date) || isDateUnavailable(date)) {
      return;
    }
    setHoveredDate(formatDate(date));
  };

  // Load availability for current month
  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const data = await apiClient.checkAvailability(
        offerId,
        formatDate(startDate),
        formatDate(endDate)
      );

      setUnavailableDates(new Set(data.unavailableDates));
      onAvailabilityCheck?.(data);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load availability when month changes
  useEffect(() => {
    loadAvailability();
  }, [currentMonth, offerId]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setHoveredDate(null);
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const days = getDaysInMonth();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Verfügbarkeit prüfen
        </h3>
        {(selectedStartDate || selectedEndDate) && (
          <button
            onClick={clearSelection}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Auswahl zurücksetzen
          </button>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2"></div>;
          }

          const isPast = isPastDate(date);
          const isUnavailable = isDateUnavailable(date);
          const isSelected = selectedStartDate === formatDate(date) ||
                           selectedEndDate === formatDate(date);
          const isInRange = isInSelectedRange(date) || isInHoverRange(date);
          const isDisabled = isPast || isUnavailable;

          return (
            <button
              key={formatDate(date)}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => handleDateHover(date)}
              disabled={isDisabled || isLoading}
              className={`
                p-2 text-sm rounded-lg transition-colors relative
                ${isDisabled
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed'
                  : 'text-gray-900 dark:text-gray-100 hover:bg-green-50 dark:hover:bg-green-900/30 cursor-pointer'
                }
                ${isSelected
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : ''
                }
                ${isInRange && !isSelected
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : ''
                }
                ${isUnavailable && !isPast
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 line-through'
                  : ''
                }
              `}
            >
              {date.getDate()}
              {isUnavailable && !isPast && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-6 bg-red-600 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Range Display */}
      {selectedStartDate && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Gewählter Zeitraum:
          </div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {selectedStartDate && selectedEndDate ? (
              <>
                {new Date(selectedStartDate).toLocaleDateString('de-DE')} - {' '}
                {new Date(selectedEndDate).toLocaleDateString('de-DE')}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({Math.floor((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Tage)
                </span>
              </>
            ) : (
              <>
                {new Date(selectedStartDate).toLocaleDateString('de-DE')}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  (Enddatum auswählen)
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Ausgewählt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
            <span>Auswahlbereich</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-3 bg-red-600 dark:bg-red-500 rotate-45"></div>
              </div>
            </div>
            <span>Nicht verfügbar</span>
          </div>
        </div>
        <p className="text-gray-400 dark:text-gray-500">
          Maximale Buchungsdauer: 14 Tage
        </p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 dark:border-primary-400 border-t-transparent"></div>
            <span className="text-sm">Verfügbarkeit wird geladen...</span>
          </div>
        </div>
      )}
    </div>
  );
}