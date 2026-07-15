USE [404146_CentralUser]
GO
/****** Object:  StoredProcedure [dbo].[bugv1]    Script Date: 14-07-2026 18:17:59 ******/
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
        DECLARE @FromDateText AS NVARCHAR(23)=CONVERT(NVARCHAR(23), @FromDate, 121)
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
            @DBNAME as NVARCHAR(50)=''
            , @id NVARCHAR(50)= ''
            , @mode NVARCHAR(100)= ''		
            , @y NVARCHAR(100)= ''
            , @appuserid NVARCHAR(100)= '' 
            , @IPAddress NVARCHAR(50)= '' 
            , @FormName NVARCHAR(200)= ''
            , @Authorization NVARCHAR(100)= ''
            , @domain NVARCHAR(50)= ''
            , @version as NVARCHAR(10)= ''
            , @ForEvt nvarchar(200)=''

            SET @con=[dbo].Base64Decode(@con)

            IF(isnull(@con,'')<>'')
            BEGIN
                    DECLARE @conTbl TABLE
                    (			
                    [id] NVARCHAR(50)
                    , [mode] NVARCHAR(100)		
                    , [y] NVARCHAR(100)
                    , [appuserid] NVARCHAR(100)
                    , [IPAddress] NVARCHAR(50)
                    , [FormName] NVARCHAR(200)
                    , [Authorization] NVARCHAR(100)
                    , [domain] NVARCHAR(50)
                    , [version] NVARCHAR(10)
                    )

                    BEGIN TRY
                        BEGIN
                            INSERT INTO @conTbl
                                (
                                [id]
                                , [mode]
                                , [y]
                                , [appuserid]
                                , [IPAddress]
                                , [FormName]
                                , [Authorization]
                                , [domain]
                                , [version]
                                )				
                            SELECT
                                ISNULL([id],0) as [id]
                                , ISNULL([mode],'') as [mode]
                                , ISNULL([y],'') as [y]
                                , ISNULL([appuserid],'') as [appuserid]
                                , ISNULL([IPAddress],'') as [IPAddress]
                                , ISNULL([FormName],'') as [FormName]
                                , ISNULL([Authorization],'') as [Authorization]
                                , ISNULL([domain],'') as [domain]
                                , ISNULL([version],'') as [version]
                            FROM OPENJSON(isnull(@con,''))
                            WITH 
                            (
                                [id] NVARCHAR(50) '$.id'
                                , [mode] NVARCHAR(100) '$.mode'		
                                , [y] NVARCHAR(100) '$.y'
                                , [appuserid] NVARCHAR(100) '$.appuserid'
                                , [IPAddress] NVARCHAR(50) '$.IPAddress'
                                , [FormName] NVARCHAR(200) '$.FormName'
                                , [Authorization] NVARCHAR(100) '$.Authorization'
                                , [domain] NVARCHAR(50) '$.domain'
                                , [version] NVARCHAR(10) '$.version'
                            ) AS a


                            SELECT TOP 1 
                                @id =ISNULL([id],0)
                                ,@mode =ISNULL([mode],'')
                                ,@y =ISNULL([y],'')
                                ,@appuserid =ISNULL([appuserid],'')
                                ,@IPAddress =ISNULL([IPAddress],'')
                                ,@FormName =ISNULL([FormName],'')
                                ,@Authorization =ISNULL([Authorization],'')
                                ,@domain =ISNULL([domain],'')
                                ,@version =ISNULL([version],'')
                            FROM @conTbl
                        END
                    END TRY
                    BEGIN CATCH	
                        PRINT '-------------catch'
                    END CATCH;
            END

            -- DB resolve
            SET @DBNAME = ISNULL([dbo].[GetdbName](@y), '')

            ----------------------------------------------------------------------------------------------------------------

            DECLARE
                    @SQL NVARCHAR(MAX) = ''
					, @bug_id INT = NULL
					, @bug_taskId INT = NULL
					, @bug_statusId INT = NULL
					, @bug_title NVARCHAR(200) = ''
					, @bug_description NVARCHAR(MAX) = ''
					, @bug_taskNo NVARCHAR(50) = ''
					, @bug_taskName NVARCHAR(200) = ''
					, @bug_assigneeId INT = NULL
					, @bug_reporterId INT = NULL
					, @bug_priorityId INT = NULL
					, @bug_dueDate NVARCHAR(50) = ''
					, @bug_categoryId INT = NULL
					, @bug_environment NVARCHAR(200) = ''
					, @bug_remark NVARCHAR(MAX) = ''
					, @comment_bugId INT = NULL
					, @comment_userId NVARCHAR(100) = ''
					, @comment_content NVARCHAR(MAX) = ''
					, @comment_id INT = NULL
					, @notif_userId NVARCHAR(100) = ''
					, @notif_id INT = NULL
					, @notif_title NVARCHAR(200) = ''
					, @notif_message NVARCHAR(MAX) = ''
					, @notif_type NVARCHAR(50) = ''
					, @notif_relatedId INT = NULL
					, @input_status NVARCHAR(50) = ''
					, @input_statusId INT = NULL
					, @input_priority NVARCHAR(50) = ''
					, @input_priorityId INT = NULL
					, @input_category NVARCHAR(50) = ''
					, @input_categoryId INT = NULL
					, @bug_filterType NVARCHAR(50) = ''
					, @bug_filterBy NVARCHAR(50) = ''
					, @bug_userId INT = NULL

            BEGIN TRY

                ------------------------------------------------	
                -- PARAM PARSE
                ------------------------------------------------
                IF (ISNULL(@p, '') <> '')
                BEGIN
                    SELECT
                        @bug_id           = ISNULL(id, NULL)
						,@bug_taskId      = ISNULL(taskId, NULL)
						,@input_status    = ISNULL(status, '')
						,@input_statusId  = ISNULL(statusId, NULL)
						,@bug_title       = ISNULL(title, '')
						,@bug_description = ISNULL(description, '')
						,@bug_taskNo      = ISNULL(taskNo, '')
						,@bug_taskName    = ISNULL(taskName, '')
						,@bug_assigneeId  = ISNULL(assigneeId, NULL)
						,@bug_reporterId  = ISNULL(reporterId, NULL)
						,@input_priority  = ISNULL(priority, '')
						,@input_priorityId = ISNULL(priorityId, NULL)
						,@bug_dueDate     = ISNULL(dueDate, '')
						,@input_category  = ISNULL(category, '')
						,@input_categoryId = ISNULL(categoryId, NULL)
						,@bug_environment = ISNULL(environment, '')
						,@bug_remark      = ISNULL(remark, '')
						,@comment_bugId   = ISNULL(bugId, NULL)
						,@comment_userId  = ISNULL(userId, NULL)
						,@comment_content = ISNULL(content, '')
						,@comment_id      = ISNULL(commentId, NULL)
						,@notif_userId    = ISNULL(userId, NULL)
						,@notif_id        = ISNULL(id, NULL)
						,@notif_title     = ISNULL(title, '')
						,@notif_message   = ISNULL(message, '')
						,@notif_type      = ISNULL([type], '')
						,@notif_relatedId = ISNULL(relatedId, NULL)
						,@bug_filterType  = ISNULL(filterType, '')
						,@bug_filterBy    = ISNULL(filterBy, '')
						,@bug_userId      = TRY_CAST(ISNULL(userId, NULL) AS INT)
                    FROM OPENJSON(@p)
                    WITH
                    (
                         id INT '$.id'                          
						,taskId INT '$.taskId'                   
						,status NVARCHAR(50) '$.status'
						,statusId INT '$.statusId'              
						,title NVARCHAR(200) '$.title'
						,description NVARCHAR(MAX) '$.description'
						,taskNo NVARCHAR(50) '$.taskNo'
						,taskName NVARCHAR(200) '$.taskName'
						,assigneeId INT '$.assigneeId'     
						,reporterId INT '$.reporterId'          
						,priority NVARCHAR(50) '$.priority'
						,priorityId INT '$.priorityId'          
						,dueDate NVARCHAR(50) '$.dueDate'
						,category NVARCHAR(50) '$.category'
						,categoryId INT '$.categoryId'           
						,environment NVARCHAR(200) '$.environment'
						,remark NVARCHAR(MAX) '$.remark'
						,bugId INT '$.bugId'             
						,userId NVARCHAR(100) '$.userId'              
						,content NVARCHAR(MAX) '$.content'
						,commentId INT '$.commentId'    
						,message NVARCHAR(MAX) '$.message'
						,[type] NVARCHAR(50) '$.type'
						,relatedId INT '$.relatedId'         
						,filterType NVARCHAR(50) '$.filterType'
						,filterBy NVARCHAR(50) '$.filterBy'
                    )

                    SET @bug_statusId   = COALESCE(@input_statusId, NULL)
					SET @bug_priorityId = COALESCE(@input_priorityId, NULL)
					SET @bug_categoryId = COALESCE(@input_categoryId, NULL)
                END

                ------------------------------------------------
                -- MODE: buglist
                ------------------------------------------------
                IF (@mode = 'buglist')
                BEGIN
                    DECLARE @appUserIdInt INT = COALESCE(@bug_userId, TRY_CAST(@appuserid AS INT))

                    IF (@bug_filterType = 'me')
                    BEGIN
                        IF (@bug_assigneeId IS NULL)
                            SET @bug_assigneeId = @appUserIdInt
                        IF (@bug_reporterId IS NULL)
                            SET @bug_reporterId = @appUserIdInt
                    END
                    ELSE IF (@bug_filterType = 'team')
                    BEGIN
                        SET @bug_assigneeId = NULL
                        SET @bug_reporterId = NULL
                    END

                    -- Build WHERE predicate (inlined values — safe, all INT inputs)
                    DECLARE @Whereclause as nvarchar(max)=' WHERE 1=1'

                    IF (@bug_taskId IS NOT NULL)
                        SET @Whereclause = @Whereclause + ' AND b.taskId = ' + CAST(@bug_taskId AS NVARCHAR(20))

                    IF (@bug_statusId IS NOT NULL)
                        SET @Whereclause = @Whereclause + ' AND b.statusId = ' + CAST(@bug_statusId AS NVARCHAR(20))

                    IF (@bug_assigneeId IS NOT NULL AND @bug_reporterId IS NOT NULL)
                        SET @Whereclause = @Whereclause + ' AND (b.assigneeId = ' + CAST(@bug_assigneeId AS NVARCHAR(20)) + ' OR b.reporterId = ' + CAST(@bug_reporterId AS NVARCHAR(20)) + ')'
                    ELSE IF (@bug_assigneeId IS NOT NULL)
                        SET @Whereclause = @Whereclause + ' AND b.assigneeId = ' + CAST(@bug_assigneeId AS NVARCHAR(20))
                    ELSE IF (@bug_reporterId IS NOT NULL)
                        SET @Whereclause = @Whereclause + ' AND b.reporterId = ' + CAST(@bug_reporterId AS NVARCHAR(20))

                    -- Key optimization: filter bugs FIRST in CTE, then only aggregate
                    -- counts for matching bug IDs — avoids full scans of comment/attch tables
                    SET @SQL = '
                        ;WITH filtered AS (
                            SELECT
                                b.id, b.bugNo, b.title, b.taskId, b.taskNo, b.taskName,
                                b.assigneeId, b.reporterId, b.priorityId, b.dueDate,
                                b.categoryId, b.environment, b.statusId,
                                b.entrydate, b.updateddate
                            FROM [' + @DBNAME + '].[dbo].[bug_Bugs] b WITH (NOLOCK)
                            ' + @Whereclause + '
                        )
                        SELECT
                            f.id, f.bugNo, f.title, f.taskId, f.taskNo, f.taskName,
                            f.assigneeId, f.reporterId, f.priorityId, f.dueDate,
                            f.categoryId, f.environment, f.statusId,
                            f.entrydate, f.updateddate,
                            f.statusId   AS [status],
                            f.priorityId AS [priority],
                            f.categoryId AS [category],
                            ISNULL(cc.cnt, 0) AS commentCount,
                            ISNULL(ac.cnt, 0) AS attachmentCount
                        FROM filtered f
                        LEFT JOIN (
                            SELECT bugid, COUNT(1) AS cnt
                            FROM [' + @DBNAME + '].[dbo].[bug_comment] WITH (NOLOCK)
                            WHERE bugid IN (SELECT id FROM filtered)
                            GROUP BY bugid
                        ) cc ON cc.bugid = f.id
                        LEFT JOIN (
                            SELECT bugid, COUNT(1) AS cnt
                            FROM [' + @DBNAME + '].[dbo].[bug_attch] WITH (NOLOCK)
                            WHERE commentid IS NULL
                            AND bugid IN (SELECT id FROM filtered)
                            GROUP BY bugid
                        ) ac ON ac.bugid = f.id
                        ORDER BY f.entrydate DESC
                        OPTION (RECOMPILE)
                    '

                    PRINT(@SQL)
                    EXEC (@SQL)
                END

                ------------------------------------------------
                -- MODE: bugsave (INSERT)
                ------------------------------------------------
                ELSE IF (@mode = 'bugsave')
                BEGIN
                    SET @SQL = '
                        DECLARE @bug_id  NVARCHAR(50)
                        DECLARE @bug_no  NVARCHAR(20)
                        DECLARE @next_num BIGINT
                        DECLARE @now      DATETIME = ''' + @FromDateText + '''

                        BEGIN TRY
                            SET TRANSACTION ISOLATION LEVEL READ COMMITTED
                            BEGIN TRANSACTION

                            INSERT INTO [' + @DBNAME + '].[dbo].[bug_bugs]
                            (
                                bugNo,
                                title, description,
                                taskId, taskNo, taskName,
                                assigneeId, reporterId,
                                priorityId, dueDate,
                                categoryId, environment,
                                statusId, entrydate, updateddate
                            )
                            VALUES
                            (
                                '''',
                                ''' + REPLACE(@bug_title,       '''', '''''') + ''',
                                ''' + REPLACE(@bug_description, '''', '''''') + ''',
                                ' + ISNULL(CAST(@bug_taskId     AS NVARCHAR(20)), 'NULL') + ',
                                ''' + @bug_taskNo + ''',
                                ''' + REPLACE(@bug_taskName,    '''', '''''') + ''',
                                ' + ISNULL(CAST(@bug_assigneeId AS NVARCHAR(20)), 'NULL') + ',
                                ' + ISNULL(CAST(@bug_reporterId AS NVARCHAR(20)), 'NULL') + ',
                                ' + ISNULL(CAST(@bug_priorityId AS NVARCHAR(20)), 'NULL') + ',
                                ''' + @bug_dueDate + ''',
                                ' + ISNULL(CAST(@bug_categoryId AS NVARCHAR(20)), 'NULL') + ',
                                ''' + REPLACE(@bug_environment, '''', '''''') + ''',
                                ' + ISNULL(CAST(@bug_statusId   AS NVARCHAR(20)), 'NULL') + ',
                                @now, @now
                            )

                            SET @next_num = SCOPE_IDENTITY()
                            IF (@next_num IS NOT NULL)
                            BEGIN
                                SET @bug_id = CAST(@next_num AS NVARCHAR(50))
                                SET @bug_no = ''BT'' + CAST(@next_num AS NVARCHAR(20))

                                UPDATE [' + @DBNAME + '].[dbo].[bug_bugs]
                                SET bugNo = @bug_no
                                WHERE id = @next_num
                            END

                            INSERT INTO [' + @DBNAME + '].[dbo].[bug_attch]
                            (
                                bugid,
                                filepath,
                                entrydate
                            )
                            SELECT
                                @bug_id,
                                filePath,
                                @now
                            FROM OPENJSON(''' + REPLACE(@p, '''', '''''') + ''', ''$.attachments'')
                            WITH
                            (
                                filePath NVARCHAR(500) ''$.filePath''
                            )
                            WHERE filePath IS NOT NULL

                            COMMIT TRANSACTION

                            SELECT 1 stat, ''bug created'' stat_msg, 1000 stat_code, @bug_id AS id, @bug_no AS bugNo

                        END TRY
                        BEGIN CATCH
                            IF (@@TRANCOUNT <> 0)
                            BEGIN
                                ROLLBACK TRANSACTION
                            END;
                            THROW;
                        END CATCH
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END

                ------------------------------------------------
                -- MODE: bugupdate
                ------------------------------------------------
                ELSE IF (@mode = 'bugupdate')
                BEGIN
                    SET @SQL = '
                        DECLARE @now DATETIME = isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
                        DECLARE @oldStatusId NVARCHAR(50), @oldPriorityId NVARCHAR(50), @oldCategoryId NVARCHAR(50)
                        DECLARE @oldAssigneeId NVARCHAR(50), @oldTitle NVARCHAR(200), @oldDescription NVARCHAR(MAX)
                        DECLARE @newStatusId NVARCHAR(50), @newPriorityId NVARCHAR(50), @newCategoryId NVARCHAR(50)
                        DECLARE @newAssigneeId NVARCHAR(50), @newTitle NVARCHAR(200), @newDescription NVARCHAR(MAX)
                        DECLARE @targetUser NVARCHAR(50), @notifMsg NVARCHAR(MAX), @effectiveTitle NVARCHAR(200)
                        DECLARE @statusHistoryRemark NVARCHAR(MAX), @priorityHistoryRemark NVARCHAR(MAX), @assigneeHistoryRemark NVARCHAR(MAX), @categoryHistoryRemark NVARCHAR(MAX), @titleHistoryRemark NVARCHAR(MAX)

                        BEGIN TRY
                            SET TRANSACTION ISOLATION LEVEL READ COMMITTED
                            BEGIN TRANSACTION

                            -- Get old values
                            SELECT 
                                @oldStatusId = [statusId],
                                @oldPriorityId = [priorityId],
                                @oldAssigneeId = assigneeId,
                                @oldTitle = title,
                                @oldDescription = [description],
                                @oldCategoryId = categoryId
                            FROM [' + @DBNAME + '].[dbo].[bug_bugs]
                            WHERE id = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + '

                            -- Set new values
                            SET @newStatusId = ISNULL(' + ISNULL(CAST(@bug_statusId AS NVARCHAR(20)), 'NULL') + ', @oldStatusId)
                            SET @newPriorityId = ISNULL(' + ISNULL(CAST(@bug_priorityId AS NVARCHAR(20)), 'NULL') + ', @oldPriorityId)
                            SET @newAssigneeId = ISNULL(' + ISNULL(CAST(@bug_assigneeId AS NVARCHAR(20)), 'NULL') + ', @oldAssigneeId)
                            SET @newTitle = IIF(''' + REPLACE(@bug_title, '''', '''''') + ''' = '''', @oldTitle, ''' + REPLACE(@bug_title, '''', '''''') + ''')
                            SET @newDescription = IIF(''' + REPLACE(@bug_description, '''', '''''') + ''' = '''', @oldDescription, ''' + REPLACE(@bug_description, '''', '''''') + ''')
                            SET @newCategoryId = ISNULL(' + ISNULL(CAST(@bug_categoryId AS NVARCHAR(20)), 'NULL') + ', @oldCategoryId)

                            -- Track History for Status
                            IF @newStatusId IS NOT NULL AND @newStatusId <> @oldStatusId
                            BEGIN
                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_history] (bugid, userid, field, oldvalue, newvalue, remark, ipaddress, entrydate)
                                VALUES (' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', ''' + REPLACE(@appuserid, '''', '''''') + ''', ''statusId'', CAST(@oldStatusId AS NVARCHAR(MAX)), CAST(@newStatusId AS NVARCHAR(MAX)), ''' + REPLACE(@bug_remark, '''', '''''') + ''', ''' + REPLACE(@IPAddress, '''', '''''') + ''', @now)
                            END

                            -- Track History for Priority
                            IF @newPriorityId IS NOT NULL AND @newPriorityId <> @oldPriorityId
                            BEGIN
                                SET @priorityHistoryRemark = ''priorityId changed from '' + ISNULL(CAST(@oldPriorityId AS NVARCHAR(MAX)), ''N/A'') + '' to '' + ISNULL(CAST(@newPriorityId AS NVARCHAR(MAX)), ''N/A'')
                                IF (''' + REPLACE(@bug_remark, '''', '''''') + ''' <> '''') SET @priorityHistoryRemark = @priorityHistoryRemark + '' | '' + ''' + REPLACE(@bug_remark, '''', '''''') + '''
                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_history] (bugid, userid, field, oldvalue, newvalue, remark, ipaddress, entrydate)
                                VALUES (' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', ''' + REPLACE(@appuserid, '''', '''''') + ''', ''priorityId'', CAST(@oldPriorityId AS NVARCHAR(MAX)), CAST(@newPriorityId AS NVARCHAR(MAX)), @priorityHistoryRemark, ''' + REPLACE(@IPAddress, '''', '''''') + ''', @now)
                            END

                            -- Track History for Assignee
                            IF @newAssigneeId IS NOT NULL AND @newAssigneeId <> @oldAssigneeId
                            BEGIN
                                SET @assigneeHistoryRemark = ''assigneeId changed from '' + ISNULL(CAST(@oldAssigneeId AS NVARCHAR(MAX)), ''N/A'') + '' to '' + ISNULL(CAST(@newAssigneeId AS NVARCHAR(MAX)), ''N/A'')
                                IF (''' + REPLACE(@bug_remark, '''', '''''') + ''' <> '''') SET @assigneeHistoryRemark = @assigneeHistoryRemark + '' | '' + ''' + REPLACE(@bug_remark, '''', '''''') + '''
                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_history] (bugid, userid, field, oldvalue, newvalue, remark, ipaddress, entrydate)
                                VALUES (' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', ''' + REPLACE(@appuserid, '''', '''''') + ''', ''assigneeId'', CAST(@oldAssigneeId AS NVARCHAR(MAX)), CAST(@newAssigneeId AS NVARCHAR(MAX)), @assigneeHistoryRemark, ''' + REPLACE(@IPAddress, '''', '''''') + ''', @now)
                            END

                            -- Track History for Category
                            IF @newCategoryId IS NOT NULL AND @newCategoryId <> @oldCategoryId
                            BEGIN
                                SET @categoryHistoryRemark = ''categoryId changed from '' + ISNULL(CAST(@oldCategoryId AS NVARCHAR(MAX)), ''N/A'') + '' to '' + ISNULL(CAST(@newCategoryId AS NVARCHAR(MAX)), ''N/A'')
                                IF (''' + REPLACE(@bug_remark, '''', '''''') + ''' <> '''') SET @categoryHistoryRemark = @categoryHistoryRemark + '' | '' + ''' + REPLACE(@bug_remark, '''', '''''') + '''
                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_history] (bugid, userid, field, oldvalue, newvalue, remark, ipaddress, entrydate)
                                VALUES (' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', ''' + REPLACE(@appuserid, '''', '''''') + ''', ''categoryId'', CAST(@oldCategoryId AS NVARCHAR(MAX)), CAST(@newCategoryId AS NVARCHAR(MAX)), @categoryHistoryRemark, ''' + REPLACE(@IPAddress, '''', '''''') + ''', @now)
                            END

                            -- Track History for Title
                            IF @newTitle IS NOT NULL AND @newTitle <> @oldTitle
                            BEGIN
                                SET @titleHistoryRemark = ''title changed from '' + ISNULL(CAST(@oldTitle AS NVARCHAR(MAX)), ''N/A'') + '' to '' + ISNULL(CAST(@newTitle AS NVARCHAR(MAX)), ''N/A'')
                                IF (''' + REPLACE(@bug_remark, '''', '''''') + ''' <> '''') SET @titleHistoryRemark = @titleHistoryRemark + '' | '' + ''' + REPLACE(@bug_remark, '''', '''''') + '''
                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_history] (bugid, userid, field, oldvalue, newvalue, remark, ipaddress, entrydate)
                                VALUES (' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', ''' + REPLACE(@appuserid, '''', '''''') + ''', ''title'', @oldTitle, @newTitle, @titleHistoryRemark, ''' + REPLACE(@IPAddress, '''', '''''') + ''', @now)
                            END

                            -- Update Bug
                            UPDATE [' + @DBNAME + '].[dbo].[bug_Bugs]
                            SET
                                title       = @newTitle
                                ,description = @newDescription
                                ,taskId      = ISNULL(' + ISNULL(CAST(@bug_taskId AS NVARCHAR(20)), 'NULL') + ', taskId)
                                ,taskNo      = IIF(''' + @bug_taskNo + ''' = '''', taskNo, ''' + @bug_taskNo + ''')
                                ,taskName    = IIF(''' + REPLACE(@bug_taskName, '''', '''''') + ''' = '''', taskName, ''' + REPLACE(@bug_taskName, '''', '''''') + ''')
                                ,assigneeId  = @newAssigneeId
                                ,reporterId  = ISNULL(' + ISNULL(CAST(@bug_reporterId AS NVARCHAR(20)), 'NULL') + ', reporterId)
                                ,priorityId  = @newPriorityId
                                ,dueDate     = IIF(''' + @bug_dueDate + ''' = '''', dueDate, ''' + @bug_dueDate + ''')
                                ,categoryId  = @newCategoryId
                                ,environment = IIF(''' + REPLACE(@bug_environment, '''', '''''') + ''' = '''', environment, ''' + REPLACE(@bug_environment, '''', '''''') + ''')
                                ,statusId    = @newStatusId
                                ,updateddate   = @now
                            WHERE id = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + '

                            IF JSON_QUERY(''' + REPLACE(@p, '''', '''''') + ''', ''$.attachments'') IS NOT NULL
                            BEGIN
                                -- Delete all existing bug-level attachments, then reinsert current payload list
                                DELETE FROM [' + @DBNAME + '].[dbo].[bug_attch]
                                WHERE bugid = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + '
                                AND commentid IS NULL

                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_attch]
                                (
                                    bugid,
                                    filepath,
                                    entrydate
                                )
                                SELECT
                                    ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ',
                                    COALESCE(filePathCamel, filePathLower),
                                    @now
                                FROM OPENJSON(''' + REPLACE(@p, '''', '''''') + ''',''$.attachments'')
                                WITH
                                (
                                    filePathCamel NVARCHAR(500) ''$.filePath'',
                                    filePathLower NVARCHAR(500) ''$.filepath''
                                )
                                WHERE COALESCE(filePathCamel, filePathLower) IS NOT NULL
                            END

                            -- Log attachments in history
                            IF EXISTS (SELECT 1 FROM OPENJSON(''' + REPLACE(@p, '''', '''''') + ''',''$.attachments''))
                            BEGIN
                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_history] (bugid, userid, field, oldvalue, newvalue, remark, ipaddress, entrydate)
                                VALUES (' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', ''' + REPLACE(@appuserid, '''', '''''') + ''', ''attachments'', ''none'', ''added'', ''attachments updated | Updated via bugupdate'', ''' + REPLACE(@IPAddress, '''', '''''') + ''', @now)
                            END

                            SET @effectiveTitle = ISNULL(@newTitle, @oldTitle)

                            -- Notify if Assignee Changed
                            IF @newAssigneeId IS NOT NULL AND @newAssigneeId <> @oldAssigneeId
                            BEGIN
                                INSERT INTO [' + @DBNAME + '].[dbo].[bug_notify]
                                (userId, title, message, [type], relatedId, entrydate)
                                VALUES (@newAssigneeId, ''Bug Reassigned to You'', @effectiveTitle, ''BUG_ASSIGNED'', ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', @now)
                            END

                            -- Notify current assignee of status change
                            IF @newStatusId IS NOT NULL AND @newStatusId <> @oldStatusId
                            BEGIN
                                SET @targetUser = ISNULL(@newAssigneeId, @oldAssigneeId)
                                DECLARE @newStatusLabel NVARCHAR(100)
                                SET @notifMsg = ''Status changed to '' + @newStatusId + '' for "'' + @effectiveTitle + ''"''
                                IF @targetUser IS NOT NULL
                                BEGIN
                                    INSERT INTO [' + @DBNAME + '].[dbo].[bug_notify]
                                    (userId, title, message, [type], relatedId, entrydate)
                                    VALUES (@targetUser, ''Bug Status Updated'', @notifMsg, ''STATUS_CHANGED'', ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ', @now)
                                END
                            END

                            COMMIT TRANSACTION

                            SELECT 1 stat, ''bug updated'' stat_msg, 1000 stat_code, ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ' id

                        END TRY
                        BEGIN CATCH
                            IF (@@TRANCOUNT <> 0)
                            BEGIN
                                ROLLBACK TRANSACTION
                            END;
                            THROW;
                        END CATCH
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END
                ------------------------------------------------
                -- MODE: bugdelete
                ------------------------------------------------
                ELSE IF (@mode = 'bugdelete')
                BEGIN
                    SET @SQL = '
                        DELETE FROM [' + @DBNAME + '].[dbo].[bug_notify]  WHERE relatedid = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ';
                        DELETE FROM [' + @DBNAME + '].[dbo].[bug_history] WHERE bugid     = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ';
                        DELETE FROM [' + @DBNAME + '].[dbo].[bug_comment] WHERE bugid     = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ';
                        DELETE FROM [' + @DBNAME + '].[dbo].[bug_attch]   WHERE bugid     = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ';
                        DELETE FROM [' + @DBNAME + '].[dbo].[bug_bugs]    WHERE id        = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ';

                        SELECT 1 stat, ''bug deleted'' stat_msg, 1000 stat_code, ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ' id
                    '
                    PRINT(@SQL)
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
                        FROM [' + @DBNAME + '].[dbo].[bug_bugs]
                        WHERE id = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + '

                        -- FETCH ATTACHMENTS (bug attachments only)
                        SELECT *
                        FROM [' + @DBNAME + '].[dbo].[bug_attch]
                        WHERE bugid = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ' AND commentid IS NULL
                        ORDER BY entrydate DESC

                        -- FETCH COMMENTS
                        SELECT *
                        FROM [' + @DBNAME + '].[dbo].[bug_comment]
                        WHERE bugid = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + '
                        ORDER BY entrydate DESC

                        -- FETCH HISTORY
                        SELECT *
                        FROM [' + @DBNAME + '].[dbo].[bug_history]
                        WHERE bugid = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + '
                        ORDER BY entrydate DESC

                        -- FETCH COMMENT ATTACHMENTS
                        SELECT *
                        FROM [' + @DBNAME + '].[dbo].[bug_attch]
                        WHERE bugid = ' + ISNULL(CAST(@bug_id AS NVARCHAR(20)), 'NULL') + ' AND commentid IS NOT NULL
                        ORDER BY entrydate DESC
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END
                ------------------------------------------------
                -- MODE: commentadd
                ------------------------------------------------
                ELSE IF (@mode = 'commentadd')
                BEGIN
                    SET @SQL = '
                        DECLARE @comment_id       INT
                        DECLARE @next_comment_num BIGINT
                        DECLARE @now              DATETIME = ''' + @FromDateText + '''

                        BEGIN TRY
                            SET TRANSACTION ISOLATION LEVEL READ COMMITTED
                            BEGIN TRANSACTION

                            INSERT INTO [' + @DBNAME + '].[dbo].[bug_comment]
                            (
                                bugid, userid, content, entrydate
                            )
                            VALUES
                            (
                                ' + ISNULL(CAST(@comment_bugId  AS NVARCHAR(20)), 'NULL') + ',
                                ' + CASE WHEN NULLIF(@comment_userId, '') IS NULL THEN 'NULL' ELSE '''' + REPLACE(@comment_userId, '''', '''''') + '''' END + ',
                                ''' + REPLACE(@comment_content, '''', '''''') + ''',
                                @now
                            )

                            SET @next_comment_num = SCOPE_IDENTITY()
                            IF (@next_comment_num IS NOT NULL)
                            BEGIN
                                SET @comment_id = CAST(@next_comment_num AS INT)
                            END

                            INSERT INTO [' + @DBNAME + '].[dbo].[bug_attch]
                            (
                                bugid, commentid, filepath, entrydate
                            )
                            SELECT
                                ' + ISNULL(CAST(@comment_bugId AS NVARCHAR(20)), 'NULL') + ',
                                @comment_id,
                                filePath,
                                @now
                            FROM OPENJSON(''' + REPLACE(@p, '''', '''''') + ''',''$.attachments'')
                            WITH
                            (
                                filePath NVARCHAR(500) ''$.filePath''
                            )
                            WHERE filePath IS NOT NULL

                            COMMIT TRANSACTION

                            SELECT 1 stat, ''comment added'' stat_msg, 1000 stat_code, @comment_id id

                        END TRY
                        BEGIN CATCH
                            IF (@@TRANCOUNT <> 0)
                            BEGIN
                                ROLLBACK TRANSACTION
                            END;
                            THROW;
                        END CATCH
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END

                ------------------------------------------------
                -- MODE: commentget
                ------------------------------------------------
                ELSE IF (@mode = 'commentget')
                BEGIN
                    SET @SQL = '
                        SELECT *
                        FROM [' + @DBNAME + '].[dbo].[bug_comment]
                        WHERE bugid = ' + ISNULL(CAST(@comment_bugId AS NVARCHAR(20)), 'NULL') + '
                        ORDER BY entrydate DESC
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END

                ------------------------------------------------
                -- MODE: notificationget
                ------------------------------------------------
                ELSE IF (@mode = 'notificationget')
                BEGIN
                    SET @SQL = '
                        SELECT *
                        FROM [' + @DBNAME + '].[dbo].[bug_notify]
                        WHERE userid = ' + CASE WHEN NULLIF(@notif_userId, '') IS NULL THEN 'NULL' ELSE '''' + REPLACE(@notif_userId, '''', '''''') + '''' END + '
                        ORDER BY isread ASC, entrydate DESC
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END

                ------------------------------------------------
                -- MODE: notificationmarkread
                ------------------------------------------------
                ELSE IF (@mode = 'notificationmarkread')
                BEGIN
                    SET @SQL = '
                        UPDATE [' + @DBNAME + '].[dbo].[bug_notify]
                        SET isread = 1
                        WHERE id = ' + ISNULL(CAST(@notif_id AS NVARCHAR(20)), 'NULL') + '

                        SELECT 1 stat,''notification marked read'' stat_msg,1000 stat_code,' + ISNULL(CAST(@notif_id AS NVARCHAR(20)), 'NULL') + ' id
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END

                ------------------------------------------------
                -- MODE: notificationcreate
                ------------------------------------------------
                ELSE IF (@mode = 'notificationcreate')
                BEGIN
                    SET @SQL = '
                        DECLARE @notif_id       INT
                        DECLARE @next_notif_num BIGINT
                        DECLARE @now            DATETIME = ''' + @FromDateText + '''

                        BEGIN TRY
                            SET TRANSACTION ISOLATION LEVEL READ COMMITTED
                            BEGIN TRANSACTION

                            INSERT INTO [' + @DBNAME + '].[dbo].[bug_notify]
                            (
                                userid, title, message, [type], relatedid, entrydate
                            )
                            VALUES
                            (
                                ' + CASE WHEN NULLIF(@notif_userId, '') IS NULL THEN 'NULL' ELSE '''' + REPLACE(@notif_userId, '''', '''''') + '''' END + ',
                                ''' + REPLACE(@notif_title,   '''', '''''') + ''',
                                ''' + REPLACE(@notif_message, '''', '''''') + ''',
                                ''' + @notif_type + ''',
                                ' + ISNULL(CAST(@notif_relatedId AS NVARCHAR(20)), 'NULL') + ',
                                @now
                            )

                            SET @next_notif_num = SCOPE_IDENTITY()
                            IF (@next_notif_num IS NOT NULL)
                            BEGIN
                                SET @notif_id = CAST(@next_notif_num AS INT)
                            END

                            COMMIT TRANSACTION

                            SELECT 1 stat, ''notification created'' stat_msg, 1000 stat_code, @notif_id id

                        END TRY
                        BEGIN CATCH
                            IF (@@TRANCOUNT <> 0)
                            BEGIN
                                ROLLBACK TRANSACTION
                            END;
                            THROW;
                        END CATCH
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END

                ------------------------------------------------
                -- MODE: dashboard
                ------------------------------------------------
                ELSE IF (@mode = 'dashboard')
                BEGIN
                    SET @appUserIdInt = @bug_userId
                    SET @whereClause = ''
                    IF (@bug_filterType = 'me')
                    BEGIN
                        IF (@bug_filterBy = 'reporter')
                            SET @whereClause = ' WHERE reporterId = ' + ISNULL(CAST(@appUserIdInt AS NVARCHAR(20)), 'NULL')
                        ELSE
                            SET @whereClause = ' WHERE assigneeId = ' + ISNULL(CAST(@appUserIdInt AS NVARCHAR(20)), 'NULL')
                    END

                    SET @SQL = '
                        -- Total bugs count
                        SELECT COUNT(1) AS totalBugs
                        FROM [' + @DBNAME + '].[dbo].[bug_bugs] WITH (NOLOCK) ' + @whereClause + ';

                        -- Bugs by status
                        SELECT
                            statusId,
                            COUNT(1) AS count
                        FROM [' + @DBNAME + '].[dbo].[bug_bugs] WITH (NOLOCK) ' + @whereClause + '
                        GROUP BY statusId;

                        -- Weekly trend (last 7 days)
                        SELECT
                            CAST(entrydate AS DATE)      AS date,
                            DATEPART(WEEKDAY, entrydate) AS dayIndex,
                            COUNT(1)                     AS bugs
                        FROM [' + @DBNAME + '].[dbo].[bug_bugs] WITH (NOLOCK)
                        WHERE entrydate >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE)) ' + 
                        IIF(@whereClause = '', '', REPLACE(@whereClause, 'WHERE', 'AND')) + '
                        GROUP BY CAST(entrydate AS DATE), DATEPART(WEEKDAY, entrydate)
                        ORDER BY date ASC;

                        -- Recent activity (last 10 history entries)
                        SELECT TOP (10)
                            bh.id,
                            bh.bugid,
                            bh.userid,
							bh.field,
							bh.oldvalue,
							bh.newvalue,
                            bh.remark,
                            bh.entrydate
                        FROM [' + @DBNAME + '].[dbo].[bug_history] bh WITH (NOLOCK)
                        ORDER BY bh.entrydate DESC;

                        -- Bugs by employee
                        SELECT
                            assigneeId,
                            COUNT(1) AS count
                        FROM [' + @DBNAME + '].[dbo].[bug_bugs] WITH (NOLOCK) ' + @whereClause + '
                        GROUP BY assigneeId;

                        -- All bugs status counts (always team, for Issue Distribution)
                        SELECT
                            statusId,
                            COUNT(1) AS count
                        FROM [' + @DBNAME + '].[dbo].[bug_bugs] WITH (NOLOCK)
                        GROUP BY statusId;
                    '
                    PRINT(@SQL)
                    EXEC (@SQL)
                END


        EXECUTE [GetTxLog] @spname, @FromDate, @DBNAME, @appuserid, @IPAddress, @FormName, 'bugv1', @mode

    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
        BEGIN
            ROLLBACK TRANSACTION
        END
        SELECT 0 stat,'"Contact your Admin"' stat_msg,1001 stat_code
        EXECUTE [GetErrlog] @appuserid, @FromDate, @DBNAME, @spname, @IPAddress, @FormName, 'bugv1', @mode
    END CATCH

    END
