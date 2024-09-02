SELECT TOP (1000) [PostId]
      ,[Content]
      ,[Pinned]
      ,[CreatedAt]
      ,[UpdatedAt]
      ,[PostedBy]
	  ,[OriginalPost]
	  ,[ReplyTo]
  FROM [dbo].[Post]


--DELETE FROM [dbo].[Post] WHERE PostId = '5474AF90-9767-EF11-BDFD-6045BD1DF899'


SELECT COUNT(*) AS PostCount 
FROM [dbo].[Post]
WHERE [PostedBy] = 'BD89110C-3C64-EF11-BDFD-6045BD1DF899'