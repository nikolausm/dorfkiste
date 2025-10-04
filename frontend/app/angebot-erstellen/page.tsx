'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, Category, OfferPicture, AnalyzeImageResponse } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateOfferPage() {
  const [step, setStep] = useState<'upload' | 'mode' | 'analyze' | 'edit'>('upload');
  const [offerMode, setOfferMode] = useState<'rent' | 'sale' | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerDay: '',
    pricePerHour: '',
    salePrice: '',
    isService: false,
    categoryId: '',
    deliveryAvailable: false,
    deliveryCost: '',
    deposit: '',
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

  const analyzeImage = async (mode: 'rent' | 'sale') => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrors([]);

    try {
      const result = await apiClient.analyzeImage(selectedFile, mode);
      setAnalysisResult(result);

      // Auto-fill form data based on mode
      setFormData({
        title: result.title,
        description: result.description,
        pricePerDay: mode === 'rent' ? (result.suggestedPricePerDay?.toString() || '') : '',
        pricePerHour: mode === 'rent' ? (result.suggestedPricePerHour?.toString() || '') : '',
        salePrice: mode === 'sale' ? '' : '',
        isService: result.isService,
        categoryId: result.suggestedCategoryId?.toString() || '',
        deliveryAvailable: false,
        deliveryCost: '',
        deposit: '',
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

    // Check if appropriate price is provided based on mode
    if (offerMode === 'rent' && !formData.pricePerDay && !formData.pricePerHour) {
      newErrors.push('Bitte geben Sie mindestens einen Mietpreis an');
    }
    if (offerMode === 'sale' && !formData.salePrice) {
      newErrors.push('Bitte geben Sie einen Verkaufspreis an');
    }

    // Validate delivery cost if delivery is enabled
    if (formData.deliveryAvailable && !formData.deliveryCost) {
      newErrors.push('Bitte geben Sie die Versandkosten an');
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
        pricePerDay: offerMode === 'rent' && formData.pricePerDay ? parseFloat(formData.pricePerDay) : undefined,
        pricePerHour: offerMode === 'rent' && formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
        salePrice: offerMode === 'sale' && formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        isService: formData.isService,
        isForSale: offerMode === 'sale',
        deliveryAvailable: formData.deliveryAvailable,
        deliveryCost: formData.deliveryAvailable && formData.deliveryCost ? parseFloat(formData.deliveryCost) : undefined,
        deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
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
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${step === 'upload' ? 'text-primary-600 dark:text-primary-400' : (step === 'mode' || step === 'analyze' || step === 'edit') ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${step === 'upload' ? 'bg-primary-100 dark:bg-primary-900/30' : (step === 'mode' || step === 'analyze' || step === 'edit') ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {step === 'mode' || step === 'analyze' || step === 'edit' ? '✓' : '1'}
              </div>
              <span className="ml-2 font-medium text-sm">Bild hochladen</span>
            </div>
            <div className={`h-0.5 flex-1 ${step === 'mode' || step === 'analyze' || step === 'edit' ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step === 'mode' ? 'text-primary-600 dark:text-primary-400' : (step === 'analyze' || step === 'edit') ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${step === 'mode' ? 'bg-primary-100 dark:bg-primary-900/30' : (step === 'analyze' || step === 'edit') ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {step === 'analyze' || step === 'edit' ? '✓' : '2'}
              </div>
              <span className="ml-2 font-medium text-sm">Vermieten/Verkaufen</span>
            </div>
            <div className={`h-0.5 flex-1 ${step === 'analyze' || step === 'edit' ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step === 'analyze' ? 'text-primary-600 dark:text-primary-400' : step === 'edit' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${step === 'analyze' ? 'bg-primary-100 dark:bg-primary-900/30' : step === 'edit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {step === 'edit' ? '✓' : '3'}
              </div>
              <span className="ml-2 font-medium text-sm">KI-Analyse</span>
            </div>
            <div className={`h-0.5 flex-1 ${step === 'edit' ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step === 'edit' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${step === 'edit' ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                4
              </div>
              <span className="ml-2 font-medium text-sm">Bearbeiten</span>
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
                <div className="mt-4">
                  <button
                    onClick={() => setStep('mode')}
                    className="w-full btn-primary"
                  >
                    Weiter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Mode */}
          {step === 'mode' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Möchten Sie vermieten oder verkaufen?
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Wählen Sie, ob Sie Ihren Gegenstand vermieten oder verkaufen möchten. Die KI wird dann einen passenden Text für Sie erstellen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rent Button */}
                <button
                  onClick={() => {
                    setOfferMode('rent');
                    setStep('analyze');
                    analyzeImage('rent');
                  }}
                  disabled={isAnalyzing}
                  className={`group relative bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-8 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-lg transition-all text-left ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-4xl">🔄</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Vermieten
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Gegenstand zum Verleih anbieten
                      </p>
                    </div>
                  </div>
                </button>

                {/* Sale Button */}
                <button
                  onClick={() => {
                    setOfferMode('sale');
                    setStep('analyze');
                    analyzeImage('sale');
                  }}
                  disabled={isAnalyzing}
                  className={`group relative bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-8 hover:border-green-500 dark:hover:border-green-400 hover:shadow-lg transition-all text-left ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-4xl">💰</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Verkaufen
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Gegenstand zum Verkauf anbieten
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {isAnalyzing && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Bild wird analysiert...</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 btn-secondary"
                  disabled={isAnalyzing}
                >
                  Zurück
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Edit Form */}
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
                  {offerMode === 'rent' ? 'Mietpreise (mindestens ein Preis erforderlich)' : 'Verkaufspreis *'}
                </label>
                {offerMode === 'rent' ? (
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
                ) : (
                  <div className="relative">
                    <input
                      id="salePrice"
                      name="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.salePrice}
                      onChange={handleChange}
                      className="input-field pr-8"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Option */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="deliveryAvailable"
                    name="deliveryAvailable"
                    type="checkbox"
                    checked={formData.deliveryAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deliveryAvailable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Lieferung/Versand möglich
                  </label>
                </div>

                {formData.deliveryAvailable && (
                  <div>
                    <label htmlFor="deliveryCost" className="block text-sm text-gray-600 dark:text-gray-400">
                      Versandkosten *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="deliveryCost"
                        name="deliveryCost"
                        type="number"
                        step="0.01"
                        min="0"
                        required={formData.deliveryAvailable}
                        value={formData.deliveryCost}
                        onChange={handleChange}
                        className="input-field pr-8"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit (for items > 200 EUR) */}
              {((offerMode === 'rent' && (parseFloat(formData.pricePerDay) > 200 || parseFloat(formData.pricePerHour) * 8 > 200)) ||
                (offerMode === 'sale' && parseFloat(formData.salePrice) > 200)) && (
                <div>
                  <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kaution (optional für Gegenstände > 200 EUR)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="deposit"
                      name="deposit"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.deposit}
                      onChange={handleChange}
                      className="input-field pr-8"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Empfohlen bei höherwertigen Gegenständen
                  </p>
                </div>
              )}

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
                  onClick={() => setStep('mode')}
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