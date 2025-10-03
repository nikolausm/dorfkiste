'use client';

import OfferThumbnail from './OfferThumbnail';

/**
 * Demo component to showcase different thumbnail states
 * Remove this file in production - it's just for demonstration
 */
export default function ThumbnailDemo() {
  return (
    <div className="p-8 bg-gray-50 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Offer Thumbnail States Demo</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Active offer with image */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Active Offer (with image)</h3>
          <OfferThumbnail
            offer={{
              id: 1,
              title: "Bohrmaschine",
              isService: false,
              firstPicture: {
                id: 123,
                fileName: "drill.jpg",
                contentType: "image/jpeg",
                displayOrder: 0
              }
            }}
            size="medium"
            isInactive={false}
          />
        </div>

        {/* Inactive offer with image (faded) */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Inactive Offer (with image)</h3>
          <OfferThumbnail
            offer={{
              id: 1,
              title: "Bohrmaschine",
              isService: false,
              firstPicture: {
                id: 123,
                fileName: "drill.jpg",
                contentType: "image/jpeg",
                displayOrder: 0
              }
            }}
            size="medium"
            isInactive={true}
          />
        </div>

        {/* Active offer without image */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Active Offer (no image)</h3>
          <OfferThumbnail
            offer={{
              id: 2,
              title: "Service ohne Bild",
              isService: true
            }}
            size="medium"
            isInactive={false}
          />
        </div>

        {/* Inactive offer without image */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Inactive Offer (no image)</h3>
          <OfferThumbnail
            offer={{
              id: 2,
              title: "Service ohne Bild",
              isService: true
            }}
            size="medium"
            isInactive={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Completely deleted offer */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Completely Deleted Offer</h3>
          <OfferThumbnail
            offer={null}
            size="medium"
          />
        </div>

        {/* Image load error */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Image Load Error</h3>
          <OfferThumbnail
            offer={{
              id: 99,
              title: "Fehlerhafte Datei",
              isService: false,
              firstPicture: {
                id: 99999, // Non-existent image ID
                fileName: "nonexistent.jpg",
                contentType: "image/jpeg",
                displayOrder: 0
              }
            }}
            size="medium"
          />
        </div>

        {/* Different size example */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Small Size</h3>
          <OfferThumbnail offer={null} size="small" />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2 text-blue-800">Design Features:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Faded images:</strong> Inactive offers show actual image with grayscale + 50% opacity</li>
          <li>• <strong>Overlay text:</strong> &ldquo;Nicht verfügbar&rdquo; appears over inactive thumbnails</li>
          <li>• <strong>Completely deleted:</strong> Dashed border with archive icon + X for null offers</li>
          <li>• <strong>Loading states:</strong> Proper spinner only while images are loading</li>
          <li>• <strong>Error handling:</strong> Falls back to placeholder if image fails to load</li>
          <li>• <strong>Consistent sizing:</strong> Maintains layout regardless of offer state</li>
          <li>• <strong>Smart detection:</strong> Uses isActive prop to determine state</li>
        </ul>
      </div>
    </div>
  );
}