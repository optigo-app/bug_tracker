USE [404146_CentralUser]
GO
/****** Object:  StoredProcedure [dbo].[bugv1]    Script Date: 25-05-2026 10:42:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[bugv1]
    @con NVARCHAR(MAX) = ''
    ,@p   NVARCHAR(MAX) = ''
AS
BEGIN
     	SET NOCOUNT ON;
	-- dbo.getparam 'Reportv4'

	DECLARE @FromDate AS DATETIME=isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
	DECLARE @ProcedureName nvarchar(max)=OBJECT_NAME(@@PROCID)
	DECLARE @spname AS NVARCHAR(MAX)
	SELECT 
		@spname = COALESCE(@spname +char(13)+'	, ', '') + concat(A.name,' = ''', A.value ,'''')
	FROM (		
		SELECT name, value
		FROM (values 
			(1, '@con', replace(cast(@con as NVARCHAR(MAX)),'''','''''')),
			(2, '@p', replace(cast(@p as NVARCHAR(MAX)),'''','''''')),
			(1, '--@con', replace(cast([dbo].Base64Decode(@con) as NVARCHAR(MAX)),'''','''''')),
			(2, '--@p', replace(cast(@p as NVARCHAR(MAX)),'''',''''''))
			) p(num, name, value)
	) AS A(name, value)		
	--SET @spname=concat('exec [',DB_NAME(),'].[dbo].',@ProcedureName,' ',@spname)	
-------------
	SET @spname=concat('exec [404146_CentralUser].[dbo].',OBJECT_NAME(@@PROCID),' ',@spname)

        DECLARE
            @DBNAME        NVARCHAR(50)  = ''
            , @appuserid     NVARCHAR(100) = ''
            , @IPAddress     NVARCHAR(50)  = ''
            , @FormName      NVARCHAR(200) = ''
            , @mode          NVARCHAR(100) = ''
            , @bug_id        NVARCHAR(50)  = ''
            , @y             NVARCHAR(100) = ''
            , @Authorization NVARCHAR(100) = ''

        -- Parse @con
        SELECT
            @mode          = IIF(element_id = 2, StringValue, @mode)
            ,@y             = IIF(element_id = 3, StringValue, @y)
            ,@appuserid     = IIF(element_id = 4, StringValue, @appuserid)
            ,@IPAddress     = IIF(element_id = 5, StringValue, @IPAddress)
            ,@FormName      = IIF(element_id = 6, StringValue, @FormName)
            ,@Authorization = IIF(element_id = 7, StringValue, @Authorization)
        FROM [dbo].[parseJSON]([dbo].Base64Decode(@con))

        -- DB resolve
        SET @DBNAME = ISNULL([dbo].[GetdbName](@y), '')

        ----------------------------------------------------------------------------------------------------------------

        DECLARE
            @SQL NVARCHAR(MAX) = ''
            , @bug_taskId NVARCHAR(50)  = ''
            , @bug_statusId NVARCHAR(50)  = ''
            , @bug_title NVARCHAR(200)  = ''
            , @bug_description NVARCHAR(MAX) = ''
            , @bug_taskNo NVARCHAR(50)  = ''
            , @bug_taskName NVARCHAR(200) = ''
            , @bug_assigneeId NVARCHAR(50) = ''
            , @bug_reporterId NVARCHAR(50) = ''
            , @bug_priorityId NVARCHAR(50) = ''
            , @bug_dueDate NVARCHAR(50)  = ''
            , @bug_categoryId NVARCHAR(50)  = ''
            , @bug_environment NVARCHAR(200) = ''
            , @bug_remark NVARCHAR(MAX) = ''
            , @comment_bugId NVARCHAR(50) = ''
            , @comment_userId NVARCHAR(50) = ''
            , @comment_content NVARCHAR(MAX) = ''
            , @comment_id NVARCHAR(50) = ''
            , @notif_userId NVARCHAR(50) = ''
            , @notif_id NVARCHAR(50) = ''
            , @notif_title NVARCHAR(200) = ''
            , @notif_message NVARCHAR(MAX) = ''
            , @notif_type NVARCHAR(50) = ''
            , @notif_relatedId NVARCHAR(50) = ''
            , @input_status NVARCHAR(50) = ''
            , @input_statusId NVARCHAR(50) = ''
            , @input_priority NVARCHAR(50) = ''
            , @input_priorityId NVARCHAR(50) = ''
            , @input_category NVARCHAR(50) = ''
            , @input_categoryId NVARCHAR(50) = ''
            , @bug_filterType NVARCHAR(50) = ''

        BEGIN TRY

            ------------------------------------------------
            -- PARAM PARSE
            ------------------------------------------------
            IF (ISNULL(@p, '') <> '')
            BEGIN
                SELECT
                    @bug_id          = ISNULL(id, '')
                    ,@bug_taskId      = ISNULL(taskId, '')
                    ,@input_status    = ISNULL(status, '')
                    ,@input_statusId  = ISNULL(statusId, '')
                    ,@bug_title       = ISNULL(title, '')
                    ,@bug_description = ISNULL(description, '')
                    ,@bug_taskNo      = ISNULL(taskNo, '')
                    ,@bug_taskName    = ISNULL(taskName, '')
                    ,@bug_assigneeId  = ISNULL(assigneeId, '')
                    ,@bug_reporterId  = ISNULL(reporterId, '')
                    ,@input_priority  = ISNULL(priority, '')
                    ,@input_priorityId = ISNULL(priorityId, '')
                    ,@bug_dueDate     = ISNULL(dueDate, '')
                    ,@input_category  = ISNULL(category, '')
                    ,@input_categoryId = ISNULL(categoryId, '')
                    ,@bug_environment = ISNULL(environment, '')
                    ,@bug_remark      = ISNULL(remark, '')

                    ,@comment_bugId   = ISNULL(bugId, '')
                    ,@comment_userId  = ISNULL(userId, '')
                    ,@comment_content = ISNULL(content, '')
                    ,@comment_id      = ISNULL(commentId, '')
                    ,@notif_userId    = ISNULL(userId, '')
                    ,@notif_id        = ISNULL(id, '')
                    ,@notif_title     = ISNULL(title, '')
                    ,@notif_message   = ISNULL(message, '')
                    ,@notif_type      = ISNULL([type], '')
                    ,@notif_relatedId = ISNULL(relatedId, '')
                    ,@bug_filterType  = ISNULL(filterType, '')
                FROM OPENJSON(@p)
                WITH
                (
                    id NVARCHAR(50) '$.id'
                    ,taskId NVARCHAR(50) '$.taskId'
                    ,status NVARCHAR(50) '$.status'
                    ,statusId NVARCHAR(50) '$.statusId'
                    ,title NVARCHAR(200) '$.title'
                    ,description NVARCHAR(MAX) '$.description'
                    ,taskNo NVARCHAR(50) '$.taskNo'
                    ,taskName NVARCHAR(200) '$.taskName'
                    ,assigneeId NVARCHAR(50) '$.assigneeId'
                    ,reporterId NVARCHAR(50) '$.reporterId'
                    ,priority NVARCHAR(50) '$.priority'
                    ,priorityId NVARCHAR(50) '$.priorityId'
                    ,dueDate NVARCHAR(50) '$.dueDate'
                    ,category NVARCHAR(50) '$.category'
                    ,categoryId NVARCHAR(50) '$.categoryId'
                    ,environment NVARCHAR(200) '$.environment'
                    ,remark NVARCHAR(MAX) '$.remark'
                    ,bugId NVARCHAR(50) '$.bugId'
                    ,userId NVARCHAR(50) '$.userId'
                    ,content NVARCHAR(MAX) '$.content'
                    ,commentId NVARCHAR(50) '$.commentId'
                    ,message NVARCHAR(MAX) '$.message'
                    ,[type] NVARCHAR(50) '$.type'
                    ,relatedId NVARCHAR(50) '$.relatedId'
                    ,filterType NVARCHAR(50) '$.filterType'
                )

                SET @bug_statusId = COALESCE(NULLIF(@input_statusId, ''), NULLIF(@input_status, ''), '')
                SET @bug_priorityId = COALESCE(NULLIF(@input_priorityId, ''), NULLIF(@input_priority, ''), '')
                SET @bug_categoryId = COALESCE(NULLIF(@input_categoryId, ''), NULLIF(@input_category, ''), '')
            END

            ------------------------------------------------
            -- MODE: buglist
            ------------------------------------------------
            IF (@mode = 'buglist')
            BEGIN
                IF (@bug_filterType = 'me')
                BEGIN
                    IF (ISNULL(@bug_assigneeId, '') = '')
                    BEGIN
                        SET @bug_assigneeId = @appuserid
                    END
                    IF (ISNULL(@bug_reporterId, '') = '')
                    BEGIN
                        SET @bug_reporterId = @appuserid
                    END
                END
                ELSE IF (@bug_filterType = 'team')
                BEGIN
                    SET @bug_assigneeId = ''
                    SET @bug_reporterId = ''
                END

                SET @SQL = '
                    SELECT *, statusId AS [status], priorityId AS [priority], categoryId AS [category]
                    FROM [' + @DBNAME + '].[dbo].[bug_Bugs]
                    WHERE (''' + @bug_taskId + ''' = '''' OR taskId = ''' + @bug_taskId + ''')
                    AND (''' + @bug_statusId + ''' = '''' OR statusId = ''' + @bug_statusId + ''')
                    AND (
                        (''' + @bug_assigneeId + ''' = '''' AND ''' + @bug_reporterId + ''' = '''')
                        OR (''' + @bug_assigneeId + ''' <> '''' AND assigneeId = ''' + @bug_assigneeId + ''')
                        OR (''' + @bug_reporterId + ''' <> '''' AND reporterId = ''' + @bug_reporterId + ''')
                    )
                    ORDER BY createdAt DESC
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: bugsave (INSERT)
            ------------------------------------------------
            ELSE IF (@mode = 'bugsave')
            BEGIN
                SET @SQL = '
                    DECLARE @bug_id NVARCHAR(50) = ''' + @bug_id + '''
                    DECLARE @bug_no NVARCHAR(10)
                    DECLARE @next_num INT
                    DECLARE @now DATETIME = GETDATE()

                    -- Get the highest existing bug number
                    SELECT @next_num = ISNULL(
                        MAX(CASE
                            WHEN bugNo LIKE ''BT%''
                            THEN CAST(SUBSTRING(bugNo, 3, LEN(bugNo) - 2) AS INT)
                            ELSE 0
                        END),
                        0
                    ) FROM [' + @DBNAME + '].[dbo].[bug_Bugs]

                    -- Generate next bug number (BT1, BT2, etc.)
                    SET @next_num = @next_num + 1
					SET @bug_no = ''BT'' + CAST(@next_num AS NVARCHAR(10))

                    INSERT INTO [' + @DBNAME + '].[dbo].[bug_Bugs]
                    (
                        id,bugNo,title,description,taskId,taskNo,taskName,
                        assigneeId,reporterId,priorityId,dueDate,
                        categoryId,environment,statusId,createdAt,updatedAt
                    )
                    VALUES
                    (
                        @bug_id,
                        @bug_no,
                        ''' + REPLACE(@bug_title, '''', '''''') + ''',
                        ''' + REPLACE(@bug_description, '''', '''''') + ''',
                        ''' + @bug_taskId + ''',
                        ''' + @bug_taskNo + ''',
                        ''' + REPLACE(@bug_taskName, '''', '''''') + ''',
                        ''' + @bug_assigneeId + ''',
                        ''' + @bug_reporterId + ''',
                        ''' + @bug_priorityId + ''',
                        ''' + @bug_dueDate + ''',
                        ''' + @bug_categoryId + ''',
                        ''' + REPLACE(@bug_environment, '''', '''''') + ''',
                        ''' + IIF(ISNULL(@bug_statusId, '') = '', 'OPEN', @bug_statusId) + ''',@now,@now
                    )

                    -- Insert Attachments
                    INSERT INTO [' + @DBNAME + '].[dbo].[bug_Attachments]
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
                        @bug_id,
                        fileName,
                        TRY_CAST(fileSize AS INT),
                        mimeType,
                        filePath
                    FROM OPENJSON(''' + REPLACE(@p, '''', '''''') + ''',''$.attachments'')
                    WITH
                    (
                        id NVARCHAR(50) ''$.id'',
                        bugId NVARCHAR(50) ''$.bugId'',
                        fileName NVARCHAR(200) ''$.fileName'',
                        fileSize NVARCHAR(50) ''$.fileSize'',
                        mimeType NVARCHAR(100) ''$.mimeType'',
                        filePath NVARCHAR(500) ''$.filePath''
                    )
                    WHERE id IS NOT NULL

                    SELECT 1 stat,''bug created'' stat_msg,1000 stat_code,@bug_id id,@bug_no bugNo
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: bugupdate
            ------------------------------------------------
            ELSE IF (@mode = 'bugupdate')
            BEGIN
                SET @SQL = '
                    DECLARE @now DATETIME = GETDATE()
                    DECLARE @oldStatusId NVARCHAR(50), @oldPriorityId NVARCHAR(50), @oldCategoryId NVARCHAR(50)
                    DECLARE @oldAssigneeId NVARCHAR(50), @oldTitle NVARCHAR(200), @oldDescription NVARCHAR(MAX)
                    DECLARE @newStatusId NVARCHAR(50), @newPriorityId NVARCHAR(50), @newCategoryId NVARCHAR(50)
                    DECLARE @newAssigneeId NVARCHAR(50), @newTitle NVARCHAR(200), @newDescription NVARCHAR(MAX)
                    DECLARE @targetUser NVARCHAR(50), @notifMsg NVARCHAR(MAX), @effectiveTitle NVARCHAR(200)

                    -- Get old values
                    SELECT 
                        @oldStatusId = [statusId],
                        @oldPriorityId = [priorityId],
                        @oldAssigneeId = assigneeId,
                        @oldTitle = title,
                        @oldDescription = [description],
                        @oldCategoryId = categoryId
                    FROM [' + @DBNAME + '].[dbo].[bug_Bugs]
                    WHERE id = ''' + @bug_id + '''

                    -- Set new values
                    SET @newStatusId = IIF(''' + @bug_statusId + ''' = '''', @oldStatusId, ''' + @bug_statusId + ''')
                    SET @newPriorityId = IIF(''' + @bug_priorityId + ''' = '''', @oldPriorityId, ''' + @bug_priorityId + ''')
                    SET @newAssigneeId = IIF(''' + @bug_assigneeId + ''' = '''', @oldAssigneeId, ''' + @bug_assigneeId + ''')
                    SET @newTitle = IIF(''' + REPLACE(@bug_title, '''', '''''') + ''' = '''', @oldTitle, ''' + REPLACE(@bug_title, '''', '''''') + ''')
                    SET @newDescription = IIF(''' + REPLACE(@bug_description, '''', '''''') + ''' = '''', @oldDescription, ''' + REPLACE(@bug_description, '''', '''''') + ''')
                    SET @newCategoryId = IIF(''' + @bug_categoryId + ''' = '''', @oldCategoryId, ''' + @bug_categoryId + ''')

                    -- Track History for Status
                    IF @newStatusId IS NOT NULL AND @newStatusId <> @oldStatusId
                    BEGIN
                        INSERT INTO [' + @DBNAME + '].[dbo].[bug_BugHistory] ([id], bugId, userId, field, oldValue, newValue, remark)
                        VALUES (''bh'' + CAST(NEWID() AS NVARCHAR(36)), ''' + @bug_id + ''', ''' + @appuserid + ''', ''statusId'', @oldStatusId, @newStatusId, ''' + REPLACE(@bug_remark, '''', '''''') + ''')
                    END

                    -- Track History for Priority
                    IF @newPriorityId IS NOT NULL AND @newPriorityId <> @oldPriorityId
                    BEGIN
                        INSERT INTO [' + @DBNAME + '].[dbo].[bug_BugHistory] ([id], bugId, userId, field, oldValue, newValue, remark)
                        VALUES (''bh'' + CAST(NEWID() AS NVARCHAR(36)), ''' + @bug_id + ''', ''' + @appuserid + ''', ''priorityId'', @oldPriorityId, @newPriorityId, ''' + REPLACE(@bug_remark, '''', '''''') + ''')
                    END

                    -- Track History for Assignee
                    IF @newAssigneeId IS NOT NULL AND @newAssigneeId <> @oldAssigneeId
                    BEGIN
                        INSERT INTO [' + @DBNAME + '].[dbo].[bug_BugHistory] ([id], bugId, userId, field, oldValue, newValue, remark)
                        VALUES (''bh'' + CAST(NEWID() AS NVARCHAR(36)), ''' + @bug_id + ''', ''' + @appuserid + ''', ''assigneeId'', @oldAssigneeId, @newAssigneeId, ''' + REPLACE(@bug_remark, '''', '''''') + ''')
                    END

                    -- Track History for Category
                    IF @newCategoryId IS NOT NULL AND @newCategoryId <> @oldCategoryId
                    BEGIN
                        INSERT INTO [' + @DBNAME + '].[dbo].[bug_BugHistory] ([id], bugId, userId, field, oldValue, newValue, remark)
                        VALUES (''bh'' + CAST(NEWID() AS NVARCHAR(36)), ''' + @bug_id + ''', ''' + @appuserid + ''', ''categoryId'', @oldCategoryId, @newCategoryId, ''' + REPLACE(@bug_remark, '''', '''''') + ''')
                    END

                    -- Track History for Title
                    IF @newTitle IS NOT NULL AND @newTitle <> @oldTitle
                    BEGIN
                        INSERT INTO [' + @DBNAME + '].[dbo].[bug_BugHistory] ([id], bugId, userId, field, oldValue, newValue, remark)
                        VALUES (''bh'' + CAST(NEWID() AS NVARCHAR(36)), ''' + @bug_id + ''', ''' + @appuserid + ''', ''title'', @oldTitle, @newTitle, ''' + REPLACE(@bug_remark, '''', '''''') + ''')
                    END

                    -- Update Bug
                    UPDATE [' + @DBNAME + '].[dbo].[bug_Bugs]
                    SET
                        title       = @newTitle
                        ,description = @newDescription
                        ,taskId      = IIF(''' + @bug_taskId + ''' = '''', taskId, ''' + @bug_taskId + ''')
                        ,taskNo      = IIF(''' + @bug_taskNo + ''' = '''', taskNo, ''' + @bug_taskNo + ''')
                        ,taskName    = IIF(''' + REPLACE(@bug_taskName, '''', '''''') + ''' = '''', taskName, ''' + REPLACE(@bug_taskName, '''', '''''') + ''')
                        ,assigneeId  = @newAssigneeId
                        ,reporterId  = IIF(''' + @bug_reporterId + ''' = '''', reporterId, ''' + @bug_reporterId + ''')
                        ,priorityId  = @newPriorityId
                        ,dueDate     = IIF(''' + @bug_dueDate + ''' = '''', dueDate, ''' + @bug_dueDate + ''')
                        ,categoryId  = @newCategoryId
                        ,environment = IIF(''' + REPLACE(@bug_environment, '''', '''''') + ''' = '''', environment, ''' + REPLACE(@bug_environment, '''', '''''') + ''')
                        ,statusId    = @newStatusId
                        ,updatedAt   = @now
                    WHERE id = ''' + @bug_id + '''

                    -- Insert Attachments (if any)
                    INSERT INTO [' + @DBNAME + '].[dbo].[bug_Attachments]
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
                        ''' + @bug_id + ''',
                        fileName,
                        TRY_CAST(fileSize AS INT),
                        mimeType,
                        filePath
                    FROM OPENJSON(''' + REPLACE(@p, '''', '''''') + ''',''$.attachments'')
                    WITH
                    (
                        id NVARCHAR(50) ''$.id'',
                        bugId NVARCHAR(50) ''$.bugId'',
                        fileName NVARCHAR(200) ''$.fileName'',
                        fileSize NVARCHAR(50) ''$.fileSize'',
                        mimeType NVARCHAR(100) ''$.mimeType'',
                        filePath NVARCHAR(500) ''$.filePath''
                    )
                    WHERE id IS NOT NULL

                    -- Log attachments in history
                    IF EXISTS (SELECT 1 FROM OPENJSON(''' + REPLACE(@p, '''', '''''') + ''',''$.attachments''))
                    BEGIN
                        INSERT INTO [' + @DBNAME + '].[dbo].[bug_BugHistory] ([id], bugId, userId, field, newValue, remark)
                        VALUES (''bh'' + CAST(NEWID() AS NVARCHAR(36)), ''' + @bug_id + ''', ''' + @appuserid + ''', ''attachments'', ''File(s) added'', ''Updated via bugupdate'')
                    END

                    SET @effectiveTitle = ISNULL(@newTitle, @oldTitle)

                    -- Notify if Assignee Changed
                    IF @newAssigneeId IS NOT NULL AND @newAssigneeId <> @oldAssigneeId
                    BEGIN
                        INSERT INTO [' + @DBNAME + '].[dbo].[bug_Notifications]
                        (id, userId, title, message, [type], relatedId, createdAt)
                        VALUES (''nt_'' + CAST(NEWID() AS NVARCHAR(36)), @newAssigneeId, ''Bug Reassigned to You'', @effectiveTitle, ''BUG_ASSIGNED'', ''' + @bug_id + ''', @now)
                    END

                    -- Notify current assignee of status change
                    IF @newStatusId IS NOT NULL AND @newStatusId <> @oldStatusId
                    BEGIN
                        SET @targetUser = ISNULL(@newAssigneeId, @oldAssigneeId)
                        SET @notifMsg = ''Status changed to '' + @newStatusId + '' for "'' + @effectiveTitle + ''"''
                        IF @targetUser IS NOT NULL
                        BEGIN
                            INSERT INTO [' + @DBNAME + '].[dbo].[bug_Notifications]
                            (id, userId, title, message, [type], relatedId, createdAt)
                            VALUES (''nt_'' + CAST(NEWID() AS NVARCHAR(36)), @targetUser, ''Bug Status Updated'', @notifMsg, ''STATUS_CHANGED'', ''' + @bug_id + ''', @now)
                        END
                    END

                    SELECT 1 stat,''bug updated'' stat_msg,1000 stat_code,''' + @bug_id + ''' id
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: bugdelete
            ------------------------------------------------
            ELSE IF (@mode = 'bugdelete')
            BEGIN
                SET @SQL = '
                    DELETE FROM [' + @DBNAME + '].[dbo].[bug_Notifications] WHERE relatedId = ''' + @bug_id + ''';
                    DELETE FROM [' + @DBNAME + '].[dbo].[bug_BugHistory] WHERE bugId = ''' + @bug_id + '''; 
                    DELETE FROM [' + @DBNAME + '].[dbo].[bug_Comments] WHERE bugId = ''' + @bug_id + ''';   
                    DELETE FROM [' + @DBNAME + '].[dbo].[bug_Attachments] WHERE bugId = ''' + @bug_id + ''';
                    DELETE FROM [' + @DBNAME + '].[dbo].[bug_Bugs] WHERE id = ''' + @bug_id + ''';
            
                    SELECT 1 stat,''bug deleted'' stat_msg,1000 stat_code,''' + @bug_id + ''' id
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: bugdetail
            ------------------------------------------------
            ELSE IF (@mode = 'bugdetail')
            BEGIN
                SET @SQL = '
                    -- FETCH BUG
                    SELECT *, statusId AS [status], priorityId AS [priority], categoryId AS [category]
                    FROM [' + @DBNAME + '].[dbo].[bug_Bugs]
                    WHERE id = ''' + @bug_id + '''

                    -- FETCH ATTACHMENTS (bug attachments only)
                    SELECT *
                    FROM [' + @DBNAME + '].[dbo].[bug_Attachments]
                    WHERE bugId = ''' + @bug_id + ''' AND commentId IS NULL
                    ORDER BY createdAt DESC

                    -- FETCH COMMENTS
                    SELECT *
                    FROM [' + @DBNAME + '].[dbo].[bug_Comments]
                    WHERE bugId = ''' + @bug_id + '''
                    ORDER BY createdAt DESC

                    -- FETCH HISTORY
                    SELECT *
                    FROM [' + @DBNAME + '].[dbo].[bug_BugHistory]
                    WHERE bugId = ''' + @bug_id + '''
                    ORDER BY createdAt DESC

                    -- FETCH COMMENT ATTACHMENTS
                    SELECT *
                    FROM [' + @DBNAME + '].[dbo].[bug_Attachments]
                    WHERE bugId = ''' + @bug_id + ''' AND commentId IS NOT NULL
                    ORDER BY createdAt DESC
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: commentadd
            ------------------------------------------------
            ELSE IF (@mode = 'commentadd')
            BEGIN
                SET @SQL = '
                    DECLARE @comment_id NVARCHAR(50) = ''c'' + CONVERT(NVARCHAR(50), CAST(DATEDIFF(SECOND, ''1970-01-01'', GETUTCDATE()) AS BIGINT)) + SUBSTRING(CONVERT(NVARCHAR(50), NEWID()), 1, 7)
                    DECLARE @now DATETIME = GETDATE()

                    INSERT INTO [' + @DBNAME + '].[dbo].[bug_Comments]
                    (
                        id,bugId,userId,content,createdAt
                    )
                    VALUES
                    (
                        @comment_id,
                        ''' + @comment_bugId + ''',
                        ''' + @comment_userId + ''',
                        ''' + REPLACE(@comment_content, '''', '''''') + ''',
                        @now
                    )

                    SELECT 1 stat,''comment added'' stat_msg,1000 stat_code,@comment_id id
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: commentget
            ------------------------------------------------
            ELSE IF (@mode = 'commentget')
            BEGIN
                SET @SQL = '
                    SELECT *
                    FROM [' + @DBNAME + '].[dbo].[bug_Comments]
                    WHERE bugId = ''' + @comment_bugId + '''
                    ORDER BY createdAt DESC
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: notificationget
            ------------------------------------------------
            ELSE IF (@mode = 'notificationget')
            BEGIN
                SET @SQL = '
                    SELECT *
                    FROM [' + @DBNAME + '].[dbo].[bug_Notifications]
                    WHERE userId = ''' + @notif_userId + '''
                    ORDER BY isRead ASC, createdAt DESC
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: notificationmarkread
            ------------------------------------------------
            ELSE IF (@mode = 'notificationmarkread')
            BEGIN
                SET @SQL = '
                    UPDATE [' + @DBNAME + '].[dbo].[bug_Notifications]
                    SET isRead = 1
                    WHERE id = ''' + @notif_id + '''

                    SELECT 1 stat,''notification marked read'' stat_msg,1000 stat_code,''' + @notif_id + ''' id
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: notificationcreate
            ------------------------------------------------
            ELSE IF (@mode = 'notificationcreate')
            BEGIN
                SET @SQL = '
                    DECLARE @notif_id NVARCHAR(50) = ''nt_'' + CAST(NEWID() AS NVARCHAR(36))
                    DECLARE @now DATETIME = GETDATE()

                    INSERT INTO [' + @DBNAME + '].[dbo].[bug_Notifications]
                    (
                        id,userId,title,message,[type],relatedId,createdAt
                    )
                    VALUES
                    (
                        @notif_id,
                        ''' + @notif_userId + ''',
                        ''' + REPLACE(@notif_title, '''', '''''') + ''',
                        ''' + REPLACE(@notif_message, '''', '''''') + ''',
                        ''' + @notif_type + ''',
                        ''' + @notif_relatedId + ''',
                        @now
                    )

                    SELECT 1 stat,''notification created'' stat_msg,1000 stat_code,@notif_id id
                '
                EXEC (@SQL)
            END

            ------------------------------------------------
            -- MODE: dashboard
            ------------------------------------------------
            ELSE IF (@mode = 'dashboard')
            BEGIN
                SET @SQL = '
                    -- Total bugs count
                    SELECT COUNT(1) AS totalBugs
                    FROM [' + @DBNAME + '].[dbo].[bug_Bugs] WITH (NOLOCK);

                    -- Bugs by status
                    SELECT 
					statusId,
					COUNT(1) AS count
					FROM [' + @DBNAME + '].[dbo].[bug_Bugs] WITH (NOLOCK)
					GROUP BY statusId;

                    -- Weekly trend (last 7 days)
                     SELECT 
					 CAST(createdAt AS DATE) AS date,
					 DATEPART(WEEKDAY, createdAt) AS dayIndex,
                     COUNT(1) AS bugs
					 FROM [' + @DBNAME + '].[dbo].[bug_Bugs] WITH (NOLOCK)
					 WHERE createdAt >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE))
					 GROUP BY CAST(createdAt AS DATE), DATEPART(WEEKDAY, createdAt)
					 ORDER BY date ASC;

                    -- Recent activity (last 10 history entries)
                    SELECT TOP (10)
                        bh.id,
                        bh.bugId,
                        bh.userId,
                        bh.field,
                        bh.oldValue,
                        bh.newValue,
                        bh.remark,
                        bh.createdAt
                    FROM [' + @DBNAME + '].[dbo].[bug_BugHistory] bh WITH (NOLOCK)
                    ORDER BY bh.createdAt DESC
                '
                EXEC (@SQL)
            END


    EXECUTE [GetTxLog] @spname, @FromDate, @DBNAME, @appuserid, @IPAddress, @FormName, 'bugv1', @mode

END TRY
BEGIN CATCH
    SELECT 0 stat,'"Contact your Admin"' stat_msg,1001 stat_code
    EXECUTE [GetErrlog] @appuserid, @FromDate, @DBNAME, @spname, @IPAddress, @FormName, 'bugv1', @mode
END CATCH

END
