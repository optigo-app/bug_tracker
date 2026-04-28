USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteBug]    Script Date: 24-04-2026 11:12:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author     : System Generated
-- Create date: March 10, 2026
-- Procedure: sp_DeleteBug
-- Description: Deletes a bug and all related data
-- Usage: EXEC sp_DeleteBug @json='{"id":"b1"}'
-- =============================================
ALTER   PROCEDURE [dbo].[sp_DeleteBug]
    @json NVARCHAR(MAX)
   ,@appuserid AS NVARCHAR(MAX) = 'system'
   ,@IPAddress AS NVARCHAR(MAX) = '0.0.0.0'
   ,@FormName AS NVARCHAR(MAX) = 'Bugs'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @FromDate AS DATETIME = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
    DECLARE @ProcedureName NVARCHAR(MAX) = OBJECT_NAME(@@PROCID)
    DECLARE @id NVARCHAR(50)
    
    BEGIN TRY
        SET @id = JSON_VALUE(@json, '$.id')

        DELETE FROM BugHistory WHERE bugId = @id;
        DELETE FROM Comments WHERE bugId = @id;
        DELETE FROM Attachments WHERE bugId = @id;
        DELETE FROM Bugs WHERE id = @id;
        
        -- Log Success
        INSERT INTO StoredProcedureLog (procedureName, appUserId, ipAddress, formName, parameters, logMessage)
        VALUES (@ProcedureName, @appuserid, @IPAddress, @FormName, @json, 
                CONCAT('Bug deleted: ', @id))
        
    END TRY
    BEGIN CATCH
        -- Log Error
        INSERT INTO StoredProcedureLog (procedureName, appUserId, ipAddress, formName, parameters, errorMessage, executionStatus)
        VALUES (@ProcedureName, @appuserid, @IPAddress, @FormName, @json, ERROR_MESSAGE(), 'ERROR')
        
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE(), @ErrSev INT = ERROR_SEVERITY(), @ErrState INT = ERROR_STATE();
        RAISERROR(@ErrMsg, @ErrSev, @ErrState);
    END CATCH
END;