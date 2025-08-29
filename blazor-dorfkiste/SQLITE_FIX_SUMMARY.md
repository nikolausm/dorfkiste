# SQLite Configuration Fix Summary

## Problem
The application was trying to connect to SQL Server instead of SQLite, causing connection errors on startup.

## Root Cause
The `ASPNETCORE_ENVIRONMENT` environment variable was not being set, causing the application to use the default (Production) configuration which points to SQL Server instead of the Development configuration that uses SQLite.

## Solution Implemented

### 1. Environment Configuration
- Created `.env` file with `ASPNETCORE_ENVIRONMENT=Development`
- Added DotNetEnv package to load environment variables
- Updated Program.cs to load .env file on startup

### 2. Launch Settings
Created `Properties/launchSettings.json` with proper environment configuration:
```json
{
  "profiles": {
    "DorfkisteBlazor.Server": {
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

### 3. Run Script
Created `run-dev.sh` script for easy startup:
```bash
#!/bin/bash
export ASPNETCORE_ENVIRONMENT=Development
cd src/DorfkisteBlazor.Server
dotnet run
```

## Configuration Files

### Development (SQLite)
**File**: `appsettings.Development.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=dorfkiste-dev.db"
  }
}
```

### Production (SQL Server)
**File**: `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DorfkisteBlazor;..."
  }
}
```

## Database Files
SQLite database files are created at:
- `src/DorfkisteBlazor.Server/dorfkiste-dev.db` (main database)
- `src/DorfkisteBlazor.Server/dorfkiste-dev.db-shm` (shared memory)
- `src/DorfkisteBlazor.Server/dorfkiste-dev.db-wal` (write-ahead log)

## How to Run

### Option 1: Use the run script
```bash
./run-dev.sh
```

### Option 2: Set environment and run
```bash
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --project src/DorfkisteBlazor.Server
```

### Option 3: Use IDE (Visual Studio/Rider)
The launchSettings.json now ensures the correct environment is set automatically.

## Verification
The SQLite database is working correctly when you see:
1. Database files created in the Server project directory
2. No SQL Server connection errors
3. Tables created (can be verified with `sqlite3 dorfkiste-dev.db ".tables"`)

## Additional Documentation
See `docs/SQLITE_SETUP.md` for complete SQLite setup and troubleshooting guide.