'use client';

import { useState, useEffect } from 'react';
import { apiClient, PriceCalculation } from '@/lib/api';

interface OfferBookingCalendarProps {
  offerId: number;
  offerPrice?: {
    pricePerDay?: number;
    pricePerHour?: number;
  };
  isService: boolean;
  onBookingRequest?: (startDate: string, endDate: string) => void;
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

export default function OfferBookingCalendar({
  offerId,
  offerPrice,
  isService,
  onBookingRequest,
  className = '',
  compact = false
}: OfferBookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookedDates();
  }, [offerId, currentDate]);

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      calculatePrice();
    } else {
      setPriceCalculation(null);
    }
  }, [selectedStartDate, selectedEndDate]);

  const loadBookedDates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getBookedDates(offerId);
      setBookedDates(new Set(response.bookedDates));
    } catch (error) {
      console.error('Error loading booked dates:', error);
      setError('Fehler beim Laden der Termine');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!selectedStartDate || !selectedEndDate) return;

    try {
      setIsPriceLoading(true);
      const data = await apiClient.calculatePrice(offerId, selectedStartDate, selectedEndDate);
      setPriceCalculation(data);
    } catch (error) {
      console.error('Error calculating price:', error);
      setPriceCalculation(null);
    } finally {
      setIsPriceLoading(false);
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
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

  const isInSelectedRange = (day: CalendarDay): boolean => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return day.dateString >= selectedStartDate && day.dateString <= selectedEndDate;
  };

  const isInHoverRange = (day: CalendarDay): boolean => {
    if (!selectedStartDate || !hoveredDate || selectedEndDate) return false;
    const start = selectedStartDate;
    const end = hoveredDate;
    const minDate = start <= end ? start : end;
    const maxDate = start <= end ? end : start;
    return day.dateString >= minDate && day.dateString <= maxDate;
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || day.isBooked) return;

    const dateStr = day.dateString;

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
      } else {
        setSelectedEndDate(end);
      }
      setHoveredDate(null);
    }
  };

  const handleDateHover = (day: CalendarDay) => {
    if (!selectedStartDate || selectedEndDate || day.isPast || day.isBooked) {
      return;
    }
    setHoveredDate(day.dateString);
  };

  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setHoveredDate(null);
    setPriceCalculation(null);
  };

  const handleBookingRequest = () => {
    if (selectedStartDate && selectedEndDate && onBookingRequest) {
      onBookingRequest(selectedStartDate, selectedEndDate);
    }
  };

  const getDayClassName = (day: CalendarDay): string => {
    const sizeClasses = compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    const baseClasses = `${sizeClasses} rounded-lg font-medium flex items-center justify-center transition-all cursor-pointer`;

    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-default`;
    }

    const isSelected = selectedStartDate === day.dateString || selectedEndDate === day.dateString;
    const isInRange = isInSelectedRange(day) || isInHoverRange(day);
    const isDisabled = day.isPast || day.isBooked;

    if (isDisabled) {
      return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed`;
    }

    if (isSelected) {
      return `${baseClasses} bg-green-600 text-white shadow-md`;
    }

    if (isInRange) {
      return `${baseClasses} bg-green-100 text-green-800`;
    }

    if (day.isToday) {
      return `${baseClasses} bg-gray-100 text-gray-900 border-2 border-primary-300`;
    }

    return `${baseClasses} text-gray-700 hover:bg-gray-100`;
  };

  const days = generateCalendarDays();
  const canBook = selectedStartDate && selectedEndDate && priceCalculation;

  if (isLoading) {
    const skeletonHeight = compact ? 'h-8' : 'h-10';
    const gridGap = compact ? 'gap-1' : 'gap-2';
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${compact ? 'p-4' : 'p-6'} ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className={`grid grid-cols-7 ${gridGap}`}>
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className={`${skeletonHeight} bg-gray-200 rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${compact ? 'p-4' : 'p-6'} ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Zeitraum auswählen
          </h3>
          {(selectedStartDate || selectedEndDate) && (
            <button
              onClick={clearSelection}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Zurücksetzen
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="font-medium text-gray-900 min-w-[120px] text-center">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 ${compact ? 'gap-1' : 'gap-1'}`}>
        {/* Weekday headers */}
        {WEEKDAYS.map(day => (
          <div key={day} className={`${compact ? 'h-8' : 'h-10'} flex items-center justify-center ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            onMouseEnter={() => handleDateHover(day)}
            onMouseLeave={() => setHoveredDate(null)}
            disabled={day.isPast || day.isBooked}
            className={getDayClassName(day)}
            title={
              day.isPast
                ? `${day.date.getDate()}. ${MONTHS[day.date.getMonth()]} - Vergangen`
                : day.isBooked
                ? `${day.date.getDate()}. ${MONTHS[day.date.getMonth()]} - Bereits gebucht`
                : `${day.date.getDate()}. ${MONTHS[day.date.getMonth()]} - Verfügbar`
            }
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>

      {/* Selected Date Range Display */}
      {selectedStartDate && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-2">
            Gewählter Zeitraum:
          </div>
          <div className="font-medium text-gray-900">
            {selectedStartDate && selectedEndDate ? (
              <>
                {new Date(selectedStartDate).toLocaleDateString('de-DE')} - {' '}
                {new Date(selectedEndDate).toLocaleDateString('de-DE')}
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.floor((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Tag{Math.floor((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 === 1 ? '' : 'e'})
                </span>
              </>
            ) : (
              <>
                {new Date(selectedStartDate).toLocaleDateString('de-DE')}
                <span className="text-sm text-gray-500 ml-2">
                  (Enddatum auswählen)
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Price Calculation */}
      {canBook && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          {isPriceLoading ? (
            <div className="text-center text-green-600">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
              <span className="ml-2 text-sm">Preis wird berechnet...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Dauer:</span>
                <span className="text-green-900 font-medium">
                  {priceCalculation?.daysCount} Tag{priceCalculation?.daysCount === 1 ? '' : 'e'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Preis pro Tag:</span>
                <span className="text-green-900 font-medium">
                  {priceCalculation?.pricePerDay.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-green-300 pt-2">
                <span className="text-green-800">Gesamtpreis:</span>
                <span className="text-green-900">
                  {priceCalculation?.totalPrice.toFixed(2)}€
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Book Button */}
      {canBook && onBookingRequest && (
        <div className="mt-4">
          <button
            onClick={handleBookingRequest}
            disabled={isPriceLoading}
            className="w-full btn-primary py-3 px-4"
          >
            Jetzt buchen
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={loadBookedDates}
            className="mt-2 text-sm text-red-600 hover:text-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>Klicken Sie auf ein Startdatum und dann auf ein Enddatum</p>
        <p>Maximale Buchungsdauer: 14 Tage</p>
      </div>
    </div>
  );
}