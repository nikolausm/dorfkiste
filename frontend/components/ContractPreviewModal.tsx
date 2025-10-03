'use client';

import { useState, useEffect } from 'react';
import { apiClient, RentalContract } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId?: number;
  bookingId?: number;
  onContractSigned?: (contract: RentalContract) => void;
}

export default function ContractPreviewModal({
  isOpen,
  onClose,
  contractId,
  bookingId,
  onContractSigned
}: ContractPreviewModalProps) {
  const { user } = useAuth();
  const [contract, setContract] = useState<RentalContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && (contractId || bookingId)) {
      loadContract();
    }
  }, [isOpen, contractId, bookingId]);

  const loadContract = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let loadedContract: RentalContract;
      if (contractId) {
        loadedContract = await apiClient.getContract(contractId);
      } else if (bookingId) {
        // Try to get existing contract or generate new one
        try {
          loadedContract = await apiClient.getContractByBooking(bookingId);
        } catch {
          // Contract doesn't exist, generate it
          loadedContract = await apiClient.generateContract(bookingId);
        }
      } else {
        throw new Error('Vertrag-ID oder Buchungs-ID erforderlich');
      }
      setContract(loadedContract);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Vertrags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!contract) return;

    setIsSigning(true);
    setError(null);
    try {
      const signedContract = await apiClient.signContract(contract.id);
      setContract(signedContract);
      if (onContractSigned) {
        onContractSigned(signedContract);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Unterschreiben des Vertrags');
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!contract) return;

    setIsDownloading(true);
    try {
      const blob = await apiClient.downloadContractPdf(contract.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mietvertrag_${contract.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Herunterladen des PDFs');
    } finally {
      setIsDownloading(false);
    }
  };

  const canUserSign = () => {
    if (!contract || !user) return false;

    if (contract.lessorId === user.id && !contract.signedByLessorAt) {
      return true;
    }
    if (contract.lesseeId === user.id && !contract.signedByLesseeAt) {
      return true;
    }
    return false;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      'Draft': { label: 'Entwurf', color: 'bg-gray-500' },
      'SignedByLessor': { label: 'Vom Vermieter unterschrieben', color: 'bg-blue-500' },
      'SignedByBoth': { label: 'Von beiden Parteien unterschrieben', color: 'bg-green-500' },
      'Active': { label: 'Aktiv', color: 'bg-green-600' },
      'Completed': { label: 'Abgeschlossen', color: 'bg-teal-500' },
      'Cancelled': { label: 'Storniert', color: 'bg-red-500' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Mietvertrag</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Vertrag wird geladen...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {contract && (
            <div className="space-y-6">
              {/* Contract Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Vertragsnummer: {contract.id}</p>
                    <p className="text-sm text-gray-600">
                      Erstellt am: {new Date(contract.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
              </div>

              {/* Parties */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vertragsparteien</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lessor */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Vermieter</h4>
                    <p className="text-gray-700">{contract.lessorName}</p>
                    <p className="text-sm text-gray-600">{contract.lessorEmail}</p>
                    {contract.signedByLessorAt && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Unterschrieben am {new Date(contract.signedByLessorAt).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>

                  {/* Lessee */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Mieter</h4>
                    <p className="text-gray-700">{contract.lesseeName}</p>
                    <p className="text-sm text-gray-600">{contract.lesseeEmail}</p>
                    {contract.signedByLesseeAt && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Unterschrieben am {new Date(contract.signedByLesseeAt).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mietgegenstand</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{contract.offerTitle}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Typ: {contract.offerType === 'Item' ? 'Gegenstand' : 'Dienstleistung'}
                  </p>
                  <p className="text-gray-700">{contract.offerDescription}</p>
                </div>
              </div>

              {/* Rental Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mietdetails</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Mietbeginn</p>
                      <p className="font-semibold">{new Date(contract.rentalStartDate).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mietende</p>
                      <p className="font-semibold">{new Date(contract.rentalEndDate).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Mietdauer: {contract.rentalDays} Tage</p>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Preis pro Tag:</span>
                      <span className="font-semibold">{contract.pricePerDay.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-semibold">Gesamtpreis:</span>
                      <span className="font-bold text-lg">{contract.totalPrice.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-semibold">Kaution:</span>
                      <span className="font-bold text-green-600">{contract.depositAmount.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vertragsbedingungen</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {contract.termsAndConditions}
                  </pre>
                </div>
              </div>

              {contract.specialConditions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Besondere Vereinbarungen</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{contract.specialConditions}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {contract && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Schließen
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isDownloading ? 'Wird heruntergeladen...' : 'PDF herunterladen'}
              </button>
              {canUserSign() && (
                <button
                  onClick={handleSign}
                  disabled={isSigning}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isSigning ? 'Unterschreiben...' : 'Vertrag unterschreiben'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
