'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Category, OfferDetail, OfferPicture } from '@/lib/api';

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const offerId = parseInt(params.id as string);

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerDay: '',
    pricePerHour: '',
    isService: false,
    categoryId: '',
    isActive: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Picture management
  const [pictures, setPictures] = useState<OfferPicture[]>([]);
  const [uploadingPictures, setUploadingPictures] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/anmelden');
      return;
    }
    loadOffer();
    loadCategories();
  }, [isLoggedIn, router, offerId]);

  const loadOffer = async () => {
    try {
      const data = await apiClient.getOffer(offerId);
      
      // Check if user owns this offer
      if (!user || data.user?.id !== user.id) {
        setErrors(['Sie sind nicht berechtigt, dieses Angebot zu bearbeiten.']);
        setIsLoading(false);
        return;
      }

      setOffer(data);
      setFormData({
        title: data.title,
        description: data.description,
        pricePerDay: data.pricePerDay?.toString() || '',
        pricePerHour: data.pricePerHour?.toString() || '',
        isService: data.isService,
        categoryId: data.category?.id.toString() || '',
        isActive: data.isActive,
      });
      setPictures(data.pictures || []);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Fehler beim Laden des Angebots']);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
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

    setIsSaving(true);
    setErrors([]);

    try {
      const offerData = {
        title: formData.title,
        description: formData.description,
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : undefined,
        pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
        salePrice: undefined, // Not supported in edit mode yet
        isService: formData.isService,
        isForSale: false, // Not supported in edit mode yet
        deliveryAvailable: false, // Not supported in edit mode yet
        deliveryCost: undefined, // Not supported in edit mode yet
        deposit: undefined, // Not supported in edit mode yet
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
      };

      await apiClient.updateOffer(offerId, offerData);
      
      // Note: Pictures are now uploaded immediately when selected
      
      router.push(`/angebote/${offerId}`);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Angebots']);
    } finally {
      setIsSaving(false);
    }
  };

  // Picture management functions
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        return false;
      }
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setErrors(['Keine gültigen Bilddateien ausgewählt. Unterstützte Formate: JPG, PNG, GIF, WebP (max. 2MB)']);
      return;
    }

    // Limit to 5 files total
    const totalFiles = pictures.length + validFiles.length;
    const filesToAdd = totalFiles > 5 ? validFiles.slice(0, 5 - pictures.length) : validFiles;
    
    if (filesToAdd.length < validFiles.length) {
      setErrors([`Nur ${filesToAdd.length} von ${validFiles.length} Dateien können hinzugefügt werden (Maximum: 5 Bilder gesamt)`]);
    }

    // Upload files immediately
    if (filesToAdd.length > 0) {
      setUploadingPictures(true);
      setErrors([]); // Clear any previous errors
      
      try {
        const newPictures: OfferPicture[] = [];
        for (const file of filesToAdd) {
          const picture = await apiClient.uploadPicture(offerId, file);
          newPictures.push(picture);
        }
        
        // Add new pictures to the list
        setPictures(prev => {
          const combined = [...prev, ...newPictures];
          return combined.sort((a, b) => a.displayOrder - b.displayOrder);
        });
      } catch (error) {
        console.error('Error uploading pictures:', error);
        let errorMessage = 'Fehler beim Hochladen der Bilder';
        if (error instanceof Error) {
          
          if (error.message.includes('401') || error.message.includes('Authorization') || error.message.includes('Unauthorized')) {
            errorMessage = 'Sie sind nicht angemeldet. Bitte melden Sie sich erneut an.';
          } else if (error.message.includes('403') || error.message.includes('Forbid')) {
            errorMessage = 'Sie haben keine Berechtigung, Bilder für dieses Angebot hochzuladen';
          } else if (error.message.includes('413') || error.message.includes('too large') || error.message.includes('2MB limit')) {
            errorMessage = 'Datei zu groß. Maximum 2MB pro Bild.';
          } else if (error.message.includes('Invalid file type') || error.message.includes('file type')) {
            errorMessage = 'Ungültiger Dateityp. Nur JPG, PNG, GIF und WebP sind erlaubt.';
          } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            errorMessage = 'Angebot wurde nicht gefunden';
          } else if (error.message.includes('No file uploaded')) {
            errorMessage = 'Keine Datei ausgewählt';
          } else {
            errorMessage = `Fehler beim Hochladen: ${error.message}`;
          }
        }
        setErrors([errorMessage]);
      } finally {
        setUploadingPictures(false);
      }
    }
    
    // Clear file input
    e.target.value = '';
  };


  const deletePicture = async (pictureId: number) => {
    if (!user || !offer) return;
    
    try {
      await apiClient.deletePicture(offerId, pictureId);
      
      // Remove the picture from local state
      setPictures(prev => {
        const filteredPictures = prev.filter(p => p.id !== pictureId);
        // Reorder remaining pictures to maintain sequential display order
        return filteredPictures.map((pic, index) => ({
          ...pic,
          displayOrder: index + 1
        }));
      });
      setErrors([]); // Clear any previous errors
    } catch (error) {
      let errorMessage = 'Fehler beim Löschen des Bildes';
      if (error instanceof Error) {
        if (error.message.includes('Authorization') || error.message.includes('Forbid')) {
          errorMessage = 'Sie haben keine Berechtigung, dieses Bild zu löschen';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'Das Bild wurde nicht gefunden';
        } else {
          errorMessage = `Fehler beim Löschen: ${error.message}`;
        }
      }
      setErrors([errorMessage]);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for some browsers
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const sortedPictures = pictures.sort((a, b) => a.displayOrder - b.displayOrder);
    const draggedPicture = sortedPictures[draggedIndex];
    const newDisplayOrder = dropIndex + 1; // Convert to 1-based
    
    // Optimistically update UI for immediate feedback
    const newPictures = [...sortedPictures];
    newPictures.splice(draggedIndex, 1);
    newPictures.splice(dropIndex, 0, draggedPicture);
    
    // Update display order for UI
    const updatedPictures = newPictures.map((pic, idx) => ({
      ...pic,
      displayOrder: idx + 1
    }));
    
    setPictures(updatedPictures);
    
    try {
      // Backend handles complete reordering
      await apiClient.updatePictureOrder(offerId, draggedPicture.id, newDisplayOrder);
      
      // Reload pictures to get the correct order from backend
      const refreshedOffer = await apiClient.getOffer(offerId);
      setPictures(refreshedOffer.pictures || []);
      
      setErrors([]); // Clear any previous errors
    } catch (error) {
      // Revert on error
      setPictures(pictures);
      let errorMessage = 'Fehler beim Neuordnen der Bilder';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Authorization') || error.message.includes('Unauthorized')) {
          errorMessage = 'Sie sind nicht angemeldet. Bitte melden Sie sich erneut an.';
        } else if (error.message.includes('403') || error.message.includes('Forbid')) {
          errorMessage = 'Sie haben keine Berechtigung, die Bilder neu zu ordnen';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'Bild oder Angebot wurde nicht gefunden';
        } else if (error.message.includes('UNIQUE constraint')) {
          errorMessage = 'Fehler beim Neuordnen der Bilder. Bitte versuchen Sie es erneut.';
        } else {
          errorMessage = `Fehler beim Neuordnen: ${error.message}`;
        }
      }
      setErrors([errorMessage]);
    }
    
    setDraggedIndex(null);
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

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Angebot wird geladen...</p>
        </div>
      </div>
    );
  }

  if (errors.length > 0 && !offer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{errors[0]}</p>
          <div className="mt-4 space-x-4">
            <Link href="/meine-angebote" className="btn-primary">
              Zu meinen Angeboten
            </Link>
            <Link href="/angebote" className="btn-secondary">
              Zu allen Angeboten
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Startseite</Link></li>
              <li>›</li>
              <li><Link href="/meine-angebote" className="hover:text-primary-600 dark:hover:text-primary-400">Meine Angebote</Link></li>
              <li>›</li>
              <li className="text-gray-900 dark:text-gray-100">Bearbeiten</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Angebot bearbeiten
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aktualisieren Sie Ihr Angebot und verwalten Sie die Bilder.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service or Item */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Was bieten Sie an?
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

                {/* Pricing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Preise (mindestens ein Preis erforderlich)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pricePerDay" className="block text-sm text-gray-600 dark:text-gray-400">
                        {formData.isService ? 'Preis pro Tag' : 'Preis pro Tag'}
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

                {/* Active status */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Angebot ist aktiv und für andere sichtbar</span>
                  </label>
                </div>

                {/* Submit buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSaving || uploadingPictures}
                    className={`flex-1 btn-primary ${
                      isSaving || uploadingPictures ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingPictures 
                      ? `Bilder werden hochgeladen...` 
                      : isSaving 
                        ? 'Wird gespeichert...' 
                        : 'Änderungen speichern'
                    }
                  </button>
                  <Link
                    href={`/angebote/${offerId}`}
                    className="flex-1 btn-secondary text-center"
                  >
                    Abbrechen
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Picture management sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Bilderverwaltung</h3>

              {/* Existing pictures */}
              {pictures.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Vorhandene Bilder (zum Neu ordnen ziehen)
                  </h4>
                  <div className="space-y-3">
                    {pictures
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((picture, index) => (
                      <div
                        key={picture.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`relative group cursor-move border rounded-lg overflow-hidden transition-colors ${
                          draggedIndex === index
                            ? 'border-primary-500 dark:border-primary-400 opacity-50'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500'
                        }`}
                      >
                        <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                          <Image
                            src={apiClient.getPictureUrl(picture.id)}
                            alt={`Bild ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => deletePicture(picture.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            #{picture.displayOrder}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new pictures */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Neue Bilder hinzufügen
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Max. {5 - pictures.length} weitere Bilder (2MB pro Bild)
                </p>

                {/* File Input */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    disabled={pictures.length >= 5 || uploadingPictures}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-400
                      hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50
                      disabled:file:opacity-50 disabled:file:cursor-not-allowed"
                  />
                </div>

                {uploadingPictures && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400 mr-2"></div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">Bilder werden hochgeladen...</span>
                    </div>
                  </div>
                )}

                {pictures.length >= 5 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    Maximale Anzahl von 5 Bildern erreicht.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}