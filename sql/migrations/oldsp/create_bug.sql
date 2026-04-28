USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateBug]    Script Date: 24-04-2026 11:11:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author     : System Generated
-- Create date: March 10, 2026
-- Procedure: sp_CreateBug
-- Description: Creates a new bug with attachments and notifications
-- Usage: EXEC sp_CreateBug @json='{"id":"b1","title":"Bug Title",...}'
-- =============================================
ALTER   PROCEDURE [dbo].[sp_CreateBug]
    @json NVARCHAR(MAX),
    @appuserid NVARCHAR(MAX) = 'system',
    @IPAddress NVARCHAR(MAX) = '0.0.0.0',
    @FormName NVARCHAR(MAX) = 'Bugs'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromDate DATETIME = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
    DECLARE @ProcedureName NVARCHAR(MAX) = OBJECT_NAME(@@PROCID)

    DECLARE 
         @id NVARCHAR(50) = ''
        ,@title NVARCHAR(200) = ''
        ,@description NVARCHAR(MAX) = ''
        ,@taskId NVARCHAR(50) = ''
        ,@taskNo NVARCHAR(50) = ''
        ,@taskName NVARCHAR(200) = ''
        ,@assigneeId NVARCHAR(50) = ''
        ,@reporterId NVARCHAR(50) = ''
        ,@priority NVARCHAR(50) = ''
        ,@severity NVARCHAR(50) = ''
        ,@dueDate NVARCHAR(50) = ''
        ,@category NVARCHAR(50) = ''
        ,@environment NVARCHAR(200) = ''

    BEGIN TRY

        IF(ISNULL(@json,'') <> '')
        BEGIN
            SELECT TOP 1
                 @id = ISNULL(id,'')
                ,@title = ISNULL(title,'')
                ,@description = description
                ,@taskId = taskId
                ,@taskNo = taskNo
                ,@taskName = taskName
                ,@assigneeId = assigneeId
                ,@reporterId = reporterId
                ,@priority = priority
                ,@severity = severity
                ,@dueDate = dueDate
                ,@category = category
                ,@environment = environment
            FROM OPENJSON(@json)
            WITH
            (
                id NVARCHAR(50) '$.id',
                title NVARCHAR(200) '$.title',
                description NVARCHAR(MAX) '$.description',
                taskId NVARCHAR(50) '$.taskId',
                taskNo NVARCHAR(50) '$.taskNo',
                taskName NVARCHAR(200) '$.taskName',
                assigneeId NVARCHAR(50) '$.assigneeId',
                reporterId NVARCHAR(50) '$.reporterId',
                priority NVARCHAR(50) '$.priority',
                severity NVARCHAR(50) '$.severity',
                dueDate NVARCHAR(50) '$.dueDate',
                category NVARCHAR(50) '$.category',
                environment NVARCHAR(200) '$.environment'
            )
        END

        IF NOT EXISTS (SELECT 1 FROM Bugs WHERE id = @id)
        BEGIN

            INSERT INTO Bugs 
            (
                id,
                title,
                description,
                taskId,
                taskNo,
                taskName,
                assigneeId,
                reporterId,
                priority,
                severity,
                dueDate,
                category,
                environment
            )
            VALUES
            (
                @id,
                @title,
                @description,
                @taskId,
                @taskNo,
                @taskName,
                @assigneeId,
                @reporterId,
                @priority,
                @severity,
                @dueDate,
                @category,
                @environment
            )


            -- Insert Attachments
            INSERT INTO Attachments
            (
                id,
                bugId,
                fileName,
                fileSize,
                mimeType,
                filePath
            )
            SELECT 
                id,
                bugId,
                fileName,
                TRY_CAST(fileSize AS INT),
                mimeType,
                filePath
            FROM OPENJSON(@json,'$.attachments')
            WITH
            (
                id NVARCHAR(50) '$.id',
                bugId NVARCHAR(50) '$.bugId',
                fileName NVARCHAR(200) '$.fileName',
                fileSize NVARCHAR(50) '$.fileSize',
                mimeType NVARCHAR(100) '$.mimeType',
                filePath NVARCHAR(500) '$.filePath'
            )


            -- Notification for Assignee
            IF ISNULL(@assigneeId,'') <> ''
            BEGIN
                EXEC sp_CreateNotification 
                     @userId = @assigneeId,
                     @title = 'New Bug Assigned',
                     @message = @title,
                     @type = 'BUG_ASSIGNED',
                     @relatedId = @id
            END


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
                CONCAT('Bug created: ', @title)
            )

        END

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