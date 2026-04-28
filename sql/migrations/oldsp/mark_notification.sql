USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_MarkNotificationRead]    Script Date: 24-04-2026 11:13:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER   PROCEDURE [dbo].[sp_MarkNotificationRead]
    @json NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id NVARCHAR(50) = JSON_VALUE(@json, '$.id');
    
    UPDATE Notifications SET isRead = 1 WHERE id = @id;
END;