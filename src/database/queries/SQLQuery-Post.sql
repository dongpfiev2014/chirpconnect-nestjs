SELECT TOP (1000) [PostId]
      ,[Content]
      ,[Pinned]
      ,[CreatedAt]
      ,[UpdatedAt]
      ,[PostedBy]
	  ,[OriginalPost]
  FROM [dbo].[Post]


DELETE FROM [dbo].[Post] WHERE PostId = '5474AF90-9767-EF11-BDFD-6045BD1DF899'