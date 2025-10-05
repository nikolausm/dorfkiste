'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, AdminUser } from '@/lib/api';
import AdminMessageModal from '@/components/AdminMessageModal';
import EditUserModal from '@/components/EditUserModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [sendingVerificationEmail, setSendingVerificationEmail] = useState<number | null>(null);
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !user?.isAdmin)) {
      router.push('/');
      return;
    }

    if (isLoggedIn && user?.isAdmin) {
      loadUsers();
    }
  }, [isLoggedIn, user, authLoading, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Fehler beim Laden der Benutzer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactUser = (userId: number, firstName: string, lastName: string) => {
    setSelectedUser({ id: userId, name: `${firstName} ${lastName}` });
    setMessageModalOpen(true);
  };

  const handleToggleAdmin = async (userId: number, currentIsAdmin: boolean) => {
    try {
      const result = await apiClient.toggleUserAdmin(userId);
      setUsers(users.map(u =>
        u.id === userId ? { ...u, isAdmin: result.isAdmin } : u
      ));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Ändern des Admin-Status');
      console.error(err);
    }
  };

  const handleSendVerificationEmail = async (userId: number) => {
    try {
      setSendingVerificationEmail(userId);
      setError('');
      setSuccessMessage('');

      await apiClient.sendVerificationEmail(userId);

      setSuccessMessage('Verifizierungs-E-Mail wurde erfolgreich gesendet');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der Verifizierungs-E-Mail');
      console.error(err);
    } finally {
      setSendingVerificationEmail(null);
    }
  };

  const handleEditUser = (u: AdminUser) => {
    setUserToEdit(u);
    setEditModalOpen(true);
  };

  const handleUserUpdated = () => {
    loadUsers();
    setSuccessMessage('Benutzerdaten wurden erfolgreich aktualisiert');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Vorname',
      'Nachname',
      'E-Mail',
      'E-Mail verifiziert',
      'Telefon',
      'Mobil',
      'Straße',
      'Stadt',
      'PLZ',
      'Bundesland',
      'Land',
      'Admin',
      'Aktiv',
      'Marketing-Einwilligung',
      'Telefon anzeigen',
      'Mobil anzeigen',
      'Straße anzeigen',
      'Stadt anzeigen',
      'Erstellt am',
      'Letzter Login'
    ];

    const rows = users.map(u => [
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.emailVerified ? 'Ja' : 'Nein',
      u.contactInfo?.phoneNumber || '',
      u.contactInfo?.mobileNumber || '',
      u.contactInfo?.street || '',
      u.contactInfo?.city || '',
      u.contactInfo?.postalCode || '',
      u.contactInfo?.state || '',
      u.contactInfo?.country || '',
      u.isAdmin ? 'Ja' : 'Nein',
      u.isActive ? 'Ja' : 'Nein',
      u.privacySettings?.marketingEmailsConsent ? 'Ja' : 'Nein',
      u.privacySettings?.showPhoneNumber ? 'Ja' : 'Nein',
      u.privacySettings?.showMobileNumber ? 'Ja' : 'Nein',
      u.privacySettings?.showStreet ? 'Ja' : 'Nein',
      u.privacySettings?.showCity ? 'Ja' : 'Nein',
      new Date(u.createdAt).toLocaleString('de-DE'),
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('de-DE') : 'Noch nie'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `benutzer_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Benutzerverwaltung
          </h1>
          <button
            onClick={handleExportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV Export
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
            <p className="text-green-700 dark:text-green-300 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className={!u.isActive ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {u.firstName} {u.lastName}
                            {u.isAdmin && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{u.email}</div>
                      {!u.emailVerified && (
                        <div className="text-xs text-orange-600 dark:text-orange-400">Nicht verifiziert</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {u.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {u.id === user?.id ? (
                        <span className="text-gray-400 dark:text-gray-600 text-sm italic">
                          Sie selbst
                        </span>
                      ) : (
                        <div className="flex justify-end gap-2 flex-wrap">
                          {!u.emailVerified && (
                            <button
                              onClick={() => handleSendVerificationEmail(u.id)}
                              disabled={sendingVerificationEmail === u.id}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:opacity-50 text-sm"
                            >
                              {sendingVerificationEmail === u.id ? 'Sendet...' : 'Verif.-Email'}
                            </button>
                          )}
                          <button
                            onClick={() => handleEditUser(u)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                            className={`text-sm ${
                              u.isAdmin
                                ? 'text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300'
                                : 'text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300'
                            }`}
                          >
                            {u.isAdmin ? 'Admin entf.' : 'Admin'}
                          </button>
                          <button
                            onClick={() => handleContactUser(u.id, u.firstName, u.lastName)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 text-sm"
                          >
                            Kontak.
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${!u.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 break-all">{u.email}</div>
                </div>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  u.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {u.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {u.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Admin
                  </span>
                )}
                {!u.emailVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Nicht verifiziert
                  </span>
                )}
              </div>

              {u.id === user?.id ? (
                <div className="text-gray-400 dark:text-gray-600 text-sm italic text-center py-2">
                  Sie selbst
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {!u.emailVerified && (
                    <button
                      onClick={() => handleSendVerificationEmail(u.id)}
                      disabled={sendingVerificationEmail === u.id}
                      className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
                    >
                      {sendingVerificationEmail === u.id ? 'Sendet...' : 'Verif.-Email'}
                    </button>
                  )}
                  <button
                    onClick={() => handleEditUser(u)}
                    className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      u.isAdmin
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    {u.isAdmin ? 'Admin entf.' : 'Admin'}
                  </button>
                  <button
                    onClick={() => handleContactUser(u.id, u.firstName, u.lastName)}
                    className="px-3 py-2 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30"
                  >
                    Kontaktieren
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Keine Benutzer gefunden</p>
          </div>
        )}
      </div>

      <AdminMessageModal
        isOpen={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setSelectedUser(null);
        }}
        recipientId={selectedUser?.id || 0}
        recipientName={selectedUser?.name || ''}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
