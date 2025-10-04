'use client';

import Link from 'next/link';

interface LegalAcceptanceCheckboxProps {
  termsAccepted: boolean;
  withdrawalRightAcknowledged: boolean;
  onTermsChange: (accepted: boolean) => void;
  onWithdrawalChange: (acknowledged: boolean) => void;
  className?: string;
}

export default function LegalAcceptanceCheckbox({
  termsAccepted,
  withdrawalRightAcknowledged,
  onTermsChange,
  onWithdrawalChange,
  className = ''
}: LegalAcceptanceCheckboxProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* AGB Acceptance */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="terms-checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="terms-checkbox" className="text-sm text-gray-700 dark:text-gray-300">
          Ich akzeptiere die{' '}
          <Link
            href="/agb"
            target="_blank"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Allgemeinen Geschäftsbedingungen (AGB)
          </Link>{' '}
          und habe die{' '}
          <Link
            href="/datenschutz"
            target="_blank"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Datenschutzerklärung
          </Link>{' '}
          zur Kenntnis genommen. <span className="text-red-600">*</span>
        </label>
      </div>

      {/* Withdrawal Right Acknowledgement */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="withdrawal-checkbox"
          checked={withdrawalRightAcknowledged}
          onChange={(e) => onWithdrawalChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="withdrawal-checkbox" className="text-sm text-gray-700 dark:text-gray-300">
          Ich habe die{' '}
          <Link
            href="/widerrufsrecht"
            target="_blank"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Widerrufsbelehrung
          </Link>{' '}
          zur Kenntnis genommen und bin damit einverstanden, dass die Leistung vor Ablauf der Widerrufsfrist beginnt.
          Mir ist bekannt, dass ich durch meine Zustimmung mit Beginn der Ausführung des Vertrags mein Widerrufsrecht verliere.{' '}
          <span className="text-red-600">*</span>
        </label>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span className="text-red-600">*</span> Pflichtfeld
      </p>
    </div>
  );
}
