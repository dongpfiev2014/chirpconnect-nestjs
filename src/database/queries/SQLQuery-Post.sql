SELECT TOP (1000) [PostId]
      ,[Content]
      ,[Pinned]
      ,[CreatedAt]
      ,[UpdatedAt]
      ,[PostedBy]
  FROM [dbo].[Post]


  DELETE FROM [dbo].[Post] WHERE PostId = 'F4C8037D-3766-EF11-BDFD-6045BD1DF899'