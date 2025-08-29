# SQLite Database Setup

## Overview
The application uses SQLite for development and can be configured to use SQL Server for production.

## Configuration

### Development Environment (SQLite)
The application automatically uses SQLite when running in Development mode. The connection string is configured in `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=dorfkiste-dev.db"
  }
}
```

### Production Environment (SQL Server)
For production, configure SQL Server in `appsettings.Production.json` or `appsettings.json`.

## Running the Application

### Method 1: Using the Run Script (Recommended)
```bash
./run-dev.sh
```

This script will:
1. Set the environment to Development
2. Restore NuGet packages
3. Build the application
4. Run database migrations
5. Start the application

### Method 2: Using Environment Variable
```bash
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --project src/DorfkisteBlazor.Server
```

### Method 3: Using Launch Settings
The application includes a `launchSettings.json` file that sets the environment automatically:
```bash
cd src/DorfkisteBlazor.Server
dotnet run
```

## Database Location
The SQLite database file is created at:
- `src/DorfkisteBlazor.Server/dorfkiste-dev.db`

## Migrations

### Creating a New Migration
```bash
cd src/DorfkisteBlazor.Server
dotnet ef migrations add MigrationName --project ../DorfkisteBlazor.Infrastructure --startup-project .
```

### Updating the Database
```bash
cd src/DorfkisteBlazor.Server
dotnet ef database update --project ../DorfkisteBlazor.Infrastructure --startup-project .
```

## Troubleshooting

### Issue: Application tries to connect to SQL Server instead of SQLite
**Cause**: The `ASPNETCORE_ENVIRONMENT` is not set to "Development"

**Solution**: 
1. Set the environment variable: `export ASPNETCORE_ENVIRONMENT=Development`
2. Or use the provided run script: `./run-dev.sh`

### Issue: Database file not found
**Cause**: The database hasn't been created yet

**Solution**: Run migrations to create the database:
```bash
cd src/DorfkisteBlazor.Server
dotnet ef database update --project ../DorfkisteBlazor.Infrastructure --startup-project .
```

### Issue: Permission denied when running the script
**Solution**: Make the script executable:
```bash
chmod +x run-dev.sh
```

## Database Management Tools

### SQLite Browser
For GUI management of the SQLite database, you can use:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [TablePlus](https://tableplus.com/)
- [DBeaver](https://dbeaver.io/)

### Command Line
```bash
# Open SQLite database
sqlite3 src/DorfkisteBlazor.Server/dorfkiste-dev.db

# View tables
.tables

# View schema
.schema

# Exit
.quit
```