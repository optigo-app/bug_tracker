USE [404146_CentralUser]
GO
/****** Object:  StoredProcedure [dbo].[Reportv6]    Script Date: 11-06-2026 17:46:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,system>
-- Create date: <Create Date :: Dec 20 2011 10:57AM>
-- Description:	<Description :: >
-- =============================================		
ALTER PROCEDURE [dbo].[Reportv6]
	 @con NVARCHAR(MAX)= '' 	
	,@p NVARCHAR(MAX)= ''
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
			--(2, '--@p', replace(cast([dbo].Base64Decode(@p) as NVARCHAR(MAX)),'''',''''''))
			(2, '--@p', replace(cast(@p as NVARCHAR(MAX)),'''',''''''))
			) p(num, name, value)
	) AS A(name, value)		
	--SET @spname=concat('exec [',DB_NAME(),'].[dbo].',@ProcedureName,' ',@spname)	
-------------
	SET @spname=concat('exec [404146_CentralUser].[dbo].',OBJECT_NAME(@@PROCID),' ',@spname)
	DECLARE 
		  @DBNAME as NVARCHAR(50)=''
		, @appuserid NVARCHAR(100)= '' 
		, @IPAddress NVARCHAR(50)= '' 
		, @FormName NVARCHAR(200)= ''
		, @mode NVARCHAR(100)= ''
		, @id NVARCHAR(50)= ''
		, @y NVARCHAR(100)= ''
		, @Authorization NVARCHAR(100)= ''
		, @domain NVARCHAR(50)= ''
		, @version as NVARCHAR(10)= ''
		, @ForEvt nvarchar(200)=''
	

	
	print 'step-1'
	print @con
	select   @id= iif(isnull(element_id,0) = 1,StringValue,@id)	
			,@mode= iif(isnull(element_id,0) = 2,StringValue,@mode)	
			,@y= iif(isnull(element_id,0) = 3,StringValue,@y)	
			,@appuserid= iif(isnull(element_id,0) = 4,StringValue,@appuserid)	
			,@IPAddress= iif(isnull(element_id,0) = 5,StringValue,@IPAddress)
			,@FormName= iif(isnull(element_id,0) = 6,StringValue,@FormName)
			,@Authorization= iif(isnull(element_id,0) = 7,StringValue,@Authorization)
			,@domain= iif(isnull(element_id,0) = 8,StringValue,@domain)	
			,@version= iif(isnull(element_id,0) = 9,StringValue,@version)
	--from [404146_CentralUser].[dbo].[parseJSON](@con)
	from [404146_CentralUser].[dbo].[parseJSON]([dbo].Base64Decode(@con))
	
	print 'step-2'
	



	print ('--mode : ' + @mode)
	print ('--y : ' + @y)
	print ('--@Authorization : '+@Authorization)
	print concat('@appuserid :',@appuserid)
	print concat('@IPAddress :',@IPAddress)
	--SET @p = [dbo].Base64Decode(@p)
	IF(@mode like 'kpidashboard%')
	BEGIN
		SET @DBNAME = isnull([dbo].[GetdbNameByDBuniquekey](@Authorization),'')
	END
	ELSE
	BEGIN
		SET @DBNAME = isnull([dbo].[GetdbName](@y),'')
	END
	print concat('@p :',@p)
	print concat('@DBNAME :',@DBNAME)
----------------------------------------------------------------------------------------------------------------
	print '11'
	DECLARE 
		  @SQL nvarchar(max)=''		
		, @SQL1 nvarchar(max)=''		
		, @SQL2 nvarchar(max)=''		
		, @SQL3 nvarchar(max)=''		
		, @SQL4 nvarchar(max)=''		
		, @SQL5 nvarchar(max)=''
		, @SQL6 nvarchar(max)=''
		, @SQL7 nvarchar(max)=''
		, @SQL8 nvarchar(max)=''
		, @SQL9 nvarchar(max)=''
		, @SQL10 nvarchar(max)=''
		, @SQL11 nvarchar(max)=''
		, @SQL12 nvarchar(max)=''
		, @SQL13 nvarchar(max)=''
		, @SQL14 nvarchar(max)=''
		, @SQL15 nvarchar(max)=''
		, @SQL16 nvarchar(max)=''
		, @SQL17 nvarchar(max)=''
		, @SQL18 nvarchar(max)=''
		, @SQL19 nvarchar(max)=''
		, @SQL20 nvarchar(max)=''
		, @SQLASSIGNEE nvarchar(max)=''
		, @SQLFilter nvarchar(max)=''
		, @OrderBy as nvarchar(max)=''
		, @WhereClause1 as nvarchar(max)=''
		, @WhereClause2 as nvarchar(max)=''
		, @WhereClause2a as nvarchar(max)=''
		, @WhereClause3 as nvarchar(max)=''			
		, @SQL1D AS NVARCHAR(MAX) = ''			
		, @SQL2D AS NVARCHAR(MAX) =''		
		, @SQL3D AS NVARCHAR(MAX) = ''
		, @SQL41 AS NVARCHAR(MAX)=''

		
		, @fdate as nvarchar(20)=''
		, @tdate as nvarchar(20)=''
		, @dueDateFrom as nvarchar(20)=''
		, @dueDateTo as nvarchar(20)=''
		, @startdatefrom as nvarchar(20)=''
		, @startdateto as nvarchar(20)=''

		, @search as nvarchar(max)=''
		, @dept as nvarchar(200)=''
		, @empbarcode as nvarchar(200)=''		
		, @sortname nvarchar(max)=''
		, @sortorder nvarchar(max)=''
		, @PageSize int=0
		, @CurrentPage int=0
		, @isdepartment int=0
		, @isemployee int=0
		, @userid nvarchar(200)=''
		, @psw nvarchar(200)=''
		, @token nvarchar(200)=''

		, @chatid int=0
		, @senderid int=0
		, @chatmsg nvarchar(max)=''
		, @contactids nvarchar(max)=''
		, @fname nvarchar(200)=''	
		, @lname nvarchar(200)=''
		, @ccode nvarchar(200)=''
		, @mobile nvarchar(200)=''
		, @rolename nvarchar(200)=''
		, @about nvarchar(200)=''
		, @avatar nvarchar(200)=''	
		, @isgroup int=0
		, @avatarColor nvarchar(200)=''
		, @emailid nvarchar(200)=''

		, @master_mode nvarchar(10)=''
		, @master_table nvarchar(max)=''
		, @master_id int=0
		, @master_labelvalue nvarchar(200)=''
		, @master_displayorder int=0
		, @taskid int=0
		, @toparentid int=0

		, @bindedMainGroupid int=0
		, @projectid int=0
		, @taskname nvarchar(max)=''
		, @StartDate datetime=NULL
		, @ReportingDate datetime=NULL
		
		
		, @estimate_hrs decimal(38,2)=0
		, @DeadLineDate datetime=NULL
		, @priorityid int=0
		, @statusid int=0
		, @secstatusid int=0
		, @workcategoryid int=0
		, @departmentid int=0
		, @parentid int=0	
		, @descr nvarchar(max)=''
		, @comment nvarchar(max)=''
		, @pageid int=0
		
		, @WhereClause_delete as nvarchar(max)=''
		, @WhereClause as nvarchar(max)=''										
		, @WhereClause_casting as nvarchar(max)=''
		, @WhereClause_spruecutting as nvarchar(max)=''
		, @WhereClause_conversion as nvarchar(max)=''	
		, @WhereClause_returnfromemployee as nvarchar(max)=''
		, @WhereClause_refine as nvarchar(max)=''
		, @iswithoutfinding as int=0
		, @isinclude_Production_SideUpData as int=1
		, @isMonthwise as int=0
		, @MetalType as nvarchar(max)='GOLD'
		, @rm_grossloss as decimal(38,3)=0	
		, @ismodule as int=0
		, @isFreez as int=0

		, @ismilestone as int=0
		, @estimate1_hrs as decimal(38,2)=0
		, @estimate2_hrs as decimal(38,2)=0
		, @isfavourite as int=0
		, @ticketno as nvarchar(max)=''
		, @assigneids as nvarchar(max)=''
		, @meetingid as int=0
		, @meetingtitle as nvarchar(max)=''
		, @EndDate datetime=NULL
		, @isAllDay as int=0
		, @isAccept as int=0
		, @ismeeting_attnd as int=0
		, @departmentAssigneelist as nvarchar(max)=''
		, @teamid as int=0
		, @isarchive as int=0
		, @createdbyid as int=0
		, @rolenamelist nvarchar(max)=''
		, @assigneeid as int=0
		, @workinghr as decimal(38,2)=0
		, @delfiltergroupattr as int=0
		, @filterattr as nvarchar(200)=''
		, @filtergroup as nvarchar(200)=''
		, @filtermaster as nvarchar(200)=''
		, @group1_attr as int=0
		, @group2_attr as int=0
		, @group3_attr as int=0
		, @group4_attr as int=0
		, @group5_attr as int=0
		, @group6_attr as int=0
		, @group7_attr as int=0
		, @group8_attr as int=0
		, @group9_attr as int=0
		, @group10_attr as int=0
		, @group11_attr as int=0
		, @group12_attr as int=0
		, @group13_attr as int=0
		, @group14_attr as int=0
		, @group15_attr as int=0
		, @group16_attr as int=0
		, @group17_attr as int=0
		, @group18_attr as int=0
		, @group19_attr as int=0
		, @group20_attr as int=0
		, @group21_attr as int=0
		, @group22_attr as int=0
		, @group23_attr as int=0
		, @group24_attr as int=0
		, @group25_attr as int=0
		, @maingroupids as nvarchar(max)=''
		, @maintaskid as int=0
		, @bindid as int=0
		, @filtergroupid as int=0
		, @filterattrid as int=0
		, @filtermaingroupid as int=0
		, @companycode as nvarchar(100)=''
		, @RandomNo nvarchar(50)=convert(varchar(50),convert(decimal(30,0),concat(isnull(([dbo].GenerateRandomNumber(100,999,Rand())),0),replace(replace(replace(replace(convert(nvarchar(30),[dbo].[UTC_CSERVERLOCAL](getdate()),121),' ',''),':',''),'.',''),'-',''))))

		,@repeatflag as nvarchar(100)=''
		,@customername as nvarchar(200)=''
		,@bindtype as nvarchar(50)=''
		,@bindname as nvarchar(100)=''
		,@splitestimate as nvarchar(max)='' ---- 06_02_2026
		,@restoreids as nvarchar(max)='' 

		,@takenbyempid as int=0
		,@givenbyempid as int=0
		,@remarks as nvarchar(max)=''
		,@isdone as int=0
		,@dailyreportingid as int=0

		,@taskno nvarchar(50)=''
		,@bugtitle as nvarchar(200)=''
		,@solvedbyid as int=0	
		,@bugpriorityid as int=0
		,@bugimagepath as nvarchar(300)=''
		,@testbyid as int=0
		,@recheckbyid as int=0
		,@bugstatusid as int=0
		,@codeby as nvarchar(100)=''
		,@bugid as int=0
		,@holidaydate as nvarchar(20)=''
        ,@bug_bugid NVARCHAR(50) = ''
		,@isCompleted as int=0
		,@moduleid as int=0
		,@Seniourid as int=0
		,@Empid as int=0

        --,@bug_userid NVARCHAR(50) = ''
        --,@bug_content NVARCHAR(MAX) = ''
        --,@bugTitle NVARCHAR(200) = ''
        --,@bugAssignee NVARCHAR(50) = ''
        --,@commentNotifMsg NVARCHAR(MAX) = ''

	
;
		


BEGIN TRY
	begin
		
		IF(isnull(@p,'')<>'' and isnull(@mode,'')<>'save_attachment' and isnull(@mode,'')<>'task_comment_save')
		begin
			declare @PTbl table
			(
				fdate nvarchar(20)
				,tdate nvarchar(20)
				,search nvarchar(max)
				,dept nvarchar(max)
				,empbarcode nvarchar(max)
				,sortname nvarchar(max)
				,sortorder nvarchar(max)
				,PageSize int
				,CurrentPage int
				,isdepartment int
				,isemployee int
				,userid nvarchar(max)
				,psw nvarchar(max)
				,token nvarchar(max)
				,chatid int
				,senderid int
				,chatmsg nvarchar(max)

				,contactids nvarchar(max)
				,fname nvarchar(max)
				,lname nvarchar(max)
				,ccode nvarchar(max)
				,mobile nvarchar(max)
				,rolename nvarchar(max)
				,about nvarchar(max)
				,avatar nvarchar(max)
				,isgroup int
				,avatarColor nvarchar(max)
				,emailid nvarchar(max)

				,master_mode nvarchar(max)
				,master_table nvarchar(max)
				,master_id int
				,master_labelvalue nvarchar(max)
				,master_displayorder int
				,taskid int
				,bindedMainGroupid int

				,projectid int
				,taskname nvarchar(max)
				,StartDate datetime
				,ReportingDate datetime
				,estimate_hrs decimal(38,2)
				,DeadLineDate datetime
				,priorityid int
				,statusid int
				,workcategoryid int
				,departmentid int
				,parentid int
				,descr nvarchar(max)
				,comment nvarchar(max)
				,pageid int
				,ismodule int
				,isFreez int
				,ismilestone int
				,estimate1_hrs decimal(38,2)
				,estimate2_hrs decimal(38,2)
				,isfavourite int
				,ticketno nvarchar(max)
				,assigneids nvarchar(max)
				,meetingid int
				,meetingtitle nvarchar(max)
				,EndDate datetime
				,isAllDay int
				,isAccept int
				,ismeeting_attnd int
				,departmentAssigneelist nvarchar(max)
				,teamid int
				,isarchive int
				,createdbyid int
				,rolenamelist nvarchar(max)
				,assigneeid int
				,workinghr decimal(38,2)
				,delfiltergroupattr int
				,filterattr nvarchar(200)
				,filtergroup nvarchar(200)

				,group1_attr int
				,group2_attr int
				,group3_attr int
				,group4_attr int
				,group5_attr int
				,group6_attr int
				,group7_attr int
				,group8_attr int
				,group9_attr int
				,group10_attr int
				,group11_attr int
				,group12_attr int
				,group13_attr int
				,group14_attr int
				,group15_attr int
				,group16_attr int
				,group17_attr int
				,group18_attr int
				,group19_attr int
				,group20_attr int
				,group21_attr int
				,group22_attr int
				,group23_attr int
				,group24_attr int
				,group25_attr int
				,toparentid int
				,maingroupids nvarchar(max)
				,maintaskid int
				,filtermaster nvarchar(200)
				,bindid int
				,filtergroupid int
				,filterattrid int
				,filtermaingroupid int
				,companycode nvarchar(200)
				,secstatusid int

				,repeatflag nvarchar(100)
				,customername nvarchar(200)
				,bindtype nvarchar(50)
				,bindname nvarchar(100)
				,splitestimate NVARCHAR(MAX)
				,restoreids NVARCHAR(MAX)
				,takenbyempid int
				,givenbyempid int
				,remarks nvarchar(max)
				,isdone int
				,dailyreportingid int

				,taskno nvarchar(50)
				,bugtitle nvarchar(200)
				,solvedbyid int
				,bugpriorityid int
				,bugimagepath nvarchar(300)
				,testbyid int
				,recheckbyid int
				,bugstatusid int
				,codeby nvarchar(100)
				,bugid int
				,holidaydate nvarchar(20)
				,dueDateFrom nvarchar(20)
				,dueDateTo nvarchar(20)

				,startdatefrom nvarchar(20)
				,startdateto nvarchar(20)
				,bug_bugid nvarchar(50)
				,isCompleted int
				,moduleid int
				,Seniourid int
				,Empid int
			)

			BEGIN TRY
				begin
					insert into @PTbl
					(
						 fdate
						,tdate
						,search
						,dept
						,empbarcode
						,sortname
						,sortorder
						,pagesize
						,currentpage
						,isdepartment
						,isemployee
						,userid
						,psw
						,token
						,chatid
						,senderid
						,chatmsg
						,contactids
						,fname
						,lname
						,ccode
						,mobile
						,rolename
						,about
						,avatar
						,isgroup
						,avatarColor
						,emailid

						,master_mode
						,master_table
						,master_id
						,master_labelvalue
						,master_displayorder
						,taskid
						,bindedMainGroupid

						,projectid
						,taskname
						,StartDate
						,ReportingDate
						,estimate_hrs
						,DeadLineDate
						,priorityid
						,statusid
						,workcategoryid
						,departmentid
						,parentid
						,descr
						,comment
						,pageid
						,ismodule
						,isFreez

						,ismilestone
						,estimate1_hrs
						,estimate2_hrs
						,isfavourite
						,ticketno
						,assigneids
						,meetingid
						,meetingtitle
						,EndDate
						,isAllDay
						,isAccept
						,ismeeting_attnd
						,departmentAssigneelist
						,teamid
						,isarchive
						,createdbyid
						,rolenamelist
						,assigneeid
						,workinghr
						,delfiltergroupattr
						,filterattr
						,filtergroup

						,group1_attr
						,group2_attr
						,group3_attr
						,group4_attr
						,group5_attr
						,group6_attr
						,group7_attr
						,group8_attr
						,group9_attr
						,group10_attr
						,group11_attr
						,group12_attr
						,group13_attr
						,group14_attr
						,group15_attr
						,group16_attr
						,group17_attr
						,group18_attr
						,group19_attr
						,group20_attr
						,group21_attr
						,group22_attr
						,group23_attr
						,group24_attr
						,group25_attr
						,toparentid
						,maingroupids
						,maintaskid
						,filtermaster
						,bindid

						,filtergroupid
						,filterattrid
						,filtermaingroupid
						,companycode
						,secstatusid

						,repeatflag
						,customername
						,bindtype
						,bindname
						,splitestimate 
						,restoreids
						,takenbyempid
						,givenbyempid
						,remarks
						,isdone
						,dailyreportingid

						,taskno
						,bugtitle
						,solvedbyid
						,bugpriorityid
						,bugimagepath
						,testbyid
						,recheckbyid
						,bugstatusid
						,codeby
						,bugid
						,holidaydate
						,dueDateFrom
						,dueDateTo

						,startdatefrom
						,startdateto
						,bug_bugid
						,isCompleted
						,moduleid
						,Seniourid
						,Empid
					)				
					select
						 isnull(fdate,'') as fdate
						,isnull(tdate,'') as tdate
						,isnull(search,'') as search

						,isnull(dept,'') as dept
						,isnull(empbarcode,'') as empbarcode
						,isnull(sortname,'') as sortname
						,isnull(sortorder,'') as sortorder
						,isnull(pagesize,0) as pagesize 
						,isnull(currentpage,0) as currentpage
						,isnull(isdepartment,0) as isdepartment
						,isnull(isemployee,0) as isdepartment
						,isnull(userid,'') as userid
						,isnull(psw,'') as psw
						,isnull(token,'') as token
						,isnull(chatid,0) as chatid
						,isnull(senderid,0) as senderid
						,isnull(chatmsg,'') as chatmsg

						,isnull(contactids,'') as contactids
						,isnull(fname,'') as fname
						,isnull(lname,'') as lname
						,isnull(ccode,'') as ccode
						,isnull(mobile,'') as mobile
						,isnull(rolename,'') as rolename
						,isnull(about,'') as about
						,isnull(avatar,'') as avatar
						,isnull(isgroup,0) as isgroup
						,isnull(avatarColor,0) as avatarColor
						,isnull(emailid,'') as emailid

						,isnull(master_mode,'') as master_mode
						,isnull(master_table,'') as master_table
						,isnull(master_id,0) as master_id
						,isnull(master_labelvalue,'') as master_labelvalue
						,isnull(master_displayorder,0) as master_displayorder
						,isnull(taskid,0) as taskid
						,isnull(bindedMainGroupid,0) as bindedMainGroupid

						,isnull(projectid,0) as projectid
						,isnull(taskname,'') as taskname
						,StartDate
						,ReportingDate
						,isnull(estimate_hrs,0) as estimate_hrs
						,DeadLineDate
						,isnull(priorityid,0) as priorityid
						,isnull(statusid,0) as statusid
						,isnull(workcategoryid,0) as workcategoryid
						,isnull(departmentid,0) as departmentid
						,isnull(parentid,0) as parentid
						,isnull(descr,'') as descr
						,isnull(comment,'') as comment
						,isnull(pageid,0) as pageid
						,isnull(ismodule,0) as ismodule
						,isnull(isFreez,0) as isFreez

						,isnull(ismilestone,0) as ismilestone
						,isnull(estimate1_hrs,0) as estimate1_hrs
						,isnull(estimate2_hrs,0) as estimate2_hrs
						,isnull(isfavourite,0) as isfavourite
						,isnull(ticketno,'') as ticketno
						,isnull(assigneids,'') as assigneids
						,isnull(meetingid,0) as meetingid
						,isnull(meetingtitle,'') as meetingtitle
						,EndDate
						,isnull(isAllDay,0) as isAllDay
						,ISNULL(isAccept,0) as isAccept
						,ISNULL(ismeeting_attnd,0) as ismeeting_attnd
						,ISNULL(departmentAssigneelist,'') as departmentAssigneelist
						,ISNULL(teamid,0) as teamid
						,ISNULL(isarchive,0) as isarchive
						,ISNULL(createdbyid,0) as createdbyid
						,ISNULL(rolenamelist,'') as rolenamelist
						,ISNULL(assigneeid,0) as assigneeid
						,ISNULL(workinghr,0) as workinghr
						,ISNULL(delfiltergroupattr,0) as delfiltergroupattr
						,ISNULL(filterattr,'') as filterattr
						,ISNULL(filtergroup,'') as filtergroup

						,ISNULL(group1_attr,0) as group1_attr
						,ISNULL(group2_attr,0) as group2_attr
						,ISNULL(group3_attr,0) as group3_attr
						,ISNULL(group4_attr,0) as group4_attr
						,ISNULL(group5_attr,0) as group5_attr
						,ISNULL(group6_attr,0) as group6_attr
						,ISNULL(group7_attr,0) as group7_attr
						,ISNULL(group8_attr,0) as group8_attr
						,ISNULL(group9_attr,0) as group9_attr
						,ISNULL(group10_attr,0) as group10_attr
						,ISNULL(group11_attr,0) as group11_attr
						,ISNULL(group12_attr,0) as group12_attr
						,ISNULL(group13_attr,0) as group13_attr
						,ISNULL(group14_attr,0) as group14_attr
						,ISNULL(group15_attr,0) as group15_attr
						,ISNULL(group16_attr,0) as group16_attr
						,ISNULL(group17_attr,0) as group17_attr
						,ISNULL(group18_attr,0) as group18_attr
						,ISNULL(group19_attr,0) as group19_attr
						,ISNULL(group20_attr,0) as group20_attr
						,ISNULL(group21_attr,0) as group21_attr
						,ISNULL(group22_attr,0) as group22_attr
						,ISNULL(group23_attr,0) as group23_attr
						,ISNULL(group24_attr,0) as group24_attr
						,ISNULL(group25_attr,0) as group25_attr
						,ISNULL(toparentid,0) as toparentid
						,ISNULL(maingroupids,'') as maingroupids
						,ISNULL(maintaskid,0) as maintaskid
						,ISNULL(filtermaster,'') as filtermaster
						,ISNULL(bindid,0) as bindid
						,ISNULL(filtergroupid,0) as filtergroupid
						,ISNULL(filterattrid,0) as filterattrid
						,ISNULL(filtermaingroupid,0) as filtermaingroupid
						,ISNULL(companycode,'') as companycode
						,ISNULL(secstatusid,0) as secstatusid

						,ISNULL(repeatflag,'') AS repeatflag
						,ISNULL(customername,'') AS customername
						,ISNULL(bindtype,'') AS bindtype
						,ISNULL(bindname,'') AS bindname
						,ISNULL(splitestimate,'') AS splitestimate
						,ISNULL(restoreids,'') as restoreids
						,ISNULL(takenbyempid,0) as takenbyempid
						,ISNULL(givenbyempid,0) as givenbyempid
						,ISNULL(remarks,'') as remarks
						,ISNULL(isdone,0) as isdone
						,ISNULL(dailyreportingid,0) as dailyreportingid

						,ISNULL(taskno,0) as taskno
						,ISNULL(bugtitle,'') as bugtitle
						,ISNULL(solvedbyid,0) as solvedbyid
						,ISNULL(bugpriorityid,0) as bugpriorityid
						,ISNULL(bugimagepath,'') as bugimagepath
						,ISNULL(testbyid,0) as testbyid
						,ISNULL(recheckbyid,0) as recheckbyid
						,ISNULL(bugstatusid,0) as bugstatusid
						,ISNULL(codeby,'') as codeby
						,ISNULL(bugid,0) as bugid
						,ISNULL(holidaydate,'') as holidaydate
						,ISNULL(dueDateFrom,'') as dueDateFrom
						,ISNULL(dueDateTo,'') as dueDateTo
						,ISNULL(startdatefrom,'') as startdatefrom
						,ISNULL(startdateto,'') as startdateto
						,ISNULL(bug_bugid,'') as bug_bugid
						,ISNULL(isCompleted,0) as isCompleted
						,ISNULL(moduleid,0) as moduleid
						,ISNULL(Seniourid,0) as Seniourid
						,ISNULL(Empid,0) as Empid
					FROM OPENJSON(isnull(@p,''))
					WITH 
					(
						 fdate NVARCHAR(20) '$.fdate' 
						,tdate NVARCHAR(20) '$.tdate' 
						,search NVARCHAR(max) '$.search' 
						,dept NVARCHAR(max) '$.dept' 
						,empbarcode NVARCHAR(max) '$.empbarcode' 
						,sortname NVARCHAR(max) '$.sortname' 
						,sortorder NVARCHAR(max) '$.sortorder' 
						,pagesize INT '$.pagesize' 
						,currentpage INT '$.currentpage' 
						,isdepartment INT '$.isdepartment' 
						,isemployee INT '$.isemployee' 
						,userid NVARCHAR(max) '$.userid' 
						,psw NVARCHAR(max) '$.psw' 
						,token NVARCHAR(max) '$.token' 

						,chatid INT '$.chatid'
						,senderid INT '$.senderid'
						,chatmsg NVARCHAR(max) '$.chatmsg' 

						,contactids NVARCHAR(max) '$.contactids' 
						,fname NVARCHAR(max) '$.fname' 
						,lname NVARCHAR(max) '$.lname' 
						,ccode NVARCHAR(max) '$.ccode' 
						,mobile NVARCHAR(max) '$.mobile' 
						,rolename NVARCHAR(max) '$.rolename' 
						,about NVARCHAR(max) '$.about' 
						,avatar NVARCHAR(max) '$.avatar' 
						,isgroup NVARCHAR(max) '$.isgroup' 
						,avatarColor NVARCHAR(max) '$.avatarColor' 
						,emailid NVARCHAR(max) '$.emailid' 

						,master_mode NVARCHAR(max) '$.master_mode' 
						,master_table NVARCHAR(max) '$.master_table' 
						,master_id INT '$.master_id'
						,master_labelvalue NVARCHAR(max) '$.master_labelvalue' 
						,master_displayorder INT '$.master_displayorder'
						,taskid INT '$.taskid'
						,bindedMainGroupid INT '$.bindedMainGroupid'

						,projectid INT '$.projectid'
						,taskname NVARCHAR(max) '$.taskname' 
						,StartDate DATETIME '$.StartDate' 
						,ReportingDate DATETIME '$.ReportingDate'
						,estimate_hrs DECIMAL(18,2) '$.estimate_hrs' 
						,DeadLineDate DATETIME '$.DeadLineDate' 
						,priorityid INT '$.priorityid'
						,statusid INT '$.statusid'
						,workcategoryid INT '$.workcategoryid'
						,departmentid INT '$.departmentid'
						,parentid INT '$.parentid'
						,descr NVARCHAR(MAX) '$.descr'
						,comment NVARCHAR(MAX) '$.comment'
						,pageid INT '$.pageid'
						,ismodule INT '$.ismodule'
						,isFreez INT '$.isFreez'

						,ismilestone INT '$.ismilestone'
						,estimate1_hrs DECIMAL(18,2) '$.estimate1_hrs' 
						,estimate2_hrs DECIMAL(18,2) '$.estimate2_hrs' 
						,isfavourite INT '$.isfavourite'
						,ticketno NVARCHAR(MAX) '$.ticketno'
						,assigneids NVARCHAR(MAX) '$.assigneids'
						,meetingid INT '$.meetingid'
						,meetingtitle  NVARCHAR(MAX) '$.meetingtitle'
						,EndDate  NVARCHAR(MAX) '$.EndDate'
						,isAllDay INT '$.isAllDay'
						,isAccept INT '$.isAccept'
						,ismeeting_attnd INT '$.ismeeting_attnd'
						,departmentAssigneelist NVARCHAR(MAX) '$.departmentAssigneelist'
						,teamid NVARCHAR(MAX) '$.teamid'
						,isarchive NVARCHAR(MAX) '$.isarchive'
						,createdbyid INT '$.createdbyid'
						,rolenamelist NVARCHAR(MAX) '$.rolenamelist'	
						,assigneeid INT '$.assigneeid'
						,workinghr DECIMAL(38,2) '$.workinghr'
						,delfiltergroupattr INT '$.delfiltergroupattr'
						,filterattr NVARCHAR(200) '$.filterattr'
						,filtergroup NVARCHAR(200) '$.filtergroup'

						,group1_attr INT '$.group1_attr'
						,group2_attr INT '$.group2_attr'
						,group3_attr INT '$.group3_attr'
						,group4_attr INT '$.group4_attr'
						,group5_attr INT '$.group5_attr'
						,group6_attr INT '$.group6_attr'
						,group7_attr INT '$.group7_attr'
						,group8_attr INT '$.group8_attr'
						,group9_attr INT '$.group9_attr'
						,group10_attr INT '$.group10_attr'
						,group11_attr INT '$.group11_attr'
						,group12_attr INT '$.group12_attr'
						,group13_attr INT '$.group13_attr'
						,group14_attr INT '$.group14_attr'
						,group15_attr INT '$.group15_attr'
						,group16_attr INT '$.group16_attr'
						,group17_attr INT '$.group17_attr'
						,group18_attr INT '$.group18_attr'
						,group19_attr INT '$.group19_attr'
						,group20_attr INT '$.group20_attr'
						,group21_attr INT '$.group21_attr'
						,group22_attr INT '$.group22_attr'
						,group23_attr INT '$.group23_attr'
						,group24_attr INT '$.group24_attr'
						,group25_attr INT '$.group25_attr'
						,toparentid INT '$.toparentid'
						,maingroupids NVARCHAR(MAX) '$.maingroupids'
						,maintaskid INT '$.maintaskid'
						,filtermaster NVARCHAR(MAX) '$.filtermaster'
						,bindid INT '$.bindid'

						,filtergroupid INT '$.filtergroupid'
						,filterattrid INT '$.filterattrid'
						,filtermaingroupid INT '$.filtermaingroupid'
						,companycode NVARCHAR(200) '$.companycode'
						,secstatusid INT '$.secstatusid'

						,repeatflag NVARCHAR(MAX) '$.repeatflag'
						,customername NVARCHAR(MAX) '$.customername'
						,bindtype NVARCHAR(MAX) '$.bindtype'
						,bindname NVARCHAR(MAX) '$.bindname'
						,splitestimate NVARCHAR(MAX) '$.splitestimate'
						,restoreids NVARCHAR(MAX) '$.restoreids'

						,takenbyempid INT '$.takenbyempid'
						,givenbyempid INT '$.givenbyempid'
						,remarks NVARCHAR(MAX) '$.remarks'
						,isdone INT '$.isdone'
						,dailyreportingid INT '$.dailyreportingid'

						,taskno nvarchar(50) '$.taskno'
						,bugtitle nvarchar(200) '$.bugtitle'
						,solvedbyid int '$.solvedbyid'
						,bugpriorityid int '$.bugpriorityid'
						,bugimagepath nvarchar(300) '$.bugimagepath'
						,testbyid int '$.testbyid'
						,recheckbyid int '$.recheckbyid'
						,bugstatusid int '$.bugstatusid'
						,codeby nvarchar(100) '$.codeby'
						,bugid int '$.bugid'
						,holidaydate nvarchar(20) '$.holidaydate'

						,dueDateFrom nvarchar(20) '$.dueDateFrom'
						,dueDateTo nvarchar(20) '$.dueDateTo'

						,startdatefrom nvarchar(20) '$.startdatefrom'
						,startdateto nvarchar(20) '$.startdateto'
						,bug_bugid nvarchar(20) '$.bug_bugid'
						,isCompleted int '$.isCompleted'
						,moduleid int '$.moduleid'
						,Seniourid int '$.Seniourid'
						,Empid int '$.Empid'

					

					) as a


					select top 1 
						 @fdate=fdate
						,@tdate=tdate
						,@search=replace(search,'''','''''')
						,@dept=replace(dept,'''','''''')
						,@empbarcode=replace(empbarcode,'''','''''')
						,@sortname=sortname
						,@sortorder=sortorder
						,@pagesize=pagesize
						,@currentpage=currentpage
						,@isdepartment=isdepartment
						,@isemployee=isemployee						
						,@userid=userid
						,@psw=psw
						,@token=token
						,@chatid=chatid
						,@senderid=senderid
						,@chatmsg=replace(chatmsg,'''','''''')
						,@contactids=contactids
						,@fname=replace(fname,'''','''''')
						,@lname=replace(lname,'''','''''')
						,@ccode=replace(ccode,'''','''''')
						,@mobile=mobile
						,@rolename=replace(rolename,'''','''''')
						,@about=replace(about,'''','''''')
						,@avatar=avatar
						,@isgroup=isgroup
						,@avatarColor=avatarColor
						,@emailid=emailid

						,@master_mode=master_mode
						,@master_table=master_table
						,@master_id=master_id
						,@master_labelvalue=replace(master_labelvalue,'''','''''')
						,@master_displayorder=master_displayorder
						,@taskid=taskid
						,@bindedMainGroupid=bindedMainGroupid

						,@projectid=projectid
						,@taskname=replace(taskname,'''','''''') 
						,@StartDate=StartDate 
						,@ReportingDate=ReportingDate
						,@EndDate=EndDate
						,@estimate_hrs=estimate_hrs 
						,@DeadLineDate=DeadLineDate
						,@priorityid=priorityid
						,@statusid=statusid
						,@workcategoryid=workcategoryid
						,@departmentid=departmentid
						,@parentid=parentid
						,@descr=replace(descr,'''','''''') 
						,@comment=replace(comment,'''','''''') 
						,@pageid=pageid
						,@ismodule=ismodule
						,@isFreez=isFreez

						,@ismilestone=ismilestone
						,@estimate1_hrs=estimate1_hrs
						,@estimate2_hrs=estimate2_hrs
						,@isfavourite=isfavourite
						,@ticketno=ticketno
						,@assigneids=assigneids
						,@meetingid=meetingid
						,@meetingtitle=replace(meetingtitle,'''','''''') 
						,@EndDate=EndDate
						,@isAllDay=isAllDay
						,@isAccept=isAccept
						,@ismeeting_attnd=isnull(ismeeting_attnd,0)
						,@departmentAssigneelist=isnull(departmentAssigneelist,'')
						,@teamid=isnull(teamid,0)
						,@isarchive=isnull(isarchive,0)
						,@createdbyid=ISNULL(createdbyid,0)
						,@rolenamelist=replace(ISNULL(rolenamelist,''),'''','''''') 
						,@assigneeid=ISNULL(assigneeid,0)
						,@workinghr=ISNULL(workinghr,0)
						,@delfiltergroupattr=ISNULL(delfiltergroupattr,0)
						,@filterattr=replace(ISNULL(filterattr,''),'''','''''') 
						,@filtergroup=replace(ISNULL(filtergroup,''),'''','''''') 

						,@group1_attr=ISNULL(group1_attr,0)
						,@group2_attr=ISNULL(group2_attr,0)
						,@group3_attr=ISNULL(group3_attr,0)
						,@group4_attr=ISNULL(group4_attr,0)
						,@group5_attr=ISNULL(group5_attr,0)
						,@group6_attr=ISNULL(group6_attr,0)
						,@group7_attr=ISNULL(group7_attr,0)
						,@group8_attr=ISNULL(group8_attr,0)
						,@group9_attr=ISNULL(group9_attr,0)
						,@group10_attr=ISNULL(group10_attr,0)
						,@group11_attr=ISNULL(group11_attr,0)
						,@group12_attr=ISNULL(group12_attr,0)
						,@group13_attr=ISNULL(group13_attr,0)
						,@group14_attr=ISNULL(group14_attr,0)
						,@group15_attr=ISNULL(group15_attr,0)
						,@group16_attr=ISNULL(group16_attr,0)
						,@group17_attr=ISNULL(group17_attr,0)
						,@group18_attr=ISNULL(group18_attr,0)
						,@group19_attr=ISNULL(group19_attr,0)
						,@group20_attr=ISNULL(group20_attr,0)
						,@group21_attr=ISNULL(group21_attr,0)
						,@group22_attr=ISNULL(group22_attr,0)
						,@group23_attr=ISNULL(group23_attr,0)
						,@group24_attr=ISNULL(group24_attr,0)
						,@group25_attr=ISNULL(group25_attr,0)
						,@toparentid=ISNULL(toparentid,0)
						,@maingroupids=ISNULL(maingroupids,'')
						,@maintaskid=ISNULL(maintaskid,0)
						,@filtermaster=replace(ISNULL(filtermaster,''),'''','''''') 
						,@bindid=ISNULL(bindid,0)
						,@filtergroupid=ISNULL(filtergroupid,0)
						,@filterattrid=ISNULL(filterattrid,0)
						,@filtermaingroupid=ISNULL(filtermaingroupid,0)
						,@companycode=ISNULL(companycode,0)
						,@secstatusid=secstatusid

						,@repeatflag=ISNULL(repeatflag,'')
						,@customername=ISNULL(customername,'')
						,@bindtype=ISNULL(bindtype,'')
						,@bindname=ISNULL(bindname,'')
						,@splitestimate=ISNULL(splitestimate,'')
						,@restoreids=ISNULL(restoreids,'')

						,@takenbyempid=ISNULL(takenbyempid,0)
						,@givenbyempid=ISNULL(givenbyempid,0)
						,@remarks=ISNULL(remarks,'')
						,@isdone=ISNULL(isdone,0)
						,@dailyreportingid=isnull(dailyreportingid,0)

						,@taskno=ISNULL(taskno,'')
						,@bugtitle=ISNULL(bugtitle,'')
						,@solvedbyid=ISNULL(solvedbyid,0)
						,@bugpriorityid=ISNULL(bugpriorityid,0)
						,@bugimagepath=ISNULL(bugimagepath,'')
						,@testbyid=ISNULL(testbyid,0)
						,@recheckbyid=ISNULL(recheckbyid,0)
						,@bugstatusid=ISNULL(bugstatusid,0)
						,@codeby=ISNULL(codeby,'')
						,@bugid=ISNULL(bugid,0)
						,@holidaydate=ISNULL(holidaydate,'')
						,@dueDateFrom=ISNULL(dueDateFrom,'')
						,@dueDateTo=ISNULL(dueDateTo,'')


						,@startdatefrom=ISNULL(startdatefrom,'')
						,@startdateto=ISNULL(startdateto,'')
						,@bug_bugid=ISNULL(bug_bugid,'')
						,@isCompleted=isnull(isCompleted,0)
						,@moduleid=isnull(moduleid,0)
						,@Seniourid=isnull(Seniourid,0)
						,@Empid=isnull(Empid,0)
					from @PTbl

				end
			END TRY
			BEGIN CATCH	
				Print '--'
			END CATCH;
		end
	
		
	end
	
BEGIN
	print concat('--@fdate :',@fdate)
	print concat('--@tdate :',@tdate)
	print concat('--@search :',@search)
	print concat('--@dept :',@dept)
	print concat('--@empbarcode :',@empbarcode)
	print concat('--@sortname :',@sortname)
	print concat('--@sortorder :',@sortorder)
	print concat('--@pagesize :',@pagesize)
	print concat('--@currentpage :',@currentpage)
	print concat('--@isdepartment :',@isdepartment)
	print concat('--@isemployee :',@isemployee)
	print concat('--@userid :',@userid)
	print concat('--@psw :',@psw)
	print concat('--@token :',@token)


	print concat('--@chatid :',@chatid)
	print concat('--@senderid :',@senderid)
	print concat('--@chatmsg :',@chatmsg)
	
	print concat('--@contactids :',@contactids)
	print concat('--@fname :',@fname)
	print concat('--@lname :',@lname)
	print concat('--@ccode :',@ccode)
	print concat('--@mobile :',@mobile)
	print concat('--@rolename :',@rolename)
	print concat('--@about :',@about)
	print concat('--@avatar :',@avatar)
	print concat('--@isgroup :',@isgroup)
	print concat('--@avatarColor :',@avatarColor)
	print concat('--@emailid :',@emailid)


	print concat('--@master_mode :',@master_mode)
	print concat('--@master_table :',@master_table)
	print concat('--@master_id :',@master_id)
	print concat('--@master_labelvalue :',@master_labelvalue)
	print concat('--@master_displayorder :',@master_displayorder)
	print concat('--@taskid :',@taskid)
	print concat('--@bindedMainGroupid :',@bindedMainGroupid)

	print concat('--@projectid :',@projectid)
	print concat('--@taskname :',@taskname)
	print concat('--@StartDate :',@StartDate) 
	print concat('--@estimate_hrs :',@estimate_hrs)
	print concat('--@DeadLineDate :',@DeadLineDate)
	print concat('--@priorityid :',@priorityid)
	print concat('--@statusid :',@statusid)
	print concat('--@workcategoryid :',@workcategoryid)
	print concat('--@departmentid :',@departmentid)
	print concat('--@parentid :',@parentid)
	print concat('--@descr :',@descr)
	print concat('--@comment :',@comment)
	print concat('--@pageid :',@pageid)
	print concat('--@ismodule :',@ismodule)
	print concat('--@isFreez :',@isFreez)

	print concat('--@ismilestone :',@ismilestone)
	print concat('--@estimate1_hrs :',@estimate1_hrs)
	print concat('--@estimate2_hrs :',@estimate2_hrs)
	print concat('--@isfavourite :',@isfavourite)
	print concat('--@ticketno :',@ticketno)
	print concat('--@assigneids :',@assigneids)
	print concat('--@meetingid :',@meetingid)
	print concat('--@meetingtitle :',@meetingtitle)
	print concat('--@EndDate :',@EndDate)
	print concat('--@isAllDay :',@isAllDay)
	print concat('--@isAccept :',@isAccept)
	print concat('--@ismeeting_attnd :',@ismeeting_attnd)
	print concat('--@departmentAssigneelist :',@departmentAssigneelist)
	print concat('--@teamid :',@teamid)
	print concat('--@isarchive :',@isarchive)
	print concat('--@createdbyid :',@createdbyid)
	print concat('--@rolenamelist :',@rolenamelist)
	print concat('--@assigneeid :',@assigneeid)
	print concat('--@workinghr :',@workinghr)
	print concat('--@delfiltergroupattr :',@delfiltergroupattr)

	print concat('--@filterattr :',@filterattr)
	print concat('--@filtergroup :',@filtergroup)

	print concat('--@group1_attr :',@group1_attr)
	print concat('--@group2_attr :',@group2_attr)
	print concat('--@group3_attr :',@group3_attr)
	print concat('--@group4_attr :',@group4_attr)
	print concat('--@group5_attr :',@group5_attr)
	print concat('--@group6_attr :',@group6_attr)
	print concat('--@group7_attr :',@group7_attr)
	print concat('--@group8_attr :',@group8_attr)
	print concat('--@group9_attr :',@group9_attr)
	print concat('--@group10_attr :',@group10_attr)
	print concat('--@group11_attr :',@group11_attr)
	print concat('--@group12_attr :',@group12_attr)
	print concat('--@group13_attr :',@group13_attr)
	print concat('--@group14_attr :',@group14_attr)
	print concat('--@group15_attr :',@group15_attr)
	print concat('--@group16_attr :',@group16_attr)
	print concat('--@group17_attr :',@group17_attr)
	print concat('--@group18_attr :',@group18_attr)
	print concat('--@group19_attr :',@group19_attr)
	print concat('--@group20_attr :',@group20_attr)
	print concat('--@group21_attr :',@group21_attr)
	print concat('--@group22_attr :',@group22_attr)
	print concat('--@group23_attr :',@group23_attr)
	print concat('--@group24_attr :',@group24_attr)
	print concat('--@group25_attr :',@group25_attr)
	print concat('--@toparentid :',@toparentid)
	PRINT concat('--@maingroupids :',@maingroupids)
	PRINT concat('--@maintaskid :',@maintaskid)
	PRINT concat('--@filtermaster :',@filtermaster)
	PRINT concat('--@bindid :',@bindid)
	PRINT concat('--@filtergroupid :',@filtergroupid)
	PRINT concat('--@filterattrid :',@filterattrid)
	PRINT concat('--@filtermaingroupid :',@filtermaingroupid)
	PRINT concat('--@companycode :',@companycode)
	PRINT concat('--@secstatusid :',@secstatusid)

	PRINT concat('--@repeatflag :',@repeatflag)
	PRINT concat('--@customername :',@customername)
	PRINT concat('--@bindtype:',@bindtype)
	PRINT concat('--@bindname:',@bindname)
	PRINT concat('--@restoreids:',@restoreids)

	PRINT concat('--@takenbyempid:',@takenbyempid)
	PRINT concat('--@givenbyempid:',@givenbyempid)
	PRINT concat('--@remarks:',@remarks)
	PRINT concat('--@isdone:',@isdone)
	PRINT concat('--dailyreportingid:',@dailyreportingid)

	PRINT concat('--@taskno:',@taskno)
	PRINT concat('--@bugtitle:',@bugtitle)
	PRINT concat('--@solvedbyid:',@solvedbyid)
	PRINT concat('--@bugpriorityid:',@bugpriorityid)
	PRINT concat('--@bugimagepath:',@bugimagepath)
	PRINT concat('--@testbyid:',@testbyid)
	PRINT concat('--@recheckbyid:',@recheckbyid)
	PRINT concat('--@bugstatusid:',@bugstatusid)
	PRINT concat('--@codeby:',@codeby)
	PRINT concat('--@bugid:',@bugid)
	PRINT concat('--@holidaydate:',@holidaydate)

	PRINT concat('--@dueDateFrom:',@dueDateFrom)
	PRINT concat('--@dueDateTo:',@dueDateTo)


	PRINT concat('--@startdatefrom:',@startdatefrom)
	PRINT concat('--@startdateto:',@startdateto)
	PRINT concat('--@bug_bugid :',@bug_bugid)
	PRINT concat('--@isCompleted :',@isCompleted)
	PRINT concat('--@moduleid :',@moduleid)

	PRINT concat('--@Seniourid :',@Seniourid)
	PRINT concat('--@Empid :',@Empid)

	DECLARE
		 @UpperBand int=0
		,@LowerBand int=0		
	;

	print '--step-1 variable declared'
END
BEGIN
	
	
	
print concat('@mode :',@mode)

IF(@mode='tasknolist')
BEGIN
    SET @SQL='
        IF OBJECT_ID(''tempdb..#task_task_'+@RandomNo+''') IS NOT NULL 
            DROP TABLE #task_task_'+@RandomNo+';

        SELECT 
             taskid,
             ISNULL(taskname, '''') AS modulename
        INTO #task_task_'+@RandomNo+'
        FROM ['+@DBNAME+'].dbo.task_task WITH (NOLOCK)
        WHERE [parentid]=0
        OR [parentid] IS NULL
        ;

        CREATE CLUSTERED INDEX IX_taskid 
        ON #task_task_'+@RandomNo+'(taskid);

        SELECT 
            t.*,            
            ISNULL(r.modulename, '''') AS modulename
        FROM ['+@DBNAME+'].dbo.task_task t WITH (NOLOCK)
        LEFT JOIN #task_task_'+@RandomNo+' r WITH (NOLOCK)
            ON t.RootTaskId = r.taskid
        WHERE t.taskno<>''''
        AND t.taskno IS NOT NULL
        ;

        IF OBJECT_ID(''tempdb..#task_task_'+@RandomNo+''') IS NOT NULL 
            DROP TABLE #task_task_'+@RandomNo+';
    '

    PRINT (@SQL)
    EXEC (@SQL);
END
ELSE IF(isnull(@mode,'')='CLEAR_FULL_ITASK')
BEGIN
	SET @SQL='
		truncate table ['+@DBNAME+'].[dbo].[QuickTasks]
		truncate table ['+@DBNAME+'].[dbo].[QuickTasks_Archive]
		truncate table ['+@DBNAME+'].[dbo].[task_attachement]
		truncate table ['+@DBNAME+'].[dbo].[task_comment]
		truncate table ['+@DBNAME+'].[dbo].[task_descr]
		truncate table ['+@DBNAME+'].[dbo].[task_descr_trash]
		--truncate table ['+@DBNAME+'].[dbo].[task_emprole]
		truncate table ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind]
		truncate table ['+@DBNAME+'].[dbo].[task_filterattr]
		truncate table ['+@DBNAME+'].[dbo].[task_filtergroup]
		truncate table ['+@DBNAME+'].[dbo].[task_filtermaingroup]
		truncate table ['+@DBNAME+'].[dbo].[task_maintenance]
		truncate table ['+@DBNAME+'].[dbo].[task_meeting]
		truncate table ['+@DBNAME+'].[dbo].[task_meeting_accept_reject]
		truncate table ['+@DBNAME+'].[dbo].[task_meeting_accept_reject_archive]
		truncate table ['+@DBNAME+'].[dbo].[task_meeting_archive]
		truncate table ['+@DBNAME+'].[dbo].[task_department]
		truncate table ['+@DBNAME+'].[dbo].[task_task]
		truncate table ['+@DBNAME+'].[dbo].[task_task_filter]
		truncate table ['+@DBNAME+'].[dbo].[task_trash]
		truncate table ['+@DBNAME+'].[dbo].[TaskManagement_Task]
		truncate table ['+@DBNAME+'].[dbo].[TaskManagement_Task_Log]
	'
	print (@SQL)
	exec (@SQL)
	
	--select * from task_priority
	--select * from task_project
	--select * from task_secstatus
	--select * from task_status
	--select * from Task_Status_master
	--select * from task_user_task_bind
	--select * from task_work_category
	--select * from task_workcategory
	--select * from task_workspace
	--select * from TaskManagement_TaskStatus
END

ELSE IF(@mode='TREELIST_FULLPATH')
BEGIN
		IF(@OrderBy='')
		BEGIN
			SET @OrderBy='order by FullPath asc'
		END

		IF(@PageSize=0)
		BEGIN
			SET @PageSize=100
		END
		
		IF(@CurrentPage=0)
		BEGIN
		 SET @CurrentPage=1
		END

		set @WhereClause=' WHERE FullPath<>'''' ';


	
		if(@startdatefrom<>'' and @startdateto<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause, ' and [StartDate] Between '''+@startdatefrom+' 00:00:00''  And '''+@startdateto+' 23:59:59''');
		END

		print concat('@dueDateFrom :',@dueDateFrom)
		print concat('@dueDateTo :',@dueDateTo)
		print'this is duedate23'
		if(@dueDateFrom<>'' and @dueDateTo<>'')
		BEGIN
			print'this is duedate'
			set @WhereClause=concat(@WhereClause,' and [DeadLineDate] Between '''+@dueDateFrom+' 00:00:00''  And '''+@dueDateTo+' 23:59:59''');
		END

		if(@statusid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [statusid] ='+convert(nvarchar(50),@statusid)+'  ');
		END

		if(@priorityid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [priorityid] ='+convert(nvarchar(50),@priorityid)+'  ');
		END

		if(@assigneeid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [assigneids] in ('''+convert(nvarchar(50),@assigneeid)+''')  ');
		END

		if(@workcategoryid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [workcategoryid] ='+convert(nvarchar(50),@workcategoryid)+'  ');
		END

		if(@search<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [FullPath] like ''%'+convert(nvarchar(50),@search)+'%''  ');
		END

		if(@moduleid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and isnull([RootTaskId],0) ='+convert(nvarchar(50),@moduleid)+'  ');
		END

		if(@isCompleted=0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and isnull([statusid],0) not in (select id from ['+@DBNAME+'].[dbo].task_status where labelname=''Completed'')');
		END
		if(@PageSize<>-1 and @CurrentPage<>-1)
		begin
			SET @UpperBand=0;
			SET @LowerBand=0;
		
			SET @LowerBand  = (@CurrentPage - 1) * @PageSize
			SET @UpperBand  = (@CurrentPage * @PageSize) + 1
			set @SQL='
				;WITH dvtbl AS 
					(
						select 
							 [id],[FullPath],[taskid],[projectid],[entrydate]
							,[taskname],[StartDate],[estimate_hrs],[DeadLineDate],[priorityid]
							,[statusid],[workcategoryid],[departmentid],[parentid],[isFreez]
							,[progress_per],[ismilestone],[isfavourite],[isnew],[isburning]
							,[estimate1_hrs],[estimate2_hrs],[ticketno],[assigneids],[createdbyid]
							,[workinghr],[maingroupids],[maintaskid],[EndDate],[secstatusid]
							,[bindedMainGroupid],[taskno],[Completion_timestamp],[isfromadminapp],[maintenanceno]
							,[print_count],[levelid],[direct_childcount],ISNULL(RootTaskId,0) as RootTaskId
						FROM ['+@DBNAME+'].[dbo].[task_task_fullpath] WITH (NOLOCK)
						'+@WhereClause+'
					)
					---------------------
					select 
						a.* 
					from 
					(
						Select 
							 total.icount AS icount					
							,ROW_NUMBER () over ('+ @OrderBy +') as SrNo					
							,dvtbl.*
						FROM dvtbl
						CROSS JOIN (
							SELECT 
								Count(id) AS icount
							FROM dvtbl) AS total 
					)  as a	
					Where a.SrNo >  '+ convert(nvarchar(max),@LowerBand) + ' 
					AND a.SrNo < ' + convert(nvarchar(max),@UpperBand) + '			
				'
			print(@SQL)
			EXEC(@SQL)

		end
END

ELSE IF(@mode='DOCESTIMATE')
BEGIN
		IF(@OrderBy='')
		BEGIN
			SET @OrderBy='order by StDate desc'
		END

		IF(@PageSize=0)
		BEGIN
			SET @PageSize=100
		END
		
		IF(@CurrentPage=0)
		BEGIN
		 SET @CurrentPage=1
		END

		set @WhereClause=' WHERE StDate IS NOT NULL ';


	
		if(@startdatefrom<>'' and @startdateto<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause, ' and [StDate] Between '''+@startdatefrom+' 00:00:00''  And '''+@startdateto+' 23:59:59''');
		END

		--print concat('@dueDateFrom :',@dueDateFrom)
		--print concat('@dueDateTo :',@dueDateTo)
		--print'this is duedate23'
		--if(@dueDateFrom<>'' and @dueDateTo<>'')
		--BEGIN
		--	print'this is duedate'
		--	set @WhereClause=concat(@WhereClause,' and [DeadLineDate] Between '''+@dueDateFrom+' 00:00:00''  And '''+@dueDateTo+' 23:59:59''');
		--END

		if(@Seniourid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and A.[Seniourid] ='+convert(nvarchar(50),@Seniourid)+'  ');
		END

		if(@Empid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and A.[Empid] ='+convert(nvarchar(50),@Empid)+'  ');
		END

		if(@search<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause,' and ( A.[taskno] like ''%'+convert(nvarchar(50),@search)+'%'' or A.[tasktitle] like ''%'+convert(nvarchar(50),@search)+'%'')  ');
		END
		if(@PageSize<>-1 and @CurrentPage<>-1)
		begin
			SET @UpperBand=0;
			SET @LowerBand=0;
		
			SET @LowerBand  = (@CurrentPage - 1) * @PageSize
			SET @UpperBand  = (@CurrentPage * @PageSize) + 1
			set @SQL='
				;WITH dvtbl AS 
				(
					SELECT 
						A.id,
						A.EstDate,
						A.StDate,
						A.EndDate,
						A.taskno,
						A.tasktitle,
						A.Seniourid,
						''('' + B.customercode + '') '' + B.firstname + '' '' + B.lastname AS SeniourName,
						A.Empid,
						''('' + C.customercode + '') '' + C.firstname + '' '' + C.lastname AS EmpName,
						A.SrEst,
						A.TrainingEst,
						A.DocEst,
						A.CodeEst,
						A.PreviewEst,
						A.PatchEst,
						A.CloneEst,
						A.EmpEst,
						A.Result,
						ISNULL(A.ActualHr, 0) AS ActualHr,
						A.actualResult
					FROM ['+@DBNAME+'].dbo.task_DocEstimate AS A
					LEFT JOIN ['+@DBNAME+'].dbo.Usermanagement_systemloginmaster AS B WITH (INDEX(IX_systemloginmaster_id))
						ON A.Seniourid = B.id
					LEFT JOIN ['+@DBNAME+'].dbo.Usermanagement_systemloginmaster AS C WITH (INDEX(IX_systemloginmaster_id))
						ON A.Empid = C.id
					'+@WhereClause+'
					)
					---------------------
					select 
						a.* 
					from 
					(
						Select 
							 total.icount AS icount					
							,ROW_NUMBER () over ('+ @OrderBy +') as SrNo					
							,dvtbl.*
						FROM dvtbl
						CROSS JOIN (
							SELECT 
								Count(id) AS icount
							FROM dvtbl) AS total 
					)  as a	
					Where a.SrNo >  '+ convert(nvarchar(max),@LowerBand) + ' 
					AND a.SrNo < ' + convert(nvarchar(max),@UpperBand) + '			
				'
			print(@SQL)
			EXEC(@SQL)

		end
END

ELSE IF(@mode='TREELIST_TODAY')
BEGIN
		

		set @WhereClause=' WHERE 1=1 ';
	
		if(@startdatefrom<>'' and @startdateto<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause, ' and T.[StartDate] Between '''+@startdatefrom+' 00:00:00''  And '''+@startdateto+' 23:59:59''');
		END

		print concat('@dueDateFrom :',@dueDateFrom)
		print concat('@dueDateTo :',@dueDateTo)
		
		if(@dueDateFrom<>'' and @dueDateTo<>'')
		BEGIN			
			set @WhereClause=concat(@WhereClause,' and T.[DeadLineDate] Between '''+@dueDateFrom+' 00:00:00''  And '''+@dueDateTo+' 23:59:59''');
		END

		if(@statusid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and T.[statusid] ='+convert(nvarchar(50),@statusid)+'  ');
		END

		if(@priorityid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and T.[priorityid] ='+convert(nvarchar(50),@priorityid)+'  ');
		END

		if(@assigneeid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and T.[assigneids] in ('''+convert(nvarchar(50),@assigneeid)+''')  ');
		END

		if(@workcategoryid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and T.[workcategoryid] ='+convert(nvarchar(50),@workcategoryid)+'  ');
		END

		if(@search<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause,' and T.[taskname] like ''%'+convert(nvarchar(50),@search)+'%''  ');
		END
		
			
		set @SQL='
				SELECT TOP (100)
					T.taskid,
					T.projectid,
					T.entrydate,
					T.taskname,
					T.StartDate,
					T.estimate_hrs,
					T.DeadLineDate,
					T.priorityid,
					T.statusid,
					T.workcategoryid,
					T.departmentid,
					T.parentid,
					T.isFreez,
					T.progress_per,
					T.ismilestone,
					T.isfavourite,
					T.isnew,
					T.isburning,
					T.estimate1_hrs,
					T.estimate2_hrs,
					T.ticketno,
					T.assigneids,
					T.createdbyid,
					T.workinghr,
					T.maingroupids,
					T.maintaskid,
					T.EndDate,
					T.secstatusid,
					T.bindedMainGroupid,
					T.taskno,
					T.Completion_timestamp,
					T.isfromadminapp,
					T.maintenanceno,
					T.print_count,
					T.levelid,
					T.direct_childcount,
					T.RootTaskId,
					T.readonlyids,
					T.isfulllistcalculated,
					ISNULL(D.[descr], '''') AS [descr],
					ISNULL(R.taskname, '''') AS roottaskname,
					ISNULL(P.taskname, '''') AS Parenttaskname
				FROM ['+@DBNAME+'].[dbo].task_task AS T WITH (NOLOCK)
				LEFT JOIN ['+@DBNAME+'].[dbo].task_task AS R WITH (NOLOCK)
					ON T.RootTaskId = R.taskid
				LEFT JOIN ['+@DBNAME+'].[dbo].task_task AS P WITH (NOLOCK)
					ON T.parentid = P.taskid
				LEFT JOIN ['+@DBNAME+'].[dbo].task_descr AS D WITH (NOLOCK)
					ON T.taskid = D.taskid
				'+@WhereClause+'
				ORDER BY T.taskid DESC;				
			'
		print(@SQL)
		EXEC(@SQL)

		
END


ELSE IF(isnull(@mode,'')='QUICKLIST')
BEGIN
	DECLARE 
		@_ISADMIN as INT=0
		,@_loginid as int=0
	;

	SET @SQL='	
		SELECT TOP(1)
			@_ISADMIN=IIF(ISNULL(mastermanagement_roleid,0)=3 and designation=''admin'',1,0)
			,@_loginid=id
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] U WITH (NOLOCK)
		WHERE U.userid = ''' + @appuserid + '''
	'
		print(@SQL)
		EXEC SP_EXECUTESQL 
			@SQL, N'@_ISADMIN INT OUTPUT
				,@_loginid INT OUTPUT'
				,@_ISADMIN OUTPUT
				,@_loginid OUTPUT

		PRINT concat('@_ISADMIN :',@_ISADMIN)
		PRINT concat('@_loginid :',@_loginid)

		SET @_ISADMIN=1

	SET @SQLASSIGNEE='
			--IF OBJECT_ID(''tempdb..#ASSIGNEELIST_'+@RandomNo+''') IS NOT NULL DROP TABLE #ASSIGNEELIST_'+@RandomNo+';
			IF OBJECT_ID(''tempdb..#task_descr_'+@RandomNo+''') IS NOT NULL DROP TABLE #task_descr_'+@RandomNo+';

			--SELECT 
			--	taskid
			--	,STRING_AGG(systemloginid, '','') AS assigneeids
			--into #ASSIGNEELIST_'+@RandomNo+'
			--FROM ['+@DBNAME+'].[dbo].task_user_task_bind WITH (NOLOCK)
			--WHERE ISNULL(systemloginid, 0)<>0
			--GROUP BY taskid

		'
		

		if(@taskid>0)
		BEGIN
				SET @SQL = '
					DECLARE 
						 @G1 AS NVARCHAR(100)=''''
						,@G2 AS NVARCHAR(100)=''''
						,@G3 AS NVARCHAR(100)=''''
						,@G4 AS NVARCHAR(100)=''''
						,@G5 AS NVARCHAR(100)=''''
						,@G6 AS NVARCHAR(100)=''''
						,@G7 AS NVARCHAR(100)=''''
						,@G8 AS NVARCHAR(100)=''''
						,@G9 AS NVARCHAR(100)=''''
						,@G10 AS NVARCHAR(100)=''''
						,@G11 AS NVARCHAR(100)=''''
						,@G12 AS NVARCHAR(100)=''''
						,@G13 AS NVARCHAR(100)=''''
						,@G14 AS NVARCHAR(100)=''''
						,@G15 AS NVARCHAR(100)=''''
						,@G16 AS NVARCHAR(100)=''''
						,@G17 AS NVARCHAR(100)=''''
						,@G18 AS NVARCHAR(100)=''''
						,@G19 AS NVARCHAR(100)=''''
						,@G20 AS NVARCHAR(100)=''''
						,@G21 AS NVARCHAR(100)=''''
						,@G22 AS NVARCHAR(100)=''''
						,@G23 AS NVARCHAR(100)=''''
						,@G24 AS NVARCHAR(100)=''''
						,@G25 AS NVARCHAR(100)=''''
					;

					create table #filtergrouplist(
						filtergroupid int
					)
					insert into #filtergrouplist
					select distinct filtergroupid 
					from ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind] with (nolock)
					where filtermaingroupid in (
						SELECT value AS maingroupid
						FROM ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)
						CROSS APPLY STRING_SPLIT(maingroupids, '','')
						WHERE taskID = '+convert(nvarchar(20),@taskid)+'
					);

					WITH CTE AS (
						SELECT 
							G.filtergroup					
							,G.id AS rn
						FROM ['+@DBNAME+'].[dbo].[task_filtergroup] as G WITH (NOLOCK) 
						INNER JOIN #filtergrouplist as F WITH (NOLOCK)
						ON G.[id]=F.filtergroupid
					)
					SELECT
						 @G1 = MAX(CASE WHEN rn = 1 THEN filtergroup END)
						,@G2 = MAX(CASE WHEN rn = 2 THEN filtergroup END)
						,@G3 = MAX(CASE WHEN rn = 3 THEN filtergroup END)
						,@G4 = MAX(CASE WHEN rn = 4 THEN filtergroup END)
						,@G5 = MAX(CASE WHEN rn = 5 THEN filtergroup END)
						,@G6 = MAX(CASE WHEN rn = 6 THEN filtergroup END)
						,@G7 = MAX(CASE WHEN rn = 7 THEN filtergroup END)
						,@G8 = MAX(CASE WHEN rn = 8 THEN filtergroup END)
						,@G9 = MAX(CASE WHEN rn = 9 THEN filtergroup END)
						,@G10 = MAX(CASE WHEN rn = 10 THEN filtergroup END)
						,@G11 = MAX(CASE WHEN rn = 11 THEN filtergroup END)
						,@G12 = MAX(CASE WHEN rn = 12 THEN filtergroup END)
						,@G13 = MAX(CASE WHEN rn = 13 THEN filtergroup END)
						,@G14 = MAX(CASE WHEN rn = 14 THEN filtergroup END)
						,@G15 = MAX(CASE WHEN rn = 15 THEN filtergroup END)
						,@G16 = MAX(CASE WHEN rn = 16 THEN filtergroup END)
						,@G17 = MAX(CASE WHEN rn = 17 THEN filtergroup END)
						,@G18 = MAX(CASE WHEN rn = 18 THEN filtergroup END)
						,@G19 = MAX(CASE WHEN rn = 19 THEN filtergroup END)
						,@G20 = MAX(CASE WHEN rn = 20 THEN filtergroup END)
						,@G21 = MAX(CASE WHEN rn = 21 THEN filtergroup END)
						,@G22 = MAX(CASE WHEN rn = 22 THEN filtergroup END)
						,@G23 = MAX(CASE WHEN rn = 23 THEN filtergroup END)
						,@G24 = MAX(CASE WHEN rn = 24 THEN filtergroup END)
						,@G25 = MAX(CASE WHEN rn = 25 THEN filtergroup END)	
					FROM CTE;

			  '
		  END
		  ELSE
		  BEGIN

				SET @SQL = '
				DECLARE @G1 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=1),'''')
					, @G2 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=2),'''')
					, @G3 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=3),'''')
					, @G4 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=4),'''')
					, @G5 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=5),'''')
					, @G6 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=6),'''')
					, @G7 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=7),'''')
					, @G8 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=8),'''')
					, @G9 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=9),'''')
					, @G10 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=10),'''')
					, @G11 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=11),'''')
					, @G12 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=12),'''')
					, @G13 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=13),'''')
					, @G14 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=14),'''')
					, @G15 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=15),'''')
					, @G16 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=16),'''')
					, @G17 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=17),'''')
					, @G18 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=18),'''')
					, @G19 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=19),'''')
					, @G20 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=20),'''')
					, @G21 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=21),'''')
					, @G22 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=22),'''')
					, @G23 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=23),'''')
					, @G24 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=24),'''')
					, @G25 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=25),'''')
					'
		END


	SET @SQL1 = '
	SELECT
		 lower(''id'') as [1]
		,lower(''taskno'') AS [2]
		,lower(''taskname'') as [3]
		,lower(''Assignee'') as [4]
		,lower(''estimate_hrs'') as [5]
		,lower(''working_hr'') as [6]
		,lower(''DeadLine'') as [7]
		,lower(''Start_Date'') as [8]
		,lower(''workcategoryid'') AS [9]
		,lower(''statusid'') AS [10]
		,lower(''createdbyid'') AS [11]
		,IIF(@G1<>'''',lower(@G1),''G1'') as [12]
		,IIF(@G2<>'''',lower(@G2),''G2'') as [13]
		,IIF(@G3<>'''',lower(@G3),''G3'') as [14]
		,IIF(@G4<>'''',lower(@G4),''G4'') as [15]
		,IIF(@G5<>'''',lower(@G5),''G5'') as [16]
		,IIF(@G6<>'''',lower(@G6),''G6'') as [17]
		,IIF(@G7<>'''',lower(@G7),''G7'') as [18]
		,IIF(@G8<>'''',lower(@G8),''G8'') as [19]
		,IIF(@G9<>'''',lower(@G9),''G9'') as [20]
		,IIF(@G10<>'''',lower(@G10),''G10'') as [21]
		,IIF(@G11<>'''',lower(@G11),''G11'') as [22]
		,IIF(@G12<>'''',lower(@G12),''G12'') as [23]
		,IIF(@G13<>'''',lower(@G13),''G13'') as [24]
		,IIF(@G14<>'''',lower(@G14),''G14'') as [25]
		,IIF(@G15<>'''',lower(@G15),''G15'') as [26]
		,IIF(@G16<>'''',lower(@G16),''G16'') as [27]
		,IIF(@G17<>'''',lower(@G17),''G17'') as [28]
		,IIF(@G18<>'''',lower(@G18),''G18'') as [29]
		,IIF(@G19<>'''',lower(@G19),''G19'') as [30]
		,IIF(@G20<>'''',lower(@G20),''G20'') as [31]
		,IIF(@G21<>'''',lower(@G21),''G21'') as [32]
		,IIF(@G22<>'''',lower(@G22),''G22'') as [33]
		,IIF(@G23<>'''',lower(@G23),''G23'') as [34]
		,IIF(@G24<>'''',lower(@G24),''G24'') as [35]
		,IIF(@G25<>'''',lower(@G25),''G25'') as [36]

'
	IF(@taskid=0)
	BEGIN
		IF(ISNULL(@_ISADMIN,0)=1)
		BEGIN
		SET @SQL2='select 
				 T.taskid AS [1]
				,ISNULL(T.taskno,0) AS [2]
				,T.taskname AS [3]
				,T.assigneids AS [4]
				,T.estimate_hrs AS [5]
				,T.workinghr AS [6]
				,T.DeadLineDate AS [7]
				,T.StartDate as [8]
				,T.statusid as [9]
				,T.createdbyid as [10]
				,ISNULL(T.workcategoryid,0) AS [11]
				,ISNULL(F.group1_attr,0) AS [12]	
				,ISNULL(F.group2_attr,0) AS [13]	
				,ISNULL(F.group3_attr,0) AS [14]	
				,ISNULL(F.group4_attr,0) AS [15]	
				,ISNULL(F.group5_attr,0) AS [16]	
				,ISNULL(F.group6_attr,0) AS [17]	
				,ISNULL(F.group7_attr,0) AS [18]	
				,ISNULL(F.group8_attr,0) AS [19]	
				,ISNULL(F.group9_attr,0) AS [20]	
				,ISNULL(F.group10_attr,0) AS [21]	
				,ISNULL(F.group11_attr,0) AS [22]	
				,ISNULL(F.group12_attr,0) AS [23]	
				,ISNULL(F.group13_attr,0) AS [24] 	
				,ISNULL(F.group14_attr,0) AS [25]	
				,ISNULL(F.group15_attr,0) AS [26]	
				,ISNULL(F.group16_attr,0) AS [27]	
				,ISNULL(F.group17_attr,0) AS [28]	
				,ISNULL(F.group18_attr,0) AS [29]	
				,ISNULL(F.group19_attr,0) AS [30]	
				,ISNULL(F.group20_attr,0) AS [31]	
				,ISNULL(F.group21_attr,0) AS [32]	
				,ISNULL(F.group22_attr,0) AS [33]	
				,ISNULL(F.group23_attr,0) AS [34]	
				,ISNULL(F.group24_attr,0) AS [35]	
				,ISNULL(F.group25_attr,0) AS [36]
				from ['+@DBNAME+'].dbo.task_task AS T WITH (NOLOCK) 
				LEFT OUTER JOIN ['+@DBNAME+'].dbo.task_task_filter AS F WITH (NOLOCK)
				ON T.taskid=F.taskid
				--LEFT OUTER JOIN (
				--	SELECT taskid
				--		,assigneeids as Assigneeid
				--	FROM #ASSIGNEELIST_'+@RandomNo+'
				--) as U 
				--ON T.[taskid]=U.[taskid]				
				WHERE ISNULL(T.taskname,'''')<>''''

				--IF OBJECT_ID(''tempdb..#ASSIGNEELIST_'+@RandomNo+''') IS NOT NULL DROP TABLE #ASSIGNEELIST_'+@RandomNo+';
			
				'
	END
		ELSE
		BEGIN
		SET @SQL2='
			select 
				 T.taskid AS [1]
				,ISNULL(T.taskno,0) AS [2]
				,T.taskname AS [3]
				,T.assigneids AS [4]
				,T.estimate_hrs AS [5]
				,T.workinghr AS [6]
				,T.DeadLineDate AS [7]
				,T.StartDate as [8]
				,T.statusid as [9]
				,T.createdbyid as [10]
				,ISNULL(T.workcategoryid,0) AS [11]
				,ISNULL(F.group1_attr,0) AS [12]	
				,ISNULL(F.group2_attr,0) AS [13]	
				,ISNULL(F.group3_attr,0) AS [14]	
				,ISNULL(F.group4_attr,0) AS [15]	
				,ISNULL(F.group5_attr,0) AS [16]	
				,ISNULL(F.group6_attr,0) AS [17]	
				,ISNULL(F.group7_attr,0) AS [18]	
				,ISNULL(F.group8_attr,0) AS [19]	
				,ISNULL(F.group9_attr,0) AS [20]	
				,ISNULL(F.group10_attr,0) AS [21]	
				,ISNULL(F.group11_attr,0) AS [22]	
				,ISNULL(F.group12_attr,0) AS [23]	
				,ISNULL(F.group13_attr,0) AS [24] 	
				,ISNULL(F.group14_attr,0) AS [25]	
				,ISNULL(F.group15_attr,0) AS [26]	
				,ISNULL(F.group16_attr,0) AS [27]	
				,ISNULL(F.group17_attr,0) AS [28]	
				,ISNULL(F.group18_attr,0) AS [29]	
				,ISNULL(F.group19_attr,0) AS [30]	
				,ISNULL(F.group20_attr,0) AS [31]	
				,ISNULL(F.group21_attr,0) AS [32]	
				,ISNULL(F.group22_attr,0) AS [33]	
				,ISNULL(F.group23_attr,0) AS [34]	
				,ISNULL(F.group24_attr,0) AS [35]	
				,ISNULL(F.group25_attr,0) AS [36]
				from ['+@DBNAME+'].dbo.task_task AS T WITH (NOLOCK) 
				LEFT OUTER JOIN ['+@DBNAME+'].dbo.task_task_filter AS F WITH (NOLOCK)
				ON T.taskid=F.taskid
				--LEFT OUTER JOIN (
				--	SELECT taskid
				--		,assigneeids as Assigneeid
				--	FROM #ASSIGNEELIST_'+@RandomNo+'
				--) as U 
				--ON T.[taskid]=U.[taskid]				
				WHERE ISNULL(T.taskname,'''')<>''''
				and T.taskid in (
						select taskid 
						from ['+@DBNAME+'].[dbo].[task_user_task_bind] WITH (NOLOCK) 
						where systemloginid='+convert(nvarchar(10),@_loginid)+'
						--union all
						--select taskid 
						--from ['+@DBNAME+'].[dbo].task_emprole WITH (NOLOCK)
						--where assigneeid='+convert(nvarchar(10),@_loginid)+'
						UNION 
						SELECT taskid
						FROM ['+@DBNAME+'].[dbo].task_task 
						WHERE createdbyid='+convert(nvarchar(10),@_loginid)+'
					)
				--IF OBJECT_ID(''tempdb..#ASSIGNEELIST_'+@RandomNo+''') IS NOT NULL DROP TABLE #ASSIGNEELIST_'+@RandomNo+';
			
				'
		END
	END
	ELSE
	BEGIN
	IF(@taskid<>0)
		BEGIN
		IF(ISNULL(@_ISADMIN,0)=1)
		BEGIN
		SET @SQL2=';WITH TaskTree AS (
					    -- Anchor member
					    SELECT 
					        T.taskid,
					        T.parentid,
					        ISNULL(T.taskno, 0) AS taskno,
					        T.taskname,
					        T.estimate_hrs,
					        T.workinghr,
					        T.DeadLineDate,
					        T.StartDate,
					        ISNULL(T.workcategoryid, 0) AS workcategoryid,
							ISNULL(T.statusid,0) as statusid,
							ISNULL(T.createdbyid,0) as createdbyid,
							T.assigneids
					    FROM ['+@DBNAME+'].dbo.task_task AS T WITH (NOLOCK)
					    WHERE ISNULL(T.taskname, '''') <> ''''
					      AND ISNULL(T.taskid,0) = '+convert(nvarchar(20),@taskid)+'
					
					    UNION ALL
					
					    SELECT 
					        T.taskid,
					        T.parentid,
					        ISNULL(T.taskno, 0),
					        T.taskname,
					        T.estimate_hrs,
					        T.workinghr,
					        T.DeadLineDate,
					        T.StartDate,
					        ISNULL(T.workcategoryid, 0),
							ISNULL(T.statusid,0) as statusid,
							ISNULL(T.createdbyid,0) as createdbyid,
							T.assigneids
					    FROM ['+@DBNAME+'].dbo.task_task AS T WITH (NOLOCK)
					    INNER JOIN TaskTree tt 
						ON t.parentid = tt.taskid
					)
				'
		END
		ELSE
		BEGIN
			SET @SQL2=';WITH TaskTree AS (
					    -- Anchor member
					    SELECT 
					        T.taskid,
					        T.parentid,
					        ISNULL(T.taskno, 0) AS taskno,
					        T.taskname,
					        T.estimate_hrs,
					        T.workinghr,
					        T.DeadLineDate,
					        T.StartDate,
					        ISNULL(T.workcategoryid, 0) AS workcategoryid,
							ISNULL(T.statusid,0) as statusid,
							ISNULL(T.createdbyid,0) as createdbyid,
							T.assigneids
					    FROM ['+@DBNAME+'].dbo.task_task AS T WITH (NOLOCK)
					    WHERE ISNULL(T.taskname, '''') <> ''''
					    AND ISNULL(T.parentid,0) = '+convert(nvarchar(20),@taskid)+'
						and T.taskid in (
							select taskid 
							from ['+@DBNAME+'].[dbo].[task_user_task_bind] WITH (NOLOCK) 
							where systemloginid='+convert(nvarchar(10),@_loginid)+'
							--union all
							--select taskid 
							--from ['+@DBNAME+'].[dbo].task_emprole WITH (NOLOCK)
							--where assigneeid='+convert(nvarchar(10),@_loginid)+'
							UNION 
							SELECT taskid
							FROM ['+@DBNAME+'].[dbo].task_task 
							WHERE createdbyid='+convert(nvarchar(10),@_loginid)+'
						)
					)
				'
		END
		BEGIN
		SET @SQL3='SELECT 
				R.taskid AS [1]
				,R.taskno AS [2]
				,R.taskname AS [3]
				,R.assigneids AS [4]
				,R.estimate_hrs AS [5]
				,R.workinghr AS [6]
				,R.DeadLineDate AS [7]
				,R.StartDate AS [8]
				,R.workcategoryid AS [9]
				,R.statusid as [10]
				,R.createdbyid as [11]
				,ISNULL(F.group1_attr,0) AS [12]	
				,ISNULL(F.group2_attr,0) AS [13]	
				,ISNULL(F.group3_attr,0) AS [14]	
				,ISNULL(F.group4_attr,0) AS [15]	
				,ISNULL(F.group5_attr,0) AS [16]	
				,ISNULL(F.group6_attr,0) AS [17]	
				,ISNULL(F.group7_attr,0) AS [18]	
				,ISNULL(F.group8_attr,0) AS [19]	
				,ISNULL(F.group9_attr,0) AS [20]	
				,ISNULL(F.group10_attr,0) AS [21]	
				,ISNULL(F.group11_attr,0) AS [22]	
				,ISNULL(F.group12_attr,0) AS [23]	
				,ISNULL(F.group13_attr,0) AS [24] 	
				,ISNULL(F.group14_attr,0) AS [25]	
				,ISNULL(F.group15_attr,0) AS [26]	
				,ISNULL(F.group16_attr,0) AS [27]	
				,ISNULL(F.group17_attr,0) AS [28]	
				,ISNULL(F.group18_attr,0) AS [29]	
				,ISNULL(F.group19_attr,0) AS [30]	
				,ISNULL(F.group20_attr,0) AS [31]	
				,ISNULL(F.group21_attr,0) AS [32]	
				,ISNULL(F.group22_attr,0) AS [33]	
				,ISNULL(F.group23_attr,0) AS [34]	
				,ISNULL(F.group24_attr,0) AS [35]	
				,ISNULL(F.group25_attr,0) AS [36]
			FROM TaskTree R
			LEFT JOIN ['+@DBNAME+'].dbo.task_task_filter AS F WITH (NOLOCK)
			    ON R.taskid = F.taskid
			--LEFT OUTER JOIN (
			--	SELECT taskid
			--		,assigneeids as Assigneeid
			--	FROM #ASSIGNEELIST_'+@RandomNo+'
			--) as U 
			--ON R.[taskid]=U.[taskid]

			--IF OBJECT_ID(''tempdb..#ASSIGNEELIST_'+@RandomNo+''') IS NOT NULL DROP TABLE #ASSIGNEELIST_'+@RandomNo+';
			
				'
		END
		END
	END


	PRINT(@SQLASSIGNEE)		
	PRINT(@SQL)
	PRINT(@SQL1)
	PRINT(@SQL2)
	PRINT(@SQL3)

	EXEC(@SQLASSIGNEE+@SQL+@SQL1+@SQL2+@SQL3)
END


IF(isnull(@mode,'')='Quicklist_filter')
BEGIN
	SET @SQL = '
	DECLARE @G1 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=1),'''')
		, @G2 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=2),'''')
		, @G3 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=3),'''')
		, @G4 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=4),'''')
		, @G5 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=5),'''')
		, @G6 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=6),'''')
		, @G7 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=7),'''')
		, @G8 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=8),'''')
		, @G9 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=9),'''')
		, @G10 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=10),'''')
		, @G11 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=11),'''')
		, @G12 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=12),'''')
		, @G13 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=13),'''')
		, @G14 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=14),'''')
		, @G15 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=15),'''')
		, @G16 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=16),'''')
		, @G17 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=17),'''')
		, @G18 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=18),'''')
		, @G19 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=19),'''')
		, @G20 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=20),'''')
		, @G21 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=21),'''')
		, @G22 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=22),'''')
		, @G23 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=23),'''')
		, @G24 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=24),'''')
		, @G25 AS NVARCHAR(100)=ISNULL((SELECT  [filtergroup] FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK) WHERE [id]=25),'''')
		'
	SET @SQL1 = '
	SELECT
		 lower(''id'') as [1]
		,IIF(@G1<>'''',lower(@G1),''G1'') as [2]
		,IIF(@G2<>'''',lower(@G2),''G2'') as [3]
		,IIF(@G3<>'''',lower(@G3),''G3'') as [4]
		,IIF(@G4<>'''',lower(@G4),''G4'') as [5]
		,IIF(@G5<>'''',lower(@G5),''G5'') as [6]
		,IIF(@G6<>'''',lower(@G6),''G6'') as [7]
		,IIF(@G7<>'''',lower(@G7),''G7'') as [8]
		,IIF(@G8<>'''',lower(@G8),''G8'') as [9]
		,IIF(@G9<>'''',lower(@G9),''G9'') as [10]
		,IIF(@G10<>'''',lower(@G10),''G10'') as [11]
		,IIF(@G11<>'''',lower(@G11),''G11'') as [12]
		,IIF(@G12<>'''',lower(@G12),''G12'') as [13]
		,IIF(@G13<>'''',lower(@G13),''G13'') as [14]
		,IIF(@G14<>'''',lower(@G14),''G14'') as [15]
		,IIF(@G15<>'''',lower(@G15),''G15'') as [16]
		,IIF(@G16<>'''',lower(@G16),''G16'') as [17]
		,IIF(@G17<>'''',lower(@G17),''G17'') as [18]
		,IIF(@G18<>'''',lower(@G18),''G18'') as [19]
		,IIF(@G19<>'''',lower(@G19),''G19'') as [20]
		,IIF(@G20<>'''',lower(@G20),''G20'') as [21]
		,IIF(@G21<>'''',lower(@G21),''G21'') as [22]
		,IIF(@G22<>'''',lower(@G22),''G22'') as [23]
		,IIF(@G23<>'''',lower(@G23),''G23'') as [24]
		,IIF(@G24<>'''',lower(@G24),''G24'') as [25]
		,IIF(@G25<>'''',lower(@G25),''G25'') as [26]
		,lower(''bindedMainGroupid'') as [27]
'

	SET @SQL2='select 
			 T.taskid AS [1]
			,ISNULL(F.group1_attr,0) AS [2]	
			,ISNULL(F.group2_attr,0) AS [3]	
			,ISNULL(F.group3_attr,0) AS [4]	
			,ISNULL(F.group4_attr,0) AS [5]	
			,ISNULL(F.group5_attr,0) AS [6]	
			,ISNULL(F.group6_attr,0) AS [7]	
			,ISNULL(F.group7_attr,0) AS [8]	
			,ISNULL(F.group8_attr,0) AS [9]	
			,ISNULL(F.group9_attr,0) AS [10]	
			,ISNULL(F.group10_attr,0) AS [11]	
			,ISNULL(F.group11_attr,0) AS [12]	
			,ISNULL(F.group12_attr,0) AS [13]	
			,ISNULL(F.group13_attr,0) AS [14] 	
			,ISNULL(F.group14_attr,0) AS [15]	
			,ISNULL(F.group15_attr,0) AS [16]	
			,ISNULL(F.group16_attr,0) AS [17]	
			,ISNULL(F.group17_attr,0) AS [18]	
			,ISNULL(F.group18_attr,0) AS [19]	
			,ISNULL(F.group19_attr,0) AS [20]	
			,ISNULL(F.group20_attr,0) AS [21]	
			,ISNULL(F.group21_attr,0) AS [22]	
			,ISNULL(F.group22_attr,0) AS [23]	
			,ISNULL(F.group23_attr,0) AS [24]	
			,ISNULL(F.group24_attr,0) AS [25]	
			,ISNULL(F.group25_attr,0) AS [26]
			,ISNULL(T.bindedMainGroupid,0) AS [27]
			from ['+@DBNAME+'].dbo.task_task AS T WITH (NOLOCK) 
			LEFT OUTER JOIN ['+@DBNAME+'].dbo.task_task_filter AS F WITH (NOLOCK)
			ON T.taskid=F.taskid
			LEFT OUTER JOIN (
				select 
					 B.taskid
					,STRING_AGG( B.systemloginid,'','') as Assigneeid
				from ['+@DBNAME+'].dbo.task_user_task_bind AS B WITH (NOLOCK)
				--inner join (
				--	select 
				--		id 
				--		,CONCAT(firstname,'' '',lastname) as uname
				--	from ['+@DBNAME+'].dbo.Usermanagement_systemloginmaster with (nolock)
				--) as US
				--ON B.systemloginid=US.id	
				group by B.taskid
			)as U
			ON T.taskid=U.taskid
			WHERE ISNULL(T.taskname,'''')<>''''
			AND T.[taskid]='+convert(nvarchar(20),@taskid)+'
			'

	PRINT (@SQL)
	PRINT (@SQL1)
	PRINT (@SQL2)

	EXEC(@SQL+@SQL1+@SQL2)
END


ELSE IF(ISNULL(@mode, '') = 'Quicklist_edit')
BEGIN   
    SET @SQL='
				IF EXISTS(
					SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_task_filter] WITH (NOLOCK)
					WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'
					AND ISNULL([taskid],0)>0
				)
				BEGIN
					UPDATE T
					SET  T.[group1_attr]='+ CASE WHEN ISNULL(@group1_attr,'')=''  THEN 'T.[group1_attr]'  ELSE CONVERT(NVARCHAR(10),@group1_attr) END + '
						,T.[group2_attr]=' + CASE WHEN ISNULL(@group2_attr,'')=''  THEN 'T.[group2_attr]'  ELSE CONVERT(NVARCHAR(10),@group2_attr) END + '
						,T.[group3_attr]=' + CASE WHEN ISNULL(@group3_attr,'')=''  THEN 'T.[group3_attr]'  ELSE CONVERT(NVARCHAR(10),@group3_attr) END + '
						,T.[group4_attr]=' + CASE WHEN ISNULL(@group4_attr,'')='' THEN 'T.[group4_attr]' ELSE CONVERT(NVARCHAR(10),@group4_attr) END + '
						,T.[group5_attr]=' + CASE WHEN ISNULL(@group5_attr,'')='' THEN 'T.[group5_attr]' ELSE CONVERT(NVARCHAR(10),@group5_attr) END + '
						,T.[group6_attr]=' + CASE WHEN ISNULL(@group6_attr,'')='' THEN 'T.[group6_attr]' ELSE CONVERT(NVARCHAR(10),@group6_attr) END + '
						,T.[group7_attr]=' + CASE WHEN ISNULL(@group7_attr,'')='' THEN 'T.[group7_attr]' ELSE CONVERT(NVARCHAR(10),@group7_attr) END + '
						,T.[group8_attr]=' + CASE WHEN ISNULL(@group8_attr,'')='' THEN 'T.[group8_attr]' ELSE CONVERT(NVARCHAR(10),@group8_attr) END + '
						,T.[group9_attr]=' + CASE WHEN ISNULL(@group9_attr,'')='' THEN 'T.[group9_attr]' ELSE CONVERT(NVARCHAR(10),@group9_attr) END + '
						,T.[group10_attr]=' + CASE WHEN ISNULL(@group10_attr,'')='' THEN 'T.[group10_attr]' ELSE CONVERT(NVARCHAR(10),@group10_attr) END + '
						,T.[group11_attr]=' + CASE WHEN ISNULL(@group11_attr,'')='' THEN 'T.[group11_attr]' ELSE CONVERT(NVARCHAR(10),@group11_attr) END + '
						,T.[group12_attr]=' + CASE WHEN ISNULL(@group12_attr,'')='' THEN 'T.[group12_attr]' ELSE CONVERT(NVARCHAR(10),@group12_attr) END + '
						,T.[group13_attr]=' + CASE WHEN ISNULL(@group13_attr,'')='' THEN 'T.[group13_attr]' ELSE CONVERT(NVARCHAR(10),@group13_attr) END + '
						,T.[group14_attr]=' + CASE WHEN ISNULL(@group14_attr,'')='' THEN 'T.[group14_attr]' ELSE CONVERT(NVARCHAR(10),@group14_attr) END + '
						,T.[group15_attr]=' + CASE WHEN ISNULL(@group15_attr,'')='' THEN 'T.[group15_attr]' ELSE CONVERT(NVARCHAR(10),@group15_attr) END + '
						,T.[group16_attr]=' + CASE WHEN ISNULL(@group16_attr,'')='' THEN 'T.[group16_attr]' ELSE CONVERT(NVARCHAR(10),@group16_attr) END + '
						,T.[group17_attr]=' + CASE WHEN ISNULL(@group17_attr,'')='' THEN 'T.[group17_attr]' ELSE CONVERT(NVARCHAR(10),@group17_attr) END + '
						,T.[group18_attr]=' + CASE WHEN ISNULL(@group18_attr,'')='' THEN 'T.[group18_attr]' ELSE CONVERT(NVARCHAR(10),@group18_attr) END + '
						,T.[group19_attr]=' + CASE WHEN ISNULL(@group19_attr,'')='' THEN 'T.[group19_attr]' ELSE CONVERT(NVARCHAR(10),@group19_attr) END + '
						,T.[group20_attr]=' + CASE WHEN ISNULL(@group20_attr,'')='' THEN 'T.[group20_attr]' ELSE CONVERT(NVARCHAR(10),@group20_attr) END + '
						,T.[group21_attr]=' + CASE WHEN ISNULL(@group21_attr,'')='' THEN 'T.[group21_attr]' ELSE CONVERT(NVARCHAR(10),@group21_attr) END + '
						,T.[group22_attr]=' + CASE WHEN ISNULL(@group22_attr,'')='' THEN 'T.[group22_attr]' ELSE CONVERT(NVARCHAR(10),@group22_attr) END + '
						,T.[group23_attr]=' + CASE WHEN ISNULL(@group23_attr,'')='' THEN 'T.[group23_attr]' ELSE CONVERT(NVARCHAR(10),@group23_attr) END + '
						,T.[group24_attr]=' + CASE WHEN ISNULL(@group24_attr,'')='' THEN 'T.[group24_attr]' ELSE CONVERT(NVARCHAR(10),@group24_attr) END + '
						,T.[group25_attr]=' + CASE WHEN ISNULL(@group25_attr,'')='' THEN 'T.[group25_attr]' ELSE CONVERT(NVARCHAR(10),@group25_attr) END + '
					FROM ['+@DBNAME+'].[dbo].[task_task_filter] AS T WITH (NOLOCK)
					WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
				END
				ELSE IF('+convert(nvarchar(20),@taskid)+'>0)
				BEGIN
				'
		SET @SQL1='					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_task_filter]
					([taskid]
					,[group1_attr],[group2_attr],[group3_attr],[group4_attr],[group5_attr]
					,[group6_attr],[group7_attr],[group8_attr],[group9_attr],[group10_attr]
					,[group11_attr],[group12_attr],[group13_attr],[group14_attr],[group15_attr]
					,[group16_attr],[group17_attr],[group18_attr],[group19_attr],[group20_attr]
					,[group21_attr],[group22_attr],[group23_attr],[group24_attr],[group25_attr])
					VALUES('+convert(nvarchar(20),@taskid)+'
					,'+CONVERT(NVARCHAR(10),@group1_attr)+'
					,'+CONVERT(NVARCHAR(10),@group2_attr)+'
					,'+CONVERT(NVARCHAR(10),@group3_attr)+'
					,'+CONVERT(NVARCHAR(10),@group4_attr)+'
					,'+CONVERT(NVARCHAR(10),@group5_attr)+'
					,'+CONVERT(NVARCHAR(10),@group6_attr)+'
					,'+CONVERT(NVARCHAR(10),@group7_attr)+'
					,'+CONVERT(NVARCHAR(10),@group8_attr)+'
					,'+CONVERT(NVARCHAR(10),@group9_attr)+'
					,'+CONVERT(NVARCHAR(10),@group10_attr)+'
					,'+CONVERT(NVARCHAR(10),@group11_attr)+'
					,'+CONVERT(NVARCHAR(10),@group12_attr)+'
					,'+CONVERT(NVARCHAR(10),@group13_attr)+'
					,'+CONVERT(NVARCHAR(10),@group14_attr)+'
					,'+CONVERT(NVARCHAR(10),@group15_attr)+'
					,'+CONVERT(NVARCHAR(10),@group16_attr)+'
					,'+CONVERT(NVARCHAR(10),@group17_attr)+'
					,'+CONVERT(NVARCHAR(10),@group18_attr)+'
					,'+CONVERT(NVARCHAR(10),@group19_attr)+'
					,'+CONVERT(NVARCHAR(10),@group20_attr)+'
					,'+CONVERT(NVARCHAR(10),@group21_attr)+'
					,'+CONVERT(NVARCHAR(10),@group22_attr)+'
					,'+CONVERT(NVARCHAR(10),@group23_attr)+'
					,'+CONVERT(NVARCHAR(10),@group24_attr)+'
					,'+CONVERT(NVARCHAR(10),@group25_attr)+'
					)
				END

				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code	
				'
    PRINT(@SQL)
	PRINT(@SQL1)
    EXEC(@SQL + @SQL1)
END

ELSE IF(ISNULL(@mode, '') = 'quickreportmasters')
BEGIN   
    SET @SQL = '

	  SELECT  [id]
		  ,[filtermaingroup]
	  FROM ['+@DBNAME+'].[dbo].[task_filtermaingroup] WITH (NOLOCK)
	
	  SELECT [id]
		  ,[filtergroup]
	  FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK)

	  SELECT [id]
		  ,[filterattr]
	  FROM ['+@DBNAME+'].[dbo].[task_filterattr] WITH (NOLOCK)

      SELECT [id]
		  ,[filtergroupid]
		  ,[filterattrid]
		  ,[filtermaingroupid]
	  FROM ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind] WITH (NOLOCK)
       
    '
    PRINT(@SQL)
    EXEC(@SQL)
END
ELSE IF(isnull(@mode,'')='wipreportexcel')
BEGIN
	
	select [ExcelExport]
      ,[PrintButton]
      ,[mailButton]
      ,[fullScreenGridButton]
      ,[imageView]
      ,[progressFilter] 
	from [404146_CentralUser].dbo.dr_masterkey
	WHERE PAGEID=@pageid

	select [colid]
      ,[HeaderName]
      ,[Field]
      ,[Width]
      ,[Align]
      ,[HrefLink]
      ,[DataType]
      ,[ColumShow]
      ,[ColumFilter]
      ,[NormalFilter]
      ,[DateRangeFilter]
      ,[MultiSelection]
      ,[RangeFilter]
      ,[ColumNumberSetting]
      ,[ColumAlign]
      ,[ColumTitleCapital]
      ,[ColumTitleSmall]
      ,[FontSize]
      ,[BorderRadius]
      ,[Color]
      ,[BackgroundColor]
      ,[Summary]
      ,[ColumAscendion]
      ,[ColumDescending]
      ,[SuggestionFilter]
      ,[SelectDropdownFilter]
      ,[ProiorityFilter] 
	FROM [404146_CentralUser].dbo.dr_ColumData WITH (NOLOCK)
	WHERE PAGEID=@pageid

	select ISNULL([1],'') as [1]
		,ISNULL([2],'') as [2]
		,ISNULL([3],'') as [3]
		,ISNULL([4],'') as [4]
		,ISNULL([5],'') as [5]
		,ISNULL([6],'') as [6]
		,ISNULL([7],'') as [7]
		,ISNULL([8],'') as [8]
		,ISNULL([9],'') as [9]
		,ISNULL([10],'') as [10] 
		,ISNULL([11],'') as [11]
		,ISNULL([12],'') as [12]
		,ISNULL([13],'') as [13]
		,ISNULL([14],'') as [14]
		,ISNULL([15],'') as [15]
		,ISNULL([16],'') as [16]
		,ISNULL([17],'') as [17]
		,ISNULL([18],'') as [18]
		,ISNULL([19],'') as [19]
		,ISNULL([20],'') as [20]
		,ISNULL([21],'') as [21]
		,ISNULL([22],'') as [22]
		,ISNULL([23],'') as [23]
		,ISNULL([24],'') as [24]
		,ISNULL([25],'') as [25]
		,ISNULL([26],'') as [26]
		,ISNULL([27],'') as [27]
		,ISNULL([28],'') as [28]
		,ISNULL([29],'') as [29]
		,ISNULL([30],'') as [30]
		,ISNULL([31],'') as [31]
		,ISNULL([32],'') as [32]
		,ISNULL([33],'') as [33]
		,ISNULL([34],'') as [34]
		,ISNULL([35],'') as [35]
		,ISNULL([36],'') as [36]
		,ISNULL([37],'') as [37]
		,ISNULL([38],'') as [38]
		,ISNULL([39],'') as [39]
		,ISNULL([40],'') as [40]
		,ISNULL([41],'') as [41]
		,ISNULL([42],'') as [42]
		,ISNULL([43],'') as [43]
		,ISNULL([44],'') as [44]
		,ISNULL([45],'') as [45]
		,ISNULL([46],'') as [46]
		,ISNULL([47],'') as [47]
		,ISNULL([48],'') as [48]
		,ISNULL([49],'') as [49]
		,ISNULL([50],'') as [50]
	from [404146_CentralUser].dbo.dr_IdWiseRowWiseDataHeader WITH (NOLOCK)
	WHERE PAGEID=@pageid

	select [1]
      ,[2]
      ,[3]
      ,[4]
      ,[5]
      ,[6]
      ,[7]
      ,[8]
      ,[9]
      ,[10] from [404146_CentralUser].dbo.dr_FinalRowData
END

ELSE IF(isnull(@mode,'')='taskemployee')
BEGIN
	SET @SQL='
		select 
			 id
			,ISNULL(userid,'''') as userid
			,ISNULL(customercode,'''') as customercode
			,ISNULL(firstname,'''') as firstname
			,ISNULL(lastname,'''') as lastname
			,ISNULL([designation],'''') as designation
			,ISNULL([department],'''') as department
			,ISNULL([departmentid],0) as departmentid 
			,ISNULL([designationid],0) as designationid
			,iif(isnull([DefaultImageLogoName],'''')='''','''',concat(''/CustomerImages/'',id,''/Photo_Resize/'',isnull([DefaultImageLogoName],''''))) as empphoto
			,isnull([isactive],0) as isactive
		from ['+@DBNAME+'].dbo.Usermanagement_systemloginmaster with (nolock)
		where isnull(mastermanagement_roleid,0)=3
		order by designation
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='dailyreport_save')
BEGIN
	print @mode
	SET @SQL='
		IF NOT EXISTS(
			SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_dailyreporting] WITH (NOLOCK)
			WHERE ISNULL([TakenByEmpID],0)='+convert(nvarchar(10),@takenbyempid)+'
				AND [GivenByEmpID]='+convert(nvarchar(10),@givenbyempid)+'
				--AND CONVERT(DATE,[entrydate])=CONVERT(DATE,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate()))
				AND CONVERT(DATE,[entrydate]) = CONVERT(DATE,'''+convert(nvarchar(max),@ReportingDate)+''')
		)
		BEGIN
			INSERT INTO ['+@DBNAME+'].[dbo].[task_dailyreporting]
				([entrydate]
				,[TakenByEmpID]
				,[GivenByEmpID]
				,[remarks]
				,[isdone])
			VALUES(
				 --isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				 CONVERT(DATE,'''+convert(nvarchar(max),@ReportingDate)+''')
				,'+convert(nvarchar(10),@takenbyempid)+'
				,'+convert(nvarchar(10),@givenbyempid)+'
				,'''+convert(nvarchar(max),@remarks)+'''
				,'+convert(nvarchar(10),@isdone)+'
			)
		END
		ELSE
		BEGIN
			UPDATE ['+@DBNAME+'].[dbo].[task_dailyreporting]
			SET [isdone]='+convert(nvarchar(10),@isdone)+'
				,[remarks]='''+convert(nvarchar(max),@remarks)+'''
			WHERE ISNULL([TakenByEmpID],0)='+convert(nvarchar(10),@takenbyempid)+'
				AND [GivenByEmpID]='+convert(nvarchar(10),@givenbyempid)+'
				--AND CONVERT(DATE,[entrydate])=CONVERT(DATE,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate()))
				AND CONVERT(DATE,[entrydate]) = CONVERT(DATE,'''+convert(nvarchar(max),@ReportingDate)+''')
		END

		SELECT 
			1 as stat
			,''successfully'' as stat_msg
			,1000 as stat_code;	

	'
	print (@SQL)
	EXEC (@SQL)


END
ELSE IF(isnull(@mode,'')='getdailyreport')
BEGIN
	SET @SQL='
		SELECT
			 [ID]
			,[entrydate]
			,[TakenByEmpID]
			,[GivenByEmpID]
			,[remarks]
			,[isdone]		
		FROM ['+@DBNAME+'].[dbo].[task_dailyreporting] WITH (NOLOCK)	
		
		SELECT 
			1 as stat
			,''successfully'' as stat_msg
			,1000 as stat_code;	
	'
	print (@SQL)
	EXEC (@SQL)
END
--ELSE IF(isnull(@mode,'')='uncheckgetdailyreport')
--BEGIN
--	SET @SQL='
--		update ['+@DBNAME+'].[dbo].[task_dailyreporting]
--		set [isdone]=0
--		where id='+CONVERT(nvarchar(10),@dailyreportingid)+'
		
--		SELECT 
--			1 as stat
--			,''successfully'' as stat_msg
--			,1000 as stat_code;	
--	'
--	print (@SQL)
--	EXEC (@SQL)
--END
--ELSE IF(isnull(@mode,'')='checkgetdailyreport')
--BEGIN
--	SET @SQL='
--		update ['+@DBNAME+'].[dbo].[task_dailyreporting]
--		set [isdone]=1
--		where id='+CONVERT(nvarchar(10),@dailyreportingid)+'
		
--		SELECT 
--			1 as stat
--			,''successfully'' as stat_msg
--			,1000 as stat_code;	
--	'
--	print (@SQL)
--	EXEC (@SQL)
--END
ELSE IF(isnull(@mode,'')='taskteamlist')
BEGIN
	SET @SQL='
		declare @RootTaskId as int=isnull((
			select top(1)
				isnull(RootTaskId,0)
			from ['+@DBNAME+'].[dbo].[task_task] with (nolock)
			where taskid='+convert(nvarchar(max),@taskid)+'
		),0)

		IF(@RootTaskId = 0)
		BEGIN
			select temp.taskid
				,systemloginid as assigneeid
				,ISNULL(rolename,'''') as rolename
				,ISNULL(islimitedaccess,0) as islimitedaccess
				,ISNULL(temp.IsReadOnly,0) as isreadonly
			from ['+@DBNAME+'].[dbo].[task_user_task_bind] as temp WITH (NOLOCK)
		END
		ELSE 
		BEGIN
			select temp.taskid
				,systemloginid as  assigneeid
				,ISNULL(rolename,'''') as rolename
				,ISNULL(islimitedaccess,0) as islimitedaccess
				,ISNULL(temp.IsReadOnly,0) as isreadonly
			from ['+@DBNAME+'].[dbo].[task_user_task_bind] as temp WITH (NOLOCK)			
			WHERE ISNULL(temp.taskid,0)=@RootTaskId
		END

		
		
	'
	print(@SQL)
	exec(@SQL)
END

ELSE IF(isnull(@mode,'')='taskteamroledel')
BEGIN
	SET @SQL='
		DELETE from ['+@DBNAME+'].[dbo].[task_user_task_bind]
		where taskid='+CONVERT(NVARCHAR(MAX),@taskid)+'
		and systemloginid='+CONVERT(NVARCHAR(MAX),@assigneeid)+'

		declare 
			 @assigneeids as nvarchar(max)=''''
			,@readonlyids as nvarchar(max)=''''
			;

		select 
			@assigneeids=STRING_AGG(systemloginid,'','') 
			,@readonlyids=STRING_AGG(CONCAT(systemloginid,''#'',ISNULL(IsReadOnly,0)),'','')
		from ['+ @DBNAME +'].[dbo].[task_user_task_bind]
		where taskid=' + CONVERT(NVARCHAR(MAX), @taskid) + ';

		update ['+ @DBNAME +'].[dbo].[task_task]
		set assigneids=@assigneeids
			,readonlyids=@readonlyids
		where taskid=' + CONVERT(NVARCHAR(MAX), @taskid) + ';

		
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='filterattr')
BEGIN
	SET @SQL='
		SELECT
			[id],[filterattr]
		FROM ['+@DBNAME+'].[dbo].[task_filterattr] WITH (NOLOCK)
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='filtergroup')
BEGIN
	SET @SQL='
		SELECT
			[id],[filtergroup]
		FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK)
		WHERE ISNULL([filtergroup],'''')<>''''
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='filtermaingroup')
BEGIN
	SET @SQL='
		SELECT
			[id],[filtermaingroup]
		FROM ['+@DBNAME+'].[dbo].[task_filtermaingroup] WITH (NOLOCK)
		WHERE ISNULL([filtermaingroup],'''')<>''''
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='filter_group_attr_bind')
BEGIN
	SET @SQL='
		SELECT
			[id]
			,[filtermaingroupid]
			,[filtergroupid]
			,[filterattrid]
		FROM ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind] WITH (NOLOCK)
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='filter_group_attr_bind')
BEGIN
	SET @SQL='
		SELECT
			[id],[filtergroupid],[filterattrid]
		FROM ['+@DBNAME+'].[dbo].[task_filter_task_group_bind] WITH (NOLOCK)
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='editfiltergroupattr')
BEGIN
	SET @SQL='
		--UPDATE ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind]
		--SET filtergroupid='+CONVERT(nvarchar(10),@filtergroupid)+'	
		--	,filterattrid='+CONVERT(nvarchar(10),@filterattrid)+'	
		--	,filtermaingroupid='+CONVERT(nvarchar(10),@filtermaingroupid)+'
		--WHERE ID='+CONVERT(nvarchar(10),@bindid)+'

		IF(lower('''+@bindtype+''')=''maingroup'')
		BEGIN
			UPDATE ['+@DBNAME+'].[dbo].[task_filtermaingroup]
			SET filtermaingroup='''+@bindname+'''
			WHERE ID='+CONVERT(nvarchar(10),@bindid)+'
		END

		IF(lower('''+@bindtype+''')=''group'')
		BEGIN
			UPDATE ['+@DBNAME+'].[dbo].[task_filtergroup]
			SET filtergroup='''+@bindname+'''
			WHERE id='+CONVERT(nvarchar(10),@bindid)+'
		END

		IF(lower('''+@bindtype+''')=''attr'')
		BEGIN
			UPDATE ['+@DBNAME+'].[dbo].[task_filterattr]
			SET filterattr='''+@bindname+'''
			WHERE ID='+CONVERT(nvarchar(10),@bindid)+'
		END



		SELECT 
			1 as stat
			,''update successfully'' as stat_msg
			,1000 as stat_code;	

	'
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='delfiltergroupattr')
BEGIN
	SET @SQL='
		DECLARE 
			@filterattrid AS INT=0
			,@filtergroupid AS INT=0
			,@filtermaingroupid AS INT=0

		SELECT 
			@filterattrid=filterattrid
			,@filtergroupid=filtergroupid
			,@filtermaingroupid=filtermaingroupid
		FROM ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind] WITH (NOLOCK)
		WHERE ID='+CONVERT(nvarchar(10),@bindid)+'
		
		IF(lower('''+@bindtype+''')=''maingroup'')
		BEGIN
			DELETE FROM ['+@DBNAME+'].[dbo].[task_filtermaingroup]
			WHERE ID='+CONVERT(nvarchar(10),@bindid)+'

			DELETE FROM ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind]
			WHERE filtermaingroupid='+CONVERT(nvarchar(10),@bindid)+'
		END

		IF(lower('''+@bindtype+''')=''group'')
		BEGIN
			DELETE FROM ['+@DBNAME+'].[dbo].[task_filtergroup]
			WHERE id='+CONVERT(nvarchar(10),@bindid)+'

			DELETE FROM ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind]
			WHERE filtergroupid='+CONVERT(nvarchar(10),@bindid)+'
		END

		IF(lower('''+@bindtype+''')=''attr'')
		BEGIN
			DELETE FROM ['+@DBNAME+'].[dbo].[task_filterattr]
			WHERE id='+CONVERT(nvarchar(10),@bindid)+'

			DELETE FROM ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind]
			WHERE filterattrid='+CONVERT(nvarchar(10),@bindid)+'
		END
		
		SELECT 
			1 as stat
			,''delete successfully'' as stat_msg
			,1000 as stat_code;	

	'
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='addfiltergroupattr')
BEGIN
	SET @SQL='
		---------------------------------------------------------
		DECLARE 
			@filterattrid AS INT=0
			,@filtergroupid AS INT=0
			,@filtermaingroupid AS INT=0

		IF NOT EXISTS(
			SELECT 1 
			FROM ['+@DBNAME+'].[dbo].[task_filtermaingroup] WITH (NOLOCK)
			WHERE ISNULL([filtermaingroup],'''') ='''+@filtermaster+'''
		)
		BEGIN
			DECLARE @MGiMaxid as int=ISNULL((SELECT MAX(ID) FROM ['+@DBNAME+'].[dbo].[task_filtermaingroup] WITH (NOLOCK)),0)+1
			INSERT INTO ['+@DBNAME+'].[dbo].[task_filtermaingroup]
            ([id],[filtermaingroup])
			VALUES(@MGiMaxid,'''+@filtermaster+''')
		END

		SET @filtermaingroupid=ISNULL((
			SELECT TOP(1) ID 
			FROM ['+@DBNAME+'].[dbo].[task_filtermaingroup] WITH (NOLOCK)
			WHERE ISNULL([filtermaingroup],'''') ='''+@filtermaster+'''),0)
		---------------------------------------------------------

		IF NOT EXISTS(
			SELECT 1 
			FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK)
			WHERE ISNULL([filtergroup],'''') ='''+@filtergroup+'''
		)
		BEGIN
			DECLARE @GiMaxid as int=ISNULL((SELECT MAX(ID) FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK)),0)+1
			INSERT INTO ['+@DBNAME+'].[dbo].[task_filtergroup]
            ([id],[filtergroup])
			VALUES(@GiMaxid,'''+@filtergroup+''')
		END

		SET @filtergroupid=ISNULL((
			SELECT TOP(1) ID 
			FROM ['+@DBNAME+'].[dbo].[task_filtergroup] WITH (NOLOCK)
			WHERE ISNULL([filtergroup],'''') ='''+@filtergroup+'''),0)
		'

	SET @SQL1='		
		---------------------------------------------------------			
		declare @tblAttr table
		(Number int identity(1,1)
		,attrname nvarchar(200));

		insert into @tblAttr(attrname)		
		SELECT TRIM(value)
		FROM STRING_SPLIT('''+@filterattr+''', '','');

		DECLARE 
			 @_N int=1
			,@_Count int=isnull((SELECT max(Number) from @tblAttr),0)
			,@_attrname as nvarchar(max)=''''
		
		WHILE @_N <= @_Count
		BEGIN
		
			SET @_attrname =''''			
		
			SELECT TOP(1)
				@_attrname=ISNULL(attrname,'''')				
			FROM @tblAttr
			WHERE Number = @_N

			PRINT CONCAT(''@_attrname :'',@_attrname)
			-----		

			IF NOT EXISTS(
				SELECT 1 
				FROM ['+@DBNAME+'].[dbo].[task_filterattr] WITH (NOLOCK)
				WHERE ISNULL([filterattr],'''') =@_attrname
			)
			BEGIN
				DECLARE @iMaxid as int=ISNULL((SELECT MAX(ID) FROM ['+@DBNAME+'].[dbo].[task_filterattr] WITH (NOLOCK)),0)+1
				INSERT INTO ['+@DBNAME+'].[dbo].[task_filterattr]
				([id],[filterattr])
				VALUES(@iMaxid,@_attrname)
			END

			SET @filterattrid=ISNULL((
				SELECT TOP(1) ID 
				FROM ['+@DBNAME+'].[dbo].[task_filterattr] WITH (NOLOCK)
				WHERE ISNULL([filterattr],'''') =@_attrname),0)


			INSERT INTO ['+@DBNAME+'].[dbo].[task_filter_group_attr_bind]
			([filtermaingroupid],[filtergroupid],[filterattrid])
			VALUES(@filtermaingroupid,@filtergroupid,@filterattrid)
			
			-----
			SET @_N = @_N + 1;
		END

		IF EXISTS( 
			SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES  
			WHERE TABLE_NAME = ''#tblAttr_'+@RandomNo+'''
		)
		BEGIN
			drop table #tblAttr_'+@RandomNo+'
		end


		SELECT 
			1 as stat
			,''save successfully'' as stat_msg
			,1000 as stat_code;	
		
	'
	print(@SQL)
	print(@SQL1)
	exec(@SQL+@SQL1)
END
ELSE IF(isnull(@mode,'')='taskteamrolesave')
BEGIN
	SET @SQL='
		-- Step 1: Create temp table
		CREATE TABLE #ParsedRoles (
			 assigneeid INT
			,rolename NVARCHAR(MAX)
			,islimitedaccess NVARCHAR(MAX)
			,isreadonly INT
		);


		INSERT INTO #ParsedRoles (assigneeid, rolename, islimitedaccess, isreadonly)
		SELECT
			CAST(SUBSTRING(Value, 1, Pos1 - 1) AS INT) AS assigneeid,
			SUBSTRING(Value, Pos1 + 1, Pos2 - Pos1 - 1) AS rolename,
			SUBSTRING(Value, Pos2 + 1, Pos3 - Pos2 - 1) AS islimitedaccess,
			CAST(SUBSTRING(Value, Pos3 + 1, LEN(Value)) AS INT) AS isreadonly
		FROM (
			SELECT 
				Value,
				CHARINDEX(''#'', Value) AS Pos1,
				CHARINDEX(''#'', Value, CHARINDEX(''#'', Value) + 1) AS Pos2,
				CHARINDEX(''#'', Value, CHARINDEX(''#'', Value, CHARINDEX(''#'', Value) + 1) + 1) AS Pos3
			FROM STRING_SPLIT('''+@rolenamelist+''', '','')
			WHERE Value LIKE ''%#%#%#%''
		) AS Positions;
		

		-- Step 3: DELETE old roles
		DELETE te
		FROM ['+ @DBNAME +'].[dbo].[task_user_task_bind] te
		INNER JOIN #ParsedRoles pr ON
			te.taskid = ' + CONVERT(NVARCHAR(MAX), @taskid) + '
			AND te.systemloginid = pr.assigneeid;

		-- Step 4: INSERT new roles if not exists
		INSERT INTO ['+ @DBNAME +'].[dbo].[task_user_task_bind] 
		([taskid], [systemloginid], [rolename],[islimitedaccess],[IsReadOnly])
		SELECT ' + CONVERT(NVARCHAR(MAX), @taskid) + '
			, pr.assigneeid
			, pr.rolename
			, pr.islimitedaccess
			, pr.isreadonly
		FROM #ParsedRoles pr
		WHERE NOT EXISTS (
			SELECT 1
			FROM ['+ @DBNAME +'].[dbo].[task_user_task_bind] te
			WHERE te.taskid = ' + CONVERT(NVARCHAR(MAX), @taskid) + '
			  AND ISNULL(te.systemloginid,0) = ISNULL(pr.assigneeid,0)
		);

		declare 
			@assigneeids as nvarchar(max)=''''
			,@readonlyids as nvarchar(max)=''''
			;

		select 
			@assigneeids=STRING_AGG(systemloginid,'','') 
			,@readonlyids=STRING_AGG(CONCAT(systemloginid,''#'',ISNULL(IsReadOnly,0)),'','')
		from ['+ @DBNAME +'].[dbo].[task_user_task_bind]
		where taskid=' + CONVERT(NVARCHAR(MAX), @taskid) + ';

		update ['+ @DBNAME +'].[dbo].[task_task]
		set assigneids=@assigneeids
			,readonlyids=@readonlyids
		where taskid=' + CONVERT(NVARCHAR(MAX), @taskid) + ';

		--DECLARE @isreadonly INT = 0
		--		,@assigneeid INT = 0	

		--SELECT 
		--	 @isreadonly = isreadonly
		--	,@assigneeid = assigneeid 
		--FROM #ParsedRoles

		
	
		SELECT 
			1 as stat
			,''save successfully'' as stat_msg
			,1000 as stat_code;	
		
		DROP TABLE #ParsedRoles;

	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='dynamic_report_sample')
BEGIN
	
	select [ExcelExport]
      ,[PrintButton]
      ,[mailButton]
      ,[fullScreenGridButton]
      ,[imageView]
      ,[progressFilter] 
	FROM [404146_CentralUser].dbo.dr_masterkey WITH(NOLOCK)
	WHERE PAGEID=@pageid

	select [colid]
      ,[HeaderName]
      ,[Field]
      ,[Width]
      ,[Align]
      ,[HrefLink]
      ,[DataType]
      ,[ColumShow]
      ,[ColumFilter]
      ,[NormalFilter]
      ,[DateRangeFilter]
      ,[MultiSelection]
      ,[RangeFilter]
      ,[ColumNumberSetting]
      ,[ColumAlign]
      ,[ColumTitleCapital]
      ,[ColumTitleSmall]
      ,[FontSize]
      ,[BorderRadius]
      ,[Color]
      ,[BackgroundColor]
      ,[Summary]
      ,[ColumAscendion]
      ,[ColumDescending]
      ,[SuggestionFilter]
      ,[SelectDropdownFilter]
      ,[ProiorityFilter] 
	FROM [404146_CentralUser].dbo.dr_ColumData WITH(NOLOCK)
	WHERE PAGEID=@pageid

	select [1]
      ,[2]
      ,[3]
      ,[4]
      ,[5]
      ,[6]
      ,[7]
      ,[8]
      ,[9]
      ,[10] 
	from [404146_CentralUser].dbo.dr_IdWiseRowWiseDataHeader

	select [1]
      ,[2]
      ,[3]
      ,[4]
      ,[5]
      ,[6]
      ,[7]
      ,[8]
      ,[9]
      ,[10] from [404146_CentralUser].dbo.dr_FinalRowData
END
ELSE IF(isnull(@mode,'')='gettokenbycompanycode')
	BEGIN
		 SET @SQL='
			IF EXISTS(
				select 1
				FROM [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission WITH(NOLOCK)
				where isnull(companycode,'''')='''+@companycode+'''
			)
			BEGIN
				SELECT
					1 as stat
					,dbUniqueKey  AS token
					,ISNULL(ukey,'''') AS ukey
					,ISNULL(serverid, 0) AS sv
					,replace(cast([404146_CentralUser].[dbo].Base64Encode(concat(''{{'',domainname,''}}{{'',yearname,''}}{{'',companycode,''}}{{'',company_password,''}}'')) as NVARCHAR(MAX)),'''','''''''') as yc
				FROM [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission WITH(NOLOCK)
				where isnull(companycode,'''')='''+@companycode+'''
			END
			ELSE
			BEGIN
				SELECT
					0 as stat
					, ''company not exists'' as stat_msg
					, 1001 as stat_code
					, ''null'' as device_token
			END
        ';
        print (@SQL)
        exec (@SQL)
	END

ELSE IF(isnull(@mode,'')='gettoken')
BEGIN
	print @mode

	declare @url_path as nvarchar(max)='https://cdnfs.optigoapps.com/content-global3'
	

	select 
		 dbUniqueKey  as token
		,ukey  as ukey
		,serverid as sv
		,@url_path as url_path
		,isnull(companycode,'') as companycode
	from [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission with (nolock)
	where dbname=@DBNAME



	IF(@appuserid<>'')
	BEGIN
		SET @SQL='
			declare @_id as int=ISNULL((
				select TOP(1) id 
				from ['+@DBNAME+'].DBO.usermanagement_systemloginmaster WITH (NOLOCK)
				where userid='''+@appuserid+'''
			),0)

			select id,title as pagename 
			from ['+@DBNAME+'].DBO.usermanagement_role_pages WITH (NOLOCK)
			where id in (
				select 
					ISNULL([usermanagement_role_pagesid],0)
				from ['+@DBNAME+'].DBO.[UserManagement_UserRightsBinding] WITH (NOLOCK)
				where Usermanagement_systemloginmasterid=@_id
				and appsname=''ITASK''
			)
	
		'
		PRINT (@SQL)
		EXEC (@SQL)
	END
END

ELSE IF(isnull(@mode,'')='login')
BEGIN
	print @mode


	DECLARE 
		 @apiurl AS NVARCHAR(MAX)=''
		,@UploadLogicalPath	AS NVARCHAR(MAX)=''		
		,@ImageLogicalPath	AS NVARCHAR(MAX)=''			
		,@jojsPath	AS NVARCHAR(MAX)=''	
		,@SMSView_URL AS NVARCHAR(MAX)=''
		
	

	SELECT TOP(1)
		 @apiurl=apiurl	
		,@UploadLogicalPath=UploadLogicalPath
		,@ImageLogicalPath=ImageLogicalPath
		,@jojsPath=jojsPath	
		,@SMSView_URL=SMSView_URL 
	FROM [404146_CentralUser].dbo.inf WITH (NOLOCK)


	

	IF(@appuserid<>'' and @psw<>'' and @companycode<>'')
	BEGIN
		DECLARE 
			 @_DBNAME AS NVARCHAR(100)=''
			,@_dbUniqueKey AS NVARCHAR(100)=''
			,@_ukey AS NVARCHAR(200)=''
			,@_svid AS INT=0
			,@_yearcode AS NVARCHAR(max)=''
			,@_cuver AS NVARCHAR(50)=''
			,@_url_path as nvarchar(max)='https://cdnfs.optigoapps.com/content-global3'
			

			SELECT 
				 @_DBNAME=dbname
				,@_dbUniqueKey=dbUniqueKey
				,@_ukey=ukey
				,@_svid=serverid
				,@_cuver=cuVer
				,@_yearcode=[dbo].[Base64Encode](concat('{{',domainname,'}}{{',yearname,'}}{{',companycode,'}}{{',company_password,'}}'))
			from [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission with (nolock)
			where ISNULL(companycode,'')=@companycode


		SET @SQL='
				declare 
					 @_id as int=0
					,@_customercode as nvarchar(100)=''''
					,@_firstname as nvarchar(200)=''''
					,@_middlename as nvarchar(200)=''''
					,@_lastname as nvarchar(200)=''''
					,@_designation as nvarchar(200)=''''	
					,@_mobileno as nvarchar(200)=''''
					,@_email1 as nvarchar(200)=''''
					,@_userid as nvarchar(200)=''''
					,@_isroaming as int=0
					,@isvalid as int=1

				select TOP(1) 
					@_id=id 
					,@_customercode=ISNULL(customercode,'''')
					,@_firstname=firstname
					,@_middlename=middlename
					,@_lastname=lastname
					,@_designation=designation	
					,@_mobileno=mobileno
					,@_email1=email1
					,@_userid=userid
					,@_isroaming=isnull(isroaming,0)
				from ['+@_DBNAME+'].DBO.usermanagement_systemloginmaster WITH (NOLOCK)
				where ISNULL(userid,'''')='''+@appuserid+'''
				and ISNULL(password,'''')='''+@psw+'''				
				and isnull(mastermanagement_roleid,0)=3 

			if(@_isroaming=0)
			BEGIN				
				if not exists(
					select IPAddress 
					from ['+@_DBNAME+'].DBO.Mastermanagement_IPAddress with (nolock)
					where isnull(IPAddress,'''')='''+@IPAddress+'''
					and ISNULL(isActive,0)=1
				)
				begin
					set @isvalid=0
				end				
			END

			if(@isvalid=0)
			BEGIN
				SELECT 
					0 as stat
					,''error-2'' as stat_msg
					,1001 as stat_code;
			END
			ELSE
			BEGIN


				IF(@_id>0)
				BEGIN
					SELECT 
						1 as stat
						,''login successfully'' as stat_msg
						,1000 as stat_code
						,@_id as id 
						,@_customercode as customercode
						,@_firstname as firstname
						,@_middlename as middlename
						,@_lastname as lastname
						,@_designation as designation	
						,@_mobileno as mobileno
						,@_email1 as email1
						,@_userid as userid
						,'''+@_dbUniqueKey+'''  as token
						,'''+@_ukey+'''  as ukey		
						,'''+@companycode+''' as companycode
						,'''+@apiurl+''' as apiurl
						,'''+REPLACE(@UploadLogicalPath,'{{vername}}',@_cuver)+''' as UploadLogicalPath		
						,'''+REPLACE(@ImageLogicalPath,'{{vername}}',@_cuver)+''' as ImageLogicalPath			
						,'''+@jojsPath+''' as jojsPath
						,'''+@SMSView_URL+''' as SMSView_URL
						,'''+convert(nvarchar(200),@_svid)+''' as svid
						,'''+@_yearcode+''' as yearcode
						,'''+@_cuver+''' as cuver
						,'''+@_url_path+''' as url_path 


					select 
						id
						,title as pagename 
					from ['+@_DBNAME+'].DBO.usermanagement_role_pages WITH (NOLOCK)
					where id in (
						select 
							ISNULL([usermanagement_role_pagesid],0)
						from ['+@_DBNAME+'].DBO.[UserManagement_UserRightsBinding] WITH (NOLOCK)
						where Usermanagement_systemloginmasterid=@_id
						and appsname=''ITASK''
					)
				END
				ELSE
				BEGIN
					SELECT 
						0 as stat
						,''invalid companycode or userid or password'' as stat_msg
						,1001 as stat_code;
				END	
			END
		'
		PRINT (@SQL)
		EXEC (@SQL)
	END
END
ELSE IF(isnull(@mode,'')='movetask')
BEGIN
	SET @SQL='
		DECLARE 
			@_maingroupids AS NVARCHAR(max)=''''
			,@_maintaskid AS INT=0
			,@_projectid AS INT=0

		SELECT TOP(1)
			 @_maingroupids=ISNULL(maingroupids,'''')
			,@_maintaskid=ISNULL(maintaskid,0)
			,@_projectid=ISNULL(projectid,0)
		FROM ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)
		WHERE taskid='+CONVERT(nvarchar(20),@toparentid)+'

		UPDATE ['+@DBNAME+'].[dbo].[task_task]
		SET parentid='+CONVERT(nvarchar(20),@toparentid)+'
			,maingroupids=@_maingroupids
			,maintaskid=@_maintaskid
			,projectid=@_projectid
		WHERE ISNULL(taskid,0)='+convert(nvarchar(20),@taskid)+'

		SELECT 
			1 as stat
			,''save successfully'' as stat_msg
			,1000 as stat_code;
	'
	PRINT (@SQL)
	EXEC (@SQL)
END

ELSE IF(isnull(@mode,'')='treelist' and ISNULL(@taskid,0)>0)
BEGIN	
	print 'treelist... with taskid'
	SET @SQL='		
		SELECT
			''1'' as [parentid]
			,''2'' as [taskid]
			,''3'' as [projectid]
			,''4'' as [entrydate]
			,''5'' as [taskname]
			,''6'' as [StartDate]
			,''7'' as [estimate_hrs]
			,''8'' as [DeadLineDate]
			,''9'' as [priorityid]
			,''10'' as [statusid] 
			,''11'' as [workcategoryid]
			,''12'' as [departmentid]
			,''13'' as [isFreez]
			,''14'' as [progress_per]
			,''15'' as [ismilestone]
			,''16'' as [estimate1_hrs]
			,''17'' as [estimate2_hrs]
			,''18'' as [isfavourite]
			,''19'' as [isnew]
			,''20'' as [isburning] 
			,''21'' as [ticketno]
			,''22'' as [assigneids]
			,''23'' as [descr]
			,''24'' as [createdbyid]
			,''25'' as [maingroupids]
			,''26'' as [workinghr]
			,''27'' as [secstatusid] 
			,''28'' as [EndDate]
			,''29'' as [isparentfreeze]
			,''30'' as [taskno]
			,''31'' as [isreadonly]
			,''32'' as [isarchive]
			,''33'' as [Completion_timestamp]
			,''34'' as [print_count]
		'
	SET @SQL1=' 
				declare 
					 @_projectid as int=0
					,@_RootTaskId as int=0
					,@_parentid as int=0
				;

				select TOP(1)
					@_parentid=taskid 
				from ['+@DBNAME+'].dbo.[task_task] with (nolock)
				where taskname=''Maintenance''

				select top(1)
					 @_projectid=isnull(projectid,0)
					,@_RootTaskId=isnull(RootTaskId,0)
				from ['+@DBNAME+'].dbo.[task_task] with (nolock)
				where taskid='+convert(nvarchar(50),@taskid)+'
	
				SELECT
					 ISNULL(t.parentid, 0)             AS [1]
					,ISNULL(t.taskid, 0)               AS [2]
					,ISNULL(t.projectid, 0)            AS [3]
					,entrydate                       AS [4]
					,ISNULL(t.taskname, '''')            AS [5]
					,StartDate                       AS [6]
					,ISNULL(t.estimate_hrs, 0)         AS [7]
					,DeadLineDate                    AS [8]
					,ISNULL(t.priorityid, 0)           AS [9]
					,ISNULL(t.statusid, 0)             AS [10]
					,ISNULL(t.workcategoryid, 0)       AS [11]
					,ISNULL(t.departmentid, 0)         AS [12]
					,ISNULL(t.isFreez, 0)              AS [13]
					,ISNULL(t.progress_per, 0)         AS [14]
					,ISNULL(t.ismilestone, 0)          AS [15]
					,ISNULL(t.estimate1_hrs, 0)        AS [16]
					,ISNULL(t.estimate2_hrs, 0)        AS [17]
					,ISNULL(t.isfavourite, 0)          AS [18]
					,ISNULL(t.isnew, 0)                AS [19]
					,ISNULL(t.isburning, 0)            AS [20]
					,ISNULL(t.ticketno, '''')          AS [21]
					,ISNULL(t.assigneids, '''')		 AS [22]
					,ISNULL(D.[descr],'''')	         AS [23]
					,ISNULL(t.createdbyid, 0)         AS [24]	
					,ISNULL(t.maingroupids,'''')	 AS [25]
					,ISNULL(t.workinghr, 0)			 AS [26]
					,ISNULL(t.secstatusid, 0)          AS [27]
					,EndDate					     AS [28]
					,0					as [29] --isparentfreeze
					--,ISNULL(t.taskno,'''') AS [30]			
					,CASE WHEN ISNULL(t.parentid,0) = @_parentid then t.maintenanceno
						ELSE ISNULL(t.taskno,'''')
					END AS [30]
					,t.readonlyids as [31]
					,0 as [32]  --isarchive
					,t.Completion_timestamp as [33]
					,ISNULL(t.print_count,0) as [34]

				 FROM ['+@DBNAME+'].[dbo].task_task t WITH (NOLOCK)
				 LEFT JOIN ['+@DBNAME+'].[dbo].task_descr D WITH (NOLOCK)
					 ON D.taskid = t.taskid

				 WHERE ISNULL(t.projectid,0)=@_projectid
				   AND ISNULL(t.RootTaskId,0)=@_RootTaskId
				'+iif(convert(nvarchar(10),@isCompleted)=1,'','and statusid<>13')+'
				;			

			 '
	
	PRINT(@SQL)
	PRINT(@SQL1)
	EXEC(@SQL+@SQL1)	
END


ELSE IF(isnull(@mode,'')='treelist' and ISNULL(@taskid,0)=0)
BEGIN	
	print 'treelist... with taskid'
	--

	DECLARE 
		 @designation NVARCHAR(50) = ''
		,@loginid NVARCHAR(50) = ''
		

	SET @SQL = '
	SELECT TOP(1)
		 @loginid = id,
		 @designation = designation
	FROM [' + @DBNAME + '].dbo.Usermanagement_systemloginmaster WITH (NOLOCK)
	WHERE userid = '''+@appuserid+''';
	'

	PRINT(@SQL)

	EXEC sp_executesql 
		@SQL,
		N'@loginid NVARCHAR(50) OUTPUT,
		  @designation NVARCHAR(50) OUTPUT',		
		  @loginid = @loginid OUTPUT,
		  @designation = @designation OUTPUT


	PRINT CONCAT('@loginid :',@loginid)
	PRINT CONCAT('@designation :',@designation)
	
		--PRINT CONCAT('@isCompleted :',@isCompleted)
	
		--PRINT CONCAT('@workcategoryid :',@workcategoryid)

		--PRINT CONCAT('@startdatefrom :',@startdatefrom)
		--PRINT CONCAT('@startdateto :',@startdateto)		
		--PRINT CONCAT('@dueDateFrom :',@dueDateFrom)
		--PRINT CONCAT('@dueDateTo :',@dueDateTo)
		--PRINT CONCAT('@statusid :',@statusid)
		--PRINT CONCAT('@priorityid :',@priorityid)
		--PRINT CONCAT('@assigneeid :',@assigneeid)
		set @WhereClause=' where 1=1 '
		if(@startdatefrom<>'' and @startdateto<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause, ' and [StartDate] Between '''+@startdatefrom+' 00:00:00''  And '''+@startdateto+' 23:59:59''');
		END
		
		if(@dueDateFrom<>'' and @dueDateTo<>'')
		BEGIN
			print'this is duedate'
			set @WhereClause=concat(@WhereClause,' and [DeadLineDate] Between '''+@dueDateFrom+' 00:00:00''  And '''+@dueDateTo+' 23:59:59''');
		END

		if(@statusid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [statusid] ='+convert(nvarchar(50),@statusid)+'  ');
		END

		if(@priorityid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [priorityid] ='+convert(nvarchar(50),@priorityid)+'  ');
		END

		if(@assigneeid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [assigneids] in ('''+convert(nvarchar(50),@assigneeid)+''')  ');
		END

		if(@workcategoryid>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [workcategoryid] ='+convert(nvarchar(50),@workcategoryid)+'  ');
		END

		if(@isCompleted>0)
		BEGIN
			set @WhereClause=concat(@WhereClause,' and statusid<>1  ');
		END

		if(@search<>'')
		BEGIN
			set @WhereClause=concat(@WhereClause,' and [taskname] like ''%'+convert(nvarchar(50),@search)+'%''  ');
		END


	--{
	--"taskid":"","teamid":"1"
	--,"isCompleted":"0"
	--,"search":""
	--,"priorityid":""
	--,"assigneeid":"80"
	--,"statusid":"","workcategoryid":""
	--,"startdatefrom":"2026-05-02"
	--,"startdateto":"2026-05-02"
	--,"duedatefrom":""
	--,"duedateto":""
	--}



	SET @SQL='	
		DECLARE @_parentid as int=0

		select TOP(1)
			@_parentid=taskid 
		from ['+@DBNAME+'].dbo.[task_task] with (nolock)
		where taskname=''Maintenance''

		SELECT
			''1'' as [parentid]
			,''2'' as [taskid]
			,''3'' as [projectid]
			,''4'' as [entrydate]
			,''5'' as [taskname]
			,''6'' as [StartDate]
			,''7'' as [estimate_hrs]
			,''8'' as [DeadLineDate]
			,''9'' as [priorityid]
			,''10'' as [statusid] 
			,''11'' as [workcategoryid]
			,''12'' as [departmentid]
			,''13'' as [isFreez]
			,''14'' as [progress_per]
			,''15'' as [ismilestone]
			,''16'' as [estimate1_hrs]
			,''17'' as [estimate2_hrs]
			,''18'' as [isfavourite]
			,''19'' as [isnew]
			,''20'' as [isburning] 
			,''21'' as [ticketno]
			,''22'' as [assigneids]
			,''23'' as [descr]
			,''24'' as [createdbyid]
			,''25'' as [maingroupids]
			,''26'' as [workinghr]
			,''27'' as [secstatusid] 
			,''28'' as [EndDate]
			,''29'' as [isparentfreeze]
			,''30'' as [taskno]
			,''31'' as [isreadonly]
			,''32'' as [isarchive]
			,''33'' as [Completion_timestamp]
			,''34'' as [print_count]
		'
	SET @SQL1=' 
				--if('''+@designation+'''<>''ADMIN'')
				--BEGIN
					SELECT
						 ISNULL(parentid, 0)             AS [1]
						,ISNULL(taskid, 0)               AS [2]
						,ISNULL(projectid, 0)            AS [3]
						,entrydate                       AS [4]
						,ISNULL(taskname, '''')            AS [5]
						,StartDate                       AS [6]
						,ISNULL(estimate_hrs, 0)         AS [7]
						,DeadLineDate                    AS [8]
						,ISNULL(priorityid, 0)           AS [9]
						,ISNULL(statusid, 0)             AS [10]
						,ISNULL(workcategoryid, 0)       AS [11]
						,ISNULL(departmentid, 0)         AS [12]
						,ISNULL(isFreez, 0)              AS [13]
						,ISNULL(progress_per, 0)         AS [14]
						,ISNULL(ismilestone, 0)          AS [15]
						,ISNULL(estimate1_hrs, 0)        AS [16]
						,ISNULL(estimate2_hrs, 0)        AS [17]
						,ISNULL(isfavourite, 0)          AS [18]
						,ISNULL(isnew, 0)                AS [19]
						,ISNULL(isburning, 0)            AS [20]
						,ISNULL(ticketno, '''')          AS [21]
						,ISNULL(assigneids, '''')     AS [22]
						,''''	   AS [23] 
						,ISNULL([createdbyid],0)         AS [24]	
						,ISNULL([maingroupids],'''')	   as [25]
						,ISNULL([workinghr],0)			as [26]
						,ISNULL(secstatusid, 0)           AS [27]
						,EndDate							AS [28]
						,0					as [29] 
						--,ISNULL(t.taskno,'''') AS [30]			
						,CASE WHEN ISNULL(t.parentid,0) = @_parentid then t.maintenanceno
							ELSE ISNULL(t.taskno,'''')
						END AS [30]
						,t.readonlyids as [31]
						,0 as [32]  --isarchive
						,Completion_timestamp as [33]
						,ISNULL(print_count,0) as [34]
					
					FROM ['+@DBNAME+'].[dbo].task_task as t WITH (NOLOCK)
					'+ @WhereClause +'
					--WHERE ISNULL(assigneids, '''') LIKE ''%' +@loginid + '%''
					--'+iif(convert(nvarchar(10),@isCompleted)=1,'','and statusid<>1')+'
					--and isnull(t.projectid,0)=@_projectid
					--and isnull(t.RootTaskId,0)=@_RootTaskId
				--END
				--ELSE
				--BEGIN
				--	SELECT
				--		 0             AS [1]
				--		,0               AS [2]
				--		,0            AS [3]
				--		,getdate()                       AS [4]
				--		,''''            AS [5]
				--		,getdate()                      AS [6]
				--		,0        AS [7]
				--		,getdate()                    AS [8]
				--		,0           AS [9]
				--		,0             AS [10]
				--		,0       AS [11]
				--		,0         AS [12]
				--		,0              AS [13]
				--		,0        AS [14]
				--		,0          AS [15]
				--		,0        AS [16]
				--		,0        AS [17]
				--		,0          AS [18]
				--		,0                AS [19]
				--		,0            AS [20]
				--		,''''          AS [21]
				--		,''''     AS [22]
				--		,''''	   AS [23]
				--		,0         AS [24]	
				--		,''''	   as [25]
				--		,0			as [26]
				--		,0           AS [27]
				--		,getdate()							AS [28]
				--		,0					as [29] --isparentfreeze
				--		,'''' AS [30]			
				--		,'''' as [31]
				--		,0 as [32]  --isarchive
				--		,getdate() as [33]
				--		,0 as [34]
					
					
				--END
				;			

			 '
	
	PRINT(@SQL)
	PRINT(@SQL1)
	EXEC(@SQL+@SQL1)	
END

ELSE IF(isnull(@mode,'')='tasksummary')
BEGIN
	DECLARE @CompletedStatusId INT;

	

	SET @SQL='	
		SELECT @CompletedStatusId = id
		FROM ['+@DBNAME+'].dbo.task_status WITH (NOLOCK)
		WHERE LOWER(labelname) = LOWER(''Completed'');

		SELECT TOP(1)
			@_ISADMIN=IIF(ISNULL(mastermanagement_roleid,0)=3 and designation=''admin'',1,0)
			,@_loginid=id
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] U WITH (NOLOCK)
		WHERE U.userid = ''' + @appuserid + '''
	'
		print(@SQL)
		EXEC SP_EXECUTESQL 
			@SQL, N'@_ISADMIN INT OUTPUT
				,@_loginid INT OUTPUT
				,@CompletedStatusId INT OUTPUT'
				,@_ISADMIN OUTPUT
				,@_loginid OUTPUT
				,@CompletedStatusId OUTPUT

		PRINT concat('@_ISADMIN :',@_ISADMIN)
		PRINT concat('@_loginid :',@_loginid)

		
	PRINT concat('@_ISADMIN :',@_ISADMIN)
	
	IF(ISNULL(@_ISADMIN,0)=1)
	BEGIN
		

	PRINT concat('true condition @_ISADMIN :',@_ISADMIN)
	SET @SQL2='
		    SELECT
		        workcategoryid
		        ,COUNT(*) AS [Total]
		        ,SUM(CASE WHEN CAST(StartDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS TodayTask
		        ,SUM(CASE WHEN DeadlineDate < CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + ' THEN 1 ELSE 0 END) AS	Overdue
		        ,SUM(CASE WHEN CAST(DeadlineDate AS DATE) = CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + ' THEN 1 ELSE   0	END) AS DueToday
		        ,SUM(CASE WHEN StartDate > CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS Upcoming
		    FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
		    WHERE workcategoryid IN (
		        SELECT id
		        FROM ['+@DBNAME+'].dbo.task_workcategory WITH (NOLOCK)
		        WHERE ISNULL(isdelete,0)=0 
				AND labelname<>''''
		    )
		    GROUP BY workcategoryid

			SELECT 
				 SUM(CASE WHEN DeadlineDate < CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + ' THEN 1 ELSE 0 END) AS	Overdue
		        ,SUM(CASE WHEN CAST(DeadlineDate AS DATE) = CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + ' THEN 1 ELSE   0	END) AS DueToday
			 FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)

			 SELECT 
				 SUM(CASE WHEN CAST(StartDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS TodayTask
		        ,SUM(CASE WHEN StartDate > CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS Upcoming
			 FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
		'
		
	END
	ELSE
	BEGIN
	
	PRINT concat('----------ELSE false condition @_ISADMIN :',@_ISADMIN)
	SET @SQL2='	
			SELECT
			   	 workcategoryid
			   	,COUNT(*) AS [Total]
			   	,SUM(CASE WHEN CAST(StartDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS TodayTask
			   	,SUM(CASE WHEN DeadlineDate < CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + ' THEN 1 ELSE 0 END) AS  	Overdue
			   	,SUM(CASE WHEN CAST(DeadlineDate AS DATE) = CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + 'THEN 1	ELSE   0	END) AS DueToday
			   	,SUM(CASE WHEN StartDate > CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS Upcoming
			   FROM ['+@DBNAME+'].[dbo].task_task as M WITH (NOLOCK)
			   WHERE taskid in (
			   		select taskid 
			   		from ['+@DBNAME+'].[dbo].[task_user_task_bind] WITH (NOLOCK) 
			   		where systemloginid='+convert(nvarchar(10),@_loginid)+'
			   		--union all
			   		--select taskid 
			   		--from ['+@DBNAME+'].[dbo].task_emprole WITH (NOLOCK)
			   		--where assigneeid='+convert(nvarchar(10),@_loginid)+'
			   		UNION 
			   		SELECT taskid
			   		FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
			   		WHERE createdbyid='+convert(nvarchar(10),@_loginid)+'
			   ) and workcategoryid in 
			   	(select 
			   		id 
			   		from ['+@DBNAME+'].dbo.task_workcategory WITH (NOLOCK)
			   		where isnull(isdelete,0)=0 
					and labelname<>'''')
			   	group by workcategoryid 

			SELECT 
				 SUM(CASE WHEN DeadlineDate < CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + ' THEN 1 ELSE 0 END) AS	Overdue
		        ,SUM(CASE WHEN CAST(DeadlineDate AS DATE) = CAST(GETDATE() AS DATE) AND ISNULL(statusid,0) <> ' + CAST(@CompletedStatusId AS NVARCHAR(10)) + ' THEN 1 ELSE   0	END) AS DueToday
			 FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
			 WHERE taskid in (
			   	select taskid 
			   	from ['+@DBNAME+'].[dbo].[task_user_task_bind] WITH (NOLOCK) 
			   	where systemloginid='+convert(nvarchar(10),@_loginid)+'
			   	--union all
			   	--select taskid 
			   	--from ['+@DBNAME+'].[dbo].task_emprole WITH (NOLOCK)
			   	--where assigneeid='+convert(nvarchar(10),@_loginid)+'
			   	UNION 
			   	SELECT taskid
			   	FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
			   	WHERE createdbyid='+convert(nvarchar(10),@_loginid)+'
			   )

			  SELECT 
				 SUM(CASE WHEN CAST(StartDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS TodayTask
		        ,SUM(CASE WHEN StartDate > CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS Upcoming
			 FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
			 WHERE taskid in (
			   	select taskid 
			   	from ['+@DBNAME+'].[dbo].[task_user_task_bind] WITH (NOLOCK) 
			   	where systemloginid='+convert(nvarchar(10),@_loginid)+'
			   	--union all
			   	--select taskid 
			   	--from ['+@DBNAME+'].[dbo].task_emprole WITH (NOLOCK)
			   	--where assigneeid='+convert(nvarchar(10),@_loginid)+'
			   	UNION 
			   	SELECT taskid
			   	FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
			   	WHERE createdbyid='+convert(nvarchar(10),@_loginid)+'
			   )
		'			
	END

	

	--PRINT(@SQL)
	PRINT(@SQL1)
	PRINT(@SQL2)
	

	EXEC(@SQL1+@SQL2)


	
END


ELSE IF(isnull(@mode,'')='tasklist')
BEGIN
	SET @SQL='
		SELECT 			
		   ''1'' as [taskid]
		  ,''2'' as [projectid]
		  ,''3'' as [entrydate]
		  ,''4'' as [taskname]
		  ,''5'' as [StartDate] 
		  ,''6'' as [estimate_hrs]
		  ,''7'' as [DeadLineDate]
		  ,''8'' as [priorityid]
		  ,''9'' as [statusid]
		  ,''10'' as [workcategoryid]
		  ,''11'' as [departmentid]
		  ,''12'' as [parentid]
		  ,''13'' as [ismilestone]
		  ,''14'' as [estimate1_hrs]
		  ,''15'' as [estimate2_hrs]
		  ,''16'' as [descr]
		  ,''17'' as [isfavourite]
		  ,''18'' as [isnew]
		  ,''19'' as [isburning]
		  ,''20'' as [ticketno]
		  ,''21'' as [assigneids]
		  ,''22'' as [createdbyid]
		  ,''23'' as [secstatusid]
		  ,''24'' as [filtergroupids]

		DECLARE @_systemloginid as int=0
		SELECT TOP(1)
			@_systemloginid=id
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
		WHERE userid='''+@appuserid+'''
		'

	SET @SQL1='
		SELECT t.[taskid] as [1]
		  ,ISNULL(t.[projectid],0) as [2]
		  ,t.[entrydate] as [3]
		  ,ISNULL(t.[taskname],'''') as [4]
		  ,t.[StartDate] as [5]
		  ,ISNULL(t.[estimate_hrs],0) as [6]
		  ,t.[DeadLineDate] as [7]
		  ,ISNULL(t.[priorityid],0) as [8]
		  ,ISNULL(t.[statusid],0) as [9]
		  ,ISNULL(t.[workcategoryid],0) as [10]
		  ,ISNULL(t.[departmentid],0) as [11]	
		  ,ISNULL(t.[parentid],0) as [12]	
		  ,ISNULL(t.[ismilestone],0) as [13]	
		  ,ISNULL(t.[estimate1_hrs],0) as [14]	
		  ,ISNULL(t.[estimate2_hrs],0) as [15]	
		  ,ISNULL(D.[descr],'''') as [16]
		  ,ISNULL(t.[isfavourite],0) as [17]
		  ,ISNULL(t.[isnew],0) as [18]
		  ,ISNULL(t.[isburning],0) as [19]	
		  ,ISNULL(t.[ticketno],'''') as [20]
		  ,ISNULL(U1.[assigneids],'''') as [21]
		  ,ISNULL(t.[createdbyid],0) as [22]
		  ,ISNULL(t.[secstatusid],0) as [23]
		  ,(
				SELECT DISTINCT
						ISNULL(st.[taskid],0) as [1]
						,ISNULL(st.[projectid],0) as [2]
						,st.[entrydate] as [3]
						,ISNULL(st.[taskname],'''') as [4]
						,st.[StartDate] as [5]
						,ISNULL(st.[estimate_hrs],0) as [6]
						,st.[DeadLineDate] as [7]
						,ISNULL(st.[priorityid],0) as [8]
						,ISNULL(st.[statusid],0) as [9]
						,ISNULL(st.[workcategoryid],0) as [10]
						,ISNULL(st.[departmentid],0) as [11]
						,ISNULL(st.[parentid],0) as [12]	
						,ISNULL(st.[ismilestone],0) as [13]	
						,ISNULL(st.[estimate1_hrs],0) as [14]	
						,ISNULL(st.[estimate2_hrs],0) as [15]
						,ISNULL(D.[descr],'''') as [16]
						,ISNULL(st.[isfavourite],0) as [17]
						,ISNULL(st.[isnew],0) as [18]
						,ISNULL(st.[isburning],0) as [19]
						,ISNULL(st.[ticketno],'''') as [20]
						,ISNULL(st.[assigneids],'''') as [21]
						,ISNULL(st.[createdbyid],'''') as [22]	
						,ISNULL(st.[secstatusid],0) as [23]
				FROM (
					SELECT t.*
					from ['+@DBNAME+'].[dbo].[task_task] as t with (nolock)
					INNER JOIN ['+@DBNAME+'].[dbo].[task_user_task_bind] as U with (nolock)
					ON t.[taskid]=U.[taskid]						
					WHERE ISNULL(U.[systemloginid],0)=@_systemloginid
					AND ISNULL(t.[parentid],0)<>-1
				) AS st 
				LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_descr] as D with (nolock)
				ON isnull(st.taskid,0)=isnull(D.[taskid],0)
				WHERE st.parentid = t.[taskid]
				FOR JSON PATH
			) AS subtasks
	  FROM ['+@DBNAME+'].[dbo].[task_task] as t	
	  LEFT OUTER JOIN (
			select 
				 taskid
				,string_Agg(systemloginid,'','') as assigneids 
			from ['+@DBNAME+'].[dbo].[task_user_task_bind] WITH (NOLOCK)
			where isnull(systemloginid,0)<>0
			group by taskid
		) as U1 ON t.[taskid]=U1.[taskid]	  
	  LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_descr] as D with (nolock)
	  ON isnull(t.taskid,0)=isnull(D.[taskid],0)
	  '+ IIF(convert(nvarchar(20),@taskid)>0,'WHERE t.[taskid]='+convert(nvarchar(20),@taskid)+''
		,'
			INNER JOIN ['+@DBNAME+'].[dbo].[task_user_task_bind] as U with (nolock)
			ON t.[taskid]=U.[taskid]	
			WHERE ISNULL(U.[systemloginid],0)=@_systemloginid
			AND ISNULL(t.[parentid],0)=0
	  ') +'
	  ;


	  '

	print(@SQL)
	print(@SQL1)
	exec(@SQL+@SQL1)
END
ELSE IF(isnull(@mode,'')='get_attachment')
BEGIN
	IF(@taskId>0)
	BEGIN
		SET @SQL='
			 SELECT 			
			   ''1'' as [id]
			  ,''2'' as [taskid]
			  ,''3'' as [entrydate]
			  ,''4'' as [foldername]
			  ,''5'' as [DocumentName]		
			  ,''6'' as [DocumentUrl]	
			  ,''7'' as [ipaddress]
			  ,''8'' as [userid]
			  ,''9'' as [taskname]
			  ,''10'' as [projectid]

			  SELECT 
				   A.[id] as [1]
				  ,ISNULL(A.[taskid],0) as [2]
				  ,A.[entrydate] as [3]	
				  ,ISNULL(A.[foldername],'''') as [4]
				  ,ISNULL(A.[DocumentName],'''') as [5]
				  ,ISNULL(A.[DocumentUrl],'''') as [6]
				  ,ISNULL(A.[ipaddress],'''') as [7]
				  ,ISNULL(A.[userid],'''') as [8]
				  ,ISNULL(B.[taskname],'''') as [9]
				  ,ISNULL(B.[projectid],0) as [10]
			  FROM ['+@DBNAME+'].[dbo].[task_attachement] as A WITH (NOLOCK)
			  INNER JOIN (select projectid,taskid,taskname from ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)) as B
				ON ISNULL(A.[taskid],0)=ISNULL(B.[taskid],0)
			  WHERE ISNULL(A.taskId,0)='+CONVERT(NVARCHAR(MAX),@taskId)+'

		'
	END
	ELSE
	BEGIN
		SET @SQL='
			 SELECT 			
			   ''1'' as [id]
			  ,''2'' as [taskid]
			  ,''3'' as [entrydate]
			  ,''4'' as [foldername]
			  ,''5'' as [DocumentName]		
			  ,''6'' as [DocumentUrl]	
			  ,''7'' as [ipaddress]
			  ,''8'' as [userid]
			  ,''9'' as [taskname]
			  ,''10'' as [projectid]

			  SELECT 
				   A.[id] as [1]
				  ,ISNULL(A.[taskid],0) as [2]
				  ,A.[entrydate] as [3]	
				  ,ISNULL(A.[foldername],'''') as [4]
				  ,ISNULL(A.[DocumentName],'''') as [5]
				  ,ISNULL(A.[DocumentUrl],'''') as [6]
				  ,ISNULL(A.[ipaddress],'''') as [7]
				  ,ISNULL(A.[userid],'''') as [8]
				  ,ISNULL(B.[taskname],'''') as [9]
				  ,ISNULL(B.[projectid],0) as [10]
			  FROM ['+@DBNAME+'].[dbo].[task_attachement] as A WITH (NOLOCK)
			  INNER JOIN (select projectid,taskid,taskname from ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)) as B
				ON ISNULL(A.[taskid],0)=ISNULL(B.[taskid],0)

		'
	END
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='save_attachment' AND isnull(@p,'')<>'')
BEGIN
	SET @SQL='
	DECLARE @_taskId NVARCHAR(50);
	SELECT @_taskId = JSON_VALUE('''+@p+''', ''$.taskid'');

	DELETE FROM ['+@DBNAME+'].[dbo].[task_attachement] WHERE ISNULL(taskId,0)=@_taskId
	
	INSERT INTO ['+@DBNAME+'].[dbo].[task_attachement] (
		[taskid]
		, [entrydate]
		, [foldername]
		, [DocumentName]
		, [DocumentUrl]
		, [ipaddress]
		, [userid]
	)
	SELECT 
		@_taskId
		,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
		,JSON_VALUE(folder.value, ''$.folderName'') AS FolderName
		,JSON_VALUE(doc.value, ''$.documents'') AS DocumentName
		,JSON_VALUE(doc.value, ''$.documentsurl'') AS DocumentUrl
		,'''+@IPAddress+'''
		,'''+@appuserid+'''
	FROM OPENJSON('''+@p+''', ''$.folders'') AS folder
	CROSS APPLY OPENJSON(JSON_QUERY(folder.value, ''$.documents'')) AS doc;

	SELECT 
		1 as stat
		,''save successfully'' as stat_msg
		,1000 as stat_code;	
	'
	PRINT(@SQL)
	EXEC(@SQL)
END


ELSE IF(isnull(@mode,'')='taskmodulelist')
BEGIN

	SET @SQLASSIGNEE='
			IF OBJECT_ID(''tempdb..#task_descr_'+@RandomNo+''') IS NOT NULL DROP TABLE #task_descr_'+@RandomNo+';

			SELECT [taskid],[descr] 
			INTO #task_descr_'+@RandomNo+'
			FROM ['+@DBNAME+'].[dbo].[task_descr] with (nolock)
		'
		
	SET @SQL='
		SELECT 			
		   ''1'' as [parentid]
			,''2'' as [taskid]
			,''3'' as [projectid]
			,''4'' as [entrydate]
			,''5'' as [taskname]
			,''6'' as [StartDate]
			,''7'' as [estimate_hrs]
			,''8'' as [DeadLineDate]
			,''9'' as [priorityid]
			,''10'' as [statusid] 
			,''11'' as [workcategoryid]
			,''12'' as [departmentid]
			,''13'' as [isFreez]
			,''14'' as [progress_per]
			,''15'' as [ismilestone]
			,''16'' as [estimate1_hrs]
			,''17'' as [estimate2_hrs]
			,''18'' as [isfavourite]
			,''19'' as [isnew]
			,''20'' as [isburning] 
			,''21'' as [ticketno]
			,''22'' as [assigneids]
			,''23'' as [descr]
			,''24'' as [createdbyid]
			,''25'' as [maingroupids]
			,''26'' as [workinghr]
			,''27'' as [secstatusid] 
			,''28'' as [EndDate]
			,''29'' as [progress]
			,''30'' as [isreadonly]
			
		  ;

		DECLARE 
			@_systemloginid as int=0
			,@_mastermanagement_roleid as int=0
			,@_designation as nvarchar(100)=''''

		SELECT TOP(1)
			@_systemloginid=id
			,@_mastermanagement_roleid=isnull(mastermanagement_roleid,0)
			,@_designation=ISNULL(designation,'''')
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
		WHERE userid='''+@appuserid+'''

		IF(@_mastermanagement_roleid=3 and @_designation=''admin'')
		BEGIN
			;WITH RecursiveSubTasks AS (
			    SELECT taskid, parentid, statusid, 1 AS Depth
			    FROM ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)
			    UNION ALL
			    SELECT st.taskid, st.parentid, st.statusid, rs.Depth + 1
			    FROM ['+@DBNAME+'].[dbo].[task_task] st  WITH (NOLOCK)
			    INNER JOIN RecursiveSubTasks rs ON st.parentid = rs.taskid
				WHERE rs.Depth < 50
			),
			ProgressAgg AS (
			    SELECT 
			        p.taskid AS parentid,
			        COUNT(r.taskid) AS total_subtasks,
			        SUM(CASE WHEN s.labelname = ''Completed'' THEN 1 ELSE 0 END) AS completed_subtasks
			    FROM ['+@DBNAME+'].[dbo].[task_task] p WITH (NOLOCK)
			    LEFT JOIN RecursiveSubTasks r ON r.parentid = p.taskid
			    LEFT JOIN ['+@DBNAME+'].[dbo].[task_status] s ON r.statusid = s.id
			    GROUP BY p.taskid
			)
			'
		SET @SQL1='
			SELECT 
				  ISNULL(t.[parentid],0) as [1]
				,ISNULL(t.[taskid],0) as [2]
				,ISNULL(t.[projectid],0) as [3]
				,t.[entrydate] as [4]
				,ISNULL(t.[taskname],'''') as [5]
				,t.[StartDate] as [6]
				,ISNULL(t.[estimate_hrs],0)  as [7]
				,t.[DeadLineDate] as [8]
				,ISNULL(t.[priorityid],0) as [9]
				,ISNULL(t.[statusid],0) as [10] 
				,ISNULL(t.[workcategoryid],0) as [11]
				,ISNULL(t.[departmentid],0) as [12]
				,ISNULL(t.[isFreez],0) as [13]
				,ISNULL(t.[progress_per],0) as [14]
				,ISNULL(t.[ismilestone],0) as [15]
				,ISNULL(t.[estimate1_hrs],0) as [16]
				,ISNULL(t.[estimate2_hrs],0) as [17]
				,ISNULL(t.[isfavourite],0) as [18]
				,ISNULL(t.[isnew],0) as [19]
				,ISNULL(t.[isburning],0) as [20]
				,ISNULL(t.[ticketno],'''') as [21]
				,ISNULL(t.[assigneids],'''') as [22]
				,ISNULL(D.[descr],'''') as [23]
				,ISNULL(t.[createdbyid],0) as [24]	
				,ISNULL(t.[maingroupids],'''') as [25]	
				,ISNULL(t.[workinghr],0) as [26]
				,ISNULL(t.[secstatusid],0) as [27] 
				,t.[EndDate] as [28]				
				,0 as [29]
				,ISNULL(t.readonlyids,'''') as [30]
			 FROM ['+@DBNAME+'].[dbo].[task_task] as t WITH (NOLOCK)
			 LEFT OUTER JOIN ( SELECT [taskid],[descr] FROM #task_descr_'+@RandomNo+' with (nolock)) as D 
			 ON D.taskid=t.[taskid]
			 LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_status] S with (nolock)
			    ON t.statusid = S.id
			 LEFT JOIN ProgressAgg prog ON prog.parentid = t.taskid
			 WHERE ISNULL(t.parentid,0) = 0
			 AND ISNULL(t.[parentid],0)<>-1
			 OPTION (MAXRECURSION 1000)
			 ;
		END
		ELSE
		'
	SET @SQL2='	
		BEGIN
			;WITH RecursiveSubTasks AS (
			    SELECT taskid, parentid, statusid, 1 AS Depth
			    FROM ['+@DBNAME+'].[dbo].[task_task] WITH  (NOLOCK)
			    UNION ALL
			    SELECT st.taskid, st.parentid, st.statusid, rs.Depth + 1
			    FROM ['+@DBNAME+'].[dbo].[task_task] st WITH  (NOLOCK)
			    INNER JOIN RecursiveSubTasks rs ON st.parentid = rs.taskid
				WHERE rs.Depth < 50
			),
			ProgressAgg AS (
			    SELECT 
			        p.taskid AS parentid,
			        COUNT(r.taskid) AS total_subtasks,
			        SUM(CASE WHEN s.labelname = ''Completed'' THEN 1 ELSE 0 END) AS completed_subtasks
			    FROM ['+@DBNAME+'].[dbo].[task_task] p WITH  (NOLOCK)
			    LEFT JOIN RecursiveSubTasks r ON r.parentid = p.taskid
			    LEFT JOIN ['+@DBNAME+'].[dbo].[task_status] s ON r.statusid = s.id
			    GROUP BY p.taskid
			)

			SELECT 
				  ISNULL(t.parentid, 0)             AS [1]
				,ISNULL(t.taskid, 0)               AS [2]
				,ISNULL(t.projectid, 0)            AS [3]
				,t.entrydate                       AS [4]
				,ISNULL(t.taskname, '''')            AS [5]
				,t.StartDate                       AS [6]
				,ISNULL(t.estimate_hrs, 0)         AS [7]
				,t.DeadLineDate                    AS [8]
				,ISNULL(t.priorityid, 0)           AS [9]
				,ISNULL(t.statusid, 0)             AS [10]
				,ISNULL(t.workcategoryid, 0)       AS [11]
				,ISNULL(t.departmentid, 0)         AS [12]
				,ISNULL(t.isFreez, 0)              AS [13]
				,ISNULL(t.progress_per, 0)         AS [14]
				,ISNULL(t.ismilestone, 0)          AS [15]
				,ISNULL(t.estimate1_hrs, 0)        AS [16]
				,ISNULL(t.estimate2_hrs, 0)        AS [17]
				,ISNULL(t.isfavourite, 0)          AS [18]
				,ISNULL(t.isnew, 0)                AS [19]
				,ISNULL(t.isburning, 0)            AS [20]
				,ISNULL(t.ticketno, '''')            AS [21]
				--,convert(nvarchar(max),@_systemloginid)       AS [22]
				,ISNULL(t.[assigneids],'''') as [22]
				,ISNULL(D.[descr],'''') as [23]
				,ISNULL(t.[createdbyid],0) as [24]
				,ISNULL(t.[maingroupids],'''') as [25]	
				,ISNULL(t.[workinghr],0) as [26]
				,ISNULL(t.secstatusid, 0)             AS [27]
				,t.EndDate                       AS [28]			
				,0 as [29]				
				,ISNULL(t.readonlyids,'''') as [30]
			 FROM ['+@DBNAME+'].[dbo].[task_task] as t with (nolock)	 
			 
			 LEFT OUTER JOIN ( SELECT [taskid],[descr] FROM #task_descr_'+@RandomNo+' with (nolock)) as D
			 ON D.taskid=t.[taskid]		
			  LEFT JOIN ProgressAgg prog ON prog.parentid = t.taskid			
			 WHERE t.taskid in (
				select taskid 
				from ['+@DBNAME+'].[dbo].[task_user_task_bind] WITH (NOLOCK) 
				where systemloginid=@_systemloginid
				--union all
				--select taskid 
				--from ['+@DBNAME+'].[dbo].task_emprole WITH (NOLOCK)
				--where assigneeid=@_systemloginid						
			)
			 AND ISNULL(t.parentid,0) = 0
			 AND ISNULL(t.[parentid],0)<>-1
			 OPTION (MAXRECURSION 1000)
			 ;
		  END

		--IF OBJECT_ID(''tempdb..#ASSIGNEELIST_'+@RandomNo+''') IS NOT NULL DROP TABLE #ASSIGNEELIST_'+@RandomNo+';
		IF OBJECT_ID(''tempdb..#task_descr_'+@RandomNo+''') IS NOT NULL DROP TABLE #task_descr_'+@RandomNo+';
		
	  '
	PRINT(@SQLASSIGNEE)		
	print(@SQL)
	print(@SQL1)
	print(@SQL2)
	exec(@SQLASSIGNEE+@SQL + @SQL1 + @SQL2)

END

ELSE IF(isnull(@mode,'')='task_descr_save')
BEGIN
	SET @SQL='	
		IF EXISTS(
			SELECT 1 FROM ['+@DBNAME+'].dbo.[task_descr] WITH (NOLOCK) 
			WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
		)
		BEGIN
			print ''change entry step-1''

			UPDATE T
			SET  T.[descr]='''+convert(nvarchar(max),@descr)+'''					
			FROM ['+@DBNAME+'].[dbo].[task_descr] AS T WITH (NOLOCK) 
			WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
			
			SELECT 
				1 as stat
				,''description update successfully'' as stat_msg
				,1000 as stat_code	

		END
		ELSE
		BEGIN
			
			INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
			([taskid],[descr])
			VALUES('+convert(nvarchar(20),@taskid)+','''+convert(nvarchar(max),@descr)+''')

			SELECT 
				1 as stat
				,''description save successfully'' as stat_msg
				,1000 as stat_code	
		END		
	'

	print (@SQL)
	exec (@SQL)
END
ELSE IF(isnull(@mode,'')='task_meeting_attnd')
BEGIN
	SET @SQL='	
		
			update ['+@DBNAME+'].[dbo].[task_meeting_accept_reject]
			set ismeeting_attnd='+convert(nvarchar(max),@ismeeting_attnd)+'
				,ismeeting_attnd_date=isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			where ISNULL(meetingid,0)='+convert(nvarchar(20),@meetingid)+'
			AND userid='''+convert(nvarchar(max),@appuserid)+'''
			
			
			SELECT 
				1 as stat
				,''successfully attend'' as stat_msg
				,1000 as stat_code	

			
	'

	print (@SQL)
	exec (@SQL)
END
ELSE IF(isnull(@mode,'')='task_getdescr')
BEGIN
	SET @SQL='	
			SELECT 
				[taskid]
			  ,[descr]
			FROM ['+@DBNAME+'].[dbo].[task_descr] WITH (NOLOCK)
			WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'
	'
	print (@SQL)
	exec (@SQL)
END
--ELSE IF(isnull(@mode,'')='task_comment_save')
--BEGIN
--	SET @SQL='				
--			INSERT INTO ['+@DBNAME+'].[dbo].[task_comment]
--			([taskid],[entrydate],[comment],[appuserid],[ipaddress])
--			VALUES(
--			'+convert(nvarchar(20),@taskid)+'
--			,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
--			,'''+convert(nvarchar(max),@comment)+'''
--			,'''+convert(nvarchar(max),@appuserid)+'''
--			,'''+convert(nvarchar(max),@IPAddress)+'''
--			)

--			SELECT 
--				1 as stat
--				,''comment save successfully'' as stat_msg
--				,1000 as stat_code	
			
--	'

--	print (@SQL)
--	exec (@SQL)
--END

ELSE IF(isnull(@mode,'')='task_comment_save')
BEGIN
	SET @SQL='
		DECLARE @_taskId NVARCHAR(50);
		SELECT @_taskId = JSON_VALUE('''+@p+''', ''$.taskid'');
		DECLARE @_comment NVARCHAR(MAX) = JSON_VALUE('''+@p+''', ''$.comment'');

		IF EXISTS (SELECT 1 FROM OPENJSON('''+@p+''', ''$.folders''))
		BEGIN
			INSERT INTO ['+@DBNAME+'].[dbo].[task_comment] (
				[taskid]
				,[entrydate]
				,[foldername]
				,[DocumentName]
				,[DocumentUrl]
				,[ipaddress]
				,[appuserid]
				,[comment]
			)
			SELECT 
				@_taskId
				,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,JSON_VALUE(folder.value, ''$.folderName'') AS FolderName
				,JSON_VALUE(doc.value, ''$.documents'') AS DocumentName
				,JSON_VALUE(doc.value, ''$.documentsurl'') AS DocumentUrl
				,'''+@IPAddress+'''
				,'''+@appuserid+'''
				,@_comment
			FROM OPENJSON('''+@p+''', ''$.folders'') AS folder
			CROSS APPLY OPENJSON(JSON_QUERY(folder.value, ''$.documents'')) AS doc;
			
		END
		ELSE
		BEGIN
			INSERT INTO ['+@DBNAME+'].[dbo].[task_comment] (
			    [taskid]
			    ,[entrydate]
			    ,[foldername]
			    ,[DocumentName]
			    ,[DocumentUrl]
			    ,[ipaddress]
			    ,[appuserid]
			    ,[comment]
			)
			VALUES (
			    @_taskId
			    ,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,''''
				,''''
				,''''
				,'''+@IPAddress+'''
				,'''+@appuserid+'''
				,@_comment
			);
		
		SELECT 
			1 as stat
			,''save successfully'' as stat_msg
			,1000 as stat_code;
		END
		'
	

	print (@SQL)
	exec (@SQL)
END
ELSE IF(isnull(@mode,'')='task_getcomment')
BEGIN	
--SELECT 
			--   [id]
			--  ,[taskid]
			--  ,[entrydate]
			--  ,ISNULL([comment],'''') as [comment]
			--  ,ISNULL([appuserid],'''') as [appuserid]
			--  ,ISNULL([ipaddress],'''') as [ipaddress]
			--  ,ISNULL([foldername],'''') as [foldername]
			--  ,ISNULL([DocumentName],'''') as [DocumentName]
			--  ,ISNULL([DocumentUrl],'''') as [DocumentUrl]
			--FROM ['+@DBNAME+'].[dbo].[task_comment] WITH (NOLOCK)
			--WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'	
	SET @SQL='
			
			;WITH TaskTree AS(
			SELECT 
				ISNULL([taskname],'''') as [taskname]
				,ISNULL([taskid],0) as [taskid]

			from ['+@DBNAME+'].dbo.task_task with (NOLOCK)
			
			WHERE taskid= '+convert(nvarchar(max),@taskid)+'

			UNION ALL
			SELECT 
				ISNULL(t.[taskname],'''') as [taskname]
				,ISNULL(t.[taskid],0) as [taskid]
			from ['+@DBNAME+'].dbo.task_task t with (NOLOCK)
			INNER JOIN TaskTree tt 
					ON t.parentid = tt.taskid
		)

		SELECT 
			DISTINCT
				ISNULL(t.[taskid],0) as [taskid]
				,ISNULL([id],0) as [id]
				,ISNULL([entrydate],0) AS [entrydate]
				,ISNULL([comment],'''') as [comment]
				,ISNULL([appuserid],'''') as [appuserid]
				,ISNULL([ipaddress],'''') as [ipaddress]
				,ISNULL([foldername],'''') as [foldername]
				,ISNULL([DocumentName],'''') as [DocumentName]
				,ISNULL([DocumentUrl],'''') as [DocumentUrl]
			FROM TaskTree AS t
			INNER JOIN(
				SELECT 
					 [id]
					,[taskid]
					,[entrydate]
					,ISNULL([comment],'''') as [comment]
					,ISNULL([appuserid],'''') as [appuserid]
					,ISNULL([ipaddress],'''') as [ipaddress]
					,ISNULL([foldername],'''') as [foldername]
					,ISNULL([DocumentName],'''') as [DocumentName]
					,ISNULL([DocumentUrl],'''') as [DocumentUrl]
				FROM ['+@DBNAME+'].[dbo].[task_comment] WITH (NOLOCK)
			) AS C
			ON t.taskid=C.taskid


			--IF EXISTS(
			--	SELECT 1 
			--	FROM ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)
			--	WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'
			--	AND ISNULL(parentid,0)=0
			--)
			--BEGIN
			--	SELECT 
			--	   [id]
			--	  ,[taskid]
			--	  ,[entrydate]
			--	  ,ISNULL([comment],'''') as [comment]
			--	  ,ISNULL([appuserid],'''') as [appuserid]
			--	  ,ISNULL([ipaddress],'''') as [ipaddress]
			--	  ,ISNULL([foldername],'''') as [foldername]
			--	  ,ISNULL([DocumentName],'''') as [DocumentName]
			--	  ,ISNULL([DocumentUrl],'''') as [DocumentUrl]
			--	FROM ['+@DBNAME+'].[dbo].[task_comment] WITH (NOLOCK)
			--	WHERE ISNULL([taskid],0) IN (
			--		SELECT taskid 
			--		FROM ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)
			--		WHERE taskid='+convert(nvarchar(20),@taskid)+'
			--		AND ISNULL(taskid,0)>0
			--	)
			--END
	'
	print (@SQL)
	exec (@SQL)
END

ELSE IF(isnull(@mode,'')='meetingdetails')
BEGIN
	SET @SQL='
		select  
			 entrydate
			,meetingid
			,userid
			,isAccept
			,Comment 
			,isnull(ismeeting_attnd,0) as ismeeting_attnd
		from ['+@DBNAME+'].[dbo].[task_meeting_accept_reject] with (nolock)
		WHERE isnull(meetingid,0)='+convert(nvarchar(max),@meetingid)+'

		SELECT 
			1 as stat
			,''success'' as stat_msg
			,1000 as stat_code

	
	'
	PRINT(@SQL)
	EXEC(@SQL)
END
ELSE IF(isnull(@mode,'')='meetingdetailslist')
BEGIN
	SET @SQL='
		select  
			 entrydate
			,meetingid
			,userid
			,isAccept
			,Comment 
			,isnull(ismeeting_attnd,0) as ismeeting_attnd
		from ['+@DBNAME+'].[dbo].[task_meeting_accept_reject] with (nolock)

		SELECT 
			1 as stat
			,''success'' as stat_msg
			,1000 as stat_code
	'
	PRINT(@SQL)
	EXEC(@SQL)
END
ELSE IF(isnull(@mode,'')='meetinglist')
BEGIN
	SET @SQL='
		declare 
				@_LoginId as int=0
			,@_LoginUserCode as nvarchar(max)=''''
			,@_loginroleid as int=0

		SELECT TOP(1)
			@_LoginId=id
			,@_LoginUserCode=isnull(customercode,'''')
			,@_loginroleid=isnull(mastermanagement_roleid,0)
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
		WHERE userid='''+@appuserid+'''

		SELECT 
		   M.[meetingid]
		  ,M.[entrydate]
		  ,M.[projectid]
		  ,M.[taskid]
		  ,T.[taskname]
		  ,P.[labelname] AS [ProjectName]
		  ,T.[taskname] AS meetingtitle
		  ,M.[assigneids]
		  ,M.[StartDate]
		  ,M.[EndDate]
		  ,M.[isAllDay]
		  ,M.[Desc]
		  ,ISNULL(M.[workcategoryid],0) AS workcategoryid
		  ,ISNULL(M.[createdbyid],0) AS createdbyid
		  ,ISNULL(M.[estimate_hrs],0) AS estimate_hrs
		  ,ISNULL(M.[estimate1_hrs],0) AS estimate1_hrs
		  ,ISNULL(M.[estimate2_hrs],0) AS estimate2_hrs
		  ,ISNULL(M.[DeadLineDate],0) AS DeadLineDate
		  ,ISNULL(M.[priorityid],0) as priorityid
		  ,ISNULL(M.[statusid],0) as statusid
		  ,ISNULL(M.[workinghr],0) as workinghr
		  ,ISNULL(M.[isfavourite],0) as isfavourite
		  ,ISNULL(M.[isFreez],0) as isFreez
		  ,ISNULL(M.[ismilestone],0) as ismilestone
		  ,ISNULL(T.[parentid],0) as parentid
		  ,ISNULL(T.[RootTaskId],0) as RootTaskId
	  FROM ['+@DBNAME+'].[dbo].[task_meeting] AS M WITH(NOLOCK)
	  LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_task] as T WITH(NOLOCK)
		ON M.[taskid]=T.[taskid]
	  LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_project] as P WITH(NOLOCK)
		ON M.[projectid]=P.[id]
	  ORDER BY M.[meetingid] DESC
   '
   PRINT(@SQL)
   EXEC(@SQL)
END

ELSE IF(isnull(@mode,'')='meetinglistbylogin')
BEGIN
	SET @SQL='
		SELECT 
		   M.[meetingid]
		  ,M.[entrydate]
		  ,M.[projectid]
		  ,M.[taskid]
		  ,T.[taskname]
		  ,P.[labelname] AS [ProjectName]
		  ,T.[taskname] AS meetingtitle
		  ,M.[assigneids]
		  ,M.[StartDate]
		  ,M.[EndDate]
		  ,M.[isAllDay]
		  ,M.[Desc]
		  ,M.[workcategoryid]
		  ,M.[createdbyid]
		  ,M.[estimate_hrs]
		  ,M.[estimate1_hrs]
		  ,M.[estimate2_hrs]
		  ,M.[DeadLineDate]
		  ,M.[priorityid]
		  ,M.[statusid]
		  ,M.[workinghr]
		  ,M.[isfavourite]
		  ,M.[isFreez]
		  ,M.[ismilestone]
		  ,T.[parentid]
		  ,t.[RootTaskId]
	  FROM ['+@DBNAME+'].[dbo].[task_meeting] AS M WITH (NOLOCK)
	  LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_task] as T WITH (NOLOCK)
		ON M.[taskid]=T.[taskid]
	  LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_project] as P WITH (NOLOCK)
		ON M.[projectid]=P.[id]	
	WHERE EXISTS (
		SELECT 1
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] U WITH (NOLOCK)
		WHERE U.userid = ''' + @appuserid + '''
		 AND '','' + M.assigneids + '','' LIKE ''%,'' + CONVERT(NVARCHAR(MAX), U.id) + '',%''
	)
	ORDER BY M.[meetingid] DESC	  
   '
   PRINT(@SQL)
   EXEC(@SQL)
   --',' + assigneids + ',' LIKE '%,11536,%'
END
ELSE IF(isnull(@mode,'')='meeting_approvalsave')
BEGIN
	SET @SQL='	
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].dbo.[task_meeting_accept_reject] WITH (NOLOCK) 
				WHERE [meetingid]='+convert(nvarchar(20),@meetingid)+'
				AND [userid]='''+@appuserid+'''
			)
			BEGIN
				UPDATE ['+@DBNAME+'].[dbo].[task_meeting_accept_reject]
				SET [entrydate] = isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
					  ,[meetingid] = '+convert(nvarchar(20),@meetingid)+'
					  ,[userid] = '''+@appuserid+'''
					  ,[isAccept] = '+convert(nvarchar(20),@isAccept)+'
					  ,[Comment] = '''+@comment+'''
				WHERE [meetingid]='+convert(nvarchar(20),@meetingid)+'
				AND [userid]='''+@appuserid+'''
			
				SELECT 
					1 as stat
					,''successfully update'' as stat_msg
					,1000 as stat_code	

			END
			ELSE
			BEGIN
				
				INSERT INTO ['+@DBNAME+'].[dbo].[task_meeting_accept_reject]
					   ([entrydate]
					   ,[meetingid]
					   ,[userid]
					   ,[isAccept]
					   ,[Comment])
				 VALUES
					   (isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
					   ,'+convert(nvarchar(20),@meetingid)+'
					   ,'''+@appuserid+'''
					   ,'+convert(nvarchar(20),@isAccept)+'
					   ,'''+@comment+''')

				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code	

			END
		
	'
	SET @SQL1='
				declare 
					 @_LoginId as int=0
					,@_LoginUserCode as nvarchar(max)=''''
					,@_loginroleid as int=0

				SELECT TOP(1)
					@_LoginId=id
					,@_LoginUserCode=isnull(customercode,'''')
					,@_loginroleid=isnull(mastermanagement_roleid,0)
				FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
				WHERE userid='''+@appuserid+'''

				INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
				([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
				,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
				VALUES
				   (isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				   ,''Task Management''
				   ,'''+@mode+'''
				   ,'''+@comment+'''
				   ,concat(''Accept status :'','+convert(nvarchar(20),@isAccept)+', ''comment is '',''['+@comment+']'')
				   ,@_LoginId
				   ,'''+@appuserid+'''
				   ,@_LoginUserCode
				   ,'''+@IPAddress+'''
				   ,'''+@FormName+'''
				   ,@_loginroleid
				 )
				
	'
	
	PRINT (@SQL)
	PRINT (@SQL1)
	EXEC (@SQL + @SQL1)
END
ELSE IF(isnull(@mode,'')='taskmeetingsave')
BEGIN
	IF(@repeatflag='Repeat')
	BEGIN 
		SET @SQL='
			declare @Normal_maxtaskid as int=isnull((
					select max(taskid) 
					from ['+@DBNAME+'].dbo.[task_task] with (nolock)),0)

				declare @_maxtaskid_archive as int=isnull((
					select max(taskid) 
					from ['+@DBNAME+'].dbo.[task_task_archive] with (nolock)),0)
				
				declare @_maxtaskid as int = CASE 
												WHEN @Normal_maxtaskid > @_maxtaskid_archive THEN @Normal_maxtaskid 
												ELSE @_maxtaskid_archive 
											END + 1;

			INSERT INTO ['+@DBNAME+'].[dbo].[task_user_task_bind]
				([systemloginid],[taskid])
				SELECT 
					TRY_CAST(value AS INT)
					,@_maxtaskid
				FROM STRING_SPLIT('''+convert(nvarchar(max),@assigneids)+''', '','');

			INSERT INTO ['+@DBNAME+'].[dbo].[task_task]
				([taskid],[projectid],[entrydate],[taskname],[StartDate]
				,[estimate_hrs],[DeadLineDate],[priorityid],[statusid],[workcategoryid]
				,[departmentid],[parentid],[createdbyid],[workinghr]
				,[EndDate],[assigneids])
				VALUES
				(@_maxtaskid
				,'+convert(nvarchar(20),@projectid)+'
				,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,'''+convert(nvarchar(max),@meetingtitle)+'''
				,'''+convert(nvarchar(max),@StartDate)+'''
				,'+convert(nvarchar(10),@estimate_hrs)+'
				,'''+convert(nvarchar(max),@DeadLineDate)+'''
				,'+convert(nvarchar(20),@priorityid)+'
				,'+convert(nvarchar(20),@statusid)+'
				,'+convert(nvarchar(20),@workcategoryid)+'
				,'+convert(nvarchar(20),@departmentid)+'
				,'+convert(nvarchar(20),@parentid)+'
				,'+convert(nvarchar(20),@createdbyid)+'
				--,'+convert(nvarchar(10),@workinghr)+'	
				,0
				,'''+convert(nvarchar(max),@EndDate)+'''
				,'''+convert(nvarchar(max),@assigneids)+'''
				)

				UPDATE t
				SET t.levelid = 
					CASE 
						WHEN t.parentid <= 0 THEN 1
						ELSE ISNULL(p.levelid, 0) + 1
					END
					,t.RootTaskId = p.RootTaskId
				FROM ['+@DBNAME+'].[dbo].task_task t
				LEFT JOIN ['+@DBNAME+'].[dbo].task_task p 
					ON t.parentid = p.taskid
				WHERE t.taskid = @_maxtaskid;

			

				UPDATE p
				SET direct_childcount = c.cnt
				FROM ['+@DBNAME+'].[dbo].task_task p
				LEFT JOIN (
					SELECT parentid, COUNT(taskid) AS cnt
					FROM ['+@DBNAME+'].[dbo].task_task
					GROUP BY parentid
				) c ON p.taskid = c.parentid;

			declare @_maxmeetingid as int=isnull((select max(meetingid) from ['+@DBNAME+'].dbo.[task_meeting] with (nolock)),0)+1

			INSERT INTO ['+@DBNAME+'].[dbo].[task_meeting]
					   ([meetingid]
					   ,[entrydate]
					   ,[projectid]
					   ,[taskid]
					   ,[meetingtitle]
					   ,[assigneids]
					   ,[StartDate]
					   ,[EndDate]
					   ,[isAllDay]
					   ,[Desc]
					   ,[createdbyid]
					   ,[estimate_hrs]
					   ,[estimate1_hrs]
					   ,[estimate2_hrs]
					   ,[DeadLineDate]
					   ,[priorityid]
					   ,[statusid]
					   ,[workinghr]
					   ,[isfavourite]
					   ,[isFreez]
					   ,[ismilestone]
					   ,[workcategoryid]
					   )
				 VALUES
					   (@_maxmeetingid
					   ,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
					   ,'+convert(nvarchar(20),@projectid)+'
					   ,@_maxtaskid
					   ,'''+convert(nvarchar(max),@meetingtitle)+'''
					   ,'''+convert(nvarchar(max),@assigneids)+'''
					   ,'''+convert(nvarchar(max),@StartDate)+'''
					   ,'''+convert(nvarchar(max),@EndDate)+'''
					   ,'+convert(nvarchar(max),@isAllDay)+'
					   ,'''+convert(nvarchar(max),@descr)+'''
					   ,'+convert(nvarchar(20),@createdbyid)+'
					   ,'+convert(nvarchar(10),@estimate_hrs)+'
					   ,'+convert(nvarchar(10),@estimate1_hrs)+'
					   ,'+convert(nvarchar(10),@estimate2_hrs)+'
					   ,'''+convert(nvarchar(max),@DeadLineDate)+'''
					   ,'+convert(nvarchar(20),@priorityid)+'
					   ,'+convert(nvarchar(20),@statusid)+'
					   ,'+convert(nvarchar(10),@workinghr)+'
					   ,'+convert(nvarchar(20),@isfavourite)+'
					   ,'+convert(nvarchar(20),@isFreez)+'
					   ,'+convert(nvarchar(20),@ismilestone)+'
					   ,'+convert(nvarchar(20),@workcategoryid)+'
					   )
				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				)
				BEGIN
					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES('+convert(nvarchar(20),@taskid)+','''+@descr+''')
				END

				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code
		'
	END
	ELSE
	SET @SQL1='	
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].dbo.[task_meeting] WITH (NOLOCK) 
				WHERE [meetingid]='+convert(nvarchar(20),@meetingid)+'
			)
			BEGIN
				UPDATE M
					SET 
					  [projectid] = '+convert(nvarchar(20),@projectid)+'
					  ,[taskid] = '+convert(nvarchar(20),@taskid)+'
					  ,[meetingtitle] = '''+convert(nvarchar(max),@meetingtitle)+'''
					  ,[assigneids] = '''+convert(nvarchar(max),@assigneids)+'''
					  ,[StartDate] = '''+convert(nvarchar(max),@StartDate)+'''
					  ,[EndDate] ='''+convert(nvarchar(max),@EndDate)+'''
					  ,[isAllDay] = '+convert(nvarchar(max),@isAllDay)+'
					  ,[Desc] = '''+convert(nvarchar(max),@descr)+'''
					  ,[createdbyid] = '+convert(nvarchar(20),@createdbyid)+'
					  ,[estimate_hrs]= '+convert(nvarchar(20),@estimate_hrs)+'
					  ,[estimate1_hrs]= '+convert(nvarchar(20),@estimate1_hrs)+'
					  ,[estimate2_hrs]= '+convert(nvarchar(20),@estimate2_hrs)+'
					  ,[DeadLineDate] = '''+convert(nvarchar(max),@DeadLineDate)+'''
					  ,[priorityid] = '+convert(nvarchar(20),@priorityid)+'
					  ,[statusid] = '+convert(nvarchar(20),@statusid)+'
					  ,[workinghr] = '+convert(nvarchar(20),@workinghr)+'
					  ,[isfavourite] = '+convert(nvarchar(20),@isfavourite)+'
					  ,[isFreez] = '+convert(nvarchar(20),@isFreez)+'
					  ,[ismilestone] = '+convert(nvarchar(20),@ismilestone)+'
					  ,[workcategoryid]='+convert(nvarchar(20),@workcategoryid)+'
				FROM ['+@DBNAME+'].[dbo].[task_meeting] AS M WITH (NOLOCK)
				WHERE [meetingid]='+convert(nvarchar(20),@meetingid)+'

				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				)
				BEGIN
					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES('+convert(nvarchar(20),@taskid)+','''+@descr+''')
				END

				SELECT 
					1 as stat
					,''successfully update'' as stat_msg
					,1000 as stat_code	

			END
			ELSE
			BEGIN
				print ''insert new entry step-2''

				declare @_maxmeetingid as int=isnull((select max(meetingid) from ['+@DBNAME+'].dbo.[task_meeting] with (nolock)),0)+1

				INSERT INTO ['+@DBNAME+'].[dbo].[task_meeting]
					   ([meetingid]
					   ,[entrydate]
					   ,[projectid]
					   ,[taskid]
					   ,[meetingtitle]
					   ,[assigneids]
					   ,[StartDate]
					   ,[EndDate]
					   ,[isAllDay]
					   ,[Desc]
					   ,[createdbyid]
					   ,[estimate_hrs]
					   ,[estimate1_hrs]
					   ,[estimate2_hrs]
					   ,[DeadLineDate]
					   ,[priorityid]
					   ,[statusid]
					   ,[workinghr]
					   ,[isfavourite]
					   ,[isFreez]
					   ,[ismilestone]
					   ,[workcategoryid]
					   )
				 VALUES
					   (@_maxmeetingid
					   ,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
					   ,'+convert(nvarchar(20),@projectid)+'
					   ,'+convert(nvarchar(20),@taskid)+'
					   ,'''+convert(nvarchar(max),@meetingtitle)+'''
					   ,'''+convert(nvarchar(max),@assigneids)+'''
					   ,'''+convert(nvarchar(max),@StartDate)+'''
					   ,'''+convert(nvarchar(max),@EndDate)+'''
					   ,'+convert(nvarchar(max),@isAllDay)+'
					   ,'''+convert(nvarchar(max),@descr)+'''
					   ,'+convert(nvarchar(20),@createdbyid)+'
					   ,'+convert(nvarchar(10),@estimate_hrs)+'
					   ,'+convert(nvarchar(10),@estimate1_hrs)+'
					   ,'+convert(nvarchar(10),@estimate2_hrs)+'
					   ,'''+convert(nvarchar(max),@DeadLineDate)+'''
					   ,'+convert(nvarchar(20),@priorityid)+'
					   ,'+convert(nvarchar(20),@statusid)+'
					   ,'+convert(nvarchar(10),@workinghr)+'
					   ,'+convert(nvarchar(20),@isfavourite)+'
					   ,'+convert(nvarchar(20),@isFreez)+'
					   ,'+convert(nvarchar(20),@ismilestone)+'
					   ,'+convert(nvarchar(20),@workcategoryid)+'
					   )
					
				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				)
				BEGIN
					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES('+convert(nvarchar(20),@taskid)+','''+@descr+''')
				END
				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code	

			END
		
	'
	SET @SQL2='

				UPDATE T
				SET 
					[StartDate] ='''+convert(nvarchar(max),@StartDate)+'''
					,[EndDate] ='''+convert(nvarchar(max),@EndDate)+'''
				   
				    ,[createdbyid] = '+convert(nvarchar(20),@createdbyid)+'
					,[estimate_hrs]= '+convert(nvarchar(20),@estimate_hrs)+'
					,[estimate1_hrs]= '+convert(nvarchar(20),@estimate1_hrs)+'
					,[estimate2_hrs]= '+convert(nvarchar(20),@estimate2_hrs)+'
					,[DeadLineDate] = '''+convert(nvarchar(max),@DeadLineDate)+'''
					,[priorityid] = '+convert(nvarchar(20),@priorityid)+'
					,[statusid] = '+convert(nvarchar(20),@statusid)+'
					,[workinghr] = '+convert(nvarchar(20),@workinghr)+'
					,[isfavourite] = '+convert(nvarchar(20),@isfavourite)+'
					,[isFreez] = '+convert(nvarchar(20),@isFreez)+'
					,[ismilestone] = '+convert(nvarchar(20),@ismilestone)+'
					,[workcategoryid]='+convert(nvarchar(20),@workcategoryid)+'
				FROM ['+@DBNAME+'].[dbo].[task_task] as T WITH (NOLOCK)
				WHERE taskid='+convert(nvarchar(20),@taskid)+'

				
				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				)
				BEGIN
					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES('+convert(nvarchar(20),@taskid)+','''+@descr+''')
				END

				declare 
					 @_LoginId as int=0
					,@_LoginUserCode as nvarchar(max)=''''
					,@_loginroleid as int=0

				SELECT TOP(1)
					@_LoginId=id
					,@_LoginUserCode=isnull(customercode,'''')
					,@_loginroleid=isnull(mastermanagement_roleid,0)
				FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
				WHERE userid='''+@appuserid+'''

				if not exists(
					select 1 
					from ['+@DBNAME+'].[dbo].[task_user_task_bind]	WITH (NOLOCK)
					where systemloginid=@_LoginId
					and taskid='+convert(nvarchar(20),@taskid)+'
				)
				BEGIN
					insert into ['+@DBNAME+'].[dbo].[task_user_task_bind]
					(systemloginid,taskid)
					values(@_LoginId,'+convert(nvarchar(20),@taskid)+')
				END


				INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
				([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
				,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
				VALUES
				   (isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				   ,''Task Management''
				   ,'''+@mode+'''
				   ,'''+@meetingtitle+'''
				   ,concat(''add/update Meeting '',''['+@meetingtitle+']'')
				   ,@_LoginId
				   ,'''+@appuserid+'''
				   ,@_LoginUserCode
				   ,'''+@IPAddress+'''
				   ,'''+@FormName+'''
				   ,@_loginroleid
				 )

	
	'
	
	
	PRINT (@SQL)
	PRINT (@SQL1)
	PRINT (@SQL2)
	EXEC(@SQL+@SQL1+@SQL2)
END
ELSE IF(isnull(@mode,'')='taskmeetingdel')
BEGIN
	SET @SQL='
	DECLARE
		 @_LoginId as int=0
		,@_LoginUserCode as nvarchar(max)=''''
		,@_loginroleid as int=0
		,@_meetingtitle as nvarchar(max)=''''

		SELECT TOP(1)
			@_LoginId=id
			,@_LoginUserCode=isnull(customercode,'''')
			,@_loginroleid=isnull(mastermanagement_roleid,0)
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
		WHERE userid='''+@appuserid+'''

		SELECT TOP(1)
			@_meetingtitle=isnull(meetingtitle,'''')
		FROM ['+@DBNAME+'].[dbo].[task_meeting] AS M WITH(NOLOCK)
		WHERE isnull(meetingid,0)= '+convert(nvarchar(20),@meetingid)+'

		INSERT INTO ['+@DBNAME+'].[dbo].[task_meeting_archive]
		([meetingid],[entrydate],[projectid],[taskid],[meetingtitle]
		,[assigneids],[StartDate],[EndDate],[isAllDay],[Desc])
		SELECT
		[meetingid],[entrydate],[projectid],[taskid],[meetingtitle]
		,[assigneids],[StartDate],[EndDate],[isAllDay],[Desc]
		FROM ['+@DBNAME+'].[dbo].[task_meeting] WITH(NOLOCK)
		WHERE isnull(meetingid,0)= '+convert(nvarchar(20),@meetingid)+'

		INSERT INTO ['+@DBNAME+'].[dbo].[task_meeting_accept_reject_archive]
		([entrydate],[meetingid],[userid],[isAccept],[Comment])
		 SELECT
			[entrydate],[meetingid],[userid],[isAccept],[Comment]
		 FROM ['+@DBNAME+'].[dbo].[task_meeting_accept_reject] WITH(NOLOCK)
		 WHERE isnull(meetingid,0)= '+convert(nvarchar(20),@meetingid)+'

	  DELETE FROM ['+@DBNAME+'].[dbo].[task_meeting] 
	  WHERE isnull(meetingid,0)= '+convert(nvarchar(20),@meetingid)+'

	  DELETE FROM ['+@DBNAME+'].[dbo].[task_meeting_accept_reject] 
	  WHERE isnull(meetingid,0)= '+convert(nvarchar(20),@meetingid)+'
	  '
	SET @SQL1='
	   SELECT 
			1 as stat
			,''successfully delete'' as stat_msg
			,1000 as stat_code	

		INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
		([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
		,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
		VALUES
			(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			,''Task Management''
			,'''+@mode+'''
			,@_meetingtitle
			,concat(''Delete Meeting '',''[@_meetingtitle]'')
			,@_LoginId
			,'''+@appuserid+'''
			,@_LoginUserCode
			,'''+@IPAddress+'''
			,'''+@FormName+'''
			,@_loginroleid
			)
   '

   PRINT(@SQL)
   PRINT(@SQL1)
   EXEC(@SQL+@SQL1)
END

ELSE IF(isnull(@mode,'')='estimateTaskSave')
BEGIN
	SET @SQL='
			;WITH CleanInput AS (
				SELECT 
					ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rowno,
					LTRIM(RTRIM(
						REPLACE(REPLACE(value, CHAR(13), ''''), CHAR(10), '''')
					)) AS rowdata
				FROM STRING_SPLIT('''+@splitestimate+''', '','')
				WHERE LTRIM(RTRIM(value)) <> ''''
			),
			SplitCols AS (
				SELECT
					CI.rowno,
					ROW_NUMBER() OVER (PARTITION BY CI.rowno ORDER BY (SELECT NULL)) AS colno,
					LTRIM(RTRIM(
						REPLACE(REPLACE(SS.value, CHAR(13), ''''), CHAR(10), '''')
					)) AS value
				FROM CleanInput CI
				CROSS APPLY STRING_SPLIT(CI.rowdata, ''#'') SS
			)
	

		UPDATE TT
		SET
			TT.estimate_hrs = P.estimate_hrs,
			TT.estimate1_hrs = P.estimate1_hrs,
			TT.estimate2_hrs = P.estimate2_hrs,
			TT.workinghr = P.workinghr
		FROM ['+@DBNAME+'].[dbo].[task_task] TT
		INNER JOIN (
			SELECT
				MAX(CASE WHEN colno = 1 THEN CAST(value AS INT) END)               AS taskid,
				MAX(CASE WHEN colno = 2 THEN CAST(value AS DECIMAL(10,3)) END)     AS estimate_hrs,
				MAX(CASE WHEN colno = 3 THEN CAST(value AS DECIMAL(10,3)) END)     AS estimate1_hrs,
				MAX(CASE WHEN colno = 4 THEN CAST(value AS DECIMAL(10,3)) END)     AS estimate2_hrs,
				MAX(CASE WHEN colno = 5 THEN CAST(value AS DECIMAL(10,3)) END)     AS workinghr
			FROM SplitCols
			GROUP BY rowno
			HAVING MAX(CASE WHEN colno = 1 THEN value END) IS NOT NULL			
		
		) P
			ON TT.taskid = P.taskid;

		SELECT 
			1 as stat
			,''successfully save'' as stat_msg
			,1000 as stat_code	

	'
	PRINT(@SQL)
	EXEC(@SQL)

END

ELSE IF(@mode='bugsave')
BEGIN
	SET @SQL='
		INSERT INTO ['+@DBNAME+'].[dbo].[task_bugs]
        ([entrydate]
        ,[taskid]
        ,[taskno]
        ,[bugtitle]
        ,[solvedbyid]
        ,[bugpriorityid]
        ,[imagepath]
        ,[descr]
        ,[testbyid]
		,[bugstatusid]
		)
		VALUES(
		 isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
        ,'+convert(nvarchar(20),@taskid)+'
        ,'''+@taskno+'''
        ,'''+@bugtitle+'''
        ,'+convert(nvarchar(20),@solvedbyid)+'       
        ,'+convert(nvarchar(20),@bugpriorityid)+'
        ,'''+@bugimagepath+'''
        ,'''+@remarks+'''
        ,'+convert(nvarchar(20),@testbyid)+'
		,'+convert(nvarchar(20),@bugstatusid)+'
		)

		INSERT INTO ['+@DBNAME+'].[dbo].[task_tasklog]
			([entrydate]
			,[taskid]
			,[description]
			,[mode]
			,[appuserid]
			,[ipaddress])
		VALUES
			(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			,'+convert(nvarchar(20),@taskid)+'
			,concat(''new bug for task#'','''+@taskno+''','' ( '','''+@codeby+''','' # '','''+@bugtitle+''','' ) added by ( '','''+@appuserid+''','' )'')
			,'''+@mode+'''
			,'''+@appuserid+'''
			,'''+@IPAddress+''')

		SELECT 
			 1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END

ELSE IF(@mode='bugsolveddate')
BEGIN
	SET @SQL='
		declare 
			 @_solvedbyid int=0
			,@_solvedbyname nvarchar(200)=''''
			,@_bugtitle nvarchar(200)=''''

		select top(1)
			@_solvedbyid=solvedbyid
			,@_bugtitle=CONCAT(''('',taskno,'') '',bugtitle)
		from ['+@DBNAME+'].[dbo].[task_bugs] with (nolock)
		WHERE id='+convert(nvarchar(max),@bugid)+'

		select 
			@_solvedbyname=concat(firstname,'' '',middlename,'' '',lastname)
		from ['+@DBNAME+'].[dbo].usermanagement_systemloginmaster with (nolock)
		where id=@_solvedbyid

		UPDATE ['+@DBNAME+'].[dbo].[task_bugs]
		SET [solveddate]=isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			,[bugstatusid]='+convert(nvarchar(20),@bugstatusid)+'
		WHERE id='+convert(nvarchar(max),@bugid)+'

		INSERT INTO ['+@DBNAME+'].[dbo].[task_tasklog]
			([entrydate]
			,[taskid]
			,[description]
			,[mode]
			,[appuserid]
			,[ipaddress])
		VALUES
			(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			,'+convert(nvarchar(20),@taskid)+'
			,concat(''task# '',@_bugtitle,'' solved by '',@_solvedbyname)
			,'''+@mode+'''
			,'''+@appuserid+'''
			,'''+@IPAddress+''')

		SELECT 
			 1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END

ELSE IF(@mode='recheked')
BEGIN
	SET @SQL='
		declare 
			 @_recheckedbyname nvarchar(200)=''''
			,@_bugtitle nvarchar(200)=''''

		select top(1)
			@_bugtitle=CONCAT(''('',taskno,'') '',bugtitle)
		from ['+@DBNAME+'].[dbo].[task_bugs] with (nolock)
		WHERE id='+convert(nvarchar(max),@bugid)+'

		select 
			@_recheckedbyname=concat(firstname,'' '',middlename,'' '',lastname)
		from ['+@DBNAME+'].[dbo].usermanagement_systemloginmaster with (nolock)
		where id='+convert(nvarchar(20),@recheckbyid)+'

		UPDATE ['+@DBNAME+'].[dbo].[task_bugs]
		SET [recheckdate]=isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			,[recheckbyid]='+convert(nvarchar(20),@recheckbyid)+'
		WHERE id='+convert(nvarchar(max),@bugid)+'

		INSERT INTO ['+@DBNAME+'].[dbo].[task_tasklog]
			([entrydate]
			,[taskid]
			,[description]
			,[mode]
			,[appuserid]
			,[ipaddress])
		VALUES
			(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			,'+convert(nvarchar(20),@taskid)+'
			,concat(''task# '',@_bugtitle,'' rechecked by '',@_recheckedbyname)
			,'''+@mode+'''
			,'''+@appuserid+'''
			,'''+@IPAddress+''')

		SELECT 
			 1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END


ELSE IF(@mode='getbugs')
BEGIN
	IF(@taskno<>'')
	BEGIN
		SET @SQL = '	
			IF OBJECT_ID(''tempdb..#systemloginmaster'') IS NOT NULL
				DROP TABLE #systemloginmaster;

			SELECT 
				 id
				,userid
				,customercode
				,CONCAT(firstname, '' '', lastname) AS fullname
			INTO #systemloginmaster
			FROM [' + @DBNAME + '].[dbo].[usermanagement_systemloginmaster] WITH (NOLOCK);

			IF OBJECT_ID(''tempdb..#task_bugs'') IS NOT NULL
				DROP TABLE #task_bugs;

			SELECT [id]
				  ,[entrydate]
				  ,[taskid]
				  ,[taskno]
				  ,[bugtitle]
				  ,[solvedbyid]
				  ,[solveddate]
				  ,[bugpriorityid]
				  ,[imagepath]
				  ,[descr]
				  ,[testbyid]
				  ,[recheckbyid]
				  ,[recheckdate]
				  ,[bugstatusid]
			INTO #task_bugs
			FROM [' + @DBNAME + '].[dbo].[task_bugs] WITH (NOLOCK)
			WHERE [taskno]='''+@taskno+''';

			';

		SET @SQL1='
			SELECT
			   A.[id]
			  ,A.[entrydate]
			  ,A.[taskid]
			  ,A.[taskno]
			  ,A.[bugtitle]
			  ,A.[solvedbyid]
			  ,B.[customercode] as solvedbycode
			  ,B.[fullname] as solvedbyfullname
			  ,A.[solveddate]
			  ,A.[bugpriorityid]
			  ,D.[labelname] as bugpriority
			  ,A.[imagepath]
			  ,A.[descr]
			  ,A.[testbyid]
			  ,B.[customercode] as testbycode
			  ,B.[fullname] as testbyfullname
			  ,A.[recheckbyid]
			  ,E.[customercode] as recheckbycode
			  ,E.[fullname] as recheckbyfullname
			  ,A.[recheckdate]
			  ,A.[bugstatusid]
			  ,F.[labelname] as bugstatus
			FROM #task_bugs as A WITH (NOLOCK)
			LEFT OUTER JOIN #systemloginmaster as B
				ON A.[solvedbyid]=B.id
			LEFT OUTER JOIN #systemloginmaster as C
				ON A.[testbyid]=C.id
			LEFT OUTER JOIN #systemloginmaster as E
				ON A.[recheckbyid]=E.id
			LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_bugpriority] as D WITH (NOLOCK)
				ON A.[bugpriorityid]=D.id
			LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[task_bugstatus] as F WITH (NOLOCK)
				ON A.[bugstatusid]=F.id
			;


			IF OBJECT_ID(''tempdb..#systemloginmaster'') IS NOT NULL
				DROP TABLE #systemloginmaster;

			IF OBJECT_ID(''tempdb..#task_bugs'') IS NOT NULL
				DROP TABLE #task_bugs;
		'
		PRINT(@SQL);
		PRINT(@SQL1);

		EXEC(@SQL+@SQL1);
	END
	ELSE
	BEGIN
		SELECT 
			 1 as stat
			,'invalid task#' as stat_msg
			,1001 as stat_code	
	END
END
ELSE IF(@mode='getLogs')
BEGIN
	
		SET @SQL = '
		 SELECT [id]
			  ,[entrydate]
			  ,[taskid]
			  ,[description]
			  ,[mode]
			  ,[appuserid]
			  ,[ipaddress]
		  FROM ['+@DBNAME+'].[dbo].[task_tasklog] WITH (NOLOCK)
		';

		PRINT(@SQL);
		EXEC(@SQL);
	
END

ELSE IF(@mode='bugtransfer')
BEGIN
	SET @SQL='
		INSERT INTO ['+@DBNAME+'].[dbo].[task_bugs]
        ([entrydate]
        ,[taskid]
        ,[taskno]
        ,[bugtitle]
        ,[solvedbyid]
        ,[bugpriorityid]
        ,[imagepath]
        ,[descr]
        ,[testbyid]
		,[bugstatusid]
		)
		VALUES(
		 isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
        ,'+convert(nvarchar(20),@taskid)+'
        ,'''+@taskno+'''
        ,'''+@bugtitle+'''
        ,'+convert(nvarchar(20),@solvedbyid)+'       
        ,'+convert(nvarchar(20),@bugpriorityid)+'
        ,'''+@bugimagepath+'''
        ,'''+@remarks+'''
        ,'+convert(nvarchar(20),@testbyid)+'
		,'+convert(nvarchar(20),@bugstatusid)+'
		)

		INSERT INTO ['+@DBNAME+'].[dbo].[task_tasklog]
			([entrydate]
			,[taskid]
			,[description]
			,[mode]
			,[appuserid]
			,[ipaddress])
		VALUES
			(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			,'+convert(nvarchar(20),@taskid)+'
			,concat(''new bug for task#'','''+@taskno+''','' ( '','''+@codeby+''','' # '','''+@bugtitle+''','' ) added by ( '','''+@appuserid+''','' )'')
			,'''+@mode+'''
			,'''+@appuserid+'''
			,'''+@IPAddress+''')

		SELECT 
			 1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END

-----------21032026
ELSE IF(@mode='print_count')
BEGIN
	SET @SQL = '
		UPDATE T
			SET T.[print_count] =  ISNULL(T.[print_count],0) + 1
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK)
		WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'

		SELECT 
			1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code
			,T.[print_count] as [print_count]
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK)
		WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'

	'
	PRINT(@SQL)
	EXEC(@SQL)
END
-----------21032026

ELSE IF(@mode='taskarchive')
BEGIN
	SET @SQL='
		UPDATE T
			SET T.[Completion_timestamp]= isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK) 
		WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
		AND isnull(parentid,0)=0
		AND ISNULL([parentid],0)<>-1

		;WITH RootTasks AS (
			SELECT *
			FROM ['+@DBNAME+'].dbo.task_task with (nolock)
			WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
		),
		RecursiveTasks AS (
			SELECT 0 as a ,*
			FROM RootTasks
    
			UNION ALL
    
			SELECT t.parentid as a,t.*
			FROM ['+@DBNAME+'].dbo.task_task t
			INNER JOIN RecursiveTasks r ON t.parentid = r.taskid
		)

		UPDATE T				
			SET T.[Completion_timestamp]=isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK)
		WHERE T.[taskid] in (SELECT taskid FROM RecursiveTasks);

		SELECT 
			1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(@mode='taskarchive')
BEGIN
	SET @SQL='
		UPDATE T
			SET T.[Completion_timestamp]= isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK) 
		WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
		AND isnull(parentid,0)=0
		AND ISNULL([parentid],0)<>-1

		;WITH RootTasks AS (
			SELECT *
			FROM ['+@DBNAME+'].dbo.task_task with (nolock)
			WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
		),
		RecursiveTasks AS (
			SELECT 0 as a ,*
			FROM RootTasks
    
			UNION ALL
    
			SELECT t.parentid as a,t.*
			FROM ['+@DBNAME+'].dbo.task_task t
			INNER JOIN RecursiveTasks r ON t.parentid = r.taskid
		)

		UPDATE T				
			SET T.[Completion_timestamp]=isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK)
		WHERE T.[taskid] in (SELECT taskid FROM RecursiveTasks);

		SELECT 
			1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(@mode='taskrestore')
BEGIN
	SET @SQL='
		UPDATE T
			SET T.[Completion_timestamp]= NULL
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK) 
		WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
		AND isnull(parentid,0)=0
		AND ISNULL([parentid],0)<>-1

		;WITH RootTasks AS (
			SELECT *
			FROM ['+@DBNAME+'].dbo.task_task with (nolock)
			WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
		),
		RecursiveTasks AS (
			SELECT 0 as a ,*
			FROM RootTasks
    
			UNION ALL
    
			SELECT t.parentid as a,t.*
			FROM ['+@DBNAME+'].dbo.task_task t
			INNER JOIN RecursiveTasks r ON t.parentid = r.taskid
		)

		UPDATE T				
			SET T.[Completion_timestamp]=NULL
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK)
		WHERE T.[taskid] in (SELECT taskid FROM RecursiveTasks);

		SELECT 
			1 as stat
			,''successfully update'' as stat_msg
			,1000 as stat_code	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='tasksave')
BEGIN
	IF(@DeadLineDate='' or @DeadLineDate is null)
	BEGIN			
		SET @DeadLineDate=@FromDate
	END



	IF(@ismodule=1)
	BEGIN	
		SET @SQL='	
			declare 
				 @_LoginId as int=0
				,@_LoginUserCode as nvarchar(max)=''''
				,@_loginroleid as int=0
				,@_statusname as nvarchar(100)=''''

			select TOP(1)
				@_statusname=labelname 
			from ['+@DBNAME+'].[dbo].task_status 
			where id='+convert(nvarchar(20),@statusid)+'

			SELECT TOP(1)
				 @_LoginId=id
				,@_LoginUserCode=isnull(customercode,'''')
				,@_loginroleid=isnull(mastermanagement_roleid,0)
			FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
			WHERE userid='''+@appuserid+'''

			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].dbo.[task_task] WITH (NOLOCK) 
				WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
				AND isnull([taskid],0)<>0
				AND isnull(parentid,0)=0
				AND ISNULL([parentid],0)<>-1
			)
			BEGIN
				print ''change entry step-1''

				UPDATE T
				SET  T.[projectid]='+convert(nvarchar(20),@projectid)+'					
					,T.[taskname]='''+convert(nvarchar(max),@taskname)+'''					
					,T.[StartDate]='+CASE WHEN ISNULL(@StartDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@StartDate)+'''' END+'
					,T.[estimate_hrs]='+convert(nvarchar(10),@estimate_hrs)+'					
					,T.[DeadLineDate] = '+CASE WHEN ISNULL(@DeadLineDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@DeadLineDate)+'''' END+'
					,T.[priorityid]='+convert(nvarchar(20),@priorityid)+'
					,T.[statusid]='+convert(nvarchar(20),@statusid)+'
					,T.[workcategoryid]='+convert(nvarchar(20),@workcategoryid)+'
					,T.[departmentid]='+convert(nvarchar(20),@departmentid)+'	
					,T.[assigneids]='''+convert(nvarchar(max),@assigneids)+'''
					,T.[createdbyid]='+convert(nvarchar(20),@createdbyid)+'	
					,T.[workinghr]=convert(decimal(38,2),'+convert(nvarchar(20),@workinghr)+')	
					,T.[maingroupids]='''+convert(nvarchar(max),@maingroupids)+'''
					,T.[EndDate]='''+convert(nvarchar(max),@EndDate)+'''
					,T.[secstatusid]='+convert(nvarchar(20),@secstatusid)+'
					,T.[bindedMainGroupid]='+convert(nvarchar(20),@bindedMainGroupid)+'	
					
				FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK) 
				WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
				AND isnull(parentid,0)=0
				AND ISNULL([parentid],0)<>-1
				
				
				'

			SET @SQL1='	

				UPDATE M
					SET 
					  [projectid] = '+convert(nvarchar(20),@projectid)+'
					  ,[taskid] = '+convert(nvarchar(20),@taskid)+'
					  ,[meetingtitle] = '''+convert(nvarchar(max),@taskname)+'''
					  ,[assigneids] = '''+convert(nvarchar(max),@assigneids)+'''
					  ,[StartDate]='+CASE WHEN ISNULL(@StartDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@StartDate)+'''' END+'
					  ,[EndDate] ='''+convert(nvarchar(max),@EndDate)+'''
					  ,[isAllDay] = '+convert(nvarchar(max),@isAllDay)+'
					  ,[Desc] = '''+convert(nvarchar(max),@descr)+'''
					  ,[createdbyid] = '+convert(nvarchar(20),@createdbyid)+'
					  ,[estimate_hrs]= '+convert(nvarchar(20),@estimate_hrs)+'
					  ,[estimate1_hrs]= '+convert(nvarchar(20),@estimate1_hrs)+'
					  ,[estimate2_hrs]= '+convert(nvarchar(20),@estimate2_hrs)+'					  
					  ,[DeadLineDate] = '+CASE WHEN ISNULL(@DeadLineDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@DeadLineDate)+'''' END+'
					  ,[priorityid] = '+convert(nvarchar(20),@priorityid)+'
					  ,[statusid] = '+convert(nvarchar(20),@statusid)+'
					  ,[workinghr] = '+convert(nvarchar(20),@workinghr)+'
					  ,[isfavourite] = '+convert(nvarchar(20),@isfavourite)+'
					  ,[isFreez] = '+convert(nvarchar(20),@isFreez)+'
					  ,[ismilestone] = '+convert(nvarchar(20),@ismilestone)+'
					  ,[workcategoryid]='+convert(nvarchar(20),@workcategoryid)+'
				FROM ['+@DBNAME+'].[dbo].[task_meeting] AS M WITH (NOLOCK)
				WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
				'
		SET @SQL2='	
				IF EXISTS(
					SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_task_filter] WITH (NOLOCK)
					WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'
					AND ISNULL([taskid],0)>0
				)
				BEGIN
					IF('+convert(nvarchar(20),@taskid)+'>0)
					BEGIN
						UPDATE T
						SET  T.[group1_attr]='+CONVERT(NVARCHAR(10),@group1_attr)+'
							,T.[group2_attr]='+CONVERT(NVARCHAR(10),@group2_attr)+'
							,T.[group3_attr]='+CONVERT(NVARCHAR(10),@group3_attr)+'
							,T.[group4_attr]='+CONVERT(NVARCHAR(10),@group4_attr)+'
							,T.[group5_attr]='+CONVERT(NVARCHAR(10),@group5_attr)+'
							,T.[group6_attr]='+CONVERT(NVARCHAR(10),@group6_attr)+'
							,T.[group7_attr]='+CONVERT(NVARCHAR(10),@group7_attr)+'
							,T.[group8_attr]='+CONVERT(NVARCHAR(10),@group8_attr)+'
							,T.[group9_attr]='+CONVERT(NVARCHAR(10),@group9_attr)+'
							,T.[group10_attr]='+CONVERT(NVARCHAR(10),@group10_attr)+'
							,T.[group11_attr]='+CONVERT(NVARCHAR(10),@group11_attr)+'
							,T.[group12_attr]='+CONVERT(NVARCHAR(10),@group12_attr)+'
							,T.[group13_attr]='+CONVERT(NVARCHAR(10),@group13_attr)+'
							,T.[group14_attr]='+CONVERT(NVARCHAR(10),@group14_attr)+'
							,T.[group15_attr]='+CONVERT(NVARCHAR(10),@group15_attr)+'
							,T.[group16_attr]='+CONVERT(NVARCHAR(10),@group16_attr)+'
							,T.[group17_attr]='+CONVERT(NVARCHAR(10),@group17_attr)+'
							,T.[group18_attr]='+CONVERT(NVARCHAR(10),@group18_attr)+'
							,T.[group19_attr]='+CONVERT(NVARCHAR(10),@group19_attr)+'
							,T.[group20_attr]='+CONVERT(NVARCHAR(10),@group20_attr)+'
							,T.[group21_attr]='+CONVERT(NVARCHAR(10),@group21_attr)+'
							,T.[group22_attr]='+CONVERT(NVARCHAR(10),@group22_attr)+'
							,T.[group23_attr]='+CONVERT(NVARCHAR(10),@group23_attr)+'
							,T.[group24_attr]='+CONVERT(NVARCHAR(10),@group24_attr)+'
							,T.[group25_attr]='+CONVERT(NVARCHAR(10),@group25_attr)+'							
						FROM ['+@DBNAME+'].[dbo].[task_task_filter] AS T WITH (NOLOCK)
						WHERE ISNULL(T.[taskid],0)='+convert(nvarchar(20),@taskid)+'
					END
				END
				ELSE IF('+convert(nvarchar(20),@taskid)+'>0)
				BEGIN
					INSERT INTO ['+@DBNAME+'].[dbo].[task_task_filter]
					([taskid]
					,[group1_attr],[group2_attr],[group3_attr],[group4_attr],[group5_attr]
					,[group6_attr],[group7_attr],[group8_attr],[group9_attr],[group10_attr]
					,[group11_attr],[group12_attr],[group13_attr],[group14_attr],[group15_attr]
					,[group16_attr],[group17_attr],[group18_attr],[group19_attr],[group20_attr]
					,[group21_attr],[group22_attr],[group23_attr],[group24_attr],[group25_attr]					
					)
					VALUES('+convert(nvarchar(20),@taskid)+'
					,'+CONVERT(NVARCHAR(10),@group1_attr)+'
					,'+CONVERT(NVARCHAR(10),@group2_attr)+'
					,'+CONVERT(NVARCHAR(10),@group3_attr)+'
					,'+CONVERT(NVARCHAR(10),@group4_attr)+'
					,'+CONVERT(NVARCHAR(10),@group5_attr)+'
					,'+CONVERT(NVARCHAR(10),@group6_attr)+'
					,'+CONVERT(NVARCHAR(10),@group7_attr)+'
					,'+CONVERT(NVARCHAR(10),@group8_attr)+'
					,'+CONVERT(NVARCHAR(10),@group9_attr)+'
					,'+CONVERT(NVARCHAR(10),@group10_attr)+'
					,'+CONVERT(NVARCHAR(10),@group11_attr)+'
					,'+CONVERT(NVARCHAR(10),@group12_attr)+'
					,'+CONVERT(NVARCHAR(10),@group13_attr)+'
					,'+CONVERT(NVARCHAR(10),@group14_attr)+'
					,'+CONVERT(NVARCHAR(10),@group15_attr)+'
					,'+CONVERT(NVARCHAR(10),@group16_attr)+'
					,'+CONVERT(NVARCHAR(10),@group17_attr)+'
					,'+CONVERT(NVARCHAR(10),@group18_attr)+'
					,'+CONVERT(NVARCHAR(10),@group19_attr)+'
					,'+CONVERT(NVARCHAR(10),@group20_attr)+'
					,'+CONVERT(NVARCHAR(10),@group21_attr)+'
					,'+CONVERT(NVARCHAR(10),@group22_attr)+'
					,'+CONVERT(NVARCHAR(10),@group23_attr)+'
					,'+CONVERT(NVARCHAR(10),@group24_attr)+'
					,'+CONVERT(NVARCHAR(10),@group25_attr)+'					
					)
				END
				'
		SET @SQL3='
				DELETE FROM ['+@DBNAME+'].[dbo].[task_user_task_bind] 
				WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'
				AND ISNULL([taskid],0)>0
				

				INSERT INTO ['+@DBNAME+'].[dbo].[task_user_task_bind]
				([systemloginid],[taskid])
				SELECT DISTINCT
					TRY_CAST(value AS INT)
					,'+convert(nvarchar(20),@taskid)+'
				FROM STRING_SPLIT('''+convert(nvarchar(max),@assigneids)+''', '','');
				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				)
				BEGIN
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES('+convert(nvarchar(20),@taskid)+','''+@descr+''')
				END

				SELECT 
					1 as stat
					,''successfully update'' as stat_msg
					,1000 as stat_code	

			END
			ELSE			
			BEGIN
				print ''insert new entry step-2''

				declare @Normal_maxtaskid as int=isnull((
					select max(taskid) 
					from ['+@DBNAME+'].dbo.[task_task] with (nolock)),0)

				declare @_maxtaskid_archive as int=isnull((
					select max(taskid) 
					from ['+@DBNAME+'].dbo.[task_task_archive] with (nolock)),0)
				
				declare @_maxtaskid as int = CASE 
												WHEN @Normal_maxtaskid > @_maxtaskid_archive THEN @Normal_maxtaskid 
												ELSE @_maxtaskid_archive 
											END + 1;

				INSERT INTO ['+@DBNAME+'].[dbo].[task_task]
				([taskid],[projectid],[entrydate],[taskname],[StartDate]
				,[estimate_hrs],[DeadLineDate],[priorityid],[statusid],[workcategoryid]
				,[departmentid],[parentid],[createdbyid],[workinghr]
				,[maingroupids],[EndDate],[secstatusid],[bindedMainGroupid]
				,[RootTaskId]
				)				

				VALUES
				(@_maxtaskid
				,'+convert(nvarchar(20),@projectid)+'
				,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,'''+@taskname+'''
				--,'''+convert(nvarchar(max),@StartDate)+'''
				,'+CASE WHEN ISNULL(@StartDate,'')='' THEN 'getdate()' ELSE ''''+convert(nvarchar(max),@StartDate)+'''' END+'
				,'+convert(nvarchar(10),@estimate_hrs)+'
				--,'''+convert(nvarchar(max),@DeadLineDate)+'''
				,'+CASE WHEN ISNULL(@DeadLineDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@DeadLineDate)+'''' END+'
				,'+convert(nvarchar(20),@priorityid)+'
				,'+convert(nvarchar(20),@statusid)+'
				,'+convert(nvarchar(20),@workcategoryid)+'
				,'+convert(nvarchar(20),@departmentid)+'
				,0
				,'+convert(nvarchar(20),@createdbyid)+'
				,convert(decimal(38,2),'+convert(nvarchar(20),@workinghr)+')	
				,'''+convert(nvarchar(max),@maingroupids)+'''
				,'''+convert(nvarchar(max),@EndDate)+'''
				,'+convert(nvarchar(20),@secstatusid)+'
				,'+convert(nvarchar(20),@bindedMainGroupid)+'
				,@_maxtaskid
				)
				'
		SET @SQL4='
				UPDATE t
				SET t.levelid = 
					CASE 
						WHEN t.parentid <= 0 THEN 1
						ELSE ISNULL(p.levelid, 0) + 1
					END
				FROM ['+@DBNAME+'].[dbo].task_task t
				LEFT JOIN ['+@DBNAME+'].[dbo].task_task p 
					ON t.parentid = p.taskid
				WHERE t.taskid = @_maxtaskid;
			   
			    UPDATE p
				SET direct_childcount = c.cnt
				FROM ['+@DBNAME+'].[dbo].task_task p
				LEFT JOIN (
					SELECT parentid, COUNT(taskid) AS cnt
					FROM ['+@DBNAME+'].[dbo].task_task
					GROUP BY parentid
				) c ON p.taskid = c.parentid;

				IF EXISTS(
					SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_task_filter] WITH (NOLOCK)
					WHERE ISNULL([taskid],0)=@_maxtaskid
					AND ISNULL([taskid],0)>0
				)
				BEGIN
					UPDATE  T
					SET	 T.[group1_attr]='+CONVERT(NVARCHAR(10),@group1_attr)+'
						,T.[group2_attr]='+CONVERT(NVARCHAR(10),@group2_attr)+'
						,T.[group3_attr]='+CONVERT(NVARCHAR(10),@group3_attr)+'
						,T.[group4_attr]='+CONVERT(NVARCHAR(10),@group4_attr)+'
						,T.[group5_attr]='+CONVERT(NVARCHAR(10),@group5_attr)+'
						,T.[group6_attr]='+CONVERT(NVARCHAR(10),@group6_attr)+'
						,T.[group7_attr]='+CONVERT(NVARCHAR(10),@group7_attr)+'
						,T.[group8_attr]='+CONVERT(NVARCHAR(10),@group8_attr)+'
						,T.[group9_attr]='+CONVERT(NVARCHAR(10),@group9_attr)+'
						,T.[group10_attr]='+CONVERT(NVARCHAR(10),@group10_attr)+'
						,T.[group11_attr]='+CONVERT(NVARCHAR(10),@group11_attr)+'
						,T.[group12_attr]='+CONVERT(NVARCHAR(10),@group12_attr)+'
						,T.[group13_attr]='+CONVERT(NVARCHAR(10),@group13_attr)+'
						,T.[group14_attr]='+CONVERT(NVARCHAR(10),@group14_attr)+'
						,T.[group15_attr]='+CONVERT(NVARCHAR(10),@group15_attr)+'
						,T.[group16_attr]='+CONVERT(NVARCHAR(10),@group16_attr)+'
						,T.[group17_attr]='+CONVERT(NVARCHAR(10),@group17_attr)+'
						,T.[group18_attr]='+CONVERT(NVARCHAR(10),@group18_attr)+'
						,T.[group19_attr]='+CONVERT(NVARCHAR(10),@group19_attr)+'
						,T.[group20_attr]='+CONVERT(NVARCHAR(10),@group20_attr)+'
						,T.[group21_attr]='+CONVERT(NVARCHAR(10),@group21_attr)+'
						,T.[group22_attr]='+CONVERT(NVARCHAR(10),@group22_attr)+'
						,T.[group23_attr]='+CONVERT(NVARCHAR(10),@group23_attr)+'
						,T.[group24_attr]='+CONVERT(NVARCHAR(10),@group24_attr)+'
						,T.[group25_attr]='+CONVERT(NVARCHAR(10),@group25_attr)+'
					FROM ['+@DBNAME+'].[dbo].[task_task_filter] AS T WITH (NOLOCK)
					WHERE T.[taskid]=@_maxtaskid
				END
				ELSE
				BEGIN
				'
		SET @SQL5='
					INSERT INTO ['+@DBNAME+'].[dbo].[task_task_filter]
					([taskid]
					,[group1_attr],[group2_attr],[group3_attr],[group4_attr],[group5_attr]
					,[group6_attr],[group7_attr],[group8_attr],[group9_attr],[group10_attr]
					,[group11_attr],[group12_attr],[group13_attr],[group14_attr],[group15_attr]
					,[group16_attr],[group17_attr],[group18_attr],[group19_attr],[group20_attr]
					,[group21_attr],[group22_attr],[group23_attr],[group24_attr],[group25_attr])
					VALUES(@_maxtaskid
					,'+CONVERT(NVARCHAR(10),@group1_attr)+'
					,'+CONVERT(NVARCHAR(10),@group2_attr)+'
					,'+CONVERT(NVARCHAR(10),@group3_attr)+'
					,'+CONVERT(NVARCHAR(10),@group4_attr)+'
					,'+CONVERT(NVARCHAR(10),@group5_attr)+'
					,'+CONVERT(NVARCHAR(10),@group6_attr)+'
					,'+CONVERT(NVARCHAR(10),@group7_attr)+'
					,'+CONVERT(NVARCHAR(10),@group8_attr)+'
					,'+CONVERT(NVARCHAR(10),@group9_attr)+'
					,'+CONVERT(NVARCHAR(10),@group10_attr)+'
					,'+CONVERT(NVARCHAR(10),@group11_attr)+'
					,'+CONVERT(NVARCHAR(10),@group12_attr)+'
					,'+CONVERT(NVARCHAR(10),@group13_attr)+'
					,'+CONVERT(NVARCHAR(10),@group14_attr)+'
					,'+CONVERT(NVARCHAR(10),@group15_attr)+'
					,'+CONVERT(NVARCHAR(10),@group16_attr)+'
					,'+CONVERT(NVARCHAR(10),@group17_attr)+'
					,'+CONVERT(NVARCHAR(10),@group18_attr)+'
					,'+CONVERT(NVARCHAR(10),@group19_attr)+'
					,'+CONVERT(NVARCHAR(10),@group20_attr)+'
					,'+CONVERT(NVARCHAR(10),@group21_attr)+'
					,'+CONVERT(NVARCHAR(10),@group22_attr)+'
					,'+CONVERT(NVARCHAR(10),@group23_attr)+'
					,'+CONVERT(NVARCHAR(10),@group24_attr)+'
					,'+CONVERT(NVARCHAR(10),@group25_attr)+'
					)
				END
				'
		SET @SQL6='				
				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)=@_maxtaskid
				)
				BEGIN					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)=@_maxtaskid
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES(@_maxtaskid,'''+@descr+''')
				END

				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code	

			END

			UPDATE ['+@DBNAME+'].[dbo].[task_task]
			SET maingroupids='''+convert(nvarchar(max),@maingroupids)+'''
			WHERE ISNULL(maintaskid,0)='+convert(nvarchar(max),@maintaskid)+'


			INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
			([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
			,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
			VALUES
				(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,''Task Management''
				,'''+@mode+'''
				,'''+@master_labelvalue+'''
				,concat(''projectid#'','''+convert(nvarchar(20),@projectid)+''',''add/update task '',''['+@taskname+']'')
				,@_LoginId
				,'''+@appuserid+'''
				,@_LoginUserCode
				,'''+@IPAddress+'''
				,'''+@FormName+'''
				,@_loginroleid
				)


				
	'
	END
	ELSE IF(@ismodule=2 and @parentid>0) -- @ismodule=2 means Bulk task entry
	BEGIN	
		
	
		SET @StartDate= GETDATE();  -- Example start date
		SET @DeadLineDate = GETDATE();  -- Example deadline date		
		SET @workcategoryid = 1;  -- Example work category ID
		SET @departmentid = 1;  -- Example department ID
		
		

		SET @SQL='	
				declare 
					 @_LoginId as int=0
					,@_LoginUserCode as nvarchar(max)=''''
					,@_loginroleid as int=0
					,@_workcategory AS int=0

				SELECT TOP(1)
					@_LoginId=id
					,@_LoginUserCode=isnull(customercode,'''')
					,@_loginroleid=isnull(mastermanagement_roleid,0)
				FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
				WHERE userid='''+@appuserid+'''
			
				SELECT TOP(1)
					@_workcategory=id
				FROM ['+@DBNAME+'].[dbo].[task_workcategory] with (nolock)
				WHERE labelname=''Productive''

				
				DECLARE @TaskDetails AS TABLE(
					Number INT identity(1,1),
					TaskName NVARCHAR(255),
					TaskValue DECIMAL(38,2),
					DeadLineDate DATETIME,
					Status int
				);
				INSERT INTO @TaskDetails (TaskName, TaskValue,DeadLineDate,Status)
				SELECT
					LTRIM(RTRIM(LEFT(Value, CHARINDEX(''#'', Value) - 1))) AS TaskName,   
					CAST(
						SUBSTRING(
							Value,
							CHARINDEX(''#'', Value) + 1,
							CHARINDEX(''#'', Value, CHARINDEX(''#'', Value) + 1)
							  - CHARINDEX(''#'', Value) - 1
						) AS FLOAT
					) AS TaskValue,    
					CAST(
						SUBSTRING(
							Value,
							CHARINDEX(''#'', Value, CHARINDEX(''#'', Value) + 1) + 1,
							CHARINDEX(''#'', Value, CHARINDEX(''#'', Value, CHARINDEX(''#'', Value) + 1) + 1)
							  - CHARINDEX(''#'', Value, CHARINDEX(''#'', Value) + 1) - 1
						) AS DATETIME
					) AS Deadline,    
					CAST(
						RIGHT(Value, LEN(Value)
							- CHARINDEX(''#'', Value, CHARINDEX(''#'', Value, CHARINDEX(''#'', Value) + 1) + 1)
						) AS INT
					) AS Status
				FROM STRING_SPLIT('''+@taskname+''', '','')
				WHERE Value LIKE ''%#%#%#%'';

				

				DECLARE 
					  @_TaskName NVARCHAR(255)=''''
					, @_DeadLineDate Datetime=NULL
					, @_TaskValue DECIMAL(38,2)=0
					, @_maxtaskid AS INT=0
					, @_Status as INT = 0 
					, @N int=1
					, @Count int=isnull((SELECT max(Number) from @TaskDetails),0)
					, @_parentid as int=0
					, @_parentmainid as int=0
					, @_maxtaskid_archive as int = 0
					, @Normal_maxtaskid as int = 0
					, @str_taskid nvarchar(max)=''''
					, @str_taskno nvarchar(max)=''''

				DECLARE @_maxtaskno INT;
				DECLARE @_taskno NVARCHAR(50)
					,@_maintenanceno NVARCHAR(50)
					,@_maxmaintenanceno int 

					WHILE @N <= @Count
					BEGIN
						set @_TaskName=''''
						set @_TaskValue=0
						set @_DeadLineDate=NULL
						SET @_taskno = NULL

						select 
							 @_TaskName=isnull(TaskName,'''')
							,@_TaskValue=isnull(TaskValue,0)
							,@_DeadLineDate=DeadLineDate
							,@_Status=ISNULL(Status,0)
						from @TaskDetails
						where Number=@N

							--SET @_maxtaskid=isnull((select max(taskid) from ['+@DBNAME+'].dbo.[task_task] with (nolock)),0)+1

							SET @Normal_maxtaskid =isnull((
									select max(taskid) 
									from ['+@DBNAME+'].dbo.[task_task] with (nolock)),0)

							SET @_maxtaskid_archive =isnull((
								select max(taskid) 
								from ['+@DBNAME+'].dbo.[task_task_archive] with (nolock)),0)
				
							SET @_maxtaskid = CASE 
												WHEN @Normal_maxtaskid > @_maxtaskid_archive THEN @Normal_maxtaskid 
												ELSE @_maxtaskid_archive 
											END + 1;


							declare @_roottaskid as int=0
							select 
								@_parentid=parentid 
								,@_roottaskid=isnull(RootTaskId,0)
							from ['+@DBNAME+'].[dbo].[task_task] 
							where taskid='+CONVERT(NVARCHAR(20),@parentid)+''
					SET @SQL1='	
							
							SELECT TOP 1 @_parentmainid = taskid
							FROM [' + @DBNAME + '].[dbo].[task_task]
							WHERE taskname = ''Maintenance''
							and projectid=' + CONVERT(NVARCHAR(20), @projectid) + ';
							
							IF (@_parentid = 0)
							BEGIN
							    SELECT @_maxtaskno =
							        CASE 
							            WHEN MAX(CAST(REPLACE(taskno,''TT'','''') AS INT)) IS NULL THEN 5001
							            WHEN MAX(CAST(REPLACE(taskno,''TT'','''') AS INT)) < 5000 THEN 5001
							            ELSE MAX(CAST(REPLACE(taskno,''TT'','''') AS INT)) + 1
							        END
							    FROM [' + @DBNAME + '].[dbo].[task_task];
							
							    SELECT @_maxmaintenanceno =
							        CASE 
							            WHEN MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) IS NULL THEN 1001
							            WHEN MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) < 1000 THEN 1001
							            ELSE MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) + 1
							        END
							    FROM [' + @DBNAME + '].[dbo].[task_task] with (nolock);
							
							    IF (' + CONVERT(NVARCHAR(20), @parentid) + ' = @_parentmainid)
							    BEGIN
								print(@_parentmainid)
							        SET @_maintenanceno = ''MM'' + CAST(@_maxmaintenanceno AS VARCHAR(10));
							        SET @_taskno = NULL;
							    END
							    ELSE
							    BEGIN
							        SET @_taskno = ''TT'' + CAST(@_maxtaskno AS VARCHAR(10));
							        SET @_maintenanceno = NULL;
							    END
							END
							ELSE
							BEGIN
							    SET @_taskno = NULL;
							    SET @_maintenanceno = NULL;
							END


							INSERT INTO ['+@DBNAME+'].[dbo].[task_task]
							([taskid],[projectid],[entrydate],[taskname],[StartDate]
							,[estimate_hrs],[estimate2_hrs],[DeadLineDate],[priorityid],[statusid]
							,[workcategoryid],[departmentid],[parentid],[createdbyid]
							,[workinghr],[maintaskid],[secstatusid],[taskno],[maintenanceno],[ismilestone],[RootTaskId],[assigneids])
							VALUES(
								@_maxtaskid
								,'+convert(nvarchar(20),@projectid)+'
								,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE()) 
								,@_TaskName	
								,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE()) 
								,CASE WHEN @_Status = 0 THEN @_TaskValue ELSE 0 END   -- estimate_hrs
								,CASE WHEN @_Status = 1 THEN @_TaskValue ELSE 0 END   -- estimate2_hrs
								,@_DeadLineDate
								--,'''+convert(nvarchar(max),@DeadLineDate)+'''
								,'+convert(nvarchar(20),@priorityid)+'
								,'+convert(nvarchar(20),@statusid)+'
								--,'+convert(nvarchar(20),@workcategoryid)+'
								,@_workcategory
								,'+convert(nvarchar(20),@departmentid)+'
								,'+convert(nvarchar(20),@parentid)+'
								,'+convert(nvarchar(20),@createdbyid)+'
								,'+convert(nvarchar(20),@workinghr)+'
								,'+CONVERT(nvarchar(20),@maintaskid)+'
								,'+convert(nvarchar(20),@secstatusid)+'
								,@_taskno
								,@_maintenanceno
								,@_Status
								,@_roottaskid
								,'''+convert(nvarchar(max),@assigneids)+'''
							)
				
							if(@str_taskid='''')
							begin
								set @str_taskid=@_maxtaskid
								set @str_taskno=@_taskno
							end
							else
							begin
								set @str_taskid=concat(@str_taskid,'','',@_maxtaskid)
								set @str_taskno=concat(@str_taskno,'','',@_taskno)
							end

							UPDATE t
							SET t.levelid = 
								CASE 
									WHEN t.parentid <= 0 THEN 1
									ELSE ISNULL(p.levelid, 0) + 1
								END
							FROM ['+@DBNAME+'].[dbo].task_task t
							LEFT JOIN ['+@DBNAME+'].[dbo].task_task p 
								ON t.parentid = p.taskid
							WHERE t.taskid = @_maxtaskid;

							;
				
				
		
				'
		SET @SQL2='
							UPDATE p
							SET direct_childcount = c.cnt
							FROM ['+@DBNAME+'].[dbo].task_task p
							LEFT JOIN (
								SELECT parentid, COUNT(taskid) AS cnt
								FROM ['+@DBNAME+'].[dbo].task_task
								GROUP BY parentid
							) c ON p.taskid = c.parentid;

							IF NOT EXISTS(
								SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_user_task_bind] 
								WHERE systemloginid='+convert(nvarchar(max),@assigneids)+' and taskid=@_maxtaskid
							)
							BEGIN
								insert into ['+@DBNAME+'].[dbo].[task_user_task_bind]
								(systemloginid,taskid)
								VALUES('+convert(nvarchar(max),@assigneids)+',@_maxtaskid)
							END

		

						SET @N = @N + 1;
					end

				SELECT 
					 1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code
					,@str_taskid as taskid
					,'+convert(nvarchar(20),@parentid)+' as parentid
					,@str_taskno as taskno	

			

			INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
			([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
			,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
			VALUES
				(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,''Task Management''
				,'''+@mode+'''
				,'''+@master_labelvalue+'''
				,concat(''bulk task Entry '',''['+@taskname+']'')
				,@_LoginId
				,'''+@appuserid+'''
				,@_LoginUserCode
				,'''+@IPAddress+'''
				,'''+@FormName+'''
				,@_loginroleid
				)


				
	'
	END
	ELSE
	BEGIN
		
		SET @SQL='
			declare 
				 @_LoginId as int=0
				,@_LoginUserCode as nvarchar(200)=''''
				,@_loginroleid as int=0
				,@_statusname as nvarchar(100)=''''

			select TOP(1)
				@_statusname=labelname 
			from ['+@DBNAME+'].[dbo].task_status with (nolock) 
			where id='+convert(nvarchar(20),@statusid)+'

			SELECT TOP(1)
				 @_LoginId=id
				,@_LoginUserCode=isnull(customercode,'''')
				,@_loginroleid=isnull(mastermanagement_roleid,0)
			FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
			WHERE userid='''+@appuserid+'''

			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].dbo.[task_task] WITH (NOLOCK) 
				WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
				AND ISNULL([parentid],0)<>-1
			)
			BEGIN
				UPDATE T
				SET  T.[projectid]='+convert(nvarchar(20),@projectid)+'					
					,T.[taskname]='''+convert(nvarchar(max),@taskname)+'''					
					,T.[priorityid]='+convert(nvarchar(20),@priorityid)+'
					,T.[statusid]='+convert(nvarchar(20),@statusid)+'
					,T.[workcategoryid]='+convert(nvarchar(20),@workcategoryid)+'
					,T.[departmentid]='+convert(nvarchar(20),@departmentid)+'
					,T.[ismilestone]='+convert(nvarchar(20),@ismilestone)+'
					,T.[estimate1_hrs]='+convert(nvarchar(20),@estimate1_hrs)+'
					,T.[estimate2_hrs]='+convert(nvarchar(20),@estimate2_hrs)+'
					,T.[isfavourite]='+convert(nvarchar(20),@isfavourite)+'
					,T.[ticketno]='''+convert(nvarchar(max),@ticketno)+'''
					,T.[assigneids]='''+convert(nvarchar(max),@assigneids)+'''
					,T.[createdbyid]='+convert(nvarchar(20),@createdbyid)+'
					,T.[workinghr]='+convert(nvarchar(20),ISNULL(@workinghr,0))+'					
					,T.[estimate_hrs]='+convert(nvarchar(10),@estimate_hrs)+'
					,T.[StartDate]='+CASE WHEN ISNULL(@StartDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@StartDate)+'''' END+'
					,T.[DeadLineDate]='+CASE WHEN ISNULL(@DeadLineDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@DeadLineDate)+'''' END+'
					,T.[EndDate]='''+convert(nvarchar(max),@EndDate)+'''
					,T.[secstatusid]='+convert(nvarchar(20),@secstatusid)+'
					,T.[maingroupids]='''+convert(nvarchar(max),@maingroupids)+'''
					,T.[bindedMainGroupid]='+convert(nvarchar(20),@bindedMainGroupid)+'		
					
				FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK) 
				WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
				AND ISNULL(T.[parentid],0)<>-1
				'

			SET @SQL1='
				UPDATE M
					SET 
					  [projectid] = '+convert(nvarchar(20),@projectid)+'
					  ,[taskid] = '+convert(nvarchar(20),@taskid)+'
					  ,[meetingtitle] = '''+convert(nvarchar(max),@taskname)+'''
					  ,[assigneids] = '''+convert(nvarchar(max),@assigneids)+'''
					  ,[StartDate] = '+CASE WHEN ISNULL(@StartDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@StartDate)+'''' END+'
					  ,[EndDate] ='''+convert(nvarchar(max),@EndDate)+'''
					  ,[isAllDay] = '+convert(nvarchar(max),@isAllDay)+'
					  ,[Desc] = '''+convert(nvarchar(max),@descr)+'''
					  ,[createdbyid] = '+convert(nvarchar(20),@createdbyid)+'
					  ,[estimate_hrs]= '+convert(nvarchar(20),@estimate_hrs)+'
					  ,[estimate1_hrs]= '+convert(nvarchar(20),@estimate1_hrs)+'
					  ,[estimate2_hrs]= '+convert(nvarchar(20),@estimate2_hrs)+'
					  ,[DeadLineDate] = '+CASE WHEN ISNULL(@DeadLineDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@DeadLineDate)+'''' END+'
					  ,[priorityid] = '+convert(nvarchar(20),@priorityid)+'
					  ,[statusid] = '+convert(nvarchar(20),@statusid)+'
					  ,[workinghr] = '+convert(nvarchar(20),@workinghr)+'
					  ,[isfavourite] = '+convert(nvarchar(20),@isfavourite)+'
					  ,[isFreez] = '+convert(nvarchar(20),@isFreez)+'
					  ,[ismilestone] = '+convert(nvarchar(20),@ismilestone)+'
					  ,[workcategoryid]='+convert(nvarchar(20),@workcategoryid)+'					  
				FROM ['+@DBNAME+'].[dbo].[task_meeting] AS M WITH (NOLOCK)
				WHERE [taskid]='+convert(nvarchar(20),@taskid)+'
				'
		SET @SQL2='
				IF EXISTS(
					SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_task_filter] WITH (NOLOCK)
					WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'
					AND ISNULL([taskid],0)>0
				)
				BEGIN
					UPDATE T
					SET  T.[group1_attr]='+CONVERT(NVARCHAR(10),@group1_attr)+'
						,T.[group2_attr]='+CONVERT(NVARCHAR(10),@group2_attr)+'
						,T.[group3_attr]='+CONVERT(NVARCHAR(10),@group3_attr)+'
						,T.[group4_attr]='+CONVERT(NVARCHAR(10),@group4_attr)+'
						,T.[group5_attr]='+CONVERT(NVARCHAR(10),@group5_attr)+'
						,T.[group6_attr]='+CONVERT(NVARCHAR(10),@group6_attr)+'
						,T.[group7_attr]='+CONVERT(NVARCHAR(10),@group7_attr)+'
						,T.[group8_attr]='+CONVERT(NVARCHAR(10),@group8_attr)+'
						,T.[group9_attr]='+CONVERT(NVARCHAR(10),@group9_attr)+'
						,T.[group10_attr]='+CONVERT(NVARCHAR(10),@group10_attr)+'
						,T.[group11_attr]='+CONVERT(NVARCHAR(10),@group11_attr)+'
						,T.[group12_attr]='+CONVERT(NVARCHAR(10),@group12_attr)+'
						,T.[group13_attr]='+CONVERT(NVARCHAR(10),@group13_attr)+'
						,T.[group14_attr]='+CONVERT(NVARCHAR(10),@group14_attr)+'
						,T.[group15_attr]='+CONVERT(NVARCHAR(10),@group15_attr)+'
						,T.[group16_attr]='+CONVERT(NVARCHAR(10),@group16_attr)+'
						,T.[group17_attr]='+CONVERT(NVARCHAR(10),@group17_attr)+'
						,T.[group18_attr]='+CONVERT(NVARCHAR(10),@group18_attr)+'
						,T.[group19_attr]='+CONVERT(NVARCHAR(10),@group19_attr)+'
						,T.[group20_attr]='+CONVERT(NVARCHAR(10),@group20_attr)+'
						,T.[group21_attr]='+CONVERT(NVARCHAR(10),@group21_attr)+'
						,T.[group22_attr]='+CONVERT(NVARCHAR(10),@group22_attr)+'
						,T.[group23_attr]='+CONVERT(NVARCHAR(10),@group23_attr)+'
						,T.[group24_attr]='+CONVERT(NVARCHAR(10),@group24_attr)+'
						,T.[group25_attr]='+CONVERT(NVARCHAR(10),@group25_attr)+'
					FROM ['+@DBNAME+'].[dbo].[task_task_filter] AS T WITH (NOLOCK)
					WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
				END
				ELSE IF('+convert(nvarchar(20),@taskid)+'>0)
				BEGIN
				'
		SET @SQL3='
					INSERT INTO ['+@DBNAME+'].[dbo].[task_task_filter]
					([taskid]
					,[group1_attr],[group2_attr],[group3_attr],[group4_attr],[group5_attr]
					,[group6_attr],[group7_attr],[group8_attr],[group9_attr],[group10_attr]
					,[group11_attr],[group12_attr],[group13_attr],[group14_attr],[group15_attr]
					,[group16_attr],[group17_attr],[group18_attr],[group19_attr],[group20_attr]
					,[group21_attr],[group22_attr],[group23_attr],[group24_attr],[group25_attr])
					VALUES('+convert(nvarchar(20),@taskid)+'
					,'+CONVERT(NVARCHAR(10),@group1_attr)+'
					,'+CONVERT(NVARCHAR(10),@group2_attr)+'
					,'+CONVERT(NVARCHAR(10),@group3_attr)+'
					,'+CONVERT(NVARCHAR(10),@group4_attr)+'
					,'+CONVERT(NVARCHAR(10),@group5_attr)+'
					,'+CONVERT(NVARCHAR(10),@group6_attr)+'
					,'+CONVERT(NVARCHAR(10),@group7_attr)+'
					,'+CONVERT(NVARCHAR(10),@group8_attr)+'
					,'+CONVERT(NVARCHAR(10),@group9_attr)+'
					,'+CONVERT(NVARCHAR(10),@group10_attr)+'
					,'+CONVERT(NVARCHAR(10),@group11_attr)+'
					,'+CONVERT(NVARCHAR(10),@group12_attr)+'
					,'+CONVERT(NVARCHAR(10),@group13_attr)+'
					,'+CONVERT(NVARCHAR(10),@group14_attr)+'
					,'+CONVERT(NVARCHAR(10),@group15_attr)+'
					,'+CONVERT(NVARCHAR(10),@group16_attr)+'
					,'+CONVERT(NVARCHAR(10),@group17_attr)+'
					,'+CONVERT(NVARCHAR(10),@group18_attr)+'
					,'+CONVERT(NVARCHAR(10),@group19_attr)+'
					,'+CONVERT(NVARCHAR(10),@group20_attr)+'
					,'+CONVERT(NVARCHAR(10),@group21_attr)+'
					,'+CONVERT(NVARCHAR(10),@group22_attr)+'
					,'+CONVERT(NVARCHAR(10),@group23_attr)+'
					,'+CONVERT(NVARCHAR(10),@group24_attr)+'
					,'+CONVERT(NVARCHAR(10),@group25_attr)+'
					)
				END
				'
		SET @SQL4='
				DELETE FROM ['+@DBNAME+'].[dbo].[task_user_task_bind] 
				WHERE ISNULL([taskid],0)='+convert(nvarchar(20),@taskid)+'
				AND ISNULL([taskid],0)>0;

				INSERT INTO ['+@DBNAME+'].[dbo].[task_user_task_bind]
				([systemloginid],[taskid])
				SELECT 
					TRY_CAST(value AS INT)
					,'+convert(nvarchar(20),@taskid)+'
				FROM STRING_SPLIT('''+convert(nvarchar(max),@assigneids)+''', '','');

				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				)
				BEGIN					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)='+convert(nvarchar(20),@taskid)+'
				END
				ELSE
				BEGIN					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES('+convert(nvarchar(20),@taskid)+','''+@descr+''')
				END
			
				SELECT 
					1 as stat
					,''successfully update'' as stat_msg
					,1000 as stat_code	

			END
			ELSE
			BEGIN
				print ''insert new entry step-2''

				declare @_isFreez as int=0
				set @_isFreez=ISNULL((
					select TOP(1) ISNULL(isFreez,0) 
					from ['+@DBNAME+'].dbo.[task_task] with (nolock)
					where isnull(taskid,0)='+convert(nvarchar(20),@parentid)+'
				),0)			

				declare @Normal_maxtaskid as int=isnull((
					select max(taskid) 
					from ['+@DBNAME+'].dbo.[task_task] with (nolock)),0)

				declare @_maxtaskid_archive as int=isnull((
					select max(taskid) 
					from ['+@DBNAME+'].dbo.[task_task_archive] with (nolock)),0)
				
				declare @_maxtaskid as int = CASE 
												WHEN @Normal_maxtaskid > @_maxtaskid_archive THEN @Normal_maxtaskid 
												ELSE @_maxtaskid_archive 
											END + 1;
				'
		SET @SQL5='
				DECLARE @_maxtaskno INT;
				DECLARE @_taskno VARCHAR(50);
				declare @_parentid int
					,@_RootTaskId int=0
					,@_maxmaintenanceno int=0
					,@_parentmainid int=0
					,@_maintenanceno VARCHAR(50)=''''
					,@_mainworkcategory int=0
				;

				SELECT 
					 @_parentid = parentid 
					,@_RootTaskId= iif(isnull(parentid,0)=0,taskid,isnull(RootTaskId,0))
				FROM [' + @DBNAME + '].[dbo].[task_task] 
				WHERE taskid = ' + CONVERT(NVARCHAR(20), @parentid) + ';
				
				SELECT TOP 1 @_parentmainid = taskid
				FROM [' + @DBNAME + '].[dbo].[task_task]
				WHERE taskname = ''Maintenance''
				and projectid=' + CONVERT(NVARCHAR(20), @projectid) + ';

				SELECT TOP(1)
					@_mainworkcategory=id
				FROM ['+@DBNAME+'].[dbo].[task_workcategory] with (nolock)
				WHERE labelname=''Maintenance''
				IF (@_parentid = 0)
				BEGIN
				    IF ('+convert(nvarchar(20),@parentid)+' = @_parentmainid)  
					BEGIN
						IF ('+convert(nvarchar(20),@workcategoryid)+' = @_mainworkcategory)
						BEGIN
							SELECT @_maxmaintenanceno =
								CASE 
									WHEN MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) IS NULL THEN 1001
									WHEN MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) < 1000 THEN 1001
									ELSE MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) + 1
								END
							FROM [' + @DBNAME + '].[dbo].[task_task] WITH (NOLOCK)
					
							SET @_maintenanceno = ''MM'' + CAST(@_maxmaintenanceno AS VARCHAR(10));
							SET @_taskno = NULL;
						END
						ELSE
						BEGIN
							SET @_maintenanceno = NULL;
							SET @_taskno = NULL;
						END
					END
					ELSE  
					BEGIN
						SELECT @_maxtaskno =
							CASE 
								WHEN MAX(CAST(REPLACE(taskno,''TT'','''') AS INT)) IS NULL THEN 5001
								WHEN MAX(CAST(REPLACE(taskno,''TT'','''') AS INT)) < 5000 THEN 5001
								ELSE MAX(CAST(REPLACE(taskno,''TT'','''') AS INT)) + 1
							END
						FROM [' + @DBNAME + '].[dbo].[task_task] WITH (NOLOCK)
					
						SET @_taskno = ''TT'' + CAST(@_maxtaskno AS VARCHAR(10));
						SET @_maintenanceno = NULL;
					END

				END
				ELSE
				BEGIN
				    SET @_taskno = NULL;
				    SET @_maintenanceno = NULL;
				END



				INSERT INTO ['+@DBNAME+'].[dbo].[task_task]
				([taskid],[projectid],[entrydate],[taskname],[StartDate]
				,[estimate_hrs],[DeadLineDate],[priorityid],[statusid],[workcategoryid]
				,[departmentid],[parentid]
				,[ismilestone]
				,[estimate1_hrs]
				,[estimate2_hrs]
				,[isfavourite]
				,[ticketno]
				,[assigneids]
				,[isnew]
				,[createdbyid]
				,[workinghr]
				,[maintaskid]
				,[EndDate]
				,[secstatusid]
				,[bindedMainGroupid]
				,[maingroupids]
				,[taskno]
				,[maintenanceno]
				,[RootTaskId]
				
				)
				VALUES
				(@_maxtaskid
				,'+convert(nvarchar(20),@projectid)+'
				,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,'''+@taskname+'''			
				,'+CASE WHEN ISNULL(@StartDate,'')='' THEN 'getdate()' ELSE ''''+convert(nvarchar(max),@StartDate)+'''' END+'
				,'+convert(nvarchar(10),@estimate_hrs)+'
				,'+CASE WHEN ISNULL(@DeadLineDate,'')='' THEN 'NULL' ELSE ''''+convert(nvarchar(max),@DeadLineDate)+'''' END+'
				,'+convert(nvarchar(20),@priorityid)+'
				,'+convert(nvarchar(20),@statusid)+'
				,'+convert(nvarchar(20),@workcategoryid)+'
				,'+convert(nvarchar(20),@departmentid)+'
				,iif('+convert(nvarchar(20),@parentid)+'=0,@_maxtaskid,'+convert(nvarchar(20),@parentid)+')
				,'+convert(nvarchar(20),@ismilestone)+'
				,'+convert(nvarchar(20),@estimate1_hrs)+'
				,'+convert(nvarchar(20),@estimate2_hrs)+'
				,'+convert(nvarchar(20),@isfavourite)+'
				,'''+convert(nvarchar(max),@ticketno)+'''
				,'''+convert(nvarchar(max),@assigneids)+'''
				,@_isFreez
				,'+convert(nvarchar(20),@createdbyid)+'
				,'+convert(nvarchar(20),@workinghr)+'
				,'+CONVERT(nvarchar(20),@maintaskid)+'
				,'''+convert(nvarchar(max),@EndDate)+'''
				,'+convert(nvarchar(20),@secstatusid)+'
				,'+convert(nvarchar(20),@bindedMainGroupid)+'
				,'''+convert(nvarchar(max),@maingroupids)+'''
				,@_taskno
				,@_maintenanceno
				,@_RootTaskId
				)

				UPDATE t
				SET t.levelid = 
					CASE 
						WHEN t.parentid <= 0 THEN 1
						ELSE ISNULL(p.levelid, 0) + 1
					END
				FROM ['+@DBNAME+'].[dbo].task_task t
				LEFT JOIN ['+@DBNAME+'].[dbo].task_task p 
					ON t.parentid = p.taskid
				WHERE t.taskid = @_maxtaskid;

				'

			SET @SQL6='
				UPDATE p
				SET direct_childcount = c.cnt
				FROM ['+@DBNAME+'].[dbo].task_task p
				LEFT JOIN (
					SELECT parentid, COUNT(taskid) AS cnt
					FROM ['+@DBNAME+'].[dbo].task_task
					GROUP BY parentid
				) c ON p.taskid = c.parentid;

				IF EXISTS(
					SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_task_filter] WITH (NOLOCK)
					WHERE ISNULL([taskid],0)=@_maxtaskid
					AND ISNULL([taskid],0)>0
				)
				BEGIN
					UPDATE T
					SET  T.[group1_attr]='+CONVERT(NVARCHAR(10),@group1_attr)+'
						,T.[group2_attr]='+CONVERT(NVARCHAR(10),@group2_attr)+'
						,T.[group3_attr]='+CONVERT(NVARCHAR(10),@group3_attr)+'
						,T.[group4_attr]='+CONVERT(NVARCHAR(10),@group4_attr)+'
						,T.[group5_attr]='+CONVERT(NVARCHAR(10),@group5_attr)+'
						,T.[group6_attr]='+CONVERT(NVARCHAR(10),@group6_attr)+'
						,T.[group7_attr]='+CONVERT(NVARCHAR(10),@group7_attr)+'
						,T.[group8_attr]='+CONVERT(NVARCHAR(10),@group8_attr)+'
						,T.[group9_attr]='+CONVERT(NVARCHAR(10),@group9_attr)+'
						,T.[group10_attr]='+CONVERT(NVARCHAR(10),@group10_attr)+'
						,T.[group11_attr]='+CONVERT(NVARCHAR(10),@group11_attr)+'
						,T.[group12_attr]='+CONVERT(NVARCHAR(10),@group12_attr)+'
						,T.[group13_attr]='+CONVERT(NVARCHAR(10),@group13_attr)+'
						,T.[group14_attr]='+CONVERT(NVARCHAR(10),@group14_attr)+'
						,T.[group15_attr]='+CONVERT(NVARCHAR(10),@group15_attr)+'
						,T.[group16_attr]='+CONVERT(NVARCHAR(10),@group16_attr)+'
						,T.[group17_attr]='+CONVERT(NVARCHAR(10),@group17_attr)+'
						,T.[group18_attr]='+CONVERT(NVARCHAR(10),@group18_attr)+'
						,T.[group19_attr]='+CONVERT(NVARCHAR(10),@group19_attr)+'
						,T.[group20_attr]='+CONVERT(NVARCHAR(10),@group20_attr)+'
						,T.[group21_attr]='+CONVERT(NVARCHAR(10),@group21_attr)+'
						,T.[group22_attr]='+CONVERT(NVARCHAR(10),@group22_attr)+'
						,T.[group23_attr]='+CONVERT(NVARCHAR(10),@group23_attr)+'
						,T.[group24_attr]='+CONVERT(NVARCHAR(10),@group24_attr)+'
						,T.[group25_attr]='+CONVERT(NVARCHAR(10),@group25_attr)+'
					FROM ['+@DBNAME+'].[dbo].[task_task_filter] AS T WITH (NOLOCK)
					WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
				END
				ELSE IF(@_maxtaskid>0)
				BEGIN
				'
		SET @SQL7='
					INSERT INTO ['+@DBNAME+'].[dbo].[task_task_filter]
					([taskid]
					,[group1_attr],[group2_attr],[group3_attr],[group4_attr],[group5_attr]
					,[group6_attr],[group7_attr],[group8_attr],[group9_attr],[group10_attr]
					,[group11_attr],[group12_attr],[group13_attr],[group14_attr],[group15_attr]
					,[group16_attr],[group17_attr],[group18_attr],[group19_attr],[group20_attr]
					,[group21_attr],[group22_attr],[group23_attr],[group24_attr],[group25_attr])
					VALUES(@_maxtaskid
					,'+CONVERT(NVARCHAR(10),@group1_attr)+'
					,'+CONVERT(NVARCHAR(10),@group2_attr)+'
					,'+CONVERT(NVARCHAR(10),@group3_attr)+'
					,'+CONVERT(NVARCHAR(10),@group4_attr)+'
					,'+CONVERT(NVARCHAR(10),@group5_attr)+'
					,'+CONVERT(NVARCHAR(10),@group6_attr)+'
					,'+CONVERT(NVARCHAR(10),@group7_attr)+'
					,'+CONVERT(NVARCHAR(10),@group8_attr)+'
					,'+CONVERT(NVARCHAR(10),@group9_attr)+'
					,'+CONVERT(NVARCHAR(10),@group10_attr)+'
					,'+CONVERT(NVARCHAR(10),@group11_attr)+'
					,'+CONVERT(NVARCHAR(10),@group12_attr)+'
					,'+CONVERT(NVARCHAR(10),@group13_attr)+'
					,'+CONVERT(NVARCHAR(10),@group14_attr)+'
					,'+CONVERT(NVARCHAR(10),@group15_attr)+'
					,'+CONVERT(NVARCHAR(10),@group16_attr)+'
					,'+CONVERT(NVARCHAR(10),@group17_attr)+'
					,'+CONVERT(NVARCHAR(10),@group18_attr)+'
					,'+CONVERT(NVARCHAR(10),@group19_attr)+'
					,'+CONVERT(NVARCHAR(10),@group20_attr)+'
					,'+CONVERT(NVARCHAR(10),@group21_attr)+'
					,'+CONVERT(NVARCHAR(10),@group22_attr)+'
					,'+CONVERT(NVARCHAR(10),@group23_attr)+'
					,'+CONVERT(NVARCHAR(10),@group24_attr)+'
					,'+CONVERT(NVARCHAR(10),@group25_attr)+'
					)
				END
				'
		SET @SQL8='
				DECLARE @_maingroupids AS NVARCHAR(max)=''''

				SELECT TOP(1)
					@_maingroupids=maingroupids
				FROM ['+@DBNAME+'].[dbo].[task_task] WITH (NOLOCK)
				WHERE taskid='+convert(nvarchar(max),@maintaskid)+'

				UPDATE ['+@DBNAME+'].[dbo].[task_task]
				SET maingroupids=@_maingroupids
				WHERE ISNULL(maintaskid,0)='+convert(nvarchar(max),@maintaskid)+'


				DELETE FROM ['+@DBNAME+'].[dbo].[task_user_task_bind] 
				WHERE ISNULL([taskid],0)=@_maxtaskid
				AND ISNULL([taskid],0)>0

				INSERT INTO ['+@DBNAME+'].[dbo].[task_user_task_bind]
				([systemloginid],[taskid])
				SELECT 
					TRY_CAST(value AS INT)
					,@_maxtaskid
				FROM STRING_SPLIT('''+convert(nvarchar(max),@assigneids)+''', '','');


				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)=@_maxtaskid
				)
				BEGIN
					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)=@_maxtaskid
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES(@_maxtaskid,'''+@descr+''')
				END


				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code	
					,@_maxtaskid as taskid
					,'+convert(nvarchar(20),@parentid)+' as parentid
					,@_taskno as taskno	

			END
		
			

				INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
				([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
				,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
				VALUES
				   (isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				   ,''Task Management''
				   ,'''+@mode+'''
				   ,'''+@master_labelvalue+'''
				   ,concat(''add/update task '',''['+@taskname+']'')
				   ,@_LoginId
				   ,'''+@appuserid+'''
				   ,@_LoginUserCode
				   ,'''+@IPAddress+'''
				   ,'''+@FormName+'''
				   ,@_loginroleid
				 )


				
	'
	END
	
	
	
	PRINT (@SQL)
	PRINT (@SQL1)
	PRINT (@SQL2)
	PRINT (@SQL3)
	PRINT (@SQL4)
	PRINT (@SQL5)
	PRINT (@SQL6)
	PRINT (@SQL7)
	PRINT (@SQL8)
	EXEC (@SQL+ @SQL1+ @SQL2+ @SQL3+ @SQL4+ @SQL5+ @SQL6+ @SQL7+ @SQL8)
END


ELSE IF(isnull(@mode,'')='calllogtasksave')
BEGIN
		--SET @taskname = REPLACE(@taskname, '''', ''''''); 
		--SET @descr = REPLACE(@descr, '''', '''''');
		SET @SQL='
			declare 
				@_LoginId as int=0
				,@_LoginUserCode as nvarchar(200)=''''
				,@_loginroleid as int=0
				,@_parentid as int=0
				,@_projectid as int=0
				,@_statusid as int=0
				,@_workcategory as int=0
				,@_priorityid as int=0
				,@_maingroupid as int=0
				
			declare @_maxtaskid as int=isnull((
				select max(taskid) 
				from ['+@DBNAME+'].dbo.[task_task] with (nolock)),0)+1
			SELECT TOP(1)
				 @_LoginId=id
				,@_LoginUserCode=isnull(customercode,'''')
				,@_loginroleid=isnull(mastermanagement_roleid,0)
			FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
			WHERE userid='''+@appuserid+'''

			select TOP(1)
				@_projectid=id 
			from ['+@DBNAME+'].dbo.[task_project] with (nolock)
			where labelname=''Optigo''

			select TOP(1)
				@_parentid=taskid 
			from ['+@DBNAME+'].dbo.[task_task] with (nolock)
			where taskname=''Maintenance''
			and projectid=@_projectid

			select TOP(1)
				@_maingroupid=maingroupids
			from ['+@DBNAME+'].dbo.[task_task] with (nolock)
			where taskid=@_parentid

			
			select TOP(1)
				@_statusid=id
			from ['+@DBNAME+'].dbo.[task_status] with (nolock)
			where labelname=''Pending''

			select TOP(1)
				@_priorityid=id
			from ['+@DBNAME+'].dbo.[task_priority] with (nolock)
			where labelname=''High''

			SELECT TOP(1)
				@_workcategory=id
			FROM ['+@DBNAME+'].[dbo].[task_workcategory] with (nolock)
			WHERE labelname=''Maintenance''


				'
		SET @SQL1='
				DECLARE @_maxtaskno INT;
				DECLARE @_maintenanceno VARCHAR(50);

				SELECT @_maxtaskno =
				    CASE 
				        WHEN MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) IS NULL THEN 1001
				        WHEN MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) < 1000 THEN 1001
				        ELSE MAX(CAST(REPLACE(maintenanceno,''MM'','''') AS INT)) + 1
				    END
				FROM ['+@DBNAME+'].[dbo].[task_task];


				SET @_maintenanceno = ''MM'' + CAST(@_maxtaskno AS VARCHAR(10));


				INSERT INTO ['+@DBNAME+'].[dbo].[task_task]
				([taskid],[projectid],[entrydate],[taskname],[StartDate]
				,[DeadLineDate],[priorityid],[statusid],[workcategoryid]
				,[parentid],[assigneids],[createdbyid],[maingroupids],[maintenanceno])
				VALUES
				(@_maxtaskid
				,@_projectid
				,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,'''+convert(nvarchar(max),@taskname)+'''
				,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,@_priorityid
				,@_statusid
				,@_workcategory
				,@_parentid
				,'''+convert(nvarchar(max),@assigneids)+'''
				,'''+convert(nvarchar(max),@assigneids)+'''
				,@_maingroupid
				,@_maintenanceno
				)

				UPDATE t
				SET t.levelid = 
					CASE 
						WHEN t.parentid <= 0 THEN 1
						ELSE ISNULL(p.levelid, 0) + 1
					END
				FROM ['+@DBNAME+'].[dbo].task_task t
				LEFT JOIN ['+@DBNAME+'].[dbo].task_task p 
					ON t.parentid = p.taskid
				WHERE t.taskid = @_maxtaskid;

				UPDATE ['+@DBNAME+'].dbo.CallLog
				SET TaskId=@_maxtaskid
				WHERE CallLogId='+convert(nvarchar(20),@taskid)+'
				'

			SET @SQL2='

				UPDATE p
				SET direct_childcount = c.cnt
				FROM ['+@DBNAME+'].[dbo].task_task p
				LEFT JOIN (
					SELECT parentid, COUNT(taskid) AS cnt
					FROM ['+@DBNAME+'].[dbo].task_task
					GROUP BY parentid
				) c ON p.taskid = c.parentid;


				IF EXISTS(
					SELECT 1 FROM ['+@DBNAME+'].[dbo].[task_task_filter] WITH (NOLOCK)
					WHERE ISNULL([taskid],0)=@_maxtaskid
					AND ISNULL([taskid],0)>0
				)
				BEGIN
					UPDATE T
					SET  T.[group1_attr]='+CONVERT(NVARCHAR(10),@group1_attr)+'
						,T.[group2_attr]='+CONVERT(NVARCHAR(10),@group2_attr)+'
						,T.[group3_attr]='+CONVERT(NVARCHAR(10),@group3_attr)+'
						,T.[group4_attr]='+CONVERT(NVARCHAR(10),@group4_attr)+'
						,T.[group5_attr]='+CONVERT(NVARCHAR(10),@group5_attr)+'
						,T.[group6_attr]='+CONVERT(NVARCHAR(10),@group6_attr)+'
						,T.[group7_attr]='+CONVERT(NVARCHAR(10),@group7_attr)+'
						,T.[group8_attr]='+CONVERT(NVARCHAR(10),@group8_attr)+'
						,T.[group9_attr]='+CONVERT(NVARCHAR(10),@group9_attr)+'
						,T.[group10_attr]='+CONVERT(NVARCHAR(10),@group10_attr)+'
						,T.[group11_attr]='+CONVERT(NVARCHAR(10),@group11_attr)+'
						,T.[group12_attr]='+CONVERT(NVARCHAR(10),@group12_attr)+'
						,T.[group13_attr]='+CONVERT(NVARCHAR(10),@group13_attr)+'
						,T.[group14_attr]='+CONVERT(NVARCHAR(10),@group14_attr)+'
						,T.[group15_attr]='+CONVERT(NVARCHAR(10),@group15_attr)+'
						,T.[group16_attr]='+CONVERT(NVARCHAR(10),@group16_attr)+'
						,T.[group17_attr]='+CONVERT(NVARCHAR(10),@group17_attr)+'
						,T.[group18_attr]='+CONVERT(NVARCHAR(10),@group18_attr)+'
						,T.[group19_attr]='+CONVERT(NVARCHAR(10),@group19_attr)+'
						,T.[group20_attr]='+CONVERT(NVARCHAR(10),@group20_attr)+'
						,T.[group21_attr]='+CONVERT(NVARCHAR(10),@group21_attr)+'
						,T.[group22_attr]='+CONVERT(NVARCHAR(10),@group22_attr)+'
						,T.[group23_attr]='+CONVERT(NVARCHAR(10),@group23_attr)+'
						,T.[group24_attr]='+CONVERT(NVARCHAR(10),@group24_attr)+'
						,T.[group25_attr]='+CONVERT(NVARCHAR(10),@group25_attr)+'
					FROM ['+@DBNAME+'].[dbo].[task_task_filter] AS T WITH (NOLOCK)
					WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
				END
				ELSE IF(@_maxtaskid>0)
				BEGIN
				'
		SET @SQL3='					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_task_filter]
					([taskid]
					,[group1_attr],[group2_attr],[group3_attr],[group4_attr],[group5_attr]
					,[group6_attr],[group7_attr],[group8_attr],[group9_attr],[group10_attr]
					,[group11_attr],[group12_attr],[group13_attr],[group14_attr],[group15_attr]
					,[group16_attr],[group17_attr],[group18_attr],[group19_attr],[group20_attr]
					,[group21_attr],[group22_attr],[group23_attr],[group24_attr],[group25_attr])
					VALUES(@_maxtaskid
					,'+CONVERT(NVARCHAR(10),@group1_attr)+'
					,'+CONVERT(NVARCHAR(10),@group2_attr)+'
					,'+CONVERT(NVARCHAR(10),@group3_attr)+'
					,'+CONVERT(NVARCHAR(10),@group4_attr)+'
					,'+CONVERT(NVARCHAR(10),@group5_attr)+'
					,'+CONVERT(NVARCHAR(10),@group6_attr)+'
					,'+CONVERT(NVARCHAR(10),@group7_attr)+'
					,'+CONVERT(NVARCHAR(10),@group8_attr)+'
					,'+CONVERT(NVARCHAR(10),@group9_attr)+'
					,'+CONVERT(NVARCHAR(10),@group10_attr)+'
					,'+CONVERT(NVARCHAR(10),@group11_attr)+'
					,'+CONVERT(NVARCHAR(10),@group12_attr)+'
					,'+CONVERT(NVARCHAR(10),@group13_attr)+'
					,'+CONVERT(NVARCHAR(10),@group14_attr)+'
					,'+CONVERT(NVARCHAR(10),@group15_attr)+'
					,'+CONVERT(NVARCHAR(10),@group16_attr)+'
					,'+CONVERT(NVARCHAR(10),@group17_attr)+'
					,'+CONVERT(NVARCHAR(10),@group18_attr)+'
					,'+CONVERT(NVARCHAR(10),@group19_attr)+'
					,'+CONVERT(NVARCHAR(10),@group20_attr)+'
					,'+CONVERT(NVARCHAR(10),@group21_attr)+'
					,'+CONVERT(NVARCHAR(10),@group22_attr)+'
					,'+CONVERT(NVARCHAR(10),@group23_attr)+'
					,'+CONVERT(NVARCHAR(10),@group24_attr)+'
					,'+CONVERT(NVARCHAR(10),@group25_attr)+'
					)
				END
				'
		SET @SQL4='
				INSERT INTO ['+@DBNAME+'].[dbo].[task_maintenance]
				([taskid],[customername])
				VALUES(@_maxtaskid,'''+@customername+''')

				DELETE FROM ['+@DBNAME+'].[dbo].[task_user_task_bind] 
				WHERE ISNULL([taskid],0)=@_maxtaskid
				AND ISNULL([taskid],0)>0

				INSERT INTO ['+@DBNAME+'].[dbo].[task_user_task_bind]
				([systemloginid],[taskid])
				SELECT 
					TRY_CAST(value AS INT)
					,@_maxtaskid
				FROM STRING_SPLIT('''+convert(nvarchar(max),@assigneids)+''', '','');

				IF EXISTS(
					select 1 from ['+@DBNAME+'].[dbo].[task_descr] 
					WHERE isnull([taskid],0)=@_maxtaskid
				)
				BEGIN
					
					update ['+@DBNAME+'].[dbo].[task_descr]
					SET [descr]='''+@descr+'''
					WHERE isnull([taskid],0)=@_maxtaskid
				END
				ELSE
				BEGIN
					
					INSERT INTO ['+@DBNAME+'].[dbo].[task_descr]
					([taskid],[descr])
					VALUES(@_maxtaskid,'''+@descr+''')
				END


				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code	

				INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
				([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
				,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
				VALUES
				   (isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				   ,''Task Management''
				   ,'''+@mode+'''
				   ,'''+@taskname+'''
				   ,concat(''add task from calllog'',''['+@taskname+']'')
				   ,@_LoginId
				   ,'''+@appuserid+'''
				   ,@_LoginUserCode
				   ,'''+@IPAddress+'''
				   ,'''+@FormName+'''
				   ,@_loginroleid
				 )			
	'
	PRINT (@SQL)
	PRINT (@SQL1)
	PRINT (@SQL2)
	PRINT (@SQL3)
	PRINT(@SQL4)
	EXEC (@SQL+@SQL1+@SQL2+@SQL3+@SQL4)
END


ELSE IF(isnull(@mode,'')='getcallloglist')
BEGIN
	IF(ISNULL(@taskid,0)<>0)
	BEGIN
	SET @SQL='
		;WITH TaskTree AS(
			SELECT 
				ISNULL([taskname],'''') as [taskname]
				,ISNULL([taskid],0) as [taskid]
				,ISNULL([priorityid],0) as [priorityid]
				,ISNULL([statusid],0) as [statusid]
				,ISNULL([createdbyid],0) as [createdbyid]
				,ISNULL([StartDate],0) as [StartDate]
				,ISNULL([EndDate],0) as [EndDate]
				,ISNULL([DeadLineDate],0) as [DeadLineDate]
				,ISNULL([workcategoryid],0) AS [workcategoryid]
				,ISNULL([parentid],0) AS [parentid]
			from ['+@DBNAME+'].dbo.task_task with (NOLOCK)
			
			WHERE ISNULL(taskid,0) = '+convert(nvarchar(max),@taskid)+'

			UNION ALL
			SELECT 
				ISNULL(t.[taskname],'''') as [taskname]
				,ISNULL(t.[taskid],0) as [taskid]
				,ISNULL(t.[priorityid],0) as [priorityid]
				,ISNULL(t.[statusid],0) as [statusid]
				,ISNULL(t.[createdbyid],0) as [createdbyid]
				,ISNULL(t.[StartDate],0) as [StartDate]
				,ISNULL(t.[EndDate],0) as [EndDate]
				,ISNULL(t.[DeadLineDate],0) as [DeadLineDate]
				,ISNULL(t.[workcategoryid],0) AS [workcategoryid]
				,ISNULL(t.[parentid],0) AS [parentid]
			from ['+@DBNAME+'].dbo.task_task t with (NOLOCK)
			INNER JOIN TaskTree tt 
					ON t.parentid = tt.taskid
		)


		SELECT 
			DISTINCT
				ISNULL(t.[taskname],'''') as [taskname]
				,ISNULL(t.[taskid],0) as [taskid]
				,ISNULL(D.[descr],'''') as [descr]
				,ISNULL(u.[customercode],0) as [createdbyid]
				,ISNULL(t.[StartDate],0) as [StartDate]
				,ISNULL(t.[EndDate],0) as [EndDate]
				,ISNULL(t.[DeadLineDate],0) as [DeadLineDate]
				,ISNULL(t.[parentid],0) AS [parentid]
				,ISNULL(s.[labelname],'''') as [status]
				,ISNULL(p.[labelname],'''') as [priority]
				,ISNULL(w.[labelname],'''') as [workcategory]
				,(
					SELECT 
						C.[comment]
						,u.customercode as userid
					FROM ['+@DBNAME+'].[dbo].[task_comment] AS C WITH (NOLOCK)
					LEFT OUTER JOIN (select userid,customercode from ['+@DBNAME+'].[dbo].usermanagement_systemloginmaster with (nolock)) as u
					ON isnull(C.appuserid,'''')=isnull(u.userid,0)
					WHERE C.[taskid] = t.[taskid]
					FOR JSON PATH
				) AS CommentsArray
			FROM TaskTree AS t
			LEFT OUTER JOIN (SELECT [taskid],[descr] FROM ['+@DBNAME+'].[dbo].[task_descr] with (nolock)) as D 
			ON isnull(t.taskid,0)=isnull(D.[taskid],0)
			LEFT OUTER JOIN (select id,labelname from ['+@DBNAME+'].[dbo].task_status with (nolock)) as s
			ON isnull(t.statusid,0)=isnull(s.id,0)
			LEFT OUTER JOIN (select id,labelname from ['+@DBNAME+'].[dbo].task_priority with (nolock)) as p
			ON isnull(t.priorityid,0)=isnull(p.id,0)
			LEFT OUTER JOIN (select id,labelname from ['+@DBNAME+'].[dbo].task_workcategory with (nolock)) as w
			ON isnull(t.workcategoryid,0)=isnull(w.id,0)
			LEFT OUTER JOIN (select id,customercode from ['+@DBNAME+'].[dbo].usermanagement_systemloginmaster with (nolock)) as u
			ON isnull(t.createdbyid,0)=isnull(u.id,0)
	'
	PRINT (@SQL)
	EXEC (@SQL)
	END
END




ELSE IF(isnull(@mode,'')='task_freez')
BEGIN
	SET @SQL='
		UPDATE T
		SET  T.[isFreez]='+convert(nvarchar(20),@isFreez)+'													
		FROM ['+@DBNAME+'].[dbo].[task_task] AS T WITH (NOLOCK) 
		WHERE T.[taskid]='+convert(nvarchar(20),@taskid)+'
		AND isnull(parentid,0)=0
		AND ISNULL(T.[parentid],0)<>-1

		SELECT 
			1 as stat
			,''successfully save'' as stat_msg
			,1000 as stat_code
	
	'
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='task_trash')
BEGIN
	SET @SQL='
		create table #tempids(
			taskid int
		);

		WITH RecursiveCTE AS (			
			SELECT TaskID
			FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
			WHERE isnull(TaskID,0) = '+convert(nvarchar(20),@taskid)+'
			AND isnull(TaskID,0)>0
			AND ISNULL([parentid],0)<>-1
			UNION ALL

			SELECT T.TaskID
			FROM ['+@DBNAME+'].[dbo].task_task T WITH (NOLOCK)
			INNER JOIN RecursiveCTE R
				ON ISNULL(T.ParentID,0) = ISNULL(R.TaskID,0)
			WHERE ISNULL(T.ParentID,0)>0
			AND ISNULL(T.[parentid],0)<>-1
		)
		INSERT INTO #tempids (taskid)
		SELECT ISNULL(TaskID,0) FROM RecursiveCTE
		OPTION (MAXRECURSION 0);
		
		INSERT INTO ['+@DBNAME+'].[dbo].[task_trash]
		([taskid],[projectid],[entrydate],[taskname],[StartDate]
		,[estimate_hrs],[DeadLineDate],[priorityid],[statusid]
		,[workcategoryid],[departmentid],[parentid])
		select 
			 [taskid],[projectid],[entrydate],[taskname],[StartDate]
			,[estimate_hrs],[DeadLineDate],[priorityid],[statusid]
			,[workcategoryid],[departmentid],[parentid] 
		FROM ['+@DBNAME+'].[dbo].task_task WITH (NOLOCK)
		WHERE ISNULL(TaskID,0) IN (SELECT ISNULL(taskid,0) FROM #tempids)
		AND ISNULL(TaskID,0)>0
		

		INSERT INTO ['+@DBNAME+'].[dbo].[task_descr_trash]
		([taskid],[descr])
		SELECT [taskid],[descr]
		FROM ['+@DBNAME+'].[dbo].[task_descr] with (NOLOCK)
		WHERE ISNULL(TaskID,0) IN (SELECT ISNULL(taskid,0) FROM #tempids)
		AND ISNULL(TaskID,0)>0

		DELETE FROM ['+@DBNAME+'].[dbo].[task_descr]
		WHERE ISNULL(TaskID,0) IN (SELECT ISNULL(taskid,0) FROM #tempids)
		AND ISNULL(TaskID,0)>0

		DELETE FROM ['+@DBNAME+'].[dbo].[task_user_task_bind]
		WHERE ISNULL(TaskID,0) IN (SELECT ISNULL(taskid,0) FROM #tempids)
		AND ISNULL(TaskID,0)>0

		DELETE FROM ['+@DBNAME+'].[dbo].task_task
		WHERE ISNULL(TaskID,0) IN (SELECT ISNULL(taskid,0) FROM #tempids)

		DELETE FROM ['+@DBNAME+'].[dbo].task_meeting
		WHERE ISNULL(TaskID,0) IN (SELECT ISNULL(taskid,0) FROM #tempids)

		SELECT 
			1 as stat
			,''successfully save'' as stat_msg
			,1000 as stat_code
		
	'
	
	PRINT (@SQL)
	EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='taskmaster')
BEGIN
	SET @SQL='
		select 1 as id,''task_workcategory'' as table_name,''Task Work Category'' as title,''taskworkcategory'' as mode
		union all
		select 2 as id,''task_status'' as table_name,''Task Status'' as title,''taskstatus'' as mode
		union all
		select 3 as id,''task_priority'' as table_name,''Task Priority'' as title,''taskpriority'' as mode
		union all
		select 4 as id,''task_department'' as table_name,''Task Department'' as title,''taskdepartment'' as mode
		union all
		select 5 as id,''task_project'' as table_name,''Project'' as title,''taskproject'' as mode
		union all
		select 6 as id,''task_secstatus'' as table_name,''What Next'' as title,''tasksecstatus'' as mode
		union all
		select 7 as id,''task_workspace'' as table_name,''Work Space'' as title,''taskworkspace'' as mode
		union all
		select 8 as id,''task_bugpriority'' as table_name,''Bug Priority'' as title,''taskbugpriority'' as mode
		union all
		select 9 as id,''task_bugstatus'' as table_name,''Bug Status'' as title,''taskbugstatus'' as mode
		union all
		select 10 as id,''task_holiday'' as table_name,''Holiday'' as title,''taskholiday'' as mode
		union all
		select 10 as id,''bug_category'' as table_name,''Bug Category'' as title,''bug_category'' as mode
	'
	print(@SQL)
	exec(@SQL)
END


ELSE IF(isnull(@mode,'')='taskworkcategory')
BEGIN
	SET @SQL='	
		select id,[labelname],isnull([displayorder],0) as [displayorder],ISNULL(isdelete,0)  as isdelete ,1 as masterid
		from ['+@DBNAME+'].dbo.[task_workcategory] with (nolock)	
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END

ELSE IF(isnull(@mode,'')='taskstatus')
BEGIN
	SET @SQL='			
		

		select id,[labelname],isnull([displayorder],0) as [displayorder],ISNULL(isdelete,0)  as isdelete ,2 as masterid
		from ['+@DBNAME+'].dbo.[task_status] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END

ELSE IF(isnull(@mode,'')='taskbugpriority')
BEGIN
	SET @SQL='	
		select 
			 id
			,[labelname]
			,isnull([displayorder],0) as [displayorder]
			,ISNULL(isdelete,0) as isdelete 
			,8 as masterid
		from ['+@DBNAME+'].dbo.[task_bugpriority] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='taskbugstatus')
BEGIN
	SET @SQL='	
		select 
			id
			,[labelname]
			,isnull([displayorder],0) as [displayorder]
			,ISNULL(isdelete,0)  as isdelete 
			,9 as masterid
		from ['+@DBNAME+'].dbo.[task_bugstatus] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='taskholiday')
BEGIN
	SET @SQL='	
		select 
			id
			,[holidaydate]
			,[labelname]
			,isnull([displayorder],0) as [displayorder]
			,ISNULL(isdelete,0)  as isdelete 
			,10 as masterid
		from ['+@DBNAME+'].dbo.[task_holiday] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='bug_category')
BEGIN
	SET @SQL='	
		select 
			id			
			,[labelname]
			,isnull([displayorder],0) as [displayorder]
			,ISNULL(isdelete,0)  as isdelete 
			,10 as masterid
		from ['+@DBNAME+'].dbo.[bug_category] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END


ELSE IF(isnull(@mode,'')='tasksecstatus')
BEGIN
	SET @SQL='			
		

		select id,[labelname],isnull([displayorder],0) as [displayorder],ISNULL(isdelete,0)  as isdelete ,6 as masterid
		from ['+@DBNAME+'].dbo.[task_secstatus] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END

ELSE IF(isnull(@mode,'')='taskpriority')
BEGIN
	SET @SQL='			

		select id,[labelname],isnull([displayorder],0) as [displayorder],ISNULL(isdelete,0)  as isdelete ,3 as masterid
		from ['+@DBNAME+'].dbo.[task_priority] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='taskdepartment')
BEGIN
	SET @SQL='			

		select id,[labelname],isnull([displayorder],0) as [displayorder],ISNULL(isdelete,0)  as isdelete,4 as masterid 
		from ['+@DBNAME+'].dbo.[task_department] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='taskproject')
BEGIN
	SET @SQL='			

		select id,[labelname],isnull([displayorder],0) as [displayorder],ISNULL(isdelete,0)  as isdelete,5 as masterid 
		from ['+@DBNAME+'].dbo.[task_project] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END
ELSE IF(isnull(@mode,'')='taskworkspace')
BEGIN
	SET @SQL='			

		select id,[labelname],isnull([displayorder],0) as [displayorder],ISNULL(isdelete,0)  as isdelete ,6 as masterid
		from ['+@DBNAME+'].dbo.[task_workspace] with (nolock)
		WHERE ISNULL([labelname],'''')<>''''
		ORDER BY [displayorder] ASC
	'
	print(@SQL)
	exec(@SQL)
END

ELSE IF(ISNULL(@mode,'')='restoretask')
BEGIN
	SET @SQL = '
		
		DECLARE 
			 @_systemloginid as int=0
			,@_isadmin as int=0
			,@_parentid as int=0

		SELECT TOP(1)
			@_systemloginid=id
			,@_isadmin=iif((isnull(mastermanagement_roleid,0)=3 and designation=''admin''),1,0)
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
		WHERE userid='''+@appuserid+'''

		IF(@_isadmin = 1)
		BEGIN


				--DECLARE @_maxtaskid AS INT=ISNULL((
				--				SELECT MAX(taskid) 
				--				FROM ['+@DBNAME+'].dbo.[task_task] WITH (NOLOCK)),0)+1

				--INSERT INTO  ['+@DBNAME+'].[dbo].[task_task]
				--	([taskid],[projectid],[entrydate],[taskname],[StartDate]
				--	,[estimate_hrs],[DeadLineDate],[priorityid],[workcategoryid]
				--	,[departmentid],[parentid],[ismilestone],[estimate1_hrs],[estimate2_hrs]
				--	,[isfavourite],[ticketno],[assigneids],[isnew],[createdbyid],[workinghr]
				--	,[maintaskid],[EndDate],[secstatusid],[bindedMainGroupid],[maingroupids]
				--	,[taskno],[maintenanceno]				
				--	)
				--SELECT 
				--	taskid,projectid,entrydate,taskname,StartDate,
				--	estimate_hrs,DeadLineDate,priorityid,workcategoryid,
				--	departmentid,parentid,ismilestone,estimate1_hrs,estimate2_hrs,
				--	isfavourite,ticketno,assigneids,isnew,createdbyid,workinghr,
				--	maintaskid,EndDate,secstatusid,bindedMainGroupid,maingroupids,
				--	taskno,maintenanceno
				--FROM  ['+@DBNAME+'].dbo.task_task_archive WITH(NOLOCK)
				--WHERE taskid = '+convert(nvarchar(20),@taskid)+'

				--DELETE FROM  ['+@DBNAME+'].dbo.task_task_archive
				--WHERE taskid = '+convert(nvarchar(20),@taskid)+'



				-- Insert records that exist in archive
				INSERT INTO ['+@DBNAME+'].[dbo].[task_task] 
				(
					[taskid],[projectid],[entrydate],[taskname],[StartDate],
					[estimate_hrs],[DeadLineDate],[priorityid],[statusid],[workcategoryid],
					[departmentid],[parentid],[ismilestone],[estimate1_hrs],[estimate2_hrs],
					[isfavourite],[ticketno],[assigneids],[isnew],[createdbyid],[workinghr],
					[maintaskid],[EndDate],[secstatusid],[bindedMainGroupid],[maingroupids],
					[taskno],[maintenanceno],[levelid],[direct_childcount]
				)
				SELECT 
					taskid,projectid,entrydate,taskname,StartDate,
					estimate_hrs,DeadLineDate,priorityid,statusid,workcategoryid,
					departmentid,parentid,ismilestone,estimate1_hrs,estimate2_hrs,
					isfavourite,ticketno,assigneids,isnew,createdbyid,workinghr,
					maintaskid,EndDate,secstatusid,bindedMainGroupid,maingroupids,
					taskno,maintenanceno,[levelid],[direct_childcount]
				FROM ['+@DBNAME+'].dbo.task_task_archive WITH(NOLOCK)
				WHERE taskid IN (SELECT value FROM STRING_SPLIT('''+ISNULL(@restoreids,'')+''', '',''))



				-- Delete records from archive
				DELETE FROM ['+@DBNAME+'].dbo.task_task_archive 
				WHERE taskid IN (SELECT value FROM STRING_SPLIT('''+ISNULL(@restoreids,'')+''', '',''))


		END
		ELSE
		BEGIN
			SELECT ''Only Admin Are Allowed!!'' as msg
		END
		SELECT ''success'' as msg
	'

	EXEC(@SQL)

END

ELSE IF(ISNULL(@mode,'') = 'archivetasklist')
BEGIN 

	SET @SQLASSIGNEE='
			IF OBJECT_ID(''tempdb..#ASSIGNEELIST_'+@RandomNo+''') IS NOT NULL DROP TABLE #ASSIGNEELIST_'+@RandomNo+';
			IF OBJECT_ID(''tempdb..#task_descr_'+@RandomNo+''') IS NOT NULL DROP TABLE #task_descr_'+@RandomNo+';

			SELECT 
				taskid
				,STRING_AGG(systemloginid, '','') AS assigneeids
			into #ASSIGNEELIST_'+@RandomNo+'
			FROM ['+@DBNAME+'].[dbo].task_user_task_bind WITH (NOLOCK)
			WHERE ISNULL(systemloginid, 0)<>0
			GROUP BY taskid


			SELECT [taskid],[descr] 
			INTO #task_descr_'+@RandomNo+'
			FROM ['+@DBNAME+'].[dbo].[task_descr] with (nolock)
		'
		PRINT(@SQLASSIGNEE)
		--EXEC(@SQLASSIGNEE)

	SET @SQL = '

		DECLARE 
			 @_systemloginid as int=0
			,@_isadmin as int=0
			,@_parentid as int=0

		SELECT TOP(1)
			@_systemloginid=id
			,@_isadmin=iif((isnull(mastermanagement_roleid,0)=3 and designation=''admin''),1,0)
		FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
		WHERE userid='''+@appuserid+'''

		IF(@_isadmin = 1)
		BEGIN
			SELECT
				  ''taskid'' as [1]
				  ,''taskname'' as [2]
				  ,''StartDate'' as [3]
 				  ,''estimate_hrs'' as [4]
				  ,''DeadLineDate'' as [5]
				  ,''priorityid'' as [6]
				  ,''workcategoryid'' as [7]
				  ,''departmentid'' as [8]
				  ,''ticketno'' as [9]
				  ,''maintaskid'' as [10]
				  ,''maintenanceno'' as [11]
				  ,''projectid'' as [12]
				  ,''enddate'' as [13]
				  ,''assigneeids'' as [14]
				  --,[statusid]
				  --,[parentid]
				  --,[isFreez]
				  --,[progress_per]
				  --,[ismilestone]
				  --,[isfavourite]
				  --,[isnew]
				  --,[isburning]
				  --,[estimate1_hrs]
				  --,[estimate2_hrs]
				  --,[assigneids]
				  --,[createdbyid]
				  --,[workinghr]
				  --,[maingroupids]
				  --,[EndDate]
				  --,[secstatusid]
				  --,[bindedMainGroupid]
				  --,[taskno]
				  --,[Completion_timestamp]
				  --,[isfromadminapp]


			SELECT 
				  t.taskid as [1]
				  ,[taskname] as [2]
				  ,[StartDate] as [3]
				  ,[estimate_hrs] as [4]
				  ,[DeadLineDate] as [5]
				  ,[priorityid] as [6]
				  ,[workcategoryid] as [7]
				  ,[departmentid] as [8]
				  ,[ticketno] as [9]
				  ,[maintaskid] as [10]
				  ,[maintenanceno] as [11]
				  ,[projectid] as [12]
				  ,[EndDate] as [13]
				  ,agg.assigneeids as [14]
				 
			FROM ['+@DBNAME+'].[dbo].[task_task_archive] as t with(nolock)
			INNER JOIN (
				SELECT taskid
					,assigneeids
				FROM #ASSIGNEELIST_'+@RandomNo+'
			) AS agg ON t.taskid = agg.taskid
			INNER JOIN ['+@DBNAME+'].[dbo].task_user_task_bind AS ub WITH (NOLOCK)
				ON t.taskid = ub.taskid	

		END

		IF OBJECT_ID(''tempdb..#ASSIGNEELIST_'+@RandomNo+''') IS NOT NULL DROP TABLE #ASSIGNEELIST_'+@RandomNo+';
		IF OBJECT_ID(''tempdb..#task_descr_'+@RandomNo+''') IS NOT NULL DROP TABLE #task_descr_'+@RandomNo+';
	'

	PRINT(@SQL)
	EXEC(@SQLASSIGNEE + @SQL)
END

ELSE IF(isnull(@mode,'')='taskfulltruncate')
BEGIN
	SET @SQL='
		truncate table task_filtermaingroup
		truncate table task_filtergroup
		truncate table task_filterattr
		truncate table task_filter_group_attr_bind

		truncate table task_attachement
		truncate table task_comment
		truncate table task_department
		truncate table task_descr
		truncate table task_descr_trash
		--truncate table task_emprole
		truncate table task_meeting
		truncate table task_meeting_archive
		truncate table task_meeting_accept_reject
		truncate table task_meeting_accept_reject_archive
		truncate table task_task		


		truncate table task_priority
		truncate table task_project
		truncate table task_status
		truncate table Task_Status_master
		
		truncate table task_trash
		truncate table task_user_task_bind
		truncate table task_workcategory
		truncate table task_workspace

		truncate table task_bugpriority
		truncate table task_bugstatus

		SELECT 
			1 as stat
			,''successfully full truncate'' as stat_msg
			,1000 as stat_code
	'
	print(@SQL)
	exec(@SQL)

END
ELSE IF(isnull(@mode,'')='master_action')
BEGIN
	IF(@master_mode='add' and isnull(@master_id,0)=0)
	BEGIN
		SET @SQL='
			if exists(
				select 1 from ['+@DBNAME+'].dbo.['+@master_table+'] 
				where [labelname]='''+@master_labelvalue+'''
			)
			BEGIN
				SELECT 
					0 as stat
					,''already exists'' as stat_msg
					,1001 as stat_code
			END
			ELSE
			BEGIN
				declare @_maxid as int=isnull((select max(id) from ['+@DBNAME+'].dbo.['+@master_table+'] with (nolock)),0)+1
				
				IF('''+@master_table+'''=''task_project'')
				BEGIN
					INSERT INTO ['+@DBNAME+'].dbo.[task_project]
					(id,[entrydate],[labelname],[displayorder])
					VALUES(@_maxid,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate()),'''+@master_labelvalue+''','+convert(nvarchar(20),@master_displayorder)+')
				END
				ELSE IF('''+@master_table+'''=''task_holiday'')
				BEGIN
					INSERT INTO ['+@DBNAME+'].dbo.[task_holiday]
					(id,[holidaydate],[labelname],[displayorder])
					VALUES(@_maxid
						,'''+convert(nvarchar(20),@holidaydate)+'''
						,'''+@master_labelvalue+''','+convert(nvarchar(20),@master_displayorder)+')
				END
				ELSE
				BEGIN
					INSERT INTO ['+@DBNAME+'].dbo.['+@master_table+']
					(id,[labelname],[displayorder])
					VALUES(@_maxid,'''+@master_labelvalue+''','+convert(nvarchar(20),@master_displayorder)+')
				END

			
				declare 
					@_LoginId as int=0
					,@_LoginUserCode as nvarchar(max)=''''
					,@_loginroleid as int=0

				SELECT TOP(1)
					@_LoginId=id
					,@_LoginUserCode=isnull(customercode,'''')
					,@_loginroleid=isnull(mastermanagement_roleid,0)
				FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
				WHERE userid='''+@appuserid+'''


				INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
				([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
				,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
				VALUES
				   (isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				   ,''Task Management''
				   ,'''+@mode+'''
				   ,'''+@master_labelvalue+'''
				   ,concat(''new data added '',''['+@master_labelvalue+']'')
				   ,@_LoginId
				   ,'''+@appuserid+'''
				   ,@_LoginUserCode
				   ,'''+@IPAddress+'''
				   ,'''+@FormName+'''
				   ,@_loginroleid
				 )


				SELECT 
					1 as stat
					,''successfully save'' as stat_msg
					,1000 as stat_code	
			END
		'		
	END
	ELSE IF(@master_mode='edit' and isnull(@master_id,0)>0)
	BEGIN
		SET @SQL='
			declare 
				@_LoginId as int=0
				,@_LoginUserCode as nvarchar(max)=''''
				,@_loginroleid as int=0
				,@_old_data as nvarchar(max)=''''


			SELECT
				@_old_data=isnull([labelname],'''')
			FROM ['+@DBNAME+'].dbo.['+@master_table+']			
			WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'

			if('''+@master_table+'''=''task_holiday'')
			BEGIN
				UPDATE ['+@DBNAME+'].dbo.['+@master_table+']
				SET [labelname]='''+@master_labelvalue+'''
				 ,[holidaydate]='''+@holidaydate+'''
				 ,[displayorder]='+convert(nvarchar(20),@master_displayorder)+'
				WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'
			END
			ELSE
			BEGIN
				UPDATE ['+@DBNAME+'].dbo.['+@master_table+']
				SET [labelname]='''+@master_labelvalue+'''				 
				 ,[displayorder]='+convert(nvarchar(20),@master_displayorder)+'
				WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'
			END

			

			

			SELECT TOP(1)
				@_LoginId=id
				,@_LoginUserCode=isnull(customercode,'''')
				,@_loginroleid=isnull(mastermanagement_roleid,0)
			FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] with (nolock)
			WHERE userid='''+@appuserid+'''


			INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
			([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
			,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
			VALUES
				(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,''Task Management''
				,'''+@mode+'''
				,'''+@master_labelvalue+'''
				,concat(''update data from ['',@_old_data,''] to '',''['+@master_labelvalue+']'')
				,@_LoginId
				,'''+@appuserid+'''
				,@_LoginUserCode
				,'''+@IPAddress+'''
				,'''+@FormName+'''
				,@_loginroleid
				)



			SELECT 
				1 as stat
				,''successfully updated!'' as stat_msg
				,1000 as stat_code		
		'		
	END
	ELSE IF(@master_mode='del' and isnull(@master_id,0)>0)
	BEGIN
		SET @SQL='
			declare 
				 @_LoginId as int=0
				,@_LoginUserCode as nvarchar(max)=''''
				,@_loginroleid as int=0
				,@_old_data as nvarchar(max)=''''


			SELECT
				@_old_data=isnull([labelname],'''')
			FROM ['+@DBNAME+'].dbo.['+@master_table+']			
			WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'


			DELETE FROM ['+@DBNAME+'].dbo.['+@master_table+']			
			WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'



			INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
			([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
			,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
			VALUES
				(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,''Task Management''
				,'''+@mode+'''
				,'''+@master_labelvalue+'''
				,concat(''successfully delete ['',@_old_data,'']'')
				,@_LoginId
				,'''+@appuserid+'''
				,@_LoginUserCode
				,'''+@IPAddress+'''
				,'''+@FormName+'''
				,@_loginroleid
				)


			SELECT 
				1 as stat
				,''successfully deleted!'' as stat_msg
				,1000 as stat_code		
		'
		
	END
	ELSE IF(@master_mode='trash' and isnull(@master_id,0)>0)
	BEGIN
		SET @SQL='
			declare 
				 @_LoginId as int=0
				,@_LoginUserCode as nvarchar(max)=''''
				,@_loginroleid as int=0
				,@_old_data as nvarchar(max)=''''


			SELECT
				@_old_data=isnull([labelname],'''')
			FROM ['+@DBNAME+'].dbo.['+@master_table+']			
			WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'


			UPDATE ['+@DBNAME+'].dbo.['+@master_table+']
			SET [isdelete]=1
				,[deletedate]=isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
			WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'



			INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
			([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
			,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
			VALUES
				(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,''Task Management''
				,'''+@mode+'''
				,'''+@master_labelvalue+'''
				,concat(''successfully trash ['',@_old_data,'']'')
				,@_LoginId
				,'''+@appuserid+'''
				,@_LoginUserCode
				,'''+@IPAddress+'''
				,'''+@FormName+'''
				,@_loginroleid
				)


			SELECT 
				1 as stat
				,''successfully trash!'' as stat_msg
				,1000 as stat_code		
		'
		
	END
	ELSE IF(@master_mode='restore' and isnull(@master_id,0)>0)
	BEGIN
		SET @SQL='
			declare 
				 @_LoginId as int=0
				,@_LoginUserCode as nvarchar(max)=''''
				,@_loginroleid as int=0
				,@_old_data as nvarchar(max)=''''


			SELECT
				@_old_data=isnull([labelname],'''')
			FROM ['+@DBNAME+'].dbo.['+@master_table+']			
			WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'


			UPDATE ['+@DBNAME+'].dbo.['+@master_table+']
			SET [isdelete]=0
				,[deletedate]=NULL
			WHERE ID='+convert(nvarchar(max),isnull(@master_id,0))+'



			INSERT INTO ['+@DBNAME+'].[dbo].[LogManagement_LogHistory]
			([entrydate],[AppsName],[PageName],[UniqueId],[LogHistory],[LoginId]
			,[LoginUserId],[LoginUserCode],[ipaddress],[formname],[loginroleid])
			VALUES
				(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
				,''Task Management''
				,'''+@mode+'''
				,'''+@master_labelvalue+'''
				,concat(''successfully restored ['',@_old_data,'']'')
				,@_LoginId
				,'''+@appuserid+'''
				,@_LoginUserCode
				,'''+@IPAddress+'''
				,'''+@FormName+'''
				,@_loginroleid
				)


			SELECT 
				1 as stat
				,''successfully restored!'' as stat_msg
				,1000 as stat_code		
		'
		
	END

	print(@SQL)
	exec(@SQL)
END


ELSE IF(isnull(@mode,'')='chat_contact_save')
BEGIN
	SET @SQL='
		if exists(select 1 from ['+@DBNAME+'].[dbo].[chat_contact] where [userid]='''+@emailid+''')
		BEGIN
			UPDATE ['+@DBNAME+'].[dbo].[chat_contact]
			SET [fname]='''+@fname+'''
				,[lname]='''+@lname+'''
				,[ccode]='''+@ccode+'''
				,[mobile]='''+@mobile+'''
				,[role]='''+@rolename+'''
				,[about]='''+@about+'''
				,[avatar]='''+@avatar+'''
				,[avatarColor]='''+@avatarColor+'''					
				,[psw]
				,[isgroup]
			WHERE [userid]='''+@emailid+'''
			
		END
		ELSE
		BEGIN
			INSERT INTO ['+@DBNAME+'].[dbo].[chat_contact]
			([fname],[lname],[ccode],[mobile],[role],[about]
			,[userid],[psw],[isgroup])
			 VALUES
				   ('''+@fname+'''
				   ,'''+@lname+'''
				   ,'''+@ccode+'''
				   ,'''+@mobile+'''
				   ,'''+@rolename+'''
				   ,'''+@about+'''				 			   
				   ,'''+@emailid+'''
				   ,'''+@psw+'''
				   ,'''+convert(nvarchar(20),@isgroup)+''')
		END



		INSERT INTO ['+@DBNAME+'].[dbo].[chat_group]
			   ([entrydate]
			   ,[groupid]
			   ,[contactid])
		 VALUES
			   (<entrydate, datetime,>
			   ,<groupid, int,>
			   ,<contactid, nvarchar(max),>)
	'
	print(@SQL)
	EXEC(@SQL)
END
ELSE IF(isnull(@mode,'')='chatsave')
BEGIN

	SET @SQL='
		if NOT EXISTS(
			select userid,loginuserid 
			from ['+@DBNAME+'].[dbo].Chats with (nolock)
			where userid='+convert(nvarchar(10),@chatid)+'
			and loginuserid='+convert(nvarchar(10),@userid)+'
		)
		BEGIN
			declare @_maxid int=isnull((select max(id) from ['+@DBNAME+'].[dbo].[Chats] with (nolock)),0)+1

			 INSERT INTO ['+@DBNAME+'].[dbo].[Chats]
			 ([id],[userId],[loginuserid],[unseenMsgs])
			 VALUES(@_maxid,'+convert(nvarchar(10),@chatid)+','+convert(nvarchar(10),@userid)+',0)
		END

		INSERT INTO ['+@DBNAME+'].[dbo].[ChatMessages]
		([chatId],[senderId],[message],[time],[isSent],[isDelivered],[isSeen])
		VALUES
           ('+convert(nvarchar(10),@chatid)+'
           ,'+convert(nvarchar(10),@senderid)+'
           ,'''+convert(nvarchar(max),@chatmsg)+'''
           ,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
           ,1
		   ,1
		   ,0
           )

		SELECT
			  1 as stat
			  ,''sucess'' as stat_msg	
			  ,1000 as stat_code

	'
	print(@SQL)
	EXEC(@SQL)
END
ELSE IF(isnull(@mode,'')='getchatdatapsw' or isnull(@mode,'')='getchatdatatoken')
BEGIN

	--select * from [chat_contact]
	--select * from [chat_status]
	--select * from [chat_contactbind]
	--select * from Chats
	--select * from ChatMessages
	--select * from chat_logintoken
	--select * from chat_group
	--select * from Chats
	--select * from ChatMessages



	SET @SQL='
		DECLARE 
			@loginid as INT=0
			,@_token as nvarchar(100)=''''
			,@_istoken as INT=0

		if('''+convert(nvarchar(200),@token)+'''<>'''')
		BEGIN
			select top(1)
				@loginid=isnull(ProfileUserId,0)
			from ['+@DBNAME+'].[dbo].chat_logintoken WITH (NOLOCK)
			where token='''+convert(nvarchar(200),@token)+'''

			SET @_istoken=1
			SET @_token='''+convert(nvarchar(200),@token)+'''
		END
		ELSE IF (('''+convert(nvarchar(200),@userid)+'''<>'''' and '''+convert(nvarchar(200),@psw)+'''<>'''') and '''+convert(nvarchar(200),@token)+'''='''')
		BEGIN
			select
			  @loginid=[id]
			FROM ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] WITH (nolock)			
			WHERE [userid]='''+convert(nvarchar(200),@userid)+'''
			and [password]='''+convert(nvarchar(200),@psw)+'''
		END

		PRINT concat(''@loginid :'',@loginid)
		

		IF(@loginid>0)
		BEGIN

			if(@_istoken=0)
			BEGIN
				set @_token=(SELECT LEFT(CONVERT(VARCHAR(50), NEWID()), 8) + CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR) AS UniqueToken);
				delete from ['+@DBNAME+'].[dbo].[chat_logintoken] where [ProfileUserId]=@loginid

				INSERT INTO ['+@DBNAME+'].[dbo].[chat_logintoken]
				([entrydate],[ProfileUserId],[token])
				VALUES (
					isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())
					,@loginid
					,@_token
				)
			END

			select 
				1 as stat
				,''sucess'' as stat_msg	
				,1000 as stat_code
				,S.id AS ProfileUserId
				,S.userid
				,S.firstname as fname
				,S.lastname as lname
				,S.mobileno as mobile
				,S.designation as [role]
				,isnull(C.[about],'''') as about
				,isnull(C.[avatar],'''') as avatar
				,isnull(C.[avatarColor],'''') as avatarColor
				,isnull(T.[status],'''') as status
				,isnull(C.[isTwoStepAuthVerificationEnabled],0) as isTwoStepAuthVerificationEnabled
				,isnull(C.[isNotificationsOn],0) as isNotificationsOn
				,@_token as logintoken
			from ['+@DBNAME+'].[dbo].Usermanagement_systemloginmaster as S WITH (NOLOCK)
			LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[chat_contact] AS C WITH (nolock)	
			ON S.id=C.systemloginid
			LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[chat_status] as T WITH (nolock)
			ON C.[statusid]=T.id
			WHERE S.[id]=@loginid
		

			select 
				1 as stat
				,''sucess'' as stat_msg	
				,1000 as stat_code
				,S.id AS ProfileUserId
				,S.userid
				,S.firstname as fname
				,S.lastname as lname
				,S.mobileno as mobile
				,S.designation as [role]
				,isnull(C.[about],'''') as about
				,isnull(C.[avatar],'''') as avatar
				,isnull(C.[avatarColor],'''') as avatarColor
				,isnull(T.[status],'''') as status
				,isnull(C.[isTwoStepAuthVerificationEnabled],0) as isTwoStepAuthVerificationEnabled
				,isnull(C.[isNotificationsOn],0) as isNotificationsOn
				,@_token as logintoken
			from ['+@DBNAME+'].[dbo].Usermanagement_systemloginmaster as S WITH (NOLOCK)
			LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[chat_contact] AS C WITH (nolock)	
			ON S.id=C.systemloginid
			LEFT OUTER JOIN ['+@DBNAME+'].[dbo].[chat_status] as T WITH (nolock)
			ON C.[statusid]=T.id
			INNER JOIN (
				select bind_contactid 
				from ['+@DBNAME+'].[dbo].[chat_contactbind] WITH (NOLOCK) 
				WHERE login_contactid=@loginid
			) as B
			ON S.[id]=B.bind_contactid
			

			-- Chats data with messages
			SELECT 
				c.id AS ChatId
				, c.userId
				, c.unseenMsgs
				, m.id AS MessageId
				, m.senderId
				, m.message
				, m.time
				, m.isSent
				, m.isDelivered
				, m.isSeen
			FROM ['+@DBNAME+'].dbo.Chats c
			JOIN ['+@DBNAME+'].dbo.ChatMessages m 
			ON c.id = m.chatId
			WHERE C.loginuserid=@loginid
			ORDER BY c.id, m.time;
		END
		ELSE
		BEGIN
			SELECT
				 0 as stat
				,''invalid userid or password'' as stat_msg	
				,1002 as stat_code
		END
	'

	print(@SQL)	
	exec(@SQL)
END

ELSE IF(isnull(@mode,'')='kpidashboard')
BEGIN
	
	create table #DepartmentWiseLossSummary
		(
			 DepartmentID int
			,DepartmentCode nvarchar(100)
			,MFG_Locationname nvarchar(100)
			,TotalWtLosspure decimal(38,3)
			,TotalWtLoss decimal(38,3)	
			,isrefine int
		)

	create table #DepartmentWiseLossSummary_Detail
		(
			 DepartmentID int
			,DepartmentCode nvarchar(100)
			,MFG_Locationname nvarchar(100)
			,TotalWtLosspure decimal(38,3)
			,TotalWtLoss decimal(38,3)						
		)
		
	SET @WhereClause_delete=''
	SET @WhereClause=''										
	SET @WhereClause_casting=''
	SET @WhereClause_spruecutting=''
	SET @WhereClause_conversion=''	
	SET @WhereClause_returnfromemployee=''
	SET @WhereClause_refine=''
	SET @iswithoutfinding=0
	SET @isinclude_Production_SideUpData=1
	SET @isMonthwise=0
	SET @MetalType='GOLD'
	SET @rm_grossloss=0	

	--SET @FDate='11/26/2024 00:00:00'					
	--SET @TDate='11/27/2024 23:59:59'	

	set @WhereClause=' where concat(metal_type_name,'' '',metal_purity_name) like '''+@MetalType+'%'' and Modifieddate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '										
	set @WhereClause_casting=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and CastingIssDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '
	set @WhereClause_spruecutting=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and CastingIssDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '
	set @WhereClause_conversion=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and convertdate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '
	set @WhereClause_returnfromemployee=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and LockerInDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '

	SET @SQL='
			declare @location as nvarchar(100)=isnull((
				select top(1) isnull(manufacturelocationname,'''') as manufacturelocationname
				from ['+@DBNAME+'].[dbo].MasterManagement_manufacturelocation with (nolock)
				where isnull(IsDefault,0)=1
			),'''')

			insert into #DepartmentWiseLossSummary_Detail(
			DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss
			)
			Select 
				-1
				,''MELT''				
				,@location	
				,sum(iif(B.entrydate IS NULL,0.00,(isnull([A].[dustwt],0)-isnull([A].[receivedgm],0)))) as meltLoss
				,sum(iif(B.entrydate IS NULL,0.00,(isnull([A].[dustwt],0)-isnull([A].[receivedgm],0)))) as meltLoss
			from ['+@DBNAME+'].[dbo].[InventoryManagement_metalrefinery] AS [A] with (nolock)	
			left outer join (
						select entrydate,[metalrefineryid] 
						from ['+@DBNAME+'].[dbo].InventoryManagement_invoice_AddedWeightLog with (nolock)
						where [Description]=''metalrefinary''
						and isnull(IsGetBack,0)=0
						) as B
			on A.id=B.[metalrefineryid]
			where  isnull(a.MeltRefiningId,0)=0
			and isnull(A.Mastermanagement_rolecode,'''')=''MELT''
			and B.entrydate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''
	'
	print (@SQL)
	exec (@SQL)
	

	set @SQL='	
			insert into #DepartmentWiseLossSummary_Detail(
			DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss
			)
			select R.deptid as DepartmentID
				,D.name as DepartmentCode
				,R.[locationname] as MFG_Locationname
				,['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
					isnull(R.metal_purity_name,'''')
					,-R.losswt
					,isnull(R.metal_type_name,'''')
					,''pure''
				) 
				,-R.losswt as TotalWtLosspure
			from ['+@DBNAME+'].[dbo].[loss_recovery] as R
			left outer join (
				select id,name from ['+@DBNAME+'].[dbo].Mastermanagement_role with (nolock)
				where isnull(IsMfg,0)=1
			) as D 
			on R.deptid=D.id
			where R.entrydate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''
			'
	print (@SQL)
	exec (@SQL)

	set @SQL='

			insert into #DepartmentWiseLossSummary_Detail(
			DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss
			)
			select 
				isnull(INV_MeterialAssignEmp_DeptId,0) as	DepartmentID
				,isnull(INV_MeterialAssignEmp_DeptName,'''') as DepartmentCode					
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,'''')) as MFG_Locationname
				,sum(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							isnull(metal_purity_name,'''')
							,iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
								,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
								,isnull([Department_LossWeight],0)
							 )							
							,isnull(metal_type_name,''''),''pure'')))) as TotalWtLosspure	
				,sum(CONVERT(decimal(38,3),iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
					,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
					,isnull([Department_LossWeight],0)
					)))					
			from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog] with (nolock)
			'+@WhereClause+' 							
				and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')					
				and isnull(IsReturnCompleted,0)=1
				and isnull(MFG_Locationname,'''')<>''''	
				and isnull(isdelete,0)=0
				and iif('+convert(nvarchar(max),@iswithoutfinding)+'=1,isnull(IsDepartmentLastReturn_locationwise,0),1)=1
			Group By isnull(INV_MeterialAssignEmp_DeptId,0)
				,isnull(INV_MeterialAssignEmp_DeptName,'''')
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,''''))				
		'	
	print (@SQL)
	exec (@SQL)
		


	set @SQL='
			insert into #DepartmentWiseLossSummary_Detail(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
			select 
				isnull(INV_MeterialAssignEmp_DeptId,0) as	DepartmentID
				,isnull(INV_MeterialAssignEmp_DeptName,'''') as DepartmentCode					
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,'''')) as MFG_Locationname
				,sum(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							isnull(metal_purity_name,'''')
							,iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
								,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
								,isnull([Department_LossWeight],0)
							 )							
							,isnull(metal_type_name,''''),''pure'')))) as TotalWtLosspure
				,sum(CONVERT(decimal(38,3),iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
								,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
								,isnull([Department_LossWeight],0)
							 )))						
			from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog_Archive] with (nolock)
			'+@WhereClause+' 							
				and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')					
				and isnull(IsReturnCompleted,0)=1
				and isnull(MFG_Locationname,'''')<>''''	
				and isnull(isdelete,0)=0
				and iif('+convert(nvarchar(max),@iswithoutfinding)+'=1,isnull(IsDepartmentLastReturn_locationwise,0),1)=1
			Group By isnull(INV_MeterialAssignEmp_DeptId,0)
				,isnull(INV_MeterialAssignEmp_DeptName,'''')
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,''''))
		'	

	print (@SQL)
	exec (@SQL)
		


	if(isnull(@isinclude_Production_SideUpData,0)=1 and @isMonthwise=0)
	begin
			set @SQL='
				insert into #DepartmentWiseLossSummary_Detail
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
				select 
					isnull(INV_MeterialAssignEmp_DeptId,0) as	DepartmentID
					,isnull(INV_MeterialAssignEmp_DeptName,'''') as DepartmentCode					
					,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,'''')) as MFG_Locationname
					,sum(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
								isnull(metal_purity_name,'''')
								,iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
									,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
									,isnull([Department_LossWeight],0)
									)							
								,isnull(metal_type_name,''''),''pure'')))) as TotalWtLosspure
					,sum(CONVERT(decimal(38,3),iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
									,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
									,isnull([Department_LossWeight],0)
									)))						
				from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog_delete] with (nolock)
				'+@WhereClause+' 							
					and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')					
					and isnull(IsReturnCompleted,0)=1
					and isnull(MFG_Locationname,'''')<>''''	
					and isnull(isdelete,0)=0
					and iif('+convert(nvarchar(max),@iswithoutfinding)+'=1,isnull(IsDepartmentLastReturn_locationwise,0),1)=1
				Group By isnull(INV_MeterialAssignEmp_DeptId,0)
					,isnull(INV_MeterialAssignEmp_DeptName,'''')
					,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,''''))
					'
	end
	else
	begin
		set @SQL=''
	end

	print (@SQL)
	exec (@SQL)
		


		set @SQL='	
			insert into #DepartmentWiseLossSummary_Detail
			(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
			select 
				27 as DepartmentID
				,''Casting'' as DepartmentCode					
				,max(isnull(Mastermanagement_MFG_JobLastLocationname,'''')) as MFG_Locationname													
				,CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
					replace(isnull([MetalType],''''),''gold '','''')
					,isnull(CastingWeight,0)-(isnull(CastingReturnWeight,0)-sum(isnull(WaxsettingDiaCsWt,0)))						
					,isnull(A.metal_type_name,''''),''pure''))) as TotalWtLosspure	
				,CONVERT(decimal(38,3),isnull(CastingWeight,0)-(isnull(CastingReturnWeight,0)-sum(isnull(WaxsettingDiaCsWt,0))))													
			from (
				select 
					Mastermanagement_MFG_JobLastLocationname,CastingWeight,CastingReturnWeight,WaxsettingDiaCsWt,MetalType 
					,CastUniqueno,CastBatchNo
					,metal_type_name
				from ['+@DBNAME+'].[dbo].[CastingManagement_CastingBatch]  with (nolock) 
				'+replace(@WhereClause_casting,'CastingIssDate','CastingReturnDate')+'	and isnull(CastingReturnWeight,0)>0
				union all
				select Mastermanagement_MFG_JobLastLocationname,CastingWeight,CastingReturnWeight,WaxsettingDiaCsWt,MetalType 
					,CastUniqueno,CastBatchNo 
					,metal_type_name
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 
				'+replace(@WhereClause_casting,'CastingIssDate','CastingReturnDate')+'	and isnull(CastingReturnWeight,0)>0
				union all
				select Mastermanagement_MFG_JobLastLocationname,CastingWeight,CastingReturnWeight,WaxsettingDiaCsWt,MetalType 
					,CastUniqueno,CastBatchNo 
					,metal_type_name
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 
				'+replace(@WhereClause_casting,'CastingIssDate','CastingReturnDate')+'	and isnull(CastingReturnWeight,0)>0
			) as A
			group by CastUniqueno
				,CastBatchNo
				,isnull(CastingWeight,0)
				,isnull(CastingReturnWeight,0)
				,isnull(MetalType,'''')	
				,isnull(A.metal_type_name,'''')
		'

		print (@SQL)
		exec (@SQL)
		



		set @SQL='
				insert into #DepartmentWiseLossSummary_Detail
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
				select 
					41 as DepartmentID
					,''Sprue Cutting'' as DepartmentCode					
					,max(isnull(Mastermanagement_MFG_JobLastLocationname,'''')) as MFG_Locationname		
					,CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
						 replace(isnull([MetalType],''''),''gold '','''')
						,(isnull(CastingReturnWeight,0)
							-(iif(isnull(IsBatchWiseSprueCutting,0)=0,SUM(isnull(sprueweight,0))+isnull(AccountTerminate_SprueCuttingWt,0),isnull(sprueweight_batchwise,0))
							+iif(isnull(IsBatchWiseSprueCutting,0)=0,(isnull(extratreeweight,0)),isnull(isnull(extratreeweight_batchwise,0),0)))	 				
							)
						,isnull(metal_type_name,''''),''pure''))) as TotalWtLosspure
						
					,CONVERT(decimal(38,3),(isnull(CastingReturnWeight,0)
						-(iif(isnull(IsBatchWiseSprueCutting,0)=0,SUM(isnull(sprueweight,0))+isnull(AccountTerminate_SprueCuttingWt,0),isnull(sprueweight_batchwise,0))
						+iif(isnull(IsBatchWiseSprueCutting,0)=0,(isnull(extratreeweight,0)),isnull(isnull(extratreeweight_batchwise,0),0)))	 				
					 ))	
					 
				from 
				(
					select 
						Mastermanagement_MFG_JobLastLocationname
						,CastingReturnWeight
						,IsBatchWiseSprueCutting
						,sprueweight
						,sprueweight_batchwise 
						,extratreeweight
						,extratreeweight_batchwise
						,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt
						,metal_type_name
						--,convert(char(20),SprueCutting_returnClosedate,106) as SprueCutting_returnClosedate
					from ['+@DBNAME+'].[dbo].[CastingManagement_CastingBatch]  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueCutting_returnClosedate')+' AND ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0
					'

		set @SQL1='
					union all
					select 
						 Mastermanagement_MFG_JobLastLocationname
						,CastingReturnWeight
						,IsBatchWiseSprueCutting
						,sprueweight
						,sprueweight_batchwise 
						,extratreeweight,extratreeweight_batchwise,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt
						,metal_type_name						
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueCutting_returnClosedate')+' AND ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0
					union all
					select 
						 Mastermanagement_MFG_JobLastLocationname
						,CastingReturnWeight
						,IsBatchWiseSprueCutting
						,sprueweight
						,sprueweight_batchwise 
						,extratreeweight,extratreeweight_batchwise,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt
						,metal_type_name						
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueCutting_returnClosedate')+' AND ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0

				) as A							
				group by CastUniqueno
					,CastBatchNo
					,isnull(CastingReturnWeight,0)
					,isnull(extratreeweight,0)
					,isnull(IsBatchWiseSprueCutting,0)
					,isnull(sprueweight_batchwise,0)
					,isnull(AccountTerminate_SprueCuttingWt,0)
					,isnull(extratreeweight_batchwise,0)
					,isnull(MetalType,'''')	
					,isnull(metal_type_name,'''')
					
				'	

		print (@SQL)
		print (@SQL1)
		exec (@SQL+@SQL1)
	
		

		set @SQL='
				insert into #DepartmentWiseLossSummary_Detail
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
				select 
					34 as DepartmentID
					,''Sprue Grinding'' as DepartmentCode					
					,max(isnull(Mastermanagement_MFG_JobLastLocationname,'''')) as MFG_Locationname					
					,CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
						replace(isnull([MetalType],''''),''gold '','''')
						,isnull(sprueweight_batchwise,0)-(SUM(isnull(SprueGrinding_Weight,0))+isnull(AccountTerminate_SprueGrindingWt,0)+isnull(SprueGrinding_treewt,0))
						,isnull(metal_type_name,'''')
						,''pure''))) as TotalWtLosspure															
					,CONVERT(decimal(38,3),isnull(sprueweight_batchwise,0)-(SUM(isnull(SprueGrinding_Weight,0))+isnull(AccountTerminate_SprueGrindingWt,0)+isnull(SprueGrinding_treewt,0)))
				from
				(
					select 
						Mastermanagement_MFG_JobLastLocationname,sprueweight_batchwise,SprueGrinding_Weight 
						,SprueGrinding_treewt,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt
						,metal_type_name
					from ['+@DBNAME+'].[dbo].[CastingManagement_CastingBatch]  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueGrinding_ReceiveCloseDate')+' 
					AND ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 
							or isnull(IsSprueCutting_ReturnClosed,0)=1
						)
					union all
					select Mastermanagement_MFG_JobLastLocationname,sprueweight_batchwise,SprueGrinding_Weight 
						,SprueGrinding_treewt,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt
						,metal_type_name
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueGrinding_ReceiveCloseDate')+' 
					AND ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 
							or isnull(IsSprueCutting_ReturnClosed,0)=1
						)
				'
		set @SQL1='
					union all
					select Mastermanagement_MFG_JobLastLocationname,sprueweight_batchwise,SprueGrinding_Weight 
						,SprueGrinding_treewt,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt
						,metal_type_name
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueGrinding_ReceiveCloseDate')+' 
					AND ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 
							or isnull(IsSprueCutting_ReturnClosed,0)=1
						)
				) as A								
				group by CastUniqueno
					,CastBatchNo
					,isnull(sprueweight_batchwise,0)
					,isnull(SprueGrinding_treewt,0)
					,isnull(AccountTerminate_SprueGrindingWt,0)
					,isnull(MetalType,'''')
					,isnull(metal_type_name,'''')
				having SUM(isnull(sprueweight_batchwise,0))>0								
			'

		print (@SQL)
		print (@SQL1)
		exec (@SQL+@SQL1)
	
		

		set @SQL='
			declare @defaultlocation as nvarchar(max)=isnull((
					select top 1 manufacturelocationname 
					from ['+@DBNAME+'].[dbo].MasterManagement_manufacturelocation with (nolock)
					where isnull(IsDefault,0)=1
			  ),'''')

			insert into #DepartmentWiseLossSummary_Detail
			(   DepartmentID
				,DepartmentCode
				,MFG_Locationname
				,TotalWtLosspure
				,TotalWtLoss
			)
			select
				-11
				,''Conversion''
				,@defaultlocation
				,['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							SUBSTRING(iif(isnull(isnew_entry,0)=1,destinationmetal,sourcemetal),0,CHARINDEX('','',iif(isnull(isnew_entry,0)=1,destinationmetal,sourcemetal),0))
							,isnull([conversionloss],0)
							,isnull(metaltype,'''')
							,''pure''
						) as netloss				
				 ,isnull([conversionloss],0)
			from ['+@DBNAME+'].[dbo].[InventoryManagement_Conversion_Log] with (nolock)			
			'+ @WhereClause_conversion +'
			and isnull(isdelete,0)=0
		'

		print (@SQL)		
		exec (@SQL)


		set @SQL='
			declare @_defaultlocation as nvarchar(max)=isnull((
					select top 1 manufacturelocationname 
					from ['+@DBNAME+'].[dbo].MasterManagement_manufacturelocation with (nolock)
					where isnull(IsDefault,0)=1
			  ),'''')

			insert into #DepartmentWiseLossSummary_Detail
			(   DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
			select
				-12
				,''HMW''
				,@_defaultlocation
				,['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							[metalpurity]
							,isnull([loss],0)
							,[metaltype]
							,''pure''
						) as netloss				
				 ,isnull([loss],0)
			from ['+@DBNAME+'].[dbo].[InventoryManagement_StockTransferLog] with (nolock)			
			'+ @WhereClause_returnfromemployee +'
			and isnull(EventName,'''')=''Return From Employee-Issue''
			
		'
		print (@SQL)		
		exec (@SQL)

		set @SQL='
			insert into #DepartmentWiseLossSummary
			(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss,isrefine) 
			select 
				 DepartmentID
				,DepartmentCode
				,MFG_Locationname
				,sum(TotalWtLosspure)
				,sum(TotalWtLoss)
				,0
			from #DepartmentWiseLossSummary_Detail
			group by DepartmentID,DepartmentCode,MFG_Locationname
			order by DepartmentID,DepartmentCode,MFG_Locationname

			if('''+@WhereClause_refine+'''<>'''' and '+convert(nvarchar(max),@isMonthwise)+'=1)
			BEGIN
				insert into #DepartmentWiseLossSummary
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss,isrefine)
				Select 
					R.id				
					,isnull([A].[Mastermanagement_rolecode],'''') AS [Mastermanagement_rolecode]
					,''Refine'' as mfglocationname
					,sum(isnull([A].[receivedgm],0)) as TotalWtLosspure
					,sum(isnull([A].[receivedgm],0)) AS [TotalWtLoss]
					,1
				from ['+@DBNAME+'].[dbo].[InventoryManagement_metalrefinery] AS [A] with (nolock)	
				inner join ['+@DBNAME+'].[dbo].Mastermanagement_role as R with (nolock)
					on isnull(A.[Mastermanagement_rolecode],'''')=isnull(R.code,'''')
				left outer join (select entrydate,[metalrefineryid] 
								from ['+@DBNAME+'].[dbo].InventoryManagement_invoice_AddedWeightLog with (nolock)
								where [Description]=''metalrefinary''
								and isnull(IsGetBack,0)=0) as B
				on A.id=B.[metalrefineryid]
				'+@WhereClause_refine+'  
				and isnull(a.MeltRefiningId,0)=0
				and isnull([A].[Mastermanagement_rolecode],''All'')<>''MIX''
				group by isnull([A].[Mastermanagement_rolecode],'''')
					,R.id
			END
			'
		print (@SQL)		
		exec (@SQL)

		select 
			@rm_grossloss=sum(TotalWtLosspure)
		from #DepartmentWiseLossSummary
		where isnull(TotalWtLosspure,0)<>0	

		print concat('-------------------------------------------@rm_grossloss :',@rm_grossloss)	
	
			



	set @SQL='
			declare 
				 @job_count as decimal(38,2)=0
				,@rm_baggingcompleted as decimal(38,2)=0
				,@rm_avg_proc_time as decimal(38,3)=0
				,@goldrate as decimal(38,3)=0
				,@rm_goldstock as decimal(38,3)=0	
				,@rm_diastock as decimal(38,3)=0
				,@rm_csstock as decimal(38,3)=0				
				,@rm_diastock_wt as decimal(38,3)=0
				,@rm_csstock_wt as decimal(38,3)=0
				,@def_customercode as nvarchar(200)=''''

			select top(1)
				@def_customercode=isnull(customercode,'''') 
			from ['+@DBNAME+'].dbo.[usermanagement_systemloginmaster] with (nolock)
			where isnull(isDefaultCustomer,0)=1

			

			select
				 @job_count=count(serialjobno)
				,@rm_avg_proc_time=isnull(sum(processtime_in_sec)/count(serialjobno),0)
				,@rm_baggingcompleted=isnull(sum(isnull(A.total_complete_count,0)),0)
			from (
			select
				serialjobno
					,min(EngageStartDate) as EngageStartDate
					,max(EngageCompleteDate) as EngageCompleteDate
					,datediff(second,min(EngageStartDate),max(EngageCompleteDate)) as processtime_in_sec
					,sum(iif(EngageCompleteDate IS NOT NULL,1,0)) total_complete_count
				from ['+@DBNAME+'].[dbo].[kpireport] WITH (NOLOCK)
				where (EngageStartDate between '''+@fdate+' 00:00:00'' And '''+@tdate+' 23:59:59'' 				
				or EngageCompleteDate between '''+@fdate+' 00:00:00'' And '''+@tdate+' 23:59:59'' 				
				)
				group by serialjobno
			) as A	

			select 
				@goldrate=isnull(Price,0)
			from ['+@DBNAME+'].dbo.[Mastermanagement_metaltype] with (nolock)
			where metaltypename=''gold''
			and metalpurity=''24K''

			'
	set @SQL1='
		SELECT
			 @rm_diastock=CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=3 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(unitprice,0)*isnull(TotalRemainingWeight,0.000)),0)))					
			,@rm_csstock=CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=4 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(unitprice,0)*isnull(TotalRemainingWeight,0.000)),0)))		
			,@rm_goldstock=CONVERT(decimal(18, 3),sum(iif((isnull(itemname,'''')=''metal'' and ISNULL(shape, '''')=''gold'' and ISNULL(master_item_id,0)=1),isnull(TotalRemainingWeight_Pure,0.000),0)))
			,@rm_diastock_wt=CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=3 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(TotalRemainingWeight,0.000)),0)))					
			,@rm_csstock_wt=CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=4 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(TotalRemainingWeight,0.000)),0)))		
		FROM ['+@DBNAME+'].dbo.[InventoryManagement_invoice] with (nolock)	
		WHERE entrydate between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 
			and isnull(isdelete,0)=0
			and isnull(TotalRemainingWeight,0.000)>0
	'


	set @SQL2='
			declare @qc_avg_inward as int=0

			select 
				@qc_avg_inward=isnull(sum(isnull(SU.jobcount,0)),0)
			from (
				select 
					convert(nvarchar(20),ExportBatchDate,106) as ExportBatchDate			
					,ExportBatchNo
					,ExportOutwardBatch
					,count(ExportBatchDate) as jobcount
			
				from
				( 

					select 				
						 exportbatchdate as ExportBatchDate
						,PS.ExportBatchNo
						,ExportOutwardBatch	
					from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook as PS with (NoLock)									
					where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''						
					and isnull(PS.ExportOutwardBatch,'''')<>''''
					union all
					select 				
							exportbatchdate as ExportBatchDate
						,PS.ExportBatchNo
						,isnull(ExportOutwardBatch,'''') as ExportOutwardBatch
					from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook_Delete as PS with (NoLock)										
					where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''  						
					and isnull(PS.ExportOutwardBatch,'''')<>''''				
					and isnull(PS.Islastversion,0)=1
					and isnull(PS.IsBackStocktoMFG,0)=0

				) as a
				group by convert(nvarchar(20),ExportBatchDate,106)			
					,ExportBatchNo
					,ExportOutwardBatch
			) as SU

			'

	SET @SQL3='
			SELECT
				 isnull(@rm_baggingcompleted,0) as rm_baggingcompleted
				,isnull(@rm_avg_proc_time,0) as rm_avg_proc_time
				,'+convert(nvarchar(max),isnull(@rm_grossloss,0))+' as rm_grossloss
				,convert(decimal(18,2),((isnull(@rm_goldstock,0))*isnull(@goldrate,0))) as rm_goldstock
				,isnull(@rm_diastock,0) as rm_diastock
				,isnull(@rm_csstock,0) as rm_csstock
				,isnull(@rm_goldstock,0) as rm_goldstock_wt
				,isnull(@rm_diastock_wt,0) as rm_diastock_wt
				,isnull(@rm_csstock_wt,0) as rm_csstock_wt
				,isnull(@qc_avg_inward,0) as qc_avg_inward
				'

		
		print(@SQL)
		print(@SQL1)
		print(@SQL2)
		print(@SQL3)
		
	
		exec(@SQL+@SQL1+@SQL2+@SQL3)


	set @SQL='
			Declare @production_Detail table
			(
				 mfg_production_gms decimal(38,3)
				,mfg_jobs int
				,mfg_grossloss decimal(38,3)
				,Locationid int
				,manufacturelocationname nvarchar(max)
				,mfg_rejection decimal(38,3)
			)
			insert into @production_Detail
			(mfg_production_gms,mfg_jobs,mfg_grossloss
			,Locationid,manufacturelocationname,mfg_rejection)
			select 
				isnull(sum(isnull(NetWt,0)),0) as mfg_production_gms
				,count(convert(nvarchar(20),ExportBatchDate,106)) as mfg_jobs			
				,iif(isnull(sum(isnull(NetWt,0)),0)=0,0,convert(decimal(38,2),iif(isnull(sum(isnull(NetWt,0)),0)=0,0,isnull(sum(isnull(GrossLoss,0)),0)/isnull(sum(isnull(NetWt,0)),0)*100.00))) as mfg_grossloss
				,Locationid
				,L.manufacturelocationname
				,0 as mfg_rejection
			from
			( 

				select 		
					 isnull(lastMount_returnwt,0) as GrossWt
					,isnull(netwt,0) as NetWt				
					,exportbatchdate as ExportBatchDate
					,isnull(NetWt_Pure,0) as NetWt_24K																						
					,isnull(TotalDepartment_LossWeight,0) as GrossLoss
					,(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](isnull(metal_purity_name,''''),isnull([TotalDepartment_LossWeight],0),isnull(metal_type_name,''''),''pure'')))) as PureLoss				
					,isnull(PS.Mastermanagement_MFG_JobLastLocationid,0) as Locationid
				from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook as PS with (NoLock)	
				where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''  
				and isnull(PS.ExportOutwardBatch,'''')<>''''							

				union all	

				select 	
					isnull(lastMount_returnwt,0) as GrossWt
					,isnull(netwt,0) as NetWt				
					,exportbatchdate as ExportBatchDate
					,isnull(NetWt_Pure,0) as NetWt_24K								
					,isnull(TotalDepartment_LossWeight,0) as GrossLoss
					,(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](isnull(metal_purity_name,''''),isnull([TotalDepartment_LossWeight],0),isnull(metal_type_name,''''),''pure'')))) as PureLoss				
					,isnull(PS.Mastermanagement_MFG_JobLastLocationid,0) as Locationid
				from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook_Delete as PS with (NoLock)										
				where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 		
				and isnull(PS.ExportOutwardBatch,'''')<>''''				
				and isnull(PS.Islastversion,0)=1
				and isnull(PS.IsBackStocktoMFG,0)=0
			) as a
			left outer join (
				select id,manufacturelocationname 
				from ['+@DBNAME+'].dbo.[MasterManagement_manufacturelocation] with (nolock)
			) as L
			ON A.Locationid=L.id
			group by Locationid,L.manufacturelocationname
			'
		set @SQL1='
			insert into @production_Detail
			(mfg_production_gms,mfg_jobs,mfg_grossloss
			,Locationid,manufacturelocationname,mfg_rejection)
			select 	
				 0 as mfg_production_gms
				,0 as mfg_jobs			
				,0 as mfg_grossloss
				,G.locationid
				,G.manufacturelocationname
				,convert(decimal(38,2),(convert(decimal(38,2),SUM(G.reject))/convert(decimal(38,2),(SUM(G.reject)+SUM(G.approve))))*100)
				as mfg_rejection
			FROM (
					SELECT 
						Q.serialjobno
						,MAX(iif(Q.statusid in (2,4),1,0)) AS reject
						,MAX(iif(Q.statusid in (1,3),1,0)) AS approve
						,isnull(M.manufacturelocationname,''-'') as manufacturelocationname
						,Q.locationid as locationid
					FROM ['+@DBNAME+'].dbo.[qc_ans]  as Q with (nolock)
					left outer join(
						select id
							,manufacturelocationname 
						from ['+@DBNAME+'].dbo.[MasterManagement_manufacturelocation] with (nolock)
					) as M
					ON Q.locationid=M.id
					WHERE Q.entrydate between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''
					GROUP BY Q.serialjobno,Q.locationid,isnull(M.manufacturelocationname,''-'')
			) AS G
			group by G.locationid,G.manufacturelocationname

			select 
				 sum(mfg_production_gms) as mfg_production_gms
				,sum(mfg_jobs) as mfg_jobs
				,sum(mfg_grossloss) as mfg_grossloss
				,Locationid
				,manufacturelocationname
				,sum(mfg_rejection) as mfg_rejection 
			from @production_Detail
			group by Locationid,manufacturelocationname
					
		'
	PRINT(@SQL)
	PRINT(@SQL1)
	exec(@SQL+@SQL1)
	
	IF EXISTS(
		SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
		WHERE TABLE_NAME = '#DepartmentWiseLossSummary_Detail')
	BEGIN
		DROP TABLE #DepartmentWiseLossSummary_Detail
	END

	IF EXISTS(
		SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
		WHERE TABLE_NAME = '#DepartmentWiseLossSummary')
	BEGIN
		DROP TABLE #DepartmentWiseLossSummary
	END

	
END
ELSE IF(isnull(@mode,'')='kpidashboard_loss')
BEGIN
	print concat('@DBNAME :',@DBNAME)

	create table #DepartmentWiseLossSummary1
		(
			 DepartmentID int
			,DepartmentCode nvarchar(100)
			,MFG_Locationname nvarchar(100)
			,TotalWtLosspure decimal(38,3)
			,TotalWtLoss decimal(38,3)	
			,isrefine int
		)

	create table #DepartmentWiseLossSummary_Detail1
		(
			 DepartmentID int
			,DepartmentCode nvarchar(100)
			,MFG_Locationname nvarchar(100)
			,TotalWtLosspure decimal(38,3)
			,TotalWtLoss decimal(38,3)						
		)
		

	SET @WhereClause_delete=''
	SET @WhereClause=''										
	SET @WhereClause_casting=''
	SET @WhereClause_spruecutting=''
	SET @WhereClause_conversion=''	
	SET @WhereClause_returnfromemployee=''
	SET @WhereClause_refine=''
	SET @iswithoutfinding=0
	SET @isinclude_Production_SideUpData=1
	SET @isMonthwise=0
	SET @MetalType='GOLD'
	SET @rm_grossloss=0	

	--SET @FDate='11/26/2024 00:00:00'					
	--SET @TDate='11/27/2024 23:59:59'	

	set @WhereClause=' where concat(metal_type_name,'' '',metal_purity_name) like '''+@MetalType+'%'' and Modifieddate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '										
	set @WhereClause_casting=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and CastingIssDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '
	set @WhereClause_spruecutting=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and CastingIssDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '
	set @WhereClause_conversion=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and convertdate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '
	set @WhereClause_returnfromemployee=' where isnull(MetalType,'''') like '''+@MetalType+'%'' and LockerInDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' '

	SET @SQL='
			declare @location as nvarchar(100)=isnull((
				select top(1) isnull(manufacturelocationname,'''') as manufacturelocationname
				from ['+@DBNAME+'].[dbo].MasterManagement_manufacturelocation with (nolock)
				where isnull(IsDefault,0)=1
			),'''')

			insert into #DepartmentWiseLossSummary_Detail1(
			DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss
			)
			Select 
				-1
				,''MELT''				
				,@location	
				,sum(iif(B.entrydate IS NULL,0.00,(isnull([A].[dustwt],0)-isnull([A].[receivedgm],0)))) as meltLoss
				,sum(iif(B.entrydate IS NULL,0.00,(isnull([A].[dustwt],0)-isnull([A].[receivedgm],0)))) as meltLoss
			from ['+@DBNAME+'].[dbo].[InventoryManagement_metalrefinery] AS [A] with (nolock)	
			left outer join (
						select entrydate,[metalrefineryid] 
						from ['+@DBNAME+'].[dbo].InventoryManagement_invoice_AddedWeightLog with (nolock)
						where [Description]=''metalrefinary''
						and isnull(IsGetBack,0)=0
						) as B
			on A.id=B.[metalrefineryid]
			where  isnull(a.MeltRefiningId,0)=0
			and isnull(A.Mastermanagement_rolecode,'''')=''MELT''
			and B.entrydate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''
	'
	print (@SQL)
	exec (@SQL)
	

	set @SQL='	
			insert into #DepartmentWiseLossSummary_Detail1(
			DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss
			)
			select R.deptid as DepartmentID
				,D.name as DepartmentCode
				,R.[locationname] as MFG_Locationname
				,['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
					isnull(R.metal_purity_name,'''')
					,-R.losswt
					,isnull(R.metal_type_name,'''')
					,''pure''
				) 
				,-R.losswt as TotalWtLosspure
			from ['+@DBNAME+'].[dbo].[loss_recovery] as R with (nolock)
			left outer join (
				select id,name from ['+@DBNAME+'].[dbo].Mastermanagement_role with (nolock)
				where isnull(IsMfg,0)=1
			) as D 
			on R.deptid=D.id
			where R.entrydate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''
			'
	print (@SQL)
	exec (@SQL)

	set @SQL='

			insert into #DepartmentWiseLossSummary_Detail1(
			DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss
			)
			select 
				isnull(INV_MeterialAssignEmp_DeptId,0) as	DepartmentID
				,isnull(INV_MeterialAssignEmp_DeptName,'''') as DepartmentCode					
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,'''')) as MFG_Locationname
				,sum(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							isnull(metal_purity_name,'''')
							,iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
								,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
								,isnull([Department_LossWeight],0)
							 )							
							,isnull(metal_type_name,''''),''pure'')))) as TotalWtLosspure	
				,sum(CONVERT(decimal(38,3),iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
					,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
					,isnull([Department_LossWeight],0)
					)))					
			from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog] with (nolock)
			'+@WhereClause+' 							
				and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')					
				and isnull(IsReturnCompleted,0)=1
				and isnull(MFG_Locationname,'''')<>''''	
				and isnull(isdelete,0)=0
				and iif('+convert(nvarchar(max),@iswithoutfinding)+'=1,isnull(IsDepartmentLastReturn_locationwise,0),1)=1
			Group By isnull(INV_MeterialAssignEmp_DeptId,0)
				,isnull(INV_MeterialAssignEmp_DeptName,'''')
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,''''))				
		'	
	print (@SQL)
	exec (@SQL)
		


	set @SQL='
			insert into #DepartmentWiseLossSummary_Detail1
			(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
			select 
				isnull(INV_MeterialAssignEmp_DeptId,0) as	DepartmentID
				,isnull(INV_MeterialAssignEmp_DeptName,'''') as DepartmentCode					
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,'''')) as MFG_Locationname
				,sum(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							isnull(metal_purity_name,'''')
							,iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
								,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
								,isnull([Department_LossWeight],0)
							 )							
							,isnull(metal_type_name,''''),''pure'')))) as TotalWtLosspure
				,sum(CONVERT(decimal(38,3),iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
								,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
								,isnull([Department_LossWeight],0)
							 )))						
			from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog_Archive] with (nolock)
			'+@WhereClause+' 							
				and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')					
				and isnull(IsReturnCompleted,0)=1
				and isnull(MFG_Locationname,'''')<>''''	
				and isnull(isdelete,0)=0
				and iif('+convert(nvarchar(max),@iswithoutfinding)+'=1,isnull(IsDepartmentLastReturn_locationwise,0),1)=1
			Group By isnull(INV_MeterialAssignEmp_DeptId,0)
				,isnull(INV_MeterialAssignEmp_DeptName,'''')
				,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,''''))
		'	

	print (@SQL)
	exec (@SQL)
		


	if(isnull(@isinclude_Production_SideUpData,0)=1 and @isMonthwise=0)
	begin
			set @SQL='
				insert into #DepartmentWiseLossSummary_Detail1
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
				select 
					isnull(INV_MeterialAssignEmp_DeptId,0) as	DepartmentID
					,isnull(INV_MeterialAssignEmp_DeptName,'''') as DepartmentCode					
					,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,'''')) as MFG_Locationname
					,sum(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
								isnull(metal_purity_name,'''')
								,iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
									,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
									,isnull([Department_LossWeight],0)
									)							
								,isnull(metal_type_name,''''),''pure'')))) as TotalWtLosspure
					,sum(CONVERT(decimal(38,3),iif('+convert(nvarchar(max),@iswithoutfinding)+'=1
									,isnull([DepartmentLastReturn_locationwise_Losswt],0)+iif(isnull([Action],'''')=''Issue For Finding Convertion'',isnull(Department_LossWeight,0),0)
									,isnull([Department_LossWeight],0)
									)))						
				from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog_delete] with (nolock)
				'+@WhereClause+' 							
					and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')					
					and isnull(IsReturnCompleted,0)=1
					and isnull(MFG_Locationname,'''')<>''''	
					and isnull(isdelete,0)=0
					and iif('+convert(nvarchar(max),@iswithoutfinding)+'=1,isnull(IsDepartmentLastReturn_locationwise,0),1)=1
				Group By isnull(INV_MeterialAssignEmp_DeptId,0)
					,isnull(INV_MeterialAssignEmp_DeptName,'''')
					,iif(isnull(MFG_Locationname,'''')='''',''MIX'',isnull(MFG_Locationname,''''))
					'
	end
	else
	begin
		set @SQL=''
	end

	print (@SQL)
	exec (@SQL)
		


		set @SQL='	
			insert into #DepartmentWiseLossSummary_Detail1
			(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
			select 
				27 as DepartmentID
				,''Casting'' as DepartmentCode					
				,max(isnull(Mastermanagement_MFG_JobLastLocationname,'''')) as MFG_Locationname													
				,CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
					replace(isnull([MetalType],''''),''gold '','''')
					,isnull(CastingWeight,0)-(isnull(CastingReturnWeight,0)-sum(isnull(WaxsettingDiaCsWt,0)))						
					,isnull(A.metal_type_name,''''),''pure''))) as TotalWtLosspure	
				,CONVERT(decimal(38,3),isnull(CastingWeight,0)-(isnull(CastingReturnWeight,0)-sum(isnull(WaxsettingDiaCsWt,0))))													
			from (
				select 
					Mastermanagement_MFG_JobLastLocationname,CastingWeight,CastingReturnWeight,WaxsettingDiaCsWt,MetalType 
					,CastUniqueno,CastBatchNo
					,metal_type_name
				from ['+@DBNAME+'].[dbo].[CastingManagement_CastingBatch]  with (nolock) 
				'+replace(@WhereClause_casting,'CastingIssDate','CastingReturnDate')+'	and isnull(CastingReturnWeight,0)>0
				union all
				select Mastermanagement_MFG_JobLastLocationname,CastingWeight,CastingReturnWeight,WaxsettingDiaCsWt,MetalType 
					,CastUniqueno,CastBatchNo 
					,metal_type_name
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 
				'+replace(@WhereClause_casting,'CastingIssDate','CastingReturnDate')+'	and isnull(CastingReturnWeight,0)>0
				union all
				select Mastermanagement_MFG_JobLastLocationname,CastingWeight,CastingReturnWeight,WaxsettingDiaCsWt,MetalType 
					,CastUniqueno,CastBatchNo 
					,metal_type_name
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 
				'+replace(@WhereClause_casting,'CastingIssDate','CastingReturnDate')+'	and isnull(CastingReturnWeight,0)>0
			) as A
			group by CastUniqueno
				,CastBatchNo
				,isnull(CastingWeight,0)
				,isnull(CastingReturnWeight,0)
				,isnull(MetalType,'''')	
				,isnull(A.metal_type_name,'''')
		'

		print (@SQL)
		exec (@SQL)
		



		set @SQL='
				insert into #DepartmentWiseLossSummary_Detail1
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
				select 
					41 as DepartmentID
					,''Sprue Cutting'' as DepartmentCode					
					,max(isnull(Mastermanagement_MFG_JobLastLocationname,'''')) as MFG_Locationname		
					,CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
						 replace(isnull([MetalType],''''),''gold '','''')
						,(isnull(CastingReturnWeight,0)
							-(iif(isnull(IsBatchWiseSprueCutting,0)=0,SUM(isnull(sprueweight,0))+isnull(AccountTerminate_SprueCuttingWt,0),isnull(sprueweight_batchwise,0))
							+iif(isnull(IsBatchWiseSprueCutting,0)=0,(isnull(extratreeweight,0)),isnull(isnull(extratreeweight_batchwise,0),0)))	 				
							)
						,isnull(metal_type_name,''''),''pure''))) as TotalWtLosspure
						
					,CONVERT(decimal(38,3),(isnull(CastingReturnWeight,0)
						-(iif(isnull(IsBatchWiseSprueCutting,0)=0,SUM(isnull(sprueweight,0))+isnull(AccountTerminate_SprueCuttingWt,0),isnull(sprueweight_batchwise,0))
						+iif(isnull(IsBatchWiseSprueCutting,0)=0,(isnull(extratreeweight,0)),isnull(isnull(extratreeweight_batchwise,0),0)))	 				
					 ))	
					 
				from 
				(
					select 
						Mastermanagement_MFG_JobLastLocationname
						,CastingReturnWeight
						,IsBatchWiseSprueCutting
						,sprueweight
						,sprueweight_batchwise 
						,extratreeweight
						,extratreeweight_batchwise
						,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt
						,metal_type_name
						--,convert(char(20),SprueCutting_returnClosedate,106) as SprueCutting_returnClosedate
					from ['+@DBNAME+'].[dbo].[CastingManagement_CastingBatch]  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueCutting_returnClosedate')+' AND ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0
					'

		set @SQL1='
					union all
					select 
						 Mastermanagement_MFG_JobLastLocationname
						,CastingReturnWeight
						,IsBatchWiseSprueCutting
						,sprueweight
						,sprueweight_batchwise 
						,extratreeweight,extratreeweight_batchwise,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt
						,metal_type_name						
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueCutting_returnClosedate')+' AND ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0
					union all
					select 
						 Mastermanagement_MFG_JobLastLocationname
						,CastingReturnWeight
						,IsBatchWiseSprueCutting
						,sprueweight
						,sprueweight_batchwise 
						,extratreeweight,extratreeweight_batchwise,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt
						,metal_type_name						
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueCutting_returnClosedate')+' AND ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0

				) as A							
				group by CastUniqueno
					,CastBatchNo
					,isnull(CastingReturnWeight,0)
					,isnull(extratreeweight,0)
					,isnull(IsBatchWiseSprueCutting,0)
					,isnull(sprueweight_batchwise,0)
					,isnull(AccountTerminate_SprueCuttingWt,0)
					,isnull(extratreeweight_batchwise,0)
					,isnull(MetalType,'''')	
					,isnull(metal_type_name,'''')
					
				'	

		print (@SQL)
		print (@SQL1)
		exec (@SQL+@SQL1)
	
		

		set @SQL='
				insert into #DepartmentWiseLossSummary_Detail1
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
				select 
					34 as DepartmentID
					,''Sprue Grinding'' as DepartmentCode					
					,max(isnull(Mastermanagement_MFG_JobLastLocationname,'''')) as MFG_Locationname					
					,CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
						replace(isnull([MetalType],''''),''gold '','''')
						,isnull(sprueweight_batchwise,0)-(SUM(isnull(SprueGrinding_Weight,0))+isnull(AccountTerminate_SprueGrindingWt,0)+isnull(SprueGrinding_treewt,0))
						,isnull(metal_type_name,'''')
						,''pure''))) as TotalWtLosspure															
					,CONVERT(decimal(38,3),isnull(sprueweight_batchwise,0)-(SUM(isnull(SprueGrinding_Weight,0))+isnull(AccountTerminate_SprueGrindingWt,0)+isnull(SprueGrinding_treewt,0)))
				from
				(
					select 
						Mastermanagement_MFG_JobLastLocationname,sprueweight_batchwise,SprueGrinding_Weight 
						,SprueGrinding_treewt,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt
						,metal_type_name
					from ['+@DBNAME+'].[dbo].[CastingManagement_CastingBatch]  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueGrinding_ReceiveCloseDate')+' 
					AND ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 
							or isnull(IsSprueCutting_ReturnClosed,0)=1
						)
					union all
					select Mastermanagement_MFG_JobLastLocationname,sprueweight_batchwise,SprueGrinding_Weight 
						,SprueGrinding_treewt,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt
						,metal_type_name
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueGrinding_ReceiveCloseDate')+' 
					AND ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 
							or isnull(IsSprueCutting_ReturnClosed,0)=1
						)
				'
		set @SQL1='
					union all
					select Mastermanagement_MFG_JobLastLocationname,sprueweight_batchwise,SprueGrinding_Weight 
						,SprueGrinding_treewt,MetalType
						,CastUniqueno,CastBatchNo
						,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt
						,metal_type_name
					from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 
					'+replace(@WhereClause_casting,'CastingIssDate','SprueGrinding_ReceiveCloseDate')+' 
					AND ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 
							or isnull(IsSprueCutting_ReturnClosed,0)=1
						)
				) as A								
				group by CastUniqueno
					,CastBatchNo
					,isnull(sprueweight_batchwise,0)
					,isnull(SprueGrinding_treewt,0)
					,isnull(AccountTerminate_SprueGrindingWt,0)
					,isnull(MetalType,'''')
					,isnull(metal_type_name,'''')
				having SUM(isnull(sprueweight_batchwise,0))>0								
			'

		print (@SQL)
		print (@SQL1)
		exec (@SQL+@SQL1)
	
		

		set @SQL='
			declare @defaultlocation as nvarchar(max)=isnull((
					select top 1 manufacturelocationname 
					from ['+@DBNAME+'].[dbo].MasterManagement_manufacturelocation with (nolock)
					where isnull(IsDefault,0)=1
			  ),'''')

			insert into #DepartmentWiseLossSummary_Detail1
			(   DepartmentID
				,DepartmentCode
				,MFG_Locationname
				,TotalWtLosspure
				,TotalWtLoss
			)
			select
				-11
				,''Conversion''
				,@defaultlocation
				,['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							SUBSTRING(iif(isnull(isnew_entry,0)=1,destinationmetal,sourcemetal),0,CHARINDEX('','',iif(isnull(isnew_entry,0)=1,destinationmetal,sourcemetal),0))
							,isnull([conversionloss],0)
							,isnull(metaltype,'''')
							,''pure''
						) as netloss				
				 ,isnull([conversionloss],0)
			from ['+@DBNAME+'].[dbo].[InventoryManagement_Conversion_Log] with (nolock)			
			'+ @WhereClause_conversion +'
			and isnull(isdelete,0)=0
		'

		print (@SQL)		
		exec (@SQL)


		set @SQL='
			declare @_defaultlocation as nvarchar(max)=isnull((
					select top 1 manufacturelocationname 
					from ['+@DBNAME+'].[dbo].MasterManagement_manufacturelocation with (nolock)
					where isnull(IsDefault,0)=1
			  ),'''')

			insert into #DepartmentWiseLossSummary_Detail1
			(   DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss)
			select
				-12
				,''HMW''
				,@_defaultlocation
				,['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
							[metalpurity]
							,isnull([loss],0)
							,[metaltype]
							,''pure''
						) as netloss				
				 ,isnull([loss],0)
			from ['+@DBNAME+'].[dbo].[InventoryManagement_StockTransferLog] with (nolock)			
			'+ @WhereClause_returnfromemployee +'
			and isnull(EventName,'''')=''Return From Employee-Issue''
			
		'
		print (@SQL)		
		exec (@SQL)

		set @SQL='
			insert into #DepartmentWiseLossSummary1
			(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss,isrefine) 
			select 
				 DepartmentID
				,DepartmentCode
				,MFG_Locationname
				,sum(TotalWtLosspure)
				,sum(TotalWtLoss)
				,0
			from #DepartmentWiseLossSummary_Detail1
			group by DepartmentID,DepartmentCode,MFG_Locationname
			order by DepartmentID,DepartmentCode,MFG_Locationname

			if('''+@WhereClause_refine+'''<>'''' and '+convert(nvarchar(max),@isMonthwise)+'=1)
			BEGIN
				insert into #DepartmentWiseLossSummary1
				(DepartmentID,DepartmentCode,MFG_Locationname,TotalWtLosspure,TotalWtLoss,isrefine)
				Select 
					R.id				
					,isnull([A].[Mastermanagement_rolecode],'''') AS [Mastermanagement_rolecode]
					,''Refine'' as mfglocationname
					,sum(isnull([A].[receivedgm],0)) as TotalWtLosspure
					,sum(isnull([A].[receivedgm],0)) AS [TotalWtLoss]
					,1
				from ['+@DBNAME+'].[dbo].[InventoryManagement_metalrefinery] AS [A] with (nolock)	
				inner join ['+@DBNAME+'].[dbo].Mastermanagement_role as R with (nolock)
					on isnull(A.[Mastermanagement_rolecode],'''')=isnull(R.code,'''')
				left outer join (select entrydate,[metalrefineryid] 
								from ['+@DBNAME+'].[dbo].InventoryManagement_invoice_AddedWeightLog with (nolock)
								where [Description]=''metalrefinary''
								and isnull(IsGetBack,0)=0) as B
				on A.id=B.[metalrefineryid]
				'+@WhereClause_refine+'  
				and isnull(a.MeltRefiningId,0)=0
				and isnull([A].[Mastermanagement_rolecode],''All'')<>''MIX''
				group by isnull([A].[Mastermanagement_rolecode],'''')
					,R.id
			END
			'
		print (@SQL)		
		exec (@SQL)

		select 
			sum(TotalWtLosspure) as rm_grossloss
		from #DepartmentWiseLossSummary1
		where isnull(TotalWtLosspure,0)<>0	


	IF EXISTS(
		SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
		WHERE TABLE_NAME = '#DepartmentWiseLossSummary_Detail1')
	BEGIN
		DROP TABLE #DepartmentWiseLossSummary_Detail1
	END

	IF EXISTS(
		SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
		WHERE TABLE_NAME = '#DepartmentWiseLossSummary1')
	BEGIN
		DROP TABLE #DepartmentWiseLossSummary1
	END


	--print concat('-------------------------------------------@rm_grossloss :',@rm_grossloss)

	--SET @SQL='

	--		select TOP(1)
	--			isnull(Loss_actual,0) as rm_grossloss
	--		from ['+@DBNAME+'].[dbo].[ERPManage_AllMetalOpeningStock] WITH (NOLOCK)
	--		where metalName=''GOLD''
	--		and Fromdate between '''+convert(nvarchar(max),dateadd(day,-1,cast(@tdate as date)))+' 00:00:00''  And '''+convert(nvarchar(max),dateadd(day,-1,cast(@tdate as date)))+' 23:59:59'' 
			
	--'
	--PRINT (@SQL)
	--EXEC (@SQL)



END
ELSE IF(isnull(@mode,'')='kpidashboard_baggingcompleted')
BEGIN
	SET @SQL='
		select
			 isnull(convert(bigint,sum(convert(bigint,isnull(processtime_in_sec,0))))/count(serialjobno),0) as rm_avg_proc_time
			,isnull(sum(isnull(A.total_complete_count,0)),0) as rm_baggingcompleted
		from (
		select
			serialjobno
				,min(EngageStartDate) as EngageStartDate
				,max(EngageCompleteDate) as EngageCompleteDate
				,datediff(second,min(EngageStartDate),max(EngageCompleteDate)) as processtime_in_sec
				,sum(iif(EngageCompleteDate IS NOT NULL,1,0)) total_complete_count
			from ['+@DBNAME+'].[dbo].[kpireport] WITH (NOLOCK)
			where (EngageStartDate between '''+@fdate+' 00:00:00'' And '''+@tdate+' 23:59:59'' 				
			or EngageCompleteDate between '''+@fdate+' 00:00:00'' And '''+@tdate+' 23:59:59'' 				
			)
			group by serialjobno
		) as A
	'
	print (@SQL)
	exec (@SQL)
END

ELSE IF(isnull(@mode,'')='kpidashboard_rmstock')
BEGIN
	set @SQL='EXEC ['+@DBNAME+'].[dbo].[kpidashboard_schedular]'
	exec (@SQL)

	if(cast(@tdate as date)=cast(isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate()) as date))
	BEGIN

		SET @SQL='

			DECLARE @final_Remainingweight AS DECIMAL(38,3)=ISNULL((
				select 
					isnull(final_Remainingweight,0)
				from ['+@DBNAME+'].[dbo].[ERPManage_AllMetalOpeningStock]
				where metalName=''GOLD''
				and Fromdate between '''+convert(nvarchar(max),dateadd(day,-1,cast(@tdate as date)))+' 00:00:00''  And '''+convert(nvarchar(max),dateadd(day,-1,cast(@tdate as date)))+' 23:59:59'' 
			),0)

			DECLARE @AVG_GOLD_RATE AS DECIMAL(38,3)=ISNULL((
				SELECT 
				   sum(ISNULL([goldrate],0))/count(entrydate)
			  FROM ['+@DBNAME+'].[dbo].[kpidashboard_rmstock] WITH (NOLOCK)
			  WHERE entrydate between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 
			),0)


			SELECT 
				   ISNULL([rm_diastock_amt],0) as [rm_diastock_amt]
				  ,ISNULL([rm_csstock_amt],0) as [rm_csstock_amt]
				  ,ISNULL([rm_miscstock_amt],0) as [rm_miscstock_amt]
				  ,CONVERT(DECIMAL(38,3),ISNULL(@final_Remainingweight,0)*ISNULL(@AVG_GOLD_RATE,0)) as [rm_goldstock_amt]
				  ,CONVERT(DECIMAL(38,3),ISNULL(@final_Remainingweight,0)) as [rm_goldstock_wt]
				  ,ISNULL([rm_diastock_wt],0) as [rm_diastock_wt]
				  ,ISNULL([rm_csstock_wt],0) as [rm_csstock_wt]
				  ,ISNULL([rm_miscstock_wt],0) as [rm_miscstock_wt]
				  ,CONVERT(DECIMAL(38,3),ISNULL(@AVG_GOLD_RATE,0)) as [goldrate]
			  FROM ['+@DBNAME+'].[dbo].[kpidashboard_rmstock] WITH (NOLOCK)
			  WHERE entrydate between '''+@tdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 
		'
	END
	ELSE
	BEGIN
		SET @SQL='

			DECLARE @final_Remainingweight AS DECIMAL(38,3)=ISNULL((
				select 
					isnull(final_Remainingweight,0)
				from ['+@DBNAME+'].[dbo].[ERPManage_AllMetalOpeningStock]
				where metalName=''GOLD''
				and Fromdate between '''+@tdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 
			),0)

			DECLARE @AVG_GOLD_RATE AS DECIMAL(38,3)=ISNULL((
				SELECT 
				   sum(ISNULL([goldrate],0))/count(entrydate)
			  FROM ['+@DBNAME+'].[dbo].[kpidashboard_rmstock] WITH (NOLOCK)
			  WHERE entrydate between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 
			),0)


			SELECT 
				   ISNULL([rm_diastock_amt],0) as [rm_diastock_amt]
				  ,ISNULL([rm_csstock_amt],0) as [rm_csstock_amt]
				  ,ISNULL([rm_miscstock_amt],0) as [rm_miscstock_amt]
				  ,CONVERT(DECIMAL(38,3),ISNULL(@final_Remainingweight,0)*ISNULL(@AVG_GOLD_RATE,0)) as [rm_goldstock_amt]
				  ,CONVERT(DECIMAL(38,3),ISNULL(@final_Remainingweight,0)) as [rm_goldstock_wt]
				  ,ISNULL([rm_diastock_wt],0) as [rm_diastock_wt]
				  ,ISNULL([rm_csstock_wt],0) as [rm_csstock_wt]
				  ,ISNULL([rm_miscstock_wt],0) as [rm_miscstock_wt]
				  ,CONVERT(DECIMAL(38,3),ISNULL(@AVG_GOLD_RATE,0)) as [goldrate]
			  FROM ['+@DBNAME+'].[dbo].[kpidashboard_rmstock] WITH (NOLOCK)
			  WHERE entrydate between '''+@tdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 
		'
	END

	PRINT (@SQL)
	EXEC (@SQL)


	--set @SQL='
	--	declare 
	--		@def_customercode as nvarchar(200)=''''
	--		,@goldrate as decimal(38,3)=0

	--	select top(1)
	--		@def_customercode=isnull(customercode,'''') 
	--	from ['+@DBNAME+'].dbo.[usermanagement_systemloginmaster] with (nolock)
	--	where isnull(isDefaultCustomer,0)=1

	--	select 
	--		@goldrate=isnull(Price,0)
	--	from ['+@DBNAME+'].dbo.[Mastermanagement_metaltype] with (nolock)
	--	where metaltypename=''gold''
	--	and metalpurity=''24K''

	--	SELECT
	--		 CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=3 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(unitprice,0)*isnull(TotalRemainingWeight,0.000)),0)))	as rm_diastock_amt
	--		,CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=4 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(unitprice,0)*isnull(TotalRemainingWeight,0.000)),0))) as rm_csstock_amt		
	--		,CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=7 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(unitprice,0)*isnull(TotalRemainingWeight,0.000)),0))) as rm_miscstock_amt		
	--		,CONVERT(decimal(18, 3),sum(iif((isnull(itemname,'''')=''metal'' and ISNULL(shape, '''')=''gold'' and ISNULL(master_item_id,0)=1),isnull(TotalRemainingWeight_Pure,0.000),0))*isnull(@goldrate,0)) as rm_goldstock_amt
	--		,CONVERT(decimal(18, 3),sum(iif((isnull(itemname,'''')=''metal'' and ISNULL(shape, '''')=''gold'' and ISNULL(master_item_id,0)=1),isnull(TotalRemainingWeight_Pure,0.000),0))) as rm_goldstock_wt
	--		,CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=3 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(TotalRemainingWeight,0.000)),0))) as rm_diastock_wt					
	--		,CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=4 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(TotalRemainingWeight,0.000)),0))) as rm_csstock_wt		
	--		,CONVERT(decimal(18, 2),SUM(iif((ISNULL(master_item_id,0)=7 and isnull(istoreCust_Customercode,'''')=@def_customercode),(isnull(TotalRemainingWeight,0.000)),0))) as rm_miscstock_wt	
	--		,@goldrate as goldrate
	--	FROM ['+@DBNAME+'].dbo.[InventoryManagement_invoice] with (nolock)	
	--	WHERE entrydate between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 
	--		and isnull(isdelete,0)=0
	--		and isnull(TotalRemainingWeight,0.000)>0
	--'
	--PRINT (@SQL)
	--EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='kpidashboard_qcinward')
BEGIN

	set @SQL='
		select 
			sum(a.jobcount) as qc_avg_inward
		from
		( 
			select 				
				1 as jobcount	
			from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook_Delete as PS with (NoLock)	
			where 
			ExportBatchDate between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''
			and (convert(date,movetoFGDetailDate)<=convert(date,isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())) 
			or movetoFGDetailDate IS NULL)
		) as a	

	'

	--set @SQL='
	--	select 
	--		isnull(sum(isnull(SU.jobcount,0)),0) as qc_avg_inward
	--	from (
	--		select 
	--			convert(nvarchar(20),ExportBatchDate,106) as ExportBatchDate			
	--			,ExportBatchNo
	--			,ExportOutwardBatch
	--			,count(ExportBatchDate) as jobcount
			
	--		from
	--		( 

	--			select 				
	--				 exportbatchdate as ExportBatchDate
	--				,PS.ExportBatchNo
	--				,ExportOutwardBatch	
	--			from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook as PS with (NoLock)									
	--			where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''						
	--			and isnull(PS.ExportOutwardBatch,'''')<>''''
	--			union all
	--			select 				
	--				exportbatchdate as ExportBatchDate
	--				,PS.ExportBatchNo
	--				,isnull(ExportOutwardBatch,'''') as ExportOutwardBatch
	--			from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook_Delete as PS with (NoLock)										
	--			where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''  						
	--			and isnull(PS.ExportOutwardBatch,'''')<>''''				
	--			and isnull(PS.Islastversion,0)=1
	--			and isnull(PS.IsBackStocktoMFG,0)=0

	--		) as a
	--		group by convert(nvarchar(20),ExportBatchDate,106)			
	--			,ExportBatchNo
	--			,ExportOutwardBatch
	--	) as SU

	--'



	PRINT(@SQL)
	EXEC (@SQL)
END
ELSE IF(isnull(@mode,'')='kpidashboard_mfg')
BEGIN
set @SQL='
			Declare @production_Detail table
			(
				 mfg_production_gms decimal(38,3)
				,mfg_jobs int
				,mfg_grossloss decimal(38,3)
				,Locationid int
				,manufacturelocationname nvarchar(max)
				,mfg_rejection decimal(38,3)
			)
			insert into @production_Detail
			(mfg_production_gms,mfg_jobs,mfg_grossloss
			,Locationid,manufacturelocationname,mfg_rejection)
			select 
				isnull(sum(isnull(NetWt,0)),0) as mfg_production_gms
				,count(convert(nvarchar(20),ExportBatchDate,106)) as mfg_jobs			
				,iif(isnull(sum(isnull(NetWt,0)),0)=0,0,convert(decimal(38,2),iif(isnull(sum(isnull(NetWt,0)),0)=0,0,isnull(sum(isnull(GrossLoss,0)),0)/isnull(sum(isnull(NetWt,0)),0)*100.00))) as mfg_grossloss
				,isnull(Locationid,0) as Locationid
				,L.manufacturelocationname
				,0 as mfg_rejection
			from
			( 

				select 		
					 isnull(lastMount_returnwt,0) as GrossWt
					,isnull(netwt,0) as NetWt				
					,exportbatchdate as ExportBatchDate
					,isnull(NetWt_Pure,0) as NetWt_24K																						
					,isnull(TotalDepartment_LossWeight,0) as GrossLoss
					,(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](isnull(metal_purity_name,''''),isnull([TotalDepartment_LossWeight],0),isnull(metal_type_name,''''),''pure'')))) as PureLoss				
					,isnull(PS.Mastermanagement_MFG_JobLastLocationid,0) as Locationid
				from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook as PS with (NoLock)	
				where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''  
				and isnull(PS.ExportOutwardBatch,'''')<>''''							

				union all	

				select 	
					isnull(lastMount_returnwt,0) as GrossWt
					,isnull(netwt,0) as NetWt				
					,exportbatchdate as ExportBatchDate
					,isnull(NetWt_Pure,0) as NetWt_24K								
					,isnull(TotalDepartment_LossWeight,0) as GrossLoss
					,(CONVERT(decimal(38,3),(['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](isnull(metal_purity_name,''''),isnull([TotalDepartment_LossWeight],0),isnull(metal_type_name,''''),''pure'')))) as PureLoss				
					,isnull(PS.Mastermanagement_MFG_JobLastLocationid,0) as Locationid
				from ['+@DBNAME+'].dbo.ProductionManagement_SerialNoBook_Delete as PS with (NoLock)										
				where PS.ExportBatchDate Between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59'' 		
				and isnull(PS.ExportOutwardBatch,'''')<>''''				
				and isnull(PS.Islastversion,0)=1
				and isnull(PS.IsBackStocktoMFG,0)=0
			) as a
			left outer join (
				select id,manufacturelocationname 
				from ['+@DBNAME+'].dbo.[MasterManagement_manufacturelocation] with (nolock)
			) as L
			ON A.Locationid=L.id
			group by Locationid,L.manufacturelocationname
			'
		set @SQL1='
			insert into @production_Detail
			(mfg_production_gms,mfg_jobs,mfg_grossloss
			,Locationid,manufacturelocationname,mfg_rejection)
			select 	
				 0 as mfg_production_gms
				,0 as mfg_jobs			
				,0 as mfg_grossloss
				,isnull(G.locationid,0) as locationid
				,isnull(G.manufacturelocationname,'''') as manufacturelocationname
				,convert(decimal(38,2),(convert(decimal(38,2),SUM(G.reject))/convert(decimal(38,2),(SUM(G.reject)+SUM(G.approve))))*100)
				as mfg_rejection
			FROM (
					SELECT 
						Q.serialjobno
						,SUM(iif(Q.statusid in (2,4),1,0)) AS reject
						,SUM(iif(Q.statusid in (1,3),1,0)) AS approve
						,isnull(M.manufacturelocationname,''-'') as manufacturelocationname
						,isnull(Q.locationid,0) as locationid
					FROM ['+@DBNAME+'].dbo.[qc_ans]  as Q with (nolock)
					left outer join(
						select id
							,manufacturelocationname 
						from ['+@DBNAME+'].dbo.[MasterManagement_manufacturelocation] with (nolock)
					) as M
					ON isnull(Q.locationid,0)=isnull(M.id,0)
					WHERE Q.entrydate between '''+@fdate+' 00:00:00''  And '''+@tdate+' 23:59:59''
					GROUP BY Q.serialjobno,Q.locationid,isnull(M.manufacturelocationname,''-'')
			) AS G
			group by isnull(G.locationid,0),isnull(G.manufacturelocationname,'''')

			select 
				 sum(mfg_production_gms) as mfg_production_gms
				,sum(mfg_jobs) as mfg_jobs
				,sum(mfg_grossloss) as mfg_grossloss
				,isnull(Locationid,0) as Locationid
				,isnull(manufacturelocationname,'''') as manufacturelocationname
				,sum(mfg_rejection) as mfg_rejection 
			from @production_Detail
			group by isnull(Locationid,0)
			,isnull(manufacturelocationname,'''')
					
		'
	PRINT(@SQL)
	PRINT(@SQL1)
	exec(@SQL+@SQL1)
END
ELSE IF(isnull(@mode,'')='wipmaster')
BEGIN
	SET @SQL='
		select id,[jadauname] 
		from ['+@DBNAME+'].dbo.[jadaumaster] with (nolock)

		select id,productionstatusname,DisplayOrder
		from ['+@DBNAME+'].dbo.[MasterManagement_productionstatus] with (nolock)
		where isnull(isdelete,0)=0

		select id,manufacturelocationname 
		from ['+@DBNAME+'].dbo.MasterManagement_manufacturelocation with (nolock)
		where isnull(Isdelete,0)=0

		select id,[name],colorcode,fontcolorcode
		from ['+@DBNAME+'].dbo.MasterManagement_Priority with (nolock)
		where isnull([name],'''')<>''''
		and isnull(IsDelete,0)=0
		order by DisplayOrder

		Select 
			 id
			,OrderType 
		from ['+@DBNAME+'].dbo.[Mastermanagement_OrderType] with (nolock)
		where isnull(isdelete,0)=0

		
		select ''regularjobs'' as jobtypeid,''Regular Job'' as jobtypename
		union all
		select ''samplelinejobs'' as jobtypeid,''Sample line Jobs'' as jobtypename
		union all
		select ''repairjobs'' as jobtypeid,''Repair Jobs'' as jobtypename
		


	'

	SET @SQL1='
		select 
			 A.Mastermanagement_roleid as id
			,A.[Name]
			,A.productionstatusids
			,isnull(A.DisplayOrder,0) as DisplayOrder
		from (
				select
				A.Mastermanagement_roleid 
				,B.[Name]
				,A.productionstatusids
				,isnull(B.DisplayOrder,0) as DisplayOrder
				from (
					select 
						 Mastermanagement_roleid
						,STRING_AGG(id,'','') as productionstatusids
					from ['+@DBNAME+'].dbo.MasterManagement_productionstatus with (nolock)
					where id not in (28)
					group by Mastermanagement_roleid
				) as A
				left outer join (
					select id,[Name],DisplayOrder from ['+@DBNAME+'].[dbo].[Mastermanagement_role] with (nolock)
					where isnull(IsDelete,0)=0 
					and isnull(isVisiable,0)=1
				) as B
				on A.Mastermanagement_roleid=B.id
				where ISNULL(A.Mastermanagement_roleid,'''')<>''''		 
				union all
				select IIF(id=1
						,-1003
						,iif(id=28
							,-1002
							,iif(id=33,-1001
							,iif(id=40,-1000,iif(id=41,-999,-998))
							))) as Mastermanagement_roleid
					,productionstatusname as [name]
					,convert(nvarchar(10),id) as productionstatusids
					,IIF(id=1
						,-1003
						,iif(id=28
							,-1002
							,iif(id=33,-1001
							,iif(id=40,-1000,iif(id=41,-999,-998))
							))) as DisplayOrder
				from ['+@DBNAME+'].dbo.MasterManagement_productionstatus with (nolock)
				where id in (28,33,34,1,40,41)
				and id not in (28)
		) as A
		where isnull(A.[Name],'''')<>''''
		order by isnull(A.DisplayOrder,0)
	'

	set @SQL2='	
		Select  
			[US].id
			,[US].customercode		
		from
		(
			select id,customercode,firmname,usermanagement_salesrepid
			from ['+@DBNAME+'].dbo.[usermanagement_systemloginmaster] AS [US] with (nolock) 
			where  isnull([US].IsDelete,0)<>1  
				and isnull([US].firstname,'''')<>'''' 
				and isnull([US].email1,'''')<>'''' 
				and isnull([US].IsActive,0)<>0
				and isnull([US].Mastermanagement_roleid,0)=3
		) as [US]
		inner join ( 
				select usermanagement_salesrepid 
				from ['+@DBNAME+'].dbo.[usermanagement_systemloginmaster] with (nolock) 
				where isnull(Mastermanagement_roleid,0) in (4,13,40)
			) AS [cust]
		on [US].id=[cust].usermanagement_salesrepid  		
		group by [US].id,[US].customercode		
		order by [US].customercode asc

		select id,jadauname from ['+@DBNAME+'].dbo.jadaumaster with (nolock)
	'


	print(@SQL)
	print(@SQL1)
	print(@SQL2)
	exec(@SQL+@SQL1+@SQL2)
END
ELSE IF(isnull(@mode,'')='wipreport')
BEGIN
	set @SQL='
	select
		 ''id'' as [1]
		,''jobpromisedate'' as [2]
		,''planningdate'' as [3]
		,''expstartdate'' as [4]
		,''jobentrydate'' as [5]
		,''deliveryBatchDate'' as [6]
		,''jadauid'' as [7]
		,''issue_age1'' as [8]
		,''Isprocurementreport'' as [9]
		,''ismovetowip'' as [10]
		,''SKUNO'' as [11]	
		,''isMetalEngagecompleted'' as [12]
		,''isFindingEngagecompleted'' as [13]
		,''isDiaEngagecompleted'' as [14]
		,''isCsEngagecompleted'' as [15]
		,''isMiscEngagecompleted'' as [16]
		,''Quantity'' as [17]
		,''jobpriority'' as [18]
		,''IsQuickRepairing'' as [19]
		,''ismfgjob'' as [20]
		,''Srorderno'' as [21]
		,''Srversionname'' as [22]
		,''SerialNo'' as [23]
		,''Designcode'' as [24]
		,''Customercode'' as [25]
		,''MetalType'' as [26]
		,''MetalColor'' as [27]
		,''productionstatusid'' as [28]
		,''isEngage'' as [29]
		,''isWaxEngage'' as [30]
		,''engage_productionstatusname'' as [31]
		,''LastProcessedBy_Name'' as [32]
		,''Locationid'' as [33]
		,''size'' as [34]
		,''GrossWeightgm'' as [35]		
		,''NetWtgm'' as [36]
		,''PureWt''	as [37]	
		,''totalDiamond_actualusedpcs'' as [38]
		,''Diamond_actualusedpcs'' as [39]
		,''totalDiamond_actualused'' as [40]
		,''Diamond_actualused'' as [41]
		,''totalColorStone_actualusedpcs'' as [42]
		,''ColorStone_actualusedpcs'' as [43]
		,''totalColorStone_actualused'' as [44]
		,''ColorStone_actualused'' as [45]	
		,''totalmisc_actualusedpcs'' as [46]
		,''misc_actualusedpcs'' as [47]
		,''totalmisc_actualused'' as [48]
		,''misc_actualused'' as [49]
		,''plasticwt'' as [50]
		,''EngagedFinding'' as [51]
		,''EngagedFinding_pure'' as [52]
		,''MetalAmount'' as [53]
		,''MountAmount'' as [54]
		,''DiamondAmount'' as [55]
		,''ColorStoneAmount'' as [56]
		,''FindingAmount'' as [57]
		,''AlloyAmount'' as [58]
		,''miscAmount'' as [59]
		,''labourAmount'' as [60]
		,''JobCost'' as [61]
		,''ordertypeid'' as [62]
	'
	SET @SQL1='
	declare @Isprocurementreport as int=isnull((
		select isnull([value],0) 
		from ['+@DBNAME+'].dbo.[webconfig] with (nolock) 
		where [key]=''Isprocurementreport''
	),0)

	;WITH dvtbl AS (
		 SELECT
			 isnull([id],0) as [1]
			,jobpromisedate as [2]
			,planningdate as [3]
			,expstartdate as [4]
			,jobentrydate as [5]
			,deliveryBatchDate as [6]
			,jadauid as [7]
			,(case 
				when (isnull(MasterManagement_productionstatusid,0)=1 
					and isnull(isengage,0)=0 
					and isnull(iswaxengage,0)=0 
				)
				then isnull(datediff(hour,[entrydate],isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())),'''') 
				else isnull(datediff(hour,[issuedate],isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())),'''') 
			  end) as [8]
			 ,@Isprocurementreport as [9]
			 ,isnull(ismovetowip,0) as [10]
			 ,isnull(iStore_JobSKUNO,'''') as [11]
			 ,isnull(isMetalEngagecompleted,0) as [12]
			 ,isnull(isFindingEngagecompleted,0) as [13]
			 ,isnull(isDiaEngagecompleted,0) as [14]
			 ,isnull(isCsEngagecompleted,0) as [15]
			 ,isnull(isMiscEngagecompleted,0) as [16]
			 ,isnull(IsSplits_Quotation_Quantity,0) as [17]
			 ,isnull(jobpriority,0) as [18]
			 ,isnull(IsQuickRepairing,0) as [19]
			 ,isnull(ismfgjob,0) as [20]
			 ,[Srorderno] as [21]
			 ,[Srversionname] as [22]
			 ,SerialNo as [23]
			 ,Designcode as [24]
			 ,isnull([Customercode],'''') as [25]
			 ,MetalType as [26]
			 ,MetalColor as [27]
			 ,isnull([MasterManagement_productionstatusid],0) as [28]
			 ,isnull([isEngage],0) as [29]
			 ,isnull([isWaxEngage],0) as [30]
			 ,isnull(engage_productionstatusname,'''') as [31]
			 ,isnull(LastProcessedBy_Name,'''') as [32]
			 ,isnull(Mastermanagement_MFG_JobLastLocationid,0) as [33]
			 ,(case 
					when mastermanagement_categoryid = 1 then Ring_FingerSize
					when mastermanagement_categoryid = 2 then PendentBailType
					when mastermanagement_categoryid = 3 then BraceletLength
					when mastermanagement_categoryid = 4 then BangelInsideDiameter
					when mastermanagement_categoryid = 5 then EaringLength
					when mastermanagement_categoryid = 6 then NecklaceLength
					when mastermanagement_categoryid = 7 then MiscellaneousFingersize
					else othersize
				end) as [34]
			'
	set @SQL2='
			,convert(decimal(38,3),isnull(lastMount_returnwt,0)) as [35]	
			,isnull(netwt,0) as [36]
			,convert(decimal(38,3),isnull(NetWt_Pure,0)) as [37]	
			,isnull(Diamond_actualusedpcs,0)+isnull(QuickRepairing_DiamondPcs,0) as [38]
			,isnull(Diamond_actualusedpcs,0) as [39]
			,isnull(Diamond_actualused,0)+isnull(QuickRepairing_Diamondwt,0) as [40]
			,isnull(Diamond_actualused,0) as [41]
			,isnull(ColorStone_actualusedpcs,0)+isnull(QuickRepairing_CsPcs,0) as [42]
			,isnull(ColorStone_actualusedpcs,0) as [43]
			,isnull(ColorStone_actualused,0)+isnull(QuickRepairing_Cswt,0) as [44]
			,isnull(ColorStone_actualused,0) as [45]
			,isnull(misc_actualusedpcs,0)+isnull(QuickRepairing_miscPcs,0) as [46]
			,isnull(misc_actualusedpcs,0) as [47]
			,isnull(misc_actualused,0)+isnull(QuickRepairing_miscwt,0) as [48]
			,isnull(misc_actualused,0) as [49]
			,isnull(plasticwt,0) as [50]
			,convert(decimal(38,3),isnull(EngagedFinding,0)) as [51]
			,convert(decimal(38,3),['+@DBNAME+'].dbo.[fn_get_source_remaning_metalctw](
				replace([MetalType],''Gold '','''')
				,isnull(EngagedFinding,0)
				,isnull(metal_type_name,'''')
				,''pure'')) as [52]
			,convert(decimal(38,2),isnull(MetalAmount,0)) as [53]
			,convert(decimal(38,2),isnull(MountAmount,0)) as [54]
			,convert(decimal(38,2),isnull(DiamondAmount,0)) as [55]
			,convert(decimal(38,2),isnull(ColorStoneAmount,0)) as [56]
			,convert(decimal(38,2),isnull(FindingAmount,0)) as [57]
			,convert(decimal(38,2),isnull(AlloyAmount,0)) as [58]
			,convert(decimal(38,2),isnull(miscAmount,0)) as [59]
			,convert(decimal(38,2),0) as [60]
			,convert(decimal(38,2),isnull(JobCost,0)) as [61]
			,OrderTypeId as [62]
			'
	set @SQL3='
		FROM ['+@DBNAME+'].dbo.[ProductionManagement_SerialNoBook] with (nolock)	
		where (isnull(IsQuickRepairing,0)=1 or isnull(ismovetowip,0)=1) 				
			and isnull(MasterManagement_productionstatusid,0)>0
			and isnull(MasterManagement_productionstatusid,0) not in (28)							
			and isnull(iStore_IsJobClosed,0)=0
			and isnull(ismerged,0)=0
			and isnull(isAllSplitedJobsNotMerged,0)<>1
			and isnull(IsSplitProcess_NotCompleted,0)=0
			and isnull(isETARejected,0)=0
			)

		SELECT 
			total.icount AS icount
			,dvtbl.*
			,iif([8]>24,concat(''D '',[8]/24),concat(''H '',[8])) as issue_age			   
		FROM dvtbl 
		CROSS JOIN (SELECT Count([1]) AS icount FROM dvtbl) AS total 		
	'

	print(@SQL)
	print(@SQL1)
	print(@SQL2)
	print(@SQL3)


	exec(@SQL
	    +@SQL1
		+@SQL2
		+@SQL3		
		)
END
ELSE IF(isnull(@mode,'')='pipbook')
BEGIN	
	  set @SQL=''

	set @SQL='
	select
		 ''id'' as [1]
		,''jobpromisedate'' as [2]
		,''planningdate'' as [3]
		,''expstartdate'' as [4]
		,''jobentrydate'' as [5]
		,''deliveryBatchDate'' as [6]
		,''jadauid'' as [7]
		,''issue_age1'' as [8]
		,''Isprocurementreport'' as [9]
		,''ismovetowip'' as [10]
		,''SKUNO'' as [11]	
		,''isMetalEngagecompleted'' as [12]
		,''isFindingEngagecompleted'' as [13]
		,''isDiaEngagecompleted'' as [14]
		,''isCsEngagecompleted'' as [15]
		,''isMiscEngagecompleted'' as [16]
		,''Quantity'' as [17]
		,''jobpriority'' as [18]
		,''IsQuickRepairing'' as [19]
		,''ismfgjob'' as [20]
		,''Srorderno'' as [21]
		,''Srversionname'' as [22]
		,''SerialNo'' as [23]
		,''Designcode'' as [24]
		,''Customercode'' as [25]
		,''MetalType'' as [26]
		,''MetalColor'' as [27]
		,''productionstatusid'' as [28]
		,''isEngage'' as [29]
		,''isWaxEngage'' as [30]
		,''engage_productionstatusname'' as [31]
		,''LastProcessedBy_Name'' as [32]
		,''Locationid'' as [33]
		,''size'' as [34]
		,''GrossWeightgm'' as [35]		
		,''NetWtgm'' as [36]
		,''PureWt''	as [37]	
		,''totalDiamond_actualusedpcs'' as [38]
		,''Diamond_actualusedpcs'' as [39]
		,''totalDiamond_actualused'' as [40]
		,''Diamond_actualused'' as [41]
		,''totalColorStone_actualusedpcs'' as [42]
		,''ColorStone_actualusedpcs'' as [43]
		,''totalColorStone_actualused'' as [44]
		,''ColorStone_actualused'' as [45]	
		,''totalmisc_actualusedpcs'' as [46]
		,''misc_actualusedpcs'' as [47]
		,''totalmisc_actualused'' as [48]
		,''misc_actualused'' as [49]
		,''plasticwt'' as [50]
		,''EngagedFinding'' as [51]
		,''EngagedFinding_pure'' as [52]
		,''MetalAmount'' as [53]
		,''MountAmount'' as [54]
		,''DiamondAmount'' as [55]
		,''ColorStoneAmount'' as [56]
		,''FindingAmount'' as [57]
		,''AlloyAmount'' as [58]
		,''miscAmount'' as [59]
		,''labourAmount'' as [60]
		,''JobCost'' as [61]
		,''ordertypeid'' as [62]
		,''issamplelinejob'' as [63]
		,''salesrepid'' as [64]
		,''engage_lastproductionstatusid'' as [65]
	'
	SET @SQL1='
	declare @Isprocurementreport as int=isnull((
		select isnull([value],0) 
		from ['+@DBNAME+'].dbo.[webconfig] with (nolock) 
		where [key]=''Isprocurementreport''
	),0)

	;WITH dvtbl AS (
		 SELECT
			 isnull([id],0) as [1]
			,jobpromisedate as [2]
			,planningdate as [3]
			,expstartdate as [4]
			,jobentrydate as [5]
			,deliveryBatchDate as [6]
			,jadauid as [7]
			,(case 
				when (isnull(MasterManagement_productionstatusid,0)=1 
					and isnull(isengage,0)=0 
					and isnull(iswaxengage,0)=0 
				)
				then isnull(datediff(hour,[entrydate],isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())),'''') 
				else isnull(datediff(hour,[issuedate],isnull([dbo].[UTC_CSERVERLOCAL](getdate()),getdate())),'''') 
			  end) as [8]
			 ,@Isprocurementreport as [9]
			 ,isnull(ismovetowip,0) as [10]
			 ,isnull(iStore_JobSKUNO,'''') as [11]
			 ,isnull(isMetalEngagecompleted,0) as [12]
			 ,isnull(isFindingEngagecompleted,0) as [13]
			 ,isnull(isDiaEngagecompleted,0) as [14]
			 ,isnull(isCsEngagecompleted,0) as [15]
			 ,isnull(isMiscEngagecompleted,0) as [16]
			 ,isnull(IsSplits_Quotation_Quantity,0) as [17]
			 ,isnull(jobpriority,0) as [18]
			 ,isnull(IsQuickRepairing,0) as [19]
			 ,isnull(ismfgjob,0) as [20]
			 ,[Srorderno] as [21]
			 ,[Srversionname] as [22]
			 ,SerialNo as [23]
			 ,Designcode as [24]
			 ,isnull([Customercode],'''') as [25]
			 ,MetalType as [26]
			 ,MetalColor as [27]
			 ,isnull([MasterManagement_productionstatusid],0) as [28]
			 ,isnull([isEngage],0) as [29]
			 ,isnull([isWaxEngage],0) as [30]
			 ,isnull(engage_productionstatusname,'''') as [31]
			 ,isnull(LastProcessedBy_Name,'''') as [32]
			 ,isnull(Mastermanagement_MFG_JobLastLocationid,0) as [33]
			 ,(case 
					when mastermanagement_categoryid = 1 then Ring_FingerSize
					when mastermanagement_categoryid = 2 then PendentBailType
					when mastermanagement_categoryid = 3 then BraceletLength
					when mastermanagement_categoryid = 4 then BangelInsideDiameter
					when mastermanagement_categoryid = 5 then EaringLength
					when mastermanagement_categoryid = 6 then NecklaceLength
					when mastermanagement_categoryid = 7 then MiscellaneousFingersize
					else othersize
				end) as [34]
			'
	set @SQL2='
			,convert(decimal(38,3),isnull(lastMount_returnwt,0)) as [35]	
			,isnull(netwt,0) as [36]
			,convert(decimal(38,3),isnull(NetWt_Pure,0)) as [37]	
			,isnull(Diamond_actualusedpcs,0)+isnull(QuickRepairing_DiamondPcs,0) as [38]
			,isnull(Diamond_actualusedpcs,0) as [39]
			,isnull(Diamond_actualused,0)+isnull(QuickRepairing_Diamondwt,0) as [40]
			,isnull(Diamond_actualused,0) as [41]
			,isnull(ColorStone_actualusedpcs,0)+isnull(QuickRepairing_CsPcs,0) as [42]
			,isnull(ColorStone_actualusedpcs,0) as [43]
			,isnull(ColorStone_actualused,0)+isnull(QuickRepairing_Cswt,0) as [44]
			,isnull(ColorStone_actualused,0) as [45]
			,isnull(misc_actualusedpcs,0)+isnull(QuickRepairing_miscPcs,0) as [46]
			,isnull(misc_actualusedpcs,0) as [47]
			,isnull(misc_actualused,0)+isnull(QuickRepairing_miscwt,0) as [48]
			,isnull(misc_actualused,0) as [49]
			,isnull(plasticwt,0) as [50]
			,convert(decimal(38,3),isnull(EngagedFinding,0)) as [51]
			,convert(decimal(38,3),['+@DBNAME+'].dbo.[fn_get_source_remaning_metalctw](
				replace([MetalType],''Gold '','''')
				,isnull(EngagedFinding,0)
				,isnull(metal_type_name,'''')
				,''pure'')) as [52]
			,convert(decimal(38,2),isnull(MetalAmount,0)) as [53]
			,convert(decimal(38,2),isnull(MountAmount,0)) as [54]
			,convert(decimal(38,2),isnull(DiamondAmount,0)) as [55]
			,convert(decimal(38,2),isnull(ColorStoneAmount,0)) as [56]
			,convert(decimal(38,2),isnull(FindingAmount,0)) as [57]
			,convert(decimal(38,2),isnull(AlloyAmount,0)) as [58]
			,convert(decimal(38,2),isnull(miscAmount,0)) as [59]
			,convert(decimal(38,2),0) as [60]
			,convert(decimal(38,2),isnull(JobCost,0)) as [61]
			,OrderTypeId as [62]
			,issamplelinejob as [63]
			,customer_salesrep_id [64]
			,engage_lastproductionstatusid [65]
			'
	set @SQL3='
		FROM ['+@DBNAME+'].dbo.[ProductionManagement_SerialNoBook] with (nolock)	
		where isnull(IsQuickRepairing,0)=0			
			and (isnull(isMetalEngagecompleted,0)=0
				or isnull(isDiaEngagecompleted,0)=0
				or isnull(isCsEngagecompleted,0)=0
				or isnull(isMiscEngagecompleted,0)=0
				or isnull(isFindingEngagecompleted,0)=0
				or isnull(ismovetowip,0)=0)				
			and isnull(MasterManagement_productionstatusid,0)>0			
			and isnull(MasterManagement_productionstatusid,0) not in (28)							
			and isnull(iStore_IsJobClosed,0)=0
			and isnull(ismerged,0)=0
			and isnull(isAllSplitedJobsNotMerged,0)<>1
			and isnull(IsSplitProcess_NotCompleted,0)=0
			and isnull(isETARejected,0)=0
			--and isnull(Mastermanagement_MFG_JobLastLocationid,0) in (1,2,3,4)
			--and isnull(jobpromisedate,'''')<>'''' 
			)

		SELECT 
			total.icount AS icount
			,dvtbl.*
			,iif([8]>24,concat(''D '',[8]/24),concat(''H '',[8])) as issue_age			   
		FROM dvtbl 
		CROSS JOIN (SELECT Count([1]) AS icount FROM dvtbl) AS total 		
	'

	print(@SQL)
	print(@SQL1)
	print(@SQL2)
	print(@SQL3)


	exec(@SQL
	    +@SQL1
		+@SQL2
		+@SQL3		
		)
END
ELSE IF(isnull(@mode,'')='conversiondetail')
BEGIN

		--set @fdate=@p1
		--set @tdate=@p2
		--set @search=@p3

	SET @SQL='
		Select 
			ROW_NUMBER () over (order by id desc) as [SrNo]
			,isnull([id],0) as id	
			,convertdate AS [convertdate]
		    ,isnull([sourcebag],'''') as sourcebag
		    ,isnull([destinationbag],'''') as destinationbag
		    ,isnull([sourcemetal],'''') as sourcemetal
		    ,isnull([destinationmetal],'''') as destinationmetal
		    ,isnull([sourcegm],0.000) as sourcegm
			,isnull([conversionloss],0) as loss
			,iif(isnull(isnew_entry,0)=1,isnull([sourcegm],0.000),isnull(totalsourcegm,0)) as totalsourcegm		    
			,isnull([destinationgm],0.000) as destinationgm
			,isnull([AlloyRFBag],'''') as [AlloyRFBag]
			,isnull([AlloyRFBagWeight],0.000) as [AlloyRFBagWeight]
			,isnull([Alloy_TransProdId],0) as [Alloy_TransProdId]
			,convert(decimal(38,3)
				,['+@DBNAME+'].[dbo].[fn_get_source_remaning_metalctw](
						SUBSTRING(iif(isnull(isnew_entry,0)=1,destinationmetal,sourcemetal),0,CHARINDEX('','',iif(isnull(isnew_entry,0)=1,destinationmetal,sourcemetal),0))
						,isnull([conversionloss],0)
						,metaltype
						,''pure''
						)
			) as netloss
			,isnull(userid,'''') as userid
			,isnull(ipaddress,'''') as ipaddress
		from ['+@DBNAME+'].DBO.[InventoryManagement_Conversion_Log] with (nolock)
		where isnull(isdelete,0)=0
	'
	print (@SQL)
	exec (@SQL)
END
ELSE IF(isnull(@mode,'')='dustcollectorreport')
BEGIN
		--set @fdate=--@p1
		--set @tdate=--@p2		
		--set @dept=--@p3
		--set @empbarcode=--@p4
		--set @sortname=--@p5
		--set @sortorder=--@p6
		--set @PageSize=--@p7
		--set @CurrentPage=--@p8
		--set @isdepartment=--@p9
		--set @isemployee=--@p10		

		


		SET @SQL = '
			 DECLARE @DepartmentWise_LossTable TABLE  
			 (  
				id INT IDENTITY(1,1)  
				,DepartmentID INT  
				,DepartmentCode nvarchar(200) 
				,Date nvarchar(50)
				,Barcode nvarchar(200) 
				,MetalType nvarchar(50)
				,WtLoss decimal(18,3)
				,netwt decimal(18,3)
			 )
			 DECLARE @DepartmentWise_LossTable1 TABLE  
			 (  
				id INT IDENTITY(1,1)  		  
				,DepartmentCode nvarchar(200) 
				,Mont_DustCollectorDate nvarchar(50)
				,Year_DustCollectorDate nvarchar(50)
				,Barcode nvarchar(200) 	
				,WtLoss decimal(18,3)
				,netwt decimal(18,3)
			 )
			 DECLARE @DepartmentWise_LossTable2 TABLE  
			 (  
				id INT IDENTITY(1,1)  		  
				,DepartmentCode nvarchar(200) 
				,Mont_DustCollectorDate nvarchar(50)
				,Year_DustCollectorDate nvarchar(50)
				,Barcode nvarchar(200) 			
				,DustWeight decimal(18,3)
				,RefineWt decimal(18,3)
				,netwt decimal(18,3)
			 )
		'
		set @SQL1='
			-------------------------------------------------------------------------------
			insert into @DepartmentWise_LossTable(
			DepartmentID,DepartmentCode,Date
			,Barcode
			,MetalType,WtLoss,netwt)
			select
				 DepartmentID
				,DepartmentCode
				,CastingReturnDate	
				,usermanagement_CastingEmployeeBarcode							
				,MetalType							
				,CONVERT(decimal(38,3),isnull(CastingWeight,0)-(isnull(CastingReturnWeight,0)-sum(isnull(WaxsettingDiaCsWt,0)))) as WtLoss
				,sum(isnull(A.CastingReturnWeight,0)) as netwt
			from 		
			(
				select	
					27 as DepartmentID
					,''Casting'' as DepartmentCode							
					,convert(nvarchar(max),isnull(CastingReturnDate,''''),106) as CastingReturnDate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,CastingWeight
					,CastingReturnWeight
					,WaxsettingDiaCsWt	
					,[CastBatchNo]							
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch  with (nolock) 							
				where  isnull(CastingReturnWeight,0)>0						
					

				union all
				select
					27 as DepartmentID
					,''Casting'' as DepartmentCode								
					,convert(nvarchar(max),isnull(CastingReturnDate,''''),106) as CastingReturnDate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,CastingWeight
					,CastingReturnWeight
					,WaxsettingDiaCsWt
					,[CastBatchNo]										
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 							
				where  isnull(CastingReturnWeight,0)>0									
					
		'
		set @SQL1D='
			union all
			select
				27 as DepartmentID
				,''Casting'' as DepartmentCode								
				,convert(nvarchar(max),isnull(CastingReturnDate,''''),106) as CastingReturnDate
				,usermanagement_CastingEmployeeBarcode							
				,MetalType
				,CastingWeight
				,CastingReturnWeight
				,WaxsettingDiaCsWt
				,[CastBatchNo]										
			from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 							
			where  isnull(CastingReturnWeight,0)>0					
				
									
		) as A
		group by DepartmentID
			,DepartmentCode
			,isnull(CastingWeight,0)
			,isnull(CastingReturnWeight,0)
			,CastingReturnDate	
			,usermanagement_CastingEmployeeBarcode							
			,MetalType
			,[CastBatchNo]
		having CONVERT(decimal(38,3),isnull(CastingWeight,0)-(isnull(CastingReturnWeight,0)-sum(isnull(WaxsettingDiaCsWt,0))))>0
		or sum(isnull(A.CastingReturnWeight,0))>0
	'
		set @SQL2='
			-------------------------------------------------------------------------------
			insert into @DepartmentWise_LossTable(
				DepartmentID,DepartmentCode,Date
				,Barcode,MetalType,WtLoss,netwt)
			select
				DepartmentID
				,DepartmentCode
				,SprueCutting_returnClosedate	
				,usermanagement_CastingEmployeeBarcode							
				,MetalType							
				,CONVERT(decimal(38,3),isnull(CastingReturnWeight,0)
									-(iif(isnull(IsBatchWiseSprueCutting,0)=0,SUM(isnull(sprueweight,0))+isnull(AccountTerminate_SprueCuttingWt,0),isnull(sprueweight_batchwise,0))
									+iif(isnull(IsBatchWiseSprueCutting,0)=0,(isnull(extratreeweight,0)),isnull(isnull(extratreeweight_batchwise,0),0)))	 				
				) as WtLoss	
				,iif(isnull(A.IsBatchWiseSprueCutting,0)=1,isnull(A.sprueweight_batchwise,0), sum(isnull(A.sprueweight,0)))


			from 		
			(	
				select	
					41 as DepartmentID
					,''Sprue Cutting'' as DepartmentCode								
					,convert(nvarchar(max),isnull(SprueCutting_returnClosedate,''''),106) as SprueCutting_returnClosedate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,CastingReturnWeight
					,sprueweight_batchwise
					,IsBatchWiseSprueCutting
					,sprueweight
					,extratreeweight
					,extratreeweight_batchwise	
					,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt					
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch  with (nolock) 							
				where  
					 isnull(MetalType,'''') <> '''' 		
					and ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0					
										
				union all
				select
					41 as DepartmentID
					,''Sprue Cutting'' as DepartmentCode								
					,convert(nvarchar(max),isnull(SprueCutting_returnClosedate,''''),106) as SprueCutting_returnClosedate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,CastingReturnWeight
					,sprueweight_batchwise
					,IsBatchWiseSprueCutting
					,sprueweight
					,extratreeweight
					,extratreeweight_batchwise	
					,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt									
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 							
				where isnull(MetalType,'''') <> '''' 		
					and ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0						
			'
		SET @SQL2D='
				union all
				select
					41 as DepartmentID
					,''Sprue Cutting'' as DepartmentCode								
					,convert(nvarchar(max),isnull(SprueCutting_returnClosedate,''''),106) as SprueCutting_returnClosedate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,CastingReturnWeight
					,sprueweight_batchwise
					,IsBatchWiseSprueCutting
					,sprueweight
					,extratreeweight
					,extratreeweight_batchwise	
					,isnull(AccountTerminate_SprueCuttingWt,0) as AccountTerminate_SprueCuttingWt									
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 							
				where isnull(MetalType,'''') <> '''' 		
					and ISNULL(MasterManagement_productionstatusid,0) IN (20,21,36)	
					and isnull(IsBatchWiseSprueCuttingReturn_Partially,0)=0																						
				) as A
				group by DepartmentID
					,DepartmentCode
					,isnull(CastingReturnWeight,0)
					,isnull(A.IsBatchWiseSprueCutting,0)
					,isnull(AccountTerminate_SprueCuttingWt,0)
					,isnull(A.sprueweight_batchwise,0)	
					,isnull(extratreeweight,0)
					,SprueCutting_returnClosedate	
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,isnull(extratreeweight_batchwise,0)
				having isnull(CastingReturnWeight,0)
					-(iif(isnull(IsBatchWiseSprueCutting,0)=0,SUM(isnull(sprueweight,0))+isnull(AccountTerminate_SprueCuttingWt,0),isnull(sprueweight_batchwise,0))
					+iif(isnull(IsBatchWiseSprueCutting,0)=0,(isnull(extratreeweight,0)),isnull(isnull(extratreeweight_batchwise,0),0)))>0
					or iif(isnull(A.IsBatchWiseSprueCutting,0)=1,isnull(A.sprueweight_batchwise,0), sum(isnull(A.sprueweight,0)))>0
	
	
			'
		set @SQL3='

			-------------------------------------------------------------------------------
			insert into @DepartmentWise_LossTable(
				DepartmentID,DepartmentCode,Date
				,Barcode,MetalType,WtLoss,netwt)
			select
				DepartmentID
				,DepartmentCode
				,SprueGrinding_ReceiveCloseDate	
				,usermanagement_CastingEmployeeBarcode							
				,MetalType							
				,CONVERT(decimal(38,3),isnull(sprueweight_batchwise,0)-(SUM(isnull(SprueGrinding_Weight,0))+isnull(AccountTerminate_SprueGrindingWt,0)+isnull(SprueGrinding_treewt,0))) as WtLoss
				,sum(isnull(A.SprueGrinding_Weight,0))
			from 		
			(	
				select	
					34 as DepartmentID
					,''Sprue Grinding'' as DepartmentCode							
					,convert(nvarchar(max),isnull(SprueGrinding_ReceiveCloseDate,''''),106) as SprueGrinding_ReceiveCloseDate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,sprueweight_batchwise
					,SprueGrinding_Weight
					,SprueGrinding_treewt
					,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt								
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch  with (nolock) 							
				where  isnull(MetalType,'''') <> '''' 
					and ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 or isnull(IsSprueCutting_ReturnClosed,0)=1)						
					
				union all
				select
					34 as DepartmentID
					,''Sprue Grinding'' as DepartmentCode								
					,convert(nvarchar(max),isnull(SprueGrinding_ReceiveCloseDate,''''),106) as SprueGrinding_ReceiveCloseDate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,sprueweight_batchwise
					,SprueGrinding_Weight
					,SprueGrinding_treewt	
					,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt												
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_archive  with (nolock) 							
				where  isnull(MetalType,'''') <> '''' 
					and ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 or isnull(IsSprueCutting_ReturnClosed,0)=1)						
					
			'
		SET @SQL3D='
				union all
				select
					34 as DepartmentID
					,''Sprue Grinding'' as DepartmentCode								
					,convert(nvarchar(max),isnull(SprueGrinding_ReceiveCloseDate,''''),106) as SprueGrinding_ReceiveCloseDate
					,usermanagement_CastingEmployeeBarcode							
					,MetalType
					,sprueweight_batchwise
					,SprueGrinding_Weight
					,SprueGrinding_treewt	
					,isnull(AccountTerminate_SprueGrindingWt,0) as AccountTerminate_SprueGrindingWt												
				from ['+@DBNAME+'].[dbo].CastingManagement_CastingBatch_delete1  with (nolock) 							
				where isnull(MetalType,'''') <> '''' 
					and ISNULL(MasterManagement_productionstatusid,0)=21
					and (isnull(IsSprueGrinding_ReturnClosed,0)=1 or isnull(IsSprueCutting_ReturnClosed,0)=1)						
					
																						
			) as A
			group by DepartmentID
				,DepartmentCode
				,isnull(sprueweight_batchwise,0)
				,isnull(SprueGrinding_treewt,0)
				,isnull(AccountTerminate_SprueGrindingWt,0)
				,SprueGrinding_ReceiveCloseDate	
				,usermanagement_CastingEmployeeBarcode							
				,MetalType
			having isnull(sprueweight_batchwise,0)-(SUM(isnull(SprueGrinding_Weight,0))+isnull(SprueGrinding_treewt,0))>0
			or sum(isnull(A.SprueGrinding_Weight,0))>0
		'
		SET @SQL4 = '
			-------------------------------------------------------------------------------
			insert into @DepartmentWise_LossTable(
				DepartmentID,DepartmentCode,Date
				,Barcode,MetalType,WtLoss,netwt)
			select 
					b.DepartmentID 	
					,b.DepartmentCode
					,b.LastTransaction
					,b.EmployeeBarcode 		
					,replace(b.MetalType,''gold '','''')
					,sum(isnull(b.Issued,0))-sum(isnull(b.Returned,0))	
					,sum(isnull(b.netwt,0)) as netwt			
				from
				(			
						select 
							isnull(TLMPUL.INV_MeterialAssignEmp_DeptName,'''')	as DepartmentCode
							,isnull(TLMPUL.INV_MeterialAssignEmp_DeptId,0)	as DepartmentID
							,isnull(US.BarCode,'''') as EmployeeBarcode
							,concat(TLMPUL.[Metal_Type_name],'' '',TLMPUL.[Metal_purity_name]) as MetalType																		
							,MAX(TLMPUL.Modifieddate) as Modifieddate			
							,convert(nvarchar(max),isnull(MAX(TLMPUL.Modifieddate),''''),106) as LastTransaction				
							,SUM(isnull([Mount_ReturnWeight],0)+isnull([Department_LossWeight],0)) as Issued
							,SUM(isnull([Mount_ReturnWeight],0)) as Returned
							,sum(iif((
									isnull([Action],'''') in (''Return Mount and Loss Weight'')						
									and isnull(IsReturnCompleted,0)=1
									and isnull(IsFirstTimeDepartmentReturn,0)=1
									and isnull(IsEngage,0)=0
									and isnull(IsWaxEngage,0)=0						
									)
								,isnull(netwt,0)-isnull(FirstTimeDepartmentReturn_Findingwt,0)-isnull(FirstTimeDepartmentReturn_Mountwt,0)
								,0)
							) as netwt
						from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog] as TLMPUL with (nolock)	
							left outer join (
								select id,BarCode from ['+@DBNAME+'].[dbo].Usermanagement_systemloginmaster WITH(NOLOCK)
							) as US
						on TLMPUL.MeterialAssignEmpId=US.id							
						where  isnull(TLMPUL.isdelete,0)=0 								
							and concat(TLMPUL.[Metal_Type_name],'' '',TLMPUL.[Metal_purity_name]) <> '''' 							
							and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')						
							and isnull(IsReturnCompleted,0)=1
												
						Group By isnull(TLMPUL.INV_MeterialAssignEmp_DeptId,0)
							,isnull(TLMPUL.INV_MeterialAssignEmp_DeptName,'''')
							,isnull(TLMPUL.MaterialAssignEmp_customercode,'''')
							,concat(TLMPUL.[Metal_Type_name],'' '',TLMPUL.[Metal_purity_name])
							,isnull(US.BarCode,'''')
						'
		SET @SQL41 = '
						union all
						select 
							isnull(TLMPUL.INV_MeterialAssignEmp_DeptName,'''')	as DepartmentCode
							,isnull(TLMPUL.INV_MeterialAssignEmp_DeptId,0)	as DepartmentID
							,isnull(US.BarCode,'''') as EmployeeBarcode
							,concat(TLMPUL.[Metal_Type_name],'' '',TLMPUL.[Metal_purity_name]) as MetalType																		
							,MAX(TLMPUL.Modifieddate) as Modifieddate			
							,convert(nvarchar(max),isnull(MAX(TLMPUL.Modifieddate),''''),106) as LastTransaction				
							,SUM(isnull([Mount_ReturnWeight],0)+isnull([Department_LossWeight],0)) as Issued
							,SUM(isnull([Mount_ReturnWeight],0)) as Returned
							,sum(iif((
									isnull([Action],'''') in (''Return Mount and Loss Weight'')						
									and isnull(IsReturnCompleted,0)=1
									and isnull(IsFirstTimeDepartmentReturn,0)=1
									and isnull(IsEngage,0)=0
									and isnull(IsWaxEngage,0)=0
								)
								,isnull(netwt,0)-isnull(FirstTimeDepartmentReturn_Findingwt,0)-isnull(FirstTimeDepartmentReturn_Mountwt,0)
								,0)
							) as netwt
						from ['+@DBNAME+'].[dbo].[TransactionLogmanagement_ProductionUpdateLog_Archive] as TLMPUL with (nolock)		
						left outer join (select id,BarCode from ['+@DBNAME+'].[dbo].Usermanagement_systemloginmaster WITH(NOLOCK)) as US
						on TLMPUL.MeterialAssignEmpId=US.id			
						where isnull(TLMPUL.isdelete,0)=0 		  							
							and concat(TLMPUL.[Metal_Type_name],'' '',TLMPUL.[Metal_purity_name]) <> '''' 											
							and isnull([Action],'''') in (''Return Mount and Loss Weight'',''Issue For Finding Convertion'')						
							and isnull(IsReturnCompleted,0)=1	
													
						Group By isnull(TLMPUL.INV_MeterialAssignEmp_DeptId,0)
							,isnull(TLMPUL.INV_MeterialAssignEmp_DeptName,'''')
							,isnull(TLMPUL.MaterialAssignEmp_customercode,'''')
							,concat(TLMPUL.[Metal_Type_name],'' '',TLMPUL.[Metal_purity_name])
							,isnull(US.BarCode,'''')
						union all	
						SELECT 
						   [DepartmentCode]
						  ,[DepartmentID]
						  ,[EmployeeBarcode]
						  ,[MetalType]
						  ,[Modifieddate]
						  ,[LastTransaction]
						  ,[Issued]
						  ,[Returned]
						  ,[netwt]			 
						FROM ['+@DBNAME+'].[dbo].[Emonth_DustCollectorReport] with (nolock)
						
									 		
			) as b
			group by 		
				replace(b.MetalType,''gold '','''')			
				,DepartmentCode
				,DepartmentID
				,EmployeeBarcode
				,LastTransaction
			having sum(isnull(b.Issued,0))-sum(isnull(b.Returned,0))>0
			or sum(isnull(b.netwt,0))>0
			 '
		SET @SQL5 = '

				insert into @DepartmentWise_LossTable1(
					DepartmentCode,Mont_DustCollectorDate,Year_DustCollectorDate
					,Barcode,WtLoss,netwt
				)
				select 
					DepartmentCode
					,DATENAME(month, Date)
					,YEAR(Date)
					,isnull(Barcode,'''')
					,sum(WtLoss)
					,sum(netwt)
				from @DepartmentWise_LossTable
				group by 	
					DepartmentCode
					,DATENAME(month, Date)
					,YEAR(Date)
					,isnull(Barcode,'''')
				order by isnull(Barcode,'''')


		'
		SET @SQL6 ='
				insert into @DepartmentWise_LossTable2 (
					Mont_DustCollectorDate,Year_DustCollectorDate,DepartmentCode
					,Barcode,DustWeight,RefineWt
				)
				select 
					DATENAME(month, dust.DustCollectorDate) AS Mont_DustCollectorDate
					,YEAR(dust.DustCollectorDate) AS Year_DustCollectorDate
					,ISNULL(dust.DepartmentName,'''') AS  DepartmentName
					,ISNULL(dust.UserManagement_EmployeeBarCode,'''') AS BarCode
					,SUM(ISNULL(dust.DustWeight,0)) AS DustWeight
					,SUM(ISNULL(Refine.receivedgm,0)) AS RefineWt	
				from ['+@DBNAME+'].[dbo].[ProductionManagement_DustCollector_ResouceWise] as dust
				left outer join ['+@DBNAME+'].[dbo].[InventoryManagement_metalrefinery] as  Refine
					on dust.metalrefinery_autocode=Refine.[autocode]
				GROUP BY DATENAME(month, dust.DustCollectorDate)
					,YEAR(dust.DustCollectorDate)
					,ISNULL(dust.DepartmentName,'''')
					,ISNULL(dust.UserManagement_EmployeeBarCode,'''')
		'
		SET @SQL7 = '
			;WITH dvtbl AS (	
					select  iif(ISNULL(T2.DepartmentCode,'''')='''',T1.DepartmentCode,T2.DepartmentCode) as Department
						,iif(ISNULL(T2.Barcode,'''')='''',T1.Barcode,T2.Barcode) as EmployeeBarCode
						,iif(ISNULL(T2.Barcode,'''')='''',T1.Mont_DustCollectorDate,T2.Mont_DustCollectorDate) as Mont_DustCollectorDate
						,iif(ISNULL(T2.Barcode,'''')='''',T1.Year_DustCollectorDate,T2.Year_DustCollectorDate) as Year_DustCollectorDate				
						,T1.WtLoss as LossWt
						,T2.DustWeight as DustWt
						,CONVERT(decimal(38,2),iif(ISNULL(T1.WtLoss,0)<>0, (T2.DustWeight / T1.WtLoss)*100,0)) as DustPercentage
						,T2.RefineWt as RefineWt
						,T1.netwt
					from @DepartmentWise_LossTable1 as T1
					FULL OUTER JOIN @DepartmentWise_LossTable2 as T2
					on T1.DepartmentCode= T2.DepartmentCode
						and T1.Mont_DustCollectorDate=T2.Mont_DustCollectorDate
						and T1.Year_DustCollectorDate=T2.Year_DustCollectorDate
						and T1.Barcode=T2.Barcode
			)	
		'
		SET @SQL8 ='
			SELECT 
				 isnull(Department,'''') as Department
				,isnull(EmployeeBarCode,''ALL'') as EmployeeBarCode
				,isnull(Mont_DustCollectorDate,'''') as Mont_DustCollectorDate
				,isnull(Year_DustCollectorDate,'''') as Year_DustCollectorDate
				,isnull(netwt,0) as netwt
				,isnull(LossWt,0) as LossWt
				,isnull(DustWt,0) as DustWt
				,isnull(DustPercentage,0) as DustPercentage
				,isnull(RefineWt,0) as RefineWt
			FROM dvtbl
			
			;
		'

		

		PRINT(@SQL)
		PRINT(@SQL1)
		PRINT(@SQL1D)
		PRINT(@SQL2)
		PRINT(@SQL2D)
		PRINT(@SQL3)
		PRINT(@SQL3D)
		PRINT(@SQL4)
		PRINT(@SQL41)
		PRINT(@SQL5)
		PRINT(@SQL6)
		PRINT(@SQL7)
		PRINT(@SQL8)
		EXEC(@SQL+@SQL1+@SQL1D+@SQL2+@SQL2D+@SQL3+@SQL3D+@SQL4+@SQL41+@SQL5+@SQL6+@SQL7+@SQL8)

END



END

--------------------------------------------------------------------------------------------------------------	
Execute [GetTxLog] @spname,@FromDate,@DBNAME,@appuserid,@IPAddress,@FormName,'Reportv4',@mode
END TRY
BEGIN CATCH	
	
	SELECT 
		0 as stat
		,'"Contact your Admin"' as stat_msg
		,1001 as stat_code
		,'null' as device_token
	
	EXECUTE [GetErrlog] @appuserid,@FromDate,@DBNAME,@spname,@IPAddress,@FormName,'Reportv4',@mode;
END CATCH;
END



