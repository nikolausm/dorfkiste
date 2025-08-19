# PowerShell script for managing Entity Framework migrations

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "migrate",
    
    [Parameter(Mandatory=$false)]
    [string]$MigrationName = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "Development",
    
    [Parameter(Mandatory=$false)]
    [switch]$SeedData = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"

# Set the working directory to the Infrastructure project
$InfrastructureProject = "../src/DorfkisteBlazor.Infrastructure"
$ServerProject = "../src/DorfkisteBlazor.Server"

Write-Information "=== Dorfkiste Database Migration Script ==="
Write-Information "Action: $Action"
Write-Information "Environment: $Environment"

try {
    # Check if dotnet EF tools are installed
    $efVersion = dotnet ef --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Entity Framework tools not found. Installing..."
        dotnet tool install --global dotnet-ef
    }

    switch ($Action.ToLower()) {
        "add" {
            if ([string]::IsNullOrWhiteSpace($MigrationName)) {
                $MigrationName = Read-Host "Enter migration name"
            }
            
            Write-Information "Adding new migration: $MigrationName"
            dotnet ef migrations add $MigrationName `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext
        }
        
        "migrate" {
            Write-Information "Applying migrations to database..."
            dotnet ef database update `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext `
                --environment $Environment
                
            if ($SeedData) {
                Write-Information "Seeding database with test data..."
                # The seeding will be handled by the DatabaseSeedingService
                Write-Information "Database seeding will occur on next application startup"
            }
        }
        
        "drop" {
            if (!$Force) {
                $confirm = Read-Host "Are you sure you want to drop the database? This will delete all data! (y/N)"
                if ($confirm -ne "y" -and $confirm -ne "Y") {
                    Write-Information "Operation cancelled."
                    exit 0
                }
            }
            
            Write-Warning "Dropping database..."
            dotnet ef database drop `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext `
                --environment $Environment `
                --force
        }
        
        "reset" {
            if (!$Force) {
                $confirm = Read-Host "Are you sure you want to reset the database? This will drop and recreate it! (y/N)"
                if ($confirm -ne "y" -and $confirm -ne "Y") {
                    Write-Information "Operation cancelled."
                    exit 0
                }
            }
            
            Write-Warning "Resetting database (drop + migrate + seed)..."
            
            # Drop database
            dotnet ef database drop `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext `
                --environment $Environment `
                --force
            
            # Apply migrations
            dotnet ef database update `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext `
                --environment $Environment
            
            Write-Information "Database reset complete. Seeding will occur on next application startup."
        }
        
        "remove" {
            Write-Information "Removing last migration..."
            dotnet ef migrations remove `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext
        }
        
        "script" {
            $scriptName = "migration-script-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
            Write-Information "Generating SQL script: $scriptName"
            
            dotnet ef migrations script `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext `
                --output $scriptName `
                --idempotent
                
            Write-Information "SQL script generated: $scriptName"
        }
        
        "status" {
            Write-Information "Checking migration status..."
            dotnet ef migrations list `
                --project $InfrastructureProject `
                --startup-project $ServerProject `
                --context ApplicationDbContext
        }
        
        default {
            Write-Information @"
Usage: .\migrate-database.ps1 [options]

Actions:
  add <name>    - Add a new migration
  migrate       - Apply pending migrations to database
  drop          - Drop the database (requires confirmation)
  reset         - Drop, recreate and seed database (requires confirmation)
  remove        - Remove the last migration
  script        - Generate SQL script for migrations
  status        - Show migration status

Options:
  -MigrationName <name>  - Name for new migration (required for 'add' action)
  -Environment <env>     - Target environment (Development, Production)
  -SeedData              - Seed test data after migration
  -Force                 - Skip confirmation prompts

Examples:
  .\migrate-database.ps1 add -MigrationName "AddUserRoles"
  .\migrate-database.ps1 migrate -Environment Production
  .\migrate-database.ps1 reset -SeedData -Force
  .\migrate-database.ps1 script
"@
        }
    }
    
    Write-Information "=== Operation completed successfully ==="
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Error $_.ScriptStackTrace
    exit 1
}