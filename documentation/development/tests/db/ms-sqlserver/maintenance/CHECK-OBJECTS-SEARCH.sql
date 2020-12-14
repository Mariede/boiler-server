-- ---------------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------
USE [NODE_TEST]
GO

Declare
	@schema varchar(50) = 'nodetest';

-- QTD COLUNAS POR TABELA NO ESQUEMA
Select
	C.TABLE_SCHEMA TableSchema
	,C.TABLE_NAME
	,C.COLUMN_NAME
	,C.DATA_TYPE
From
	INFORMATION_SCHEMA.COLUMNS C
Where
	C.DATA_TYPE LIKE 'DATE%'
	And C.TABLE_SCHEMA = @schema
ORDER BY
	C.TABLE_NAME;
