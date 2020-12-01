-- ---------------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------
USE [NODE_TEST]
GO

Declare
	@schema varchar(50) = 'nodetest';

-- VERIFICA EXISTENCIA DE IDENTITIES POR TABELA
Select
	A.TABLE_NAME
	,A.COLUMN_NAME
	, A.IS_NULLABLE
From
	INFORMATION_SCHEMA.COLUMNS A
Where
	COLUMNPROPERTY(object_id(A.TABLE_SCHEMA + '.' + A.TABLE_NAME), A.COLUMN_NAME, 'IsIdentity') = 1
	And A.TABLE_SCHEMA = @schema
Order By
	TABLE_NAME;
