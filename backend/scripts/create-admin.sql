-- Direct SQL Script für Admin User Erstellung
-- Verwendung: sqlite3 dorfkiste.db < create-admin.sql

-- WICHTIG: Password Hash ist für "Admin123!"
-- Generiert mit BCrypt.Net.BCrypt.HashPassword("Admin123!", BCrypt.Net.BCrypt.GenerateSalt(12))

INSERT INTO Users (
    Email,
    PasswordHash,
    FirstName,
    LastName,
    CreatedAt,
    IsActive,
    EmailVerified,
    IsAdmin
)
VALUES (
    'admin@dorfkiste.local',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyKzpWR92wWy',  -- Hash für "Admin123!"
    'Admin',
    'User',
    datetime('now'),
    1,
    1,
    1
);

-- Erstelle ContactInfo für Admin
INSERT INTO ContactInfos (
    UserId,
    PhoneNumber,
    Street,
    City,
    PostalCode,
    Country
)
VALUES (
    last_insert_rowid(),
    '',
    'Admin Straße 1',
    'München',
    '80331',
    'Deutschland'
);

-- Erstelle UserPrivacySettings für Admin
INSERT INTO UserPrivacySettings (
    UserId,
    MarketingEmailsConsent,
    DataProcessingConsent,
    ProfileVisibilityConsent,
    DataSharingConsent,
    CreatedAt,
    UpdatedAt
)
VALUES (
    (SELECT Id FROM Users WHERE Email = 'admin@dorfkiste.local'),
    0,
    1,
    1,
    0,
    datetime('now'),
    datetime('now')
);

-- Zeige erstellten Admin User
SELECT
    Id,
    Email,
    FirstName,
    LastName,
    IsAdmin,
    EmailVerified,
    CreatedAt
FROM Users
WHERE Email = 'admin@dorfkiste.local';
