'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, RentalContract } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContractPreviewModal from '@/components/ContractPreviewModal';

export default function MyContractsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/auth/login');
    } else if (isLoggedIn) {
      loadContracts();
    }
  }, [isLoggedIn, authLoading, router]);

  const loadContracts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getMyContracts();
      setContracts(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Verträge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContract = (contractId: number) => {
    setSelectedContractId(contractId);
    setIsModalOpen(true);
  };

  const handleContractSigned = (updatedContract: RentalContract) => {
    // Update the contract in the list
    setContracts(prev =>
      prev.map(c => c.id === updatedContract.id ? updatedContract : c)
    );
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
      <span className={`inline-block px-2 py-1 rounded-full text-white text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (contract: RentalContract) => {
    if (!user) return null;

    if (contract.lessorId === user.id) {
      return (
        <span className="inline-block px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
          Vermieter
        </span>
      );
    } else {
      return (
        <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          Mieter
        </span>
      );
    }
  };

  const needsSignature = (contract: RentalContract) => {
    if (!user) return false;

    if (contract.lessorId === user.id && !contract.signedByLessorAt) {
      return true;
    }
    if (contract.lesseeId === user.id && !contract.signedByLesseeAt) {
      return true;
    }
    return false;
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verträge werden geladen...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Meine Mietverträge</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {contracts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Keine Verträge vorhanden</h3>
              <p className="mt-1 text-gray-500">
                Sie haben noch keine Mietverträge. Verträge werden automatisch erstellt, wenn eine Buchung bestätigt wird.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {contract.offerTitle}
                      </h3>
                      <div className="flex gap-2 mb-2">
                        {getRoleBadge(contract)}
                        {getStatusBadge(contract.status)}
                        {needsSignature(contract) && (
                          <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                            Unterschrift erforderlich
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Vertrag Nr. {contract.id} · Buchung Nr. {contract.bookingId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Mietdauer</p>
                      <p className="font-semibold">
                        {new Date(contract.rentalStartDate).toLocaleDateString('de-DE')} -{' '}
                        {new Date(contract.rentalEndDate).toLocaleDateString('de-DE')}
                      </p>
                      <p className="text-sm text-gray-600">{contract.rentalDays} Tage</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gesamtpreis</p>
                      <p className="font-semibold text-lg">{contract.totalPrice.toFixed(2)} €</p>
                      <p className="text-sm text-gray-600">Kaution: {contract.depositAmount.toFixed(2)} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {contract.lessorId === user?.id ? 'Mieter' : 'Vermieter'}
                      </p>
                      <p className="font-semibold">
                        {contract.lessorId === user?.id ? contract.lesseeName : contract.lessorName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {contract.lessorId === user?.id ? contract.lesseeEmail : contract.lessorEmail}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Erstellt am {new Date(contract.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <button
                      onClick={() => handleViewContract(contract.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Vertrag ansehen
                    </button>
                  </div>

                  {contract.cancellationReason && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-red-900">Stornierungsgrund:</p>
                      <p className="text-sm text-red-800">{contract.cancellationReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Contract Preview Modal */}
      <ContractPreviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContractId(null);
        }}
        contractId={selectedContractId || undefined}
        onContractSigned={handleContractSigned}
      />
    </>
  );
}
