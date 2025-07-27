-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "condition" TEXT NOT NULL,
    "pricePerDay" REAL,
    "pricePerHour" REAL,
    "deposit" REAL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
    "deliveryFee" REAL,
    "deliveryRadius" REAL,
    "deliveryDetails" TEXT,
    "pickupAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("available", "categoryId", "condition", "createdAt", "deposit", "description", "id", "latitude", "location", "longitude", "pricePerDay", "pricePerHour", "title", "updatedAt", "userId") SELECT "available", "categoryId", "condition", "createdAt", "deposit", "description", "id", "latitude", "location", "longitude", "pricePerDay", "pricePerHour", "title", "updatedAt", "userId" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE TABLE "new_Rental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalPrice" REAL NOT NULL,
    "depositPaid" REAL NOT NULL,
    "platformFee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "stripePaymentIntentId" TEXT,
    "paypalOrderId" TEXT,
    "deliveryRequested" BOOLEAN NOT NULL DEFAULT false,
    "deliveryAddress" TEXT,
    "deliveryFee" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "itemId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    CONSTRAINT "Rental_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rental_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rental_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rental" ("createdAt", "depositPaid", "endDate", "id", "itemId", "ownerId", "paymentMethod", "paymentStatus", "paypalOrderId", "platformFee", "renterId", "startDate", "status", "stripePaymentIntentId", "totalPrice", "updatedAt") SELECT "createdAt", "depositPaid", "endDate", "id", "itemId", "ownerId", "paymentMethod", "paymentStatus", "paypalOrderId", "platformFee", "renterId", "startDate", "status", "stripePaymentIntentId", "totalPrice", "updatedAt" FROM "Rental";
DROP TABLE "Rental";
ALTER TABLE "new_Rental" RENAME TO "Rental";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
