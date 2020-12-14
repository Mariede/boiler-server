IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = N'NODE_TEST')
CREATE DATABASE [NODE_TEST]
GO

USE [NODE_TEST]
GO

/****** Object:  Schema [nodetest] ******/
IF EXISTS (SELECT * FROM sys.schemas WHERE name = N'nodetest')
DROP SCHEMA [nodetest]
GO

CREATE SCHEMA [nodetest] AUTHORIZATION [dbo]
GO
