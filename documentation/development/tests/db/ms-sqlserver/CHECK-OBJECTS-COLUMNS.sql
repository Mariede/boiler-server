-- ---------------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------
USE [NODE_TEST]
GO

Declare
	@schema varchar(50) = 'nodetest';

-- VERIFICA QUANTIDADE DE COLUNAS POR TABELA
Select
	a.TABLE_SCHEMA
	,a.TABLE_NAME
	,Count(a.COLUMN_NAME)	QTD_COLUNAS
From
	INFORMATION_SCHEMA.COLUMNS a
Where
	a.TABLE_SCHEMA Like @schema + '%'
Group By
	a.TABLE_SCHEMA
	,a.TABLE_NAME
Order By
	a.TABLE_NAME;

	-- VERIFICA QUANTIDADE DE COLUNAS TOTAL
Select
	a.TABLE_SCHEMA
	,Count(a.COLUMN_NAME)	QTD_COLUNAS_TOTAL
From
	INFORMATION_SCHEMA.COLUMNS a
Where
	TABLE_SCHEMA Like @schema + '%'
Group By
	a.TABLE_SCHEMA;
