USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetBugDetail]    Script Date: 24-04-2026 11:12:33 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author     : System Generated
-- Create date: March 10, 2026
-- Procedure: sp_GetBugDetail
-- Description: Retrieves detailed bug information including attachments, comments, and history
-- Usage: EXEC sp_GetBugDetail @json='{"id":"b1"}'
-- =============================================
ALTER   PROCEDURE [dbo].[sp_GetBugDetail]
    @json NVARCHAR(MAX),
    @appuserid NVARCHAR(MAX) = 'system',
    @IPAddress NVARCHAR(MAX) = '0.0.0.0',
    @FormName NVARCHAR(MAX) = 'Bugs'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromDate DATETIME = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
    DECLARE @ProcedureName NVARCHAR(MAX) = OBJECT_NAME(@@PROCID)

    DECLARE @id NVARCHAR(50) = ''

    BEGIN TRY

        IF(ISNULL(@json,'') <> '')
        BEGIN
            SELECT TOP 1
                @id = ISNULL(id,'')
            FROM OPENJSON(@json)
            WITH
            (
                id NVARCHAR(50) '$.id'
            )
        END

        -- FETCH BUG
        SELECT b.*
        FROM Bugs b
        WHERE b.id = @id

        -- FETCH ATTACHMENTS
        SELECT * FROM Attachments WHERE bugId = @id ORDER BY createdAt DESC

        -- FETCH COMMENTS
        SELECT c.*
        FROM Comments c
        WHERE c.bugId = @id
        ORDER BY c.createdAt DESC

        -- FETCH HISTORY (Including Remark)
        SELECT bh.*
        FROM BugHistory bh
        WHERE bh.bugId = @id
        ORDER BY bh.createdAt DESC

        -- Log Success
        INSERT INTO StoredProcedureLog
        (
            procedureName,
            appUserId,
            ipAddress,
            formName,
            parameters,
            logMessage
        )
        VALUES
        (
            @ProcedureName,
            @appuserid,
            @IPAddress,
            @FormName,
            @json,
            CONCAT('Bug detail retrieved: ', @id)
        )

    END TRY
    BEGIN CATCH

        INSERT INTO StoredProcedureLog
        (
            procedureName,
            appUserId,
            ipAddress,
            formName,
            parameters,
            errorMessage,
            executionStatus
        )
        VALUES
        (
            @ProcedureName,
            @appuserid,
            @IPAddress,
            @FormName,
            @json,
            ERROR_MESSAGE(),
            'ERROR'
        )

        DECLARE 
            @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrSev INT = ERROR_SEVERITY(),
            @ErrState INT = ERROR_STATE()

        RAISERROR(@ErrMsg, @ErrSev, @ErrState)

    END CATCH

END;