-- ---------------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------
USE [NODE_TEST]
GO

Declare
	@schema varchar(50) = 'nodetest';

-- QTD OBJETOS NO ESQUEMA
(
Select
	o.name
	,o.schema_id
	,o.type
	,o.type_desc
	,o.create_date
	,o.modify_date
From
	sys.objects o
Where
	schema_name(o.schema_id) Like @schema + '%'
Union
Select
	i.name
	,o.schema_id
	,o.type
	,o.type_desc
	,o.create_date
	,o.modify_date
From
	sys.objects o
	Inner Join sys.indexes i
		On (o.object_id = i.object_id)
Where
	schema_name(o.schema_id) Like @schema + '%'
)
Order by
	type_desc
	,name;
