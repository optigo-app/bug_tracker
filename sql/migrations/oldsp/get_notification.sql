USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetNotifications]    Script Date: 24-04-2026 11:13:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- 2. Stored Procedures
ALTER   PROCEDURE [dbo].[sp_GetNotifications]
    @json NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @userId NVARCHAR(50) = JSON_VALUE(@json, '$.userId');
    
    SELECT * FROM Notifications 
    WHERE userId = @userId 
    ORDER BY isRead ASC, createdAt DESC;
END;