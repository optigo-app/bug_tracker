USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_AddComment]    Script Date: 24-04-2026 11:11:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Create updated procedure
ALTER   PROCEDURE [dbo].[sp_AddComment]
    @json NVARCHAR(MAX),
    @appuserid NVARCHAR(MAX) = 'system',
    @IPAddress NVARCHAR(MAX) = '0.0.0.0',
    @FormName NVARCHAR(MAX) = 'Comments'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromDate DATETIME = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
    DECLARE @ProcedureName NVARCHAR(MAX) = OBJECT_NAME(@@PROCID)

    DECLARE 
         @id NVARCHAR(50) = ''
        ,@bugId NVARCHAR(50) = ''
        ,@userId NVARCHAR(50) = ''
        ,@content NVARCHAR(MAX) = ''
        ,@bugTitle NVARCHAR(200) = ''
        ,@bugAssignee NVARCHAR(50) = ''
        ,@commentNotifMsg NVARCHAR(MAX) = ''

    BEGIN TRY

        IF(ISNULL(@json,'') <> '')
        BEGIN
            SELECT TOP 1
                 @bugId = ISNULL(bugId,'')
                ,@userId = ISNULL(userId,'')
                ,@content = content
            FROM OPENJSON(@json)
            WITH
            (
                bugId NVARCHAR(50) '$.bugId',
                userId NVARCHAR(50) '$.userId',
                content NVARCHAR(MAX) '$.content'
            )
        END

        -- Generate comment ID in database
        SET @id = 'c' + CONVERT(NVARCHAR(50), CAST(DATEDIFF(SECOND, '1970-01-01', GETUTCDATE()) AS BIGINT)) + SUBSTRING(CONVERT(NVARCHAR(50), NEWID()), 1, 7)

        INSERT INTO Comments 
        (
            id,
            bugId,
            userId,
            content
        )
        VALUES
        (
            @id,
            @bugId,
            @userId,
            @content
        )


        -- Insert Attachments
        INSERT INTO Attachments
        (
            id,
            bugId,
            commentId,
            fileName,
            fileSize,
            mimeType,
            filePath
        )
        SELECT 
            id,
            bugId,
            ISNULL(NULLIF(commentId, ''), @id),
            fileName,
            TRY_CAST(fileSize AS INT),
            mimeType,
            filePath
        FROM OPENJSON(@json,'$.attachments')
        WITH
        (
            id NVARCHAR(50) '$.id',
            bugId NVARCHAR(50) '$.bugId',
            commentId NVARCHAR(50) '$.commentId',
            fileName NVARCHAR(200) '$.fileName',
            fileSize NVARCHAR(50) '$.fileSize',
            mimeType NVARCHAR(100) '$.mimeType',
            filePath NVARCHAR(500) '$.filePath'
        )


        -- Notification for Assignee on New Comment
        SELECT 
            @bugTitle = title,
            @bugAssignee = assigneeId 
        FROM Bugs 
        WHERE id = @bugId

        SET @commentNotifMsg = 'A new comment was added to "' + ISNULL(@bugTitle, '') + '"'

        IF ISNULL(@bugAssignee,'') <> '' AND @bugAssignee <> @userId
        BEGIN
            EXEC sp_CreateNotification
                 @userId = @bugAssignee,
                 @title = 'New Comment on Bug',
                 @message = @commentNotifMsg,
                 @type = 'COMMENT_ADDED',
                 @relatedId = @bugId
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
            CONCAT('Comment added to bug: ', @bugId)
        )

        -- Return the generated comment ID and data
        SELECT @id AS id, @bugId AS bugId, @userId AS userId, @content AS content, GETDATE() AS createdAt

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