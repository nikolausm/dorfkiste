#!/bin/bash

# Bash script for managing Entity Framework migrations

set -e  # Exit on any error

# Default values
ACTION="migrate"
MIGRATION_NAME=""
ENVIRONMENT="Development"
SEED_DATA=false
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        add|migrate|drop|reset|remove|script|status)
            ACTION="$1"
            shift
            ;;
        -n|--name)
            MIGRATION_NAME="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--seed)
            SEED_DATA=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [action] [options]"
            echo ""
            echo "Actions:"
            echo "  add <name>    - Add a new migration"
            echo "  migrate       - Apply pending migrations to database"
            echo "  drop          - Drop the database (requires confirmation)"
            echo "  reset         - Drop, recreate and seed database (requires confirmation)"
            echo "  remove        - Remove the last migration"
            echo "  script        - Generate SQL script for migrations"
            echo "  status        - Show migration status"
            echo ""
            echo "Options:"
            echo "  -n, --name <name>      - Name for new migration (required for 'add' action)"
            echo "  -e, --environment <env> - Target environment (Development, Production)"
            echo "  -s, --seed             - Seed test data after migration"
            echo "  -f, --force            - Skip confirmation prompts"
            echo "  -h, --help             - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 add --name AddUserRoles"
            echo "  $0 migrate --environment Production"
            echo "  $0 reset --seed --force"
            echo "  $0 script"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Project paths
INFRASTRUCTURE_PROJECT="../src/DorfkisteBlazor.Infrastructure"
SERVER_PROJECT="../src/DorfkisteBlazor.Server"

echo "=== Dorfkiste Database Migration Script ==="
echo "Action: $ACTION"
echo "Environment: $ENVIRONMENT"

# Check if dotnet EF tools are installed
if ! dotnet ef --version > /dev/null 2>&1; then
    echo "Entity Framework tools not found. Installing..."
    dotnet tool install --global dotnet-ef
fi

case $ACTION in
    "add")
        if [ -z "$MIGRATION_NAME" ]; then
            read -p "Enter migration name: " MIGRATION_NAME
        fi
        
        if [ -z "$MIGRATION_NAME" ]; then
            echo "Migration name is required for 'add' action"
            exit 1
        fi
        
        echo "Adding new migration: $MIGRATION_NAME"
        dotnet ef migrations add "$MIGRATION_NAME" \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext
        ;;
        
    "migrate")
        echo "Applying migrations to database..."
        dotnet ef database update \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext \
            --environment "$ENVIRONMENT"
            
        if [ "$SEED_DATA" = true ]; then
            echo "Seeding database with test data..."
            echo "Database seeding will occur on next application startup"
        fi
        ;;
        
    "drop")
        if [ "$FORCE" != true ]; then
            read -p "Are you sure you want to drop the database? This will delete all data! (y/N): " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Operation cancelled."
                exit 0
            fi
        fi
        
        echo "Dropping database..."
        dotnet ef database drop \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext \
            --environment "$ENVIRONMENT" \
            --force
        ;;
        
    "reset")
        if [ "$FORCE" != true ]; then
            read -p "Are you sure you want to reset the database? This will drop and recreate it! (y/N): " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Operation cancelled."
                exit 0
            fi
        fi
        
        echo "Resetting database (drop + migrate + seed)..."
        
        # Drop database
        dotnet ef database drop \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext \
            --environment "$ENVIRONMENT" \
            --force
        
        # Apply migrations
        dotnet ef database update \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext \
            --environment "$ENVIRONMENT"
        
        echo "Database reset complete. Seeding will occur on next application startup."
        ;;
        
    "remove")
        echo "Removing last migration..."
        dotnet ef migrations remove \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext
        ;;
        
    "script")
        SCRIPT_NAME="migration-script-$(date +%Y%m%d-%H%M%S).sql"
        echo "Generating SQL script: $SCRIPT_NAME"
        
        dotnet ef migrations script \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext \
            --output "$SCRIPT_NAME" \
            --idempotent
            
        echo "SQL script generated: $SCRIPT_NAME"
        ;;
        
    "status")
        echo "Checking migration status..."
        dotnet ef migrations list \
            --project "$INFRASTRUCTURE_PROJECT" \
            --startup-project "$SERVER_PROJECT" \
            --context ApplicationDbContext
        ;;
        
    *)
        echo "Unknown action: $ACTION"
        echo "Use --help for usage information"
        exit 1
        ;;
esac

echo "=== Operation completed successfully ==="