USE [test-AI2]
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateBug]    Script Date: 24-04-2026 11:13:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author     : System Generated
-- Create date: March 10, 2026
-- Procedure: sp_UpdateBug
-- Description: Updates bug information and tracks changes in history
-- Usage: EXEC sp_UpdateBug @json='{"id":"b1","status":"IN_PROGRESS",...}'
-- =============================================
ALTER   PROCEDURE [dbo].[sp_UpdateBug]
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
    DECLARE @userId NVARCHAR(50)
    DECLARE @remark NVARCHAR(MAX)
    
    DECLARE @oldStatus NVARCHAR(50), @oldPriority NVARCHAR(50), @oldSeverity NVARCHAR(50), @oldCategory NVARCHAR(50), @oldEnvironment NVARCHAR(MAX)
    DECLARE @oldAssigneeId NVARCHAR(50), @oldDueDate DATETIME2, @oldTitle NVARCHAR(200), @oldDescription NVARCHAR(MAX)
    DECLARE @newStatus NVARCHAR(50), @newPriority NVARCHAR(50), @newSeverity NVARCHAR(50), @newCategory NVARCHAR(50), @newEnvironment NVARCHAR(MAX)
    DECLARE @newAssigneeId NVARCHAR(50), @newDueDate DATETIME2, @newTitle NVARCHAR(200), @newDescription NVARCHAR(MAX)
    DECLARE @targetUser NVARCHAR(50), @notifMsg NVARCHAR(MAX), @effectiveTitle NVARCHAR(200)
    
    BEGIN TRY
        SET @id = JSON_VALUE(@json, '$.id')
        SET @userId = JSON_VALUE(@json, '$.userId')
        SET @remark = JSON_VALUE(@json, '$.remark')
        
        -- Get old values
        SELECT @oldStatus = [status], @oldPriority = [priority], @oldSeverity = [severity],
               @oldAssigneeId = assigneeId, @oldDueDate = dueDate, @oldTitle = title, @oldDescription = [description],
               @oldCategory = category, @oldEnvironment = environment
        FROM Bugs WHERE id = @id;

        -- Get new values from JSON
        SET @newStatus = JSON_VALUE(@json, '$.status')
        SET @newPriority = JSON_VALUE(@json, '$.priority')
        SET @newSeverity = JSON_VALUE(@json, '$.severity')
        SET @newAssigneeId = JSON_VALUE(@json, '$.assigneeId')
        SET @newDueDate = JSON_VALUE(@json, '$.dueDate')
        SET @newTitle = JSON_VALUE(@json, '$.title')
        SET @newDescription = JSON_VALUE(@json, '$.description')
        SET @newCategory = JSON_VALUE(@json, '$.category')
        SET @newEnvironment = JSON_VALUE(@json, '$.environment')

        -- Track History for Status
        IF @newStatus IS NOT NULL AND @newStatus <> ISNULL(@oldStatus, '')
        BEGIN
            INSERT INTO BugHistory ([id], bugId, userId, field, oldValue, newValue, remark)
            VALUES ('bh' + CAST(NEWID() AS NVARCHAR(36)), @id, @userId, 'status', @oldStatus, @newStatus, @remark);
        END;

        -- Track History for Priority
        IF @newPriority IS NOT NULL AND @newPriority <> ISNULL(@oldPriority, '')
        BEGIN
            INSERT INTO BugHistory ([id], bugId, userId, field, oldValue, newValue, remark)
            VALUES ('bh' + CAST(NEWID() AS NVARCHAR(36)), @id, @userId, 'priority', @oldPriority, @newPriority, @remark);
        END;

        -- Track History for Severity
        IF @newSeverity IS NOT NULL AND @newSeverity <> ISNULL(@oldSeverity, '')
        BEGIN
            INSERT INTO BugHistory ([id], bugId, userId, field, oldValue, newValue, remark)
            VALUES ('bh' + CAST(NEWID() AS NVARCHAR(36)), @id, @userId, 'severity', @oldSeverity, @newSeverity, @remark);
        END;

        -- Track History for Assignee
        IF @newAssigneeId IS NOT NULL AND @newAssigneeId <> ISNULL(@oldAssigneeId, '')
        BEGIN
            INSERT INTO BugHistory ([id], bugId, userId, field, oldValue, newValue, remark)
            VALUES ('bh' + CAST(NEWID() AS NVARCHAR(36)), @id, @userId, 'assigneeId', @oldAssigneeId, @newAssigneeId, @remark);
        END;

        -- Track History for Category
        IF @newCategory IS NOT NULL AND @newCategory <> ISNULL(@oldCategory, '')
        BEGIN
            INSERT INTO BugHistory ([id], bugId, userId, field, oldValue, newValue, remark)
            VALUES ('bh' + CAST(NEWID() AS NVARCHAR(36)), @id, @userId, 'category', @oldCategory, @newCategory, @remark);
        END;

        -- Track History for Title
        IF @newTitle IS NOT NULL AND @newTitle <> ISNULL(@oldTitle, '')
        BEGIN
            INSERT INTO BugHistory ([id], bugId, userId, field, oldValue, newValue, remark)
            VALUES ('bh' + CAST(NEWID() AS NVARCHAR(36)), @id, @userId, 'title', @oldTitle, @newTitle, @remark);
        END;

        -- Update Bug
        UPDATE Bugs
        SET [status] = ISNULL(@newStatus, [status]),
            [priority] = ISNULL(@newPriority, [priority]),
            [severity] = ISNULL(@newSeverity, [severity]),
            assigneeId = ISNULL(@newAssigneeId, assigneeId),
            title = ISNULL(@newTitle, title),
            [description] = ISNULL(@newDescription, [description]),
            dueDate = ISNULL(@newDueDate, dueDate),
            category = ISNULL(@newCategory, category),
            environment = ISNULL(@newEnvironment, environment),
            updatedAt = SYSUTCDATETIME()
        WHERE id = @id;

        -- Insert Attachments
        INSERT INTO Attachments ([id], bugId, [fileName], fileSize, mimeType, filePath)
        SELECT 
            JSON_VALUE([value], '$.id'),
            JSON_VALUE([value], '$.bugId'),
            JSON_VALUE([value], '$.fileName'),
            CAST(JSON_VALUE([value], '$.fileSize') AS INT),
            JSON_VALUE([value], '$.mimeType'),
            JSON_VALUE([value], '$.filePath')
        FROM OPENJSON(@json, '$.attachments');

        -- Log attachments in history
        IF EXISTS (SELECT 1 FROM OPENJSON(@json, '$.attachments'))
        BEGIN
            INSERT INTO BugHistory ([id], bugId, userId, field, newValue, remark)
            VALUES ('bh' + CAST(NEWID() AS NVARCHAR(36)), @id, @userId, 'attachments', 'File(s) added', @remark);
        END;

        SET @effectiveTitle = ISNULL(@newTitle, @oldTitle)

        -- Notify if Assignee Changed
        IF @newAssigneeId IS NOT NULL AND @newAssigneeId <> ISNULL(@oldAssigneeId, '')
        BEGIN
            EXEC sp_CreateNotification 
                @userId = @newAssigneeId,
                @title = 'Bug Reassigned to You',
                @message = @effectiveTitle,
                @type = 'BUG_ASSIGNED',
                @relatedId = @id;
        END

        -- Notify current assignee of status change
        IF @newStatus IS NOT NULL AND @newStatus <> ISNULL(@oldStatus, '')
        BEGIN
            SET @targetUser = ISNULL(@newAssigneeId, @oldAssigneeId);
            SET @notifMsg = 'Status changed to ' + @newStatus + ' for "' + @effectiveTitle + '"';
            IF @targetUser IS NOT NULL
            BEGIN
                EXEC sp_CreateNotification 
                    @userId = @targetUser,
                    @title = 'Bug Status Updated',
                    @message = @notifMsg,
                    @type = 'STATUS_CHANGED',
                    @relatedId = @id;
            END
        END
        
        -- Log Success
        INSERT INTO StoredProcedureLog (procedureName, appUserId, ipAddress, formName, parameters, logMessage)
        VALUES (@ProcedureName, @appuserid, @IPAddress, @FormName, @json, 
                CONCAT('Bug updated: ', @effectiveTitle))
        
    END TRY
    BEGIN CATCH
        -- Log Error
        INSERT INTO StoredProcedureLog (procedureName, appUserId, ipAddress, formName, parameters, errorMessage, executionStatus)
        VALUES (@ProcedureName, @appuserid, @IPAddress, @FormName, @json, ERROR_MESSAGE(), 'ERROR')
        
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE(), @ErrSev INT = ERROR_SEVERITY(), @ErrState INT = ERROR_STATE();
        RAISERROR(@ErrMsg, @ErrSev, @ErrState);
    END CATCH
END;