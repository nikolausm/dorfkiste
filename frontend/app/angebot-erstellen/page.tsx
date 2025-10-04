'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, Category, OfferPicture, AnalyzeImageResponse } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateOfferPage() {
  const [step, setStep] = useState<'upload' | 'analyze' | 'edit'>('upload');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerDay: '',
    pricePerHour: '',
    isService: false,
    categoryId: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImageResponse | null>(null);
  const [createdOfferId, setCreatedOfferId] = useState<number | null>(null);

  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors(['Bitte wählen Sie eine Bilddatei aus.']);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(['Die Datei ist zu groß. Maximale Größe: 5MB.']);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors([]);
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrors([]);

    try {
      const result = await apiClient.analyzeImage(selectedFile);
      setAnalysisResult(result);

      // Auto-fill form data
      setFormData({
        title: result.title,
        description: result.description,
        pricePerDay: result.suggestedPricePerDay?.toString() || '',
        pricePerHour: result.suggestedPricePerHour?.toString() || '',
        isService: result.isService,
        categoryId: result.suggestedCategoryId?.toString() || '',
      });

      setStep('edit');
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Fehler bei der Bildanalyse']);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push('Titel ist erforderlich');
    }
    if (!formData.description.trim()) {
      newErrors.push('Beschreibung ist erforderlich');
    }
    if (!formData.categoryId) {
      newErrors.push('Kategorie ist erforderlich');
    }

    // Check if at least one price is provided
    if (!formData.pricePerDay && !formData.pricePerHour) {
      newErrors.push('Bitte geben Sie mindestens einen Preis an');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // Create offer
      const offerData = {
        title: formData.title,
        description: formData.description,
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : undefined,
        pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
        salePrice: undefined,
        isService: formData.isService,
        isForSale: false,
        deliveryAvailable: false,
        deliveryCost: undefined,
        deposit: undefined,
        categoryId: parseInt(formData.categoryId),
      };

      const newOffer = await apiClient.createOffer(offerData);
      setCreatedOfferId(newOffer.id);

      // Upload the image if we have one
      if (selectedFile) {
        await apiClient.uploadPicture(newOffer.id, selectedFile);
      }

      router.push(`/angebote/${newOffer.id}`);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Fehler beim Erstellen des Angebots']);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      tools: '🔧',
      garden: '🌿',
      home: '🏠',
      sport: '🚴',
      transport: '🚚',
      electronics: '📱',
      services: '⚒️',
      landscaping: '🌱',
      cleaning: '🧽',
      other: '📦'
    };
    return icons[iconName] || '📦';
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 dark:text-primary-400 text-2xl">🔒</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Anmeldung erforderlich
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sie müssen angemeldet sein, um ein Angebot zu erstellen.
            </p>
            <div className="space-y-4">
              <Link
                href="/anmelden"
                className="w-full btn-primary inline-block text-center"
              >
                Jetzt anmelden
              </Link>
              <Link
                href="/registrieren"
                className="w-full btn-secondary inline-block text-center"
              >
                Kostenloses Konto erstellen
              </Link>
              <Link
                href="/angebote"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm"
              >
                Zurück zu den Angeboten
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Neues Angebot erstellen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Laden Sie ein Bild hoch und lassen Sie die KI Ihr Angebot erstellen.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'upload' ? 'text-primary-600 dark:text-primary-400' : step === 'analyze' || step === 'edit' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${step === 'upload' ? 'bg-primary-100 dark:bg-primary-900/30' : step === 'analyze' || step === 'edit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {step === 'analyze' || step === 'edit' ? '✓' : '1'}
              </div>
              <span className="ml-2 font-medium">Bild hochladen</span>
            </div>
            <div className={`h-0.5 flex-1 ${step === 'analyze' || step === 'edit' ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step === 'analyze' ? 'text-primary-600 dark:text-primary-400' : step === 'edit' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${step === 'analyze' ? 'bg-primary-100 dark:bg-primary-900/30' : step === 'edit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {step === 'edit' ? '✓' : '2'}
              </div>
              <span className="ml-2 font-medium">Analyse</span>
            </div>
            <div className={`h-0.5 flex-1 ${step === 'edit' ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step === 'edit' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${step === 'edit' ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Bearbeiten & Speichern</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Bitte korrigieren Sie die folgenden Fehler:
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Upload Image */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Bild hochladen *
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Laden Sie ein Bild Ihres Gegenstands oder Ihrer Dienstleistung hoch. Die KI wird automatisch einen Titel, eine Beschreibung und passende Kategorie vorschlagen.
                </p>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-white dark:bg-gray-800">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative w-48 h-48 mx-auto">
                          <Image
                            src={previewUrl}
                            alt="Vorschau"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Klicken Sie, um ein anderes Bild auszuwählen</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-primary-600 dark:text-primary-400 text-2xl">📷</span>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Bild auswählen</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG, GIF oder WebP bis zu 5MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {selectedFile && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('edit')}
                    className="flex-1 btn-secondary"
                  >
                    Manuell erstellen
                  </button>
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className={`flex-1 btn-primary ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Angebot wird erstellt...
                      </>
                    ) : (
                      <>🤖 Automatisch erstellen</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Edit Form */}
          {step === 'edit' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Show AI Analysis Result */}
              {analysisResult && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                        ✨ KI-Analyse abgeschlossen!
                      </h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                        <p>Die KI hat Ihr Bild analysiert und folgende Daten vorgeschlagen:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Titel: {analysisResult.title}</li>
                          <li>Kategorie: {analysisResult.suggestedCategoryName}</li>
                          <li>Typ: {analysisResult.isService ? 'Dienstleistung' : 'Gegenstand'}</li>
                        </ul>
                        <p className="mt-2">Sie können alle Daten nach Belieben anpassen.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Service or Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Was möchten Sie anbieten?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="isService"
                      checked={!formData.isService}
                      onChange={() => setFormData(prev => ({ ...prev, isService: false }))}
                      className="mr-2"
                    />
                    <span>Gegenstand verleihen</span>
                  </label>
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="isService"
                      checked={formData.isService}
                      onChange={() => setFormData(prev => ({ ...prev, isService: true }))}
                      className="mr-2"
                    />
                    <span>Dienstleistung anbieten</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titel *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder={formData.isService ? "z.B. Gartenservice - Rasenmähen" : "z.B. Bohrmaschine Makita HP2050H"}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategorie *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="input-field mt-1"
                >
                  <option value="">Kategorie wählen</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryIcon(category.iconName)} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Beschreibung *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder={formData.isService
                    ? "Beschreiben Sie Ihre Dienstleistung detailliert..."
                    : "Beschreiben Sie den Gegenstand, seinen Zustand und besondere Eigenschaften..."
                  }
                />
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Bild
                  </label>
                  <div className="relative w-48 h-48">
                    <Image
                      src={previewUrl}
                      alt="Vorschau"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Preise (mindestens ein Preis erforderlich)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pricePerDay" className="block text-sm text-gray-600 dark:text-gray-400">
                      Preis pro Tag
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="pricePerDay"
                        name="pricePerDay"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pricePerDay}
                        onChange={handleChange}
                        className="input-field pr-8"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pricePerHour" className="block text-sm text-gray-600 dark:text-gray-400">
                      Preis pro Stunde
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="pricePerHour"
                        name="pricePerHour"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        className="input-field pr-8"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Wird erstellt...' : 'Angebot erstellen'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="flex-1 btn-secondary"
                  disabled={isLoading}
                >
                  Zurück
                </button>
                <Link
                  href="/angebote"
                  className="flex-1 btn-secondary text-center"
                >
                  Abbrechen
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}