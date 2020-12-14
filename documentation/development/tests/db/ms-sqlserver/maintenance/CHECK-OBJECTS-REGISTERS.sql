-- ---------------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------
USE [NODE_TEST]
GO

Declare
	@schema varchar(50) = 'nodetest';

-- VERIFICA QUANTIDADE DE REGISTROS POR TABELA
Select
	TableSchema = s.name
	,TableName = t.name
	,QtdRegistros = p.rows
	,UsedSpaceKB = (Sum(a.used_pages) * 8)
	,TotalSpaceKB = (Sum(a.total_pages) * 8)
From
	sys.tables t
	Inner Join sys.indexes i
		On (t.OBJECT_ID = i.object_id)
	Inner Join sys.partitions p
		On (i.object_id = p.OBJECT_ID And i.index_id = p.index_id)
	Inner Join sys.allocation_units a
		On (p.partition_id = a.container_id)
	Inner Join sys.schemas s
		On (t.schema_id = s.schema_id)
Where
	t.is_ms_shipped = 0
	And s.Name = @schema
Group By
	t.Name
	,s.Name
	,p.Rows
Order By
	3 Desc;
