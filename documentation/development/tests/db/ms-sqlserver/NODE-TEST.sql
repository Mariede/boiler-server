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

/****** Object:  Table [nodetest].[EMPRESA] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[EMPRESA]') AND type in (N'U'))
BEGIN
CREATE TABLE [nodetest].[EMPRESA](
	[ID_EMPRESA] [int] IDENTITY(1,1) NOT NULL,
	[EMPRESA] [varchar](200) NOT NULL,
	[CNPJ] [numeric](14, 0) NOT NULL,
	[PROPRIETARIO] [bit] NOT NULL,
	[ATIVO] [bit] NOT NULL,
	[DETALHES] [varchar](max) NULL,
	[DATA_LIMITE_USO] [datetime] NULL,
	[DATA_CRIACAO] [datetime] NOT NULL,
 CONSTRAINT [PK_EMPRESA] PRIMARY KEY CLUSTERED
(
	[ID_EMPRESA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

/****** Object:  Table [nodetest].[FUNCAO] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[FUNCAO]') AND type in (N'U'))
BEGIN
CREATE TABLE [nodetest].[FUNCAO](
	[ID_FUNCAO] [int] NOT NULL,
	[FUNCAO] [varchar](50) NOT NULL,
	[DESCRICAO] [varchar](200) NOT NULL,
 CONSTRAINT [PK_FUNCAO] PRIMARY KEY CLUSTERED
(
	[ID_FUNCAO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

/****** Object:  Table [nodetest].[LOGS] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[LOGS]') AND type in (N'U'))
BEGIN
CREATE TABLE [nodetest].[LOGS](
	[ID_LOGS] [int] IDENTITY(1,1) NOT NULL,
	[ID_USUARIO] [int] NOT NULL,
	[IP] [varchar](20) NOT NULL,
	[DATA_INSERCAO] [datetime] NOT NULL,
 CONSTRAINT [PK_LOGS] PRIMARY KEY CLUSTERED
(
	[ID_LOGS] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

/****** Object:  Table [nodetest].[PERFIL] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[PERFIL]') AND type in (N'U'))
BEGIN
CREATE TABLE [nodetest].[PERFIL](
	[ID_PERFIL] [int] NOT NULL,
	[PERFIL] [varchar](50) NOT NULL,
 CONSTRAINT [PK_PERFIL] PRIMARY KEY CLUSTERED
(
	[ID_PERFIL] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

/****** Object:  Table [nodetest].[PERFIL_FUNCAO] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[PERFIL_FUNCAO]') AND type in (N'U'))
BEGIN
CREATE TABLE [nodetest].[PERFIL_FUNCAO](
	[ID_PERFIL] [int] NOT NULL,
	[ID_FUNCAO] [int] NOT NULL,
 CONSTRAINT [PK_PERFIL_FUNCAO] PRIMARY KEY CLUSTERED
(
	[ID_PERFIL] ASC,
	[ID_FUNCAO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

/****** Object:  Table [nodetest].[PERFIL_USUARIO] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[PERFIL_USUARIO]') AND type in (N'U'))
BEGIN
CREATE TABLE [nodetest].[PERFIL_USUARIO](
	[ID_PERFIL] [int] NOT NULL,
	[ID_USUARIO] [int] NOT NULL,
 CONSTRAINT [PK_PERFIL_USUARIO] PRIMARY KEY CLUSTERED
(
	[ID_PERFIL] ASC,
	[ID_USUARIO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

/****** Object:  Table [nodetest].[USUARIO] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[USUARIO]') AND type in (N'U'))
BEGIN
CREATE TABLE [nodetest].[USUARIO](
	[ID_USUARIO] [int] IDENTITY(1,1) NOT NULL,
	[ID_EMPRESA] [int] NOT NULL,
	[NOME] [varchar](200) NOT NULL,
	[EMAIL] [varchar](200) NOT NULL,
	[CPF] [numeric](11, 0) NOT NULL,
	[SENHA] [varchar](128) NOT NULL,
	[SALT] [varchar](5) NOT NULL,
	[ATIVO] [bit] NOT NULL,
	[DELETADO] [datetime] NULL,
	[DETALHES] [varchar](max) NULL,
	[DATA_CRIACAO] [datetime] NOT NULL,
 CONSTRAINT [PK_USUARIO] PRIMARY KEY CLUSTERED
(
	[ID_USUARIO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

/****** Data:  Table [nodetest].[EMPRESA] ******/
SET IDENTITY_INSERT [nodetest].[EMPRESA] ON

INSERT [nodetest].[EMPRESA] ([ID_EMPRESA], [EMPRESA], [CNPJ], [PROPRIETARIO], [ATIVO], [DATA_CRIACAO]) VALUES (1, N'ALPHA', 47963554000158, 0, 0, GETDATE())
INSERT [nodetest].[EMPRESA] ([ID_EMPRESA], [EMPRESA], [CNPJ], [PROPRIETARIO], [ATIVO], [DATA_CRIACAO]) VALUES (2, N'BETA', 25508670000144, 0, 1, GETDATE())
INSERT [nodetest].[EMPRESA] ([ID_EMPRESA], [EMPRESA], [CNPJ], [PROPRIETARIO], [ATIVO], [DATA_CRIACAO]) VALUES (3, N'GAMA', 8874578000189, 0, 1, GETDATE())
INSERT [nodetest].[EMPRESA] ([ID_EMPRESA], [EMPRESA], [CNPJ], [PROPRIETARIO], [ATIVO], [DATA_CRIACAO]) VALUES (4, N'DELTA', 60830120000148, 1, 1, GETDATE())
INSERT [nodetest].[EMPRESA] ([ID_EMPRESA], [EMPRESA], [CNPJ], [PROPRIETARIO], [ATIVO], [DATA_CRIACAO]) VALUES (5, N'EPSILON', 90173007000106, 0, 1, GETDATE())

SET IDENTITY_INSERT [nodetest].[EMPRESA] OFF

/****** Data:  Table [nodetest].[FUNCAO] ******/
INSERT [nodetest].[FUNCAO] ([ID_FUNCAO], [FUNCAO], [DESCRICAO]) VALUES (1, N'LST_EMPRESAS', N'Listagem empresas')
INSERT [nodetest].[FUNCAO] ([ID_FUNCAO], [FUNCAO], [DESCRICAO]) VALUES (2, N'EDT_EMPRESAS', N'Edição de empresas')
INSERT [nodetest].[FUNCAO] ([ID_FUNCAO], [FUNCAO], [DESCRICAO]) VALUES (3, N'LST_USUARIOS', N'Listagem usuários')
INSERT [nodetest].[FUNCAO] ([ID_FUNCAO], [FUNCAO], [DESCRICAO]) VALUES (4, N'EDT_USUARIOS', N'Edição de usuários')
INSERT [nodetest].[FUNCAO] ([ID_FUNCAO], [FUNCAO], [DESCRICAO]) VALUES (5, N'EDT_MINHA_SENHA', N'Alterar a própria senha')
INSERT [nodetest].[FUNCAO] ([ID_FUNCAO], [FUNCAO], [DESCRICAO]) VALUES (6, N'EXEC_CALCULO', N'Execução dos cálculos')

/****** Data:  Table [nodetest].[PERFIL] ******/
INSERT [nodetest].[PERFIL] ([ID_PERFIL], [PERFIL]) VALUES (1, N'SUPER')
INSERT [nodetest].[PERFIL] ([ID_PERFIL], [PERFIL]) VALUES (2, N'USUÁRIO')

/****** Data:  Table [nodetest].[PERFIL_FUNCAO] ******/
INSERT [nodetest].[PERFIL_FUNCAO] ([ID_PERFIL], [ID_FUNCAO]) VALUES (1, 1)
INSERT [nodetest].[PERFIL_FUNCAO] ([ID_PERFIL], [ID_FUNCAO]) VALUES (1, 2)
INSERT [nodetest].[PERFIL_FUNCAO] ([ID_PERFIL], [ID_FUNCAO]) VALUES (1, 3)
INSERT [nodetest].[PERFIL_FUNCAO] ([ID_PERFIL], [ID_FUNCAO]) VALUES (1, 4)
INSERT [nodetest].[PERFIL_FUNCAO] ([ID_PERFIL], [ID_FUNCAO]) VALUES (1, 5)
INSERT [nodetest].[PERFIL_FUNCAO] ([ID_PERFIL], [ID_FUNCAO]) VALUES (2, 5)
INSERT [nodetest].[PERFIL_FUNCAO] ([ID_PERFIL], [ID_FUNCAO]) VALUES (2, 6)

/****** Data:  Table [nodetest].[PERFIL_USUARIO] ******/
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (1, 1)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (1, 2)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (1, 3)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (1, 8)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (1, 40)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (1, 77)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (1, 93)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 1)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 68)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 69)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 70)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 93)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 76)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 77)
INSERT [nodetest].[PERFIL_USUARIO] ([ID_PERFIL], [ID_USUARIO]) VALUES (2, 78)

/****** Data:  Table [nodetest].[USUARIO] ******/
SET IDENTITY_INSERT [nodetest].[USUARIO] ON

INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (1, 2, N'JOAQUIM SANTOS', N'jsantos@email.com', 54951163055, N'0970d5775cebc72f1fefb69a1eb8a2d98d9c7fcdbb1378e040be8cf25246aeccbf3f5ab07f2bd5801040595dd38454f609015251678822bb649c7352109af7ff', N'62077', 1, '01-09-2020 09:01:10.380')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (2, 2, N'MARCIO ARAÚJO', N'maraujo@email.com', 2954417048, N'8d45da886663570f9eae356788ae02ac5edbd9a0cfdad870a7015924361f3f7c3773bb500e47f3ec16d0bc7e8a3bf7d4386c0ef2c77fedff666f8ed1ed84582f', N'44043', 1, '10-09-2020 15:02:11.390')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (3, 5, N'ENÉIAS CARNEIRO', N'eneias@email2.com', 56918910060, N'a8d38252958ba2c179a72c89af577e9abdd050ba9ea3a697e009c513c6ee72c6892b55e966536055012acb89dc68fc41cf1b1bd0d4aee9cb07385c19fca071db', N'd808b', 1, '11-09-2020 18:03:12.490')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (8, 1, N'ELEONORA PASCHOAL DOS SANTOS', N'eleonora.paschoal@email.com', 95488238026, N'7c1f069ac995851131301a399c0142e91aed5a459c246bc29bd4c9e0ee53b65675d8cf5596e83070885ca558f68ae02710cb2cd4196d90a6b7e30d7b99fc3208', N'ca254', 1, '06-10-2020 07:05:13.500')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (40, 5, N'ÉLISON GUSTAVO', N'elison@email23.com', 38772760087, N'e14987ed5cc23cdb56e33c75fcc07860776752b285e51dc319a3afc4ceabdf71d16d72b393400409c2a3965a7bfb41b0a296d00d181a0f63723b9555d7c0378f', N'22032', 1, '07-10-2020 08:30:10.600')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (68, 2, N'JONNY, O DESORDEIRO', N'jonny@destructor.com', 32124809040, N'8fd4a81099464baa6ff62836e19f60619d1bafd1a991d3f62beab96d95ed2c0e8daeb47a509d4db18b62e05441d8abbaa21865c8824210cff296318fdc01c849', N'ff990', 1, '11-10-2020 09:31:11.710')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (69, 4, N'ACÁCIO DA SILVA CALEGÁRIO', N'acacio@email.com', 58311353069, N'3d4cb39f83fac6b3da983d43c55cca212007a8d5fcf10c3d0c6575293b7222e350909a52e0a29458947a1e930b9c917c4f342b94d82151bfdc5833c1fa55abf5', N'5243e', 1, '15-10-2020 10:02:12.820')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (70, 4, N'YONARA MAGALHÃES MENDONÇA', N'yonara@email.com', 64011857084, N'3031d688d667887ca91f2b852ecb1c9c126aee6fed63258aca49b1e15eebd972b62666801d15d8412d4ee508a579c62fb3e52f2ede655856f3a2bb5388e40633', N'f681b', 0, '18-10-2020 23:18:13.530')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (76, 3, N'YUNA SIQUEIRA SANTOS', N'yuna.siqueira@email.com', 96407945038, N'3a38d60ec01d9c38058aada982a126ba62c3f736c104a232a9598d0a78ce34d8682b626eb697de58d93c50faddec8e7887fbb86f40e832042d629fd6ab05060d', N'e0aa7', 1, '01-11-2020 12:19:25.150')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (77, 4, N'JOFFREY BARATHEON MAGALHÃES INÁCIO', N'joffrey@email.com', 62756256005, N'65e9dc99c0fdecfa9326499d6fe3c4674a0c402c8f4c3843f0e5b0544e789bb3d48c20f561df5de0bda96b79cb9e79e649299bf3f26d37fad3cb409d2498520d', N'0361f', 1, '02-11-2020 13:08:28.210')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (78, 1, N'CACIQUE RAONÍ', N'cacique.raoni@emailfloresta.com', 40599454040, N'fad725c64711f559aa7df479907d92bab158ccf15f6820ac86f689673058e683e884e47dc3cddbefc2eb14128cfb0224ee4c2d1eb67b770abee7b637288af868', N'72190', 1, '09-11-2020 05:10:29.300')
INSERT [nodetest].[USUARIO] ([ID_USUARIO], [ID_EMPRESA], [NOME], [EMAIL], [CPF], [SENHA], [SALT], [ATIVO], [DATA_CRIACAO]) VALUES (93, 5, N'AYRTON SENNA DO BRASIL', N'ayrton@vencedor.com', 42331165017, N'cae52d6e890f65c6d1f753f2ee684d6bf73ca303a7371d1888b647b0961c339ead7c7445b4b688c86651fe9163ee09e5cc69737d0a5fc9c17b6faf6be65b0825', N'26333', 1, '11-11-2020 11:02:55.470')

SET IDENTITY_INSERT [nodetest].[USUARIO] OFF

SET ANSI_PADDING ON
GO

/****** Object:  Index [UK_EMPRESA_CNPJ] ******/
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[nodetest].[EMPRESA]') AND name = N'UK_EMPRESA_CNPJ')
CREATE UNIQUE NONCLUSTERED INDEX [UK_EMPRESA_CNPJ] ON [nodetest].[EMPRESA]
(
	[CNPJ] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

/****** Object:  Index [UK_EMPRESA_PROPRIETARIO] ******/
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[nodetest].[EMPRESA]') AND name = N'UK_EMPRESA_PROPRIETARIO')
CREATE UNIQUE NONCLUSTERED INDEX [UK_EMPRESA_PROPRIETARIO] ON [nodetest].[EMPRESA]
(
	[PROPRIETARIO] ASC
)
WHERE ([PROPRIETARIO]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

/****** Object:  Index [UK_FUNCAO_FUNCAO] ******/
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[nodetest].[FUNCAO]') AND name = N'UK_FUNCAO_FUNCAO')
CREATE UNIQUE NONCLUSTERED INDEX [UK_FUNCAO_FUNCAO] ON [nodetest].[FUNCAO]
(
	[FUNCAO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

/****** Object:  Index [UK_USUARIO_CPF] ******/
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[nodetest].[USUARIO]') AND name = N'UK_USUARIO_CPF')
CREATE UNIQUE NONCLUSTERED INDEX [UK_USUARIO_CPF] ON [nodetest].[USUARIO]
(
	[CPF] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

/****** Object:  Index [UK_USUARIO_EMAIL] ******/
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[nodetest].[USUARIO]') AND name = N'UK_USUARIO_EMAIL')
CREATE UNIQUE NONCLUSTERED INDEX [UK_USUARIO_EMAIL] ON [nodetest].[USUARIO]
(
	[EMAIL] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

/****** Object:  FK [FK_LOGS_USUARIO] ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_LOGS_USUARIO]') AND parent_object_id = OBJECT_ID(N'[nodetest].[LOGS]'))
ALTER TABLE [nodetest].[LOGS]  WITH CHECK ADD  CONSTRAINT [FK_LOGS_USUARIO] FOREIGN KEY([ID_USUARIO])
REFERENCES [nodetest].[USUARIO] ([ID_USUARIO])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_LOGS_USUARIO]') AND parent_object_id = OBJECT_ID(N'[nodetest].[LOGS]'))
ALTER TABLE [nodetest].[LOGS] CHECK CONSTRAINT [FK_LOGS_USUARIO]
GO

/****** Object:  FK [FK_PERFIL_FUNCAO_FUNCAO] ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_FUNCAO_FUNCAO]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_FUNCAO]'))
ALTER TABLE [nodetest].[PERFIL_FUNCAO]  WITH CHECK ADD  CONSTRAINT [FK_PERFIL_FUNCAO_FUNCAO] FOREIGN KEY([ID_FUNCAO])
REFERENCES [nodetest].[FUNCAO] ([ID_FUNCAO])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_FUNCAO_FUNCAO]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_FUNCAO]'))
ALTER TABLE [nodetest].[PERFIL_FUNCAO] CHECK CONSTRAINT [FK_PERFIL_FUNCAO_FUNCAO]
GO

/****** Object:  FK [FK_PERFIL_FUNCAO_PERFIL] ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_FUNCAO_PERFIL]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_FUNCAO]'))
ALTER TABLE [nodetest].[PERFIL_FUNCAO]  WITH CHECK ADD  CONSTRAINT [FK_PERFIL_FUNCAO_PERFIL] FOREIGN KEY([ID_PERFIL])
REFERENCES [nodetest].[PERFIL] ([ID_PERFIL])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_FUNCAO_PERFIL]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_FUNCAO]'))
ALTER TABLE [nodetest].[PERFIL_FUNCAO] CHECK CONSTRAINT [FK_PERFIL_FUNCAO_PERFIL]
GO

/****** Object:  FK [FK_PERFIL_USUARIO_PERFIL] ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_USUARIO_PERFIL]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_USUARIO]'))
ALTER TABLE [nodetest].[PERFIL_USUARIO]  WITH CHECK ADD  CONSTRAINT [FK_PERFIL_USUARIO_PERFIL] FOREIGN KEY([ID_PERFIL])
REFERENCES [nodetest].[PERFIL] ([ID_PERFIL])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_USUARIO_PERFIL]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_USUARIO]'))
ALTER TABLE [nodetest].[PERFIL_USUARIO] CHECK CONSTRAINT [FK_PERFIL_USUARIO_PERFIL]
GO

/****** Object:  FK [FK_PERFIL_USUARIO_USUARIO] ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_USUARIO_USUARIO]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_USUARIO]'))
ALTER TABLE [nodetest].[PERFIL_USUARIO]  WITH CHECK ADD  CONSTRAINT [FK_PERFIL_USUARIO_USUARIO] FOREIGN KEY([ID_USUARIO])
REFERENCES [nodetest].[USUARIO] ([ID_USUARIO])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_PERFIL_USUARIO_USUARIO]') AND parent_object_id = OBJECT_ID(N'[nodetest].[PERFIL_USUARIO]'))
ALTER TABLE [nodetest].[PERFIL_USUARIO] CHECK CONSTRAINT [FK_PERFIL_USUARIO_USUARIO]
GO

/****** Object:  FK [FK_USUARIO_EMPRESA] ******/
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_USUARIO_EMPRESA]') AND parent_object_id = OBJECT_ID(N'[nodetest].[USUARIO]'))
ALTER TABLE [nodetest].[USUARIO]  WITH CHECK ADD  CONSTRAINT [FK_USUARIO_EMPRESA] FOREIGN KEY([ID_EMPRESA])
REFERENCES [nodetest].[EMPRESA] ([ID_EMPRESA])
GO
IF  EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[nodetest].[FK_USUARIO_EMPRESA]') AND parent_object_id = OBJECT_ID(N'[nodetest].[USUARIO]'))
ALTER TABLE [nodetest].[USUARIO] CHECK CONSTRAINT [FK_USUARIO_EMPRESA]
GO

/****** Object:  StoredProcedure [nodetest].[USUARIO_CONSULTAR] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[nodetest].[USUARIO_CONSULTAR]') AND type in (N'P', N'PC'))
BEGIN
EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [nodetest].[USUARIO_CONSULTAR] AS'
END
GO
ALTER PROCEDURE [nodetest].[USUARIO_CONSULTAR]
	@ID_USUARIO
		int
	,@NOME
		varchar(200)
	,@QTD_RET
		int OUTPUT
AS
BEGIN
	SET NOCOUNT OFF;

/*
PROC DE TESTES
*/

	SELECT
		*
	FROM
		nodetest.USUARIO (NOLOCK)
	WHERE
		ID_USUARIO = @ID_USUARIO OR NOME LIKE ('%' + @NOME + '%');

	SET
		@QTD_RET = @@ROWCOUNT;

	RETURN
		@QTD_RET;
END
GO
