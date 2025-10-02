'use client';

import { useState, useEffect } from 'react';
import { apiClient, BookingAvailability, PriceCalculation, BookingResponse } from '@/lib/api';
// Using simple SVG icons instead of heroicons
import BookingCalendar from './BookingCalendar';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: number;
  offerTitle: string;
  offerPrice?: {
    pricePerDay?: number;
    pricePerHour?: number;
  };
  isService: boolean;
  onBookingSuccess?: (booking: BookingResponse) => void;
  preselectedDates?: {
    startDate: string;
    endDate: string;
  };
}

// Using interfaces from API client

export default function BookingModal({
  isOpen,
  onClose,
  offerId,
  offerTitle,
  offerPrice,
  isService,
  onBookingSuccess,
  preselectedDates
}: BookingModalProps) {
  const [step, setStep] = useState<'calendar' | 'confirm' | 'success'>('calendar');
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (preselectedDates) {
        // If dates are preselected, skip to confirmation step
        setStep('confirm');
        setSelectedStartDate(preselectedDates.startDate);
        setSelectedEndDate(preselectedDates.endDate);
        setAvailability(null);
        setPriceCalculation(null);
        setError(null);
        setBooking(null);
        // Calculate price for preselected dates
        calculatePriceForPreselectedDates();
      } else {
        // Normal flow - start with calendar
        setStep('calendar');
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setAvailability(null);
        setPriceCalculation(null);
        setError(null);
        setBooking(null);
      }
    }
  }, [isOpen, preselectedDates]);

  // Handle date range selection
  const handleDateRangeSelect = async (startDate: string, endDate: string) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setError(null);

    // Calculate price
    try {
      setIsLoading(true);
      const data = await apiClient.calculatePrice(offerId, startDate, endDate);
      setPriceCalculation(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler bei der Preisberechnung');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle availability check
  const handleAvailabilityCheck = (data: BookingAvailability) => {
    setAvailability(data);
  };

  // Calculate price for preselected dates
  const calculatePriceForPreselectedDates = async () => {
    if (!preselectedDates) return;

    try {
      setIsLoading(true);
      const data = await apiClient.calculatePrice(offerId, preselectedDates.startDate, preselectedDates.endDate);
      setPriceCalculation(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler bei der Preisberechnung');
    } finally {
      setIsLoading(false);
    }
  };

  // Go to confirmation step
  const goToConfirmation = () => {
    if (selectedStartDate && selectedEndDate && priceCalculation) {
      setStep('confirm');
    }
  };

  // Create booking
  const createBooking = async () => {
    if (!selectedStartDate || !selectedEndDate) return;

    try {
      setIsLoading(true);
      setError(null);

      const bookingData = await apiClient.createBooking(offerId, {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
      });

      setBooking(bookingData);
      setStep('success');
      onBookingSuccess?.(bookingData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Erstellen der Buchung');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date range
  const formatDateRange = () => {
    if (!selectedStartDate || !selectedEndDate) return '';
    const start = new Date(selectedStartDate).toLocaleDateString('de-DE');
    const end = new Date(selectedEndDate).toLocaleDateString('de-DE');
    return `${start} - ${end}`;
  };

  // Close and reset
  const handleClose = () => {
    setStep('calendar');
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setPriceCalculation(null);
    setError(null);
    setBooking(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'calendar' && 'Zeitraum auswählen'}
              {step === 'confirm' && 'Buchung bestätigen'}
              {step === 'success' && 'Buchung erfolgreich'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {offerTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'calendar' && (
            <div className="space-y-6">
              <BookingCalendar
                offerId={offerId}
                onDateRangeSelect={handleDateRangeSelect}
                onAvailabilityCheck={handleAvailabilityCheck}
              />

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {priceCalculation && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">
                    Preisberechnung
                  </h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Zeitraum:</span>
                      <span>{formatDateRange()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dauer:</span>
                      <span>{priceCalculation.daysCount} Tag(e)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preis pro Tag:</span>
                      <span>{priceCalculation.pricePerDay.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-green-300 pt-2">
                      <span>Gesamtpreis:</span>
                      <span>{priceCalculation.totalPrice.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedStartDate && selectedEndDate && priceCalculation && (
                <div className="flex justify-end">
                  <button
                    onClick={goToConfirmation}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    Weiter zur Bestätigung
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && priceCalculation && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Buchungsdetails
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Angebot:</span>
                    <span className="text-gray-900">{offerTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Typ:</span>
                    <span className="text-gray-900">
                      {isService ? 'Dienstleistung' : 'Gegenstand'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zeitraum:</span>
                    <span className="text-gray-900">{formatDateRange()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dauer:</span>
                    <span className="text-gray-900">{priceCalculation.daysCount} Tag(e)</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-gray-300 pt-2">
                    <span className="text-gray-900">Gesamtpreis:</span>
                    <span className="text-gray-900">{priceCalculation.totalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  📋 Buchungsablauf
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>1. Ihre Buchung wird sofort bestätigt und der Zeitraum reserviert</p>
                  <p>2. Der Anbieter erhält automatisch eine Benachrichtigung</p>
                  <p>3. Sie finden die Buchung unter &ldquo;Meine Buchungen&rdquo;</p>
                  <p>4. Kontaktieren Sie den Anbieter für weitere Details zur Übergabe</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">
                  ✅ Verbindliche Buchung
                </h4>
                <p className="text-sm text-green-700">
                  Diese Buchung ist sofort verbindlich und der Zeitraum wird für Sie reserviert.
                  Die Bezahlung erfolgt später direkt mit dem Anbieter.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('calendar')}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Zurück
                </button>
                <button
                  onClick={createBooking}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Wird gebucht...' : 'Jetzt verbindlich buchen'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && booking && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Buchung erfolgreich bestätigt!
                </h3>
                <p className="text-gray-600">
                  Ihr Zeitraum wurde erfolgreich reserviert.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Buchungsreferenz
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buchungs-ID:</span>
                    <span className="text-gray-900 font-mono">#{booking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zeitraum:</span>
                    <span className="text-gray-900">{formatDateRange()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gesamtpreis:</span>
                    <span className="text-gray-900">{booking.totalPrice.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Bestätigt</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  📱 Nächste Schritte
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Der Anbieter wurde automatisch benachrichtigt</p>
                  <p>• Ihre Buchung finden Sie unter &ldquo;Meine Buchungen&rdquo;</p>
                  <p>• Kontaktieren Sie den Anbieter für Übergabedetails</p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleClose}
                  className="btn-primary"
                >
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}