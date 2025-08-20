-- DorfkisteBlazor - Database Initialization Script
-- Infrastructure & DevOps Agent - Database Setup

-- ==================================================
-- Create Database if it doesn't exist
-- ==================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'DorfkisteBlazor')
BEGIN
    CREATE DATABASE [DorfkisteBlazor];
    PRINT 'Database DorfkisteBlazor created successfully';
END
ELSE
BEGIN
    PRINT 'Database DorfkisteBlazor already exists';
END
GO

-- Switch to the DorfkisteBlazor database
USE [DorfkisteBlazor];
GO

-- ==================================================
-- Enable necessary features
-- ==================================================
-- Enable full-text search if needed
-- EXEC sp_fulltext_database 'enable';

-- ==================================================
-- Create application user (if needed)
-- ==================================================
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'dorfkiste_app')
BEGIN
    CREATE USER [dorfkiste_app] WITHOUT LOGIN;
    PRINT 'User dorfkiste_app created successfully';
END
ELSE
BEGIN
    PRINT 'User dorfkiste_app already exists';
END
GO

-- Grant necessary permissions
ALTER ROLE [db_datareader] ADD MEMBER [dorfkiste_app];
ALTER ROLE [db_datawriter] ADD MEMBER [dorfkiste_app];
GRANT EXECUTE TO [dorfkiste_app];
GO

-- ==================================================
-- Initial configuration
-- ==================================================
-- Set database options for better performance
ALTER DATABASE [DorfkisteBlazor] SET READ_COMMITTED_SNAPSHOT ON;
ALTER DATABASE [DorfkisteBlazor] SET ALLOW_SNAPSHOT_ISOLATION ON;
ALTER DATABASE [DorfkisteBlazor] SET AUTO_CREATE_STATISTICS ON;
ALTER DATABASE [DorfkisteBlazor] SET AUTO_UPDATE_STATISTICS ON;
GO

PRINT 'Database initialization completed successfully';
GO