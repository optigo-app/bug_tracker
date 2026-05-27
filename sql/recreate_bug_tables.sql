USE [orail25]
GO

/* Drop in dependency order */
IF OBJECT_ID('[dbo].[bug_Attachments]', 'U') IS NOT NULL
    DROP TABLE [dbo].[bug_Attachments]
GO

IF OBJECT_ID('[dbo].[bug_BugHistory]', 'U') IS NOT NULL
    DROP TABLE [dbo].[bug_BugHistory]
GO

IF OBJECT_ID('[dbo].[bug_Comments]', 'U') IS NOT NULL
    DROP TABLE [dbo].[bug_Comments]
GO

IF OBJECT_ID('[dbo].[bug_Notifications]', 'U') IS NOT NULL
    DROP TABLE [dbo].[bug_Notifications]
GO

IF OBJECT_ID('[dbo].[bug_Bugs]', 'U') IS NOT NULL
    DROP TABLE [dbo].[bug_Bugs]
GO

CREATE TABLE [dbo].[bug_Bugs](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [title] [nvarchar](255) NOT NULL,
    [description] [nvarchar](max) NULL,
    [assigneeId] [int] NULL,
    [reporterId] [int] NULL,
    [dueDate] [datetime2](7) NULL,
    [createdAt] [datetime2](7) NULL,
    [updatedAt] [datetime2](7) NULL,
    [environment] [nvarchar](max) NULL,
    [taskId] [int] NULL,
    [taskNo] [nvarchar](50) NULL,
    [taskName] [nvarchar](200) NULL,
    [bugNo] [nvarchar](10) NULL,
    [statusId] [int] NULL,
    [priorityId] [int] NULL,
    [categoryId] [int] NULL,
    CONSTRAINT [PK_bug_Bugs] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[bug_Bugs]
ADD CONSTRAINT [DF_bug_Bugs_createdAt] DEFAULT (sysutcdatetime()) FOR [createdAt]
GO

ALTER TABLE [dbo].[bug_Bugs]
ADD CONSTRAINT [DF_bug_Bugs_updatedAt] DEFAULT (sysutcdatetime()) FOR [updatedAt]
GO

CREATE TABLE [dbo].[bug_Comments](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [bugId] [int] NULL,
    [userId] [int] NULL,
    [content] [nvarchar](max) NOT NULL,
    [createdAt] [datetime2](7) NULL,
    CONSTRAINT [PK_bug_Comments] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[bug_Comments]
ADD CONSTRAINT [DF_bug_Comments_createdAt] DEFAULT (sysutcdatetime()) FOR [createdAt]
GO

CREATE TABLE [dbo].[bug_BugHistory](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [bugId] [int] NULL,
    [userId] [int] NULL,
    [remark] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NULL,
    CONSTRAINT [PK_bug_BugHistory] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[bug_BugHistory]
ADD CONSTRAINT [DF_bug_BugHistory_createdAt] DEFAULT (sysutcdatetime()) FOR [createdAt]
GO

CREATE TABLE [dbo].[bug_Attachments](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [bugId] [int] NULL,
    [commentId] [int] NULL,
    [fileName] [nvarchar](255) NOT NULL,
    [filePath] [nvarchar](max) NULL,
    [createdAt] [datetime2](7) NULL,
    CONSTRAINT [PK_bug_Attachments] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[bug_Attachments]
ADD CONSTRAINT [DF_bug_Attachments_createdAt] DEFAULT (sysutcdatetime()) FOR [createdAt]
GO

CREATE TABLE [dbo].[bug_Notifications](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [userId] [int] NULL,
    [title] [nvarchar](255) NULL,
    [message] [nvarchar](max) NULL,
    [type] [nvarchar](100) NULL,
    [relatedId] [int] NULL,
    [isRead] [bit] NOT NULL,
    [createdAt] [datetime2](7) NULL,
    CONSTRAINT [PK_bug_Notifications] PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[bug_Notifications]
ADD CONSTRAINT [DF_bug_Notifications_isRead] DEFAULT ((0)) FOR [isRead]
GO

ALTER TABLE [dbo].[bug_Notifications]
ADD CONSTRAINT [DF_bug_Notifications_createdAt] DEFAULT (sysutcdatetime()) FOR [createdAt]
GO
