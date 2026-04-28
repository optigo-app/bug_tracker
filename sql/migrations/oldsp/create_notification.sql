USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateNotification]    Script Date: 24-04-2026 11:11:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

            ALTER   PROCEDURE [dbo].[sp_CreateNotification]
                @userId NVARCHAR(50),
                @title NVARCHAR(200),
                @message NVARCHAR(MAX),
                @type NVARCHAR(50),
                @relatedId NVARCHAR(50)
            AS
            BEGIN
                SET NOCOUNT ON;
                DECLARE @id NVARCHAR(50) = 'nt_' + CAST(NEWID() AS NVARCHAR(36));
                
                INSERT INTO Notifications (id, userId, title, message, [type], relatedId)
                VALUES (@id, @userId, @title, @message, @type, @relatedId);
            END;
        