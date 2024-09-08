SELECT TOP (1000) [PostId]
      ,[Content]
      ,[ContentNoDiacritics]
      ,[Pinned]
      ,[CreatedAt]
      ,[UpdatedAt]
      ,[PostedBy]
      ,[OriginalPost]
      ,[ReplyTo]
  FROM [dbo].[Post]


--DELETE FROM [dbo].[Post] WHERE PostId = '5474AF90-9767-EF11-BDFD-6045BD1DF899'

/*

SELECT COUNT(*) AS PostCount 
FROM [dbo].[Post]
WHERE [PostedBy] = 'B1B7174F-0E65-EF11-BDFD-6045BD1DF899'


-- Xóa Full-Text Index
DROP FULLTEXT INDEX ON [dbo].[Post];

-- Xóa Full-Text Catalog nếu không còn cần thiết
DROP FULLTEXT CATALOG PostCatalog;

-- Tạo catalogue
CREATE FULLTEXT CATALOG ftCatalog AS DEFAULT;

-- Xóa chỉ mục đã tồn tại
DROP INDEX IDX_f1580b9eefa0c4cf1fa376c8de ON Post;

-- Tạo một chỉ mục mới duy nhất và không cho phép giá trị NULL trên cột PostId
--CREATE UNIQUE INDEX IX_PostId_ForFullText ON Post(PostId) 
--CREATE UNIQUE NONCLUSTERED INDEX IDX_PostId_Unique ON Post(PostId);
--CREATE UNIQUE INDEX idx_post_content ON Post(Content);


-- Create Full-Text Index on the Content column
CREATE FULLTEXT INDEX ON Post(ContentNoDiacritics) 
KEY INDEX PK_4310855a585bd7630b9eae93338
ON ftCatalog ;


--Cập Nhật Full-Text Index
--ALTER FULLTEXT INDEX ON Post START FULL POPULATION;

-- Kiểm tra các chỉ mục trên bảng Post
SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    c.name AS ColumnName
FROM 
    sys.indexes AS i
    JOIN sys.index_columns AS ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    JOIN sys.columns AS c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE 
    i.object_id = OBJECT_ID('Post');


-- Kiểm tra các chỉ mục Fulltext trên bảng Post
	SELECT * 
FROM sys.fulltext_indexes 
WHERE object_id = OBJECT_ID('Post');

	SELECT * 
FROM sys.fulltext_catalogs;


SELECT * 
FROM Post 
WHERE CONTAINS(ContentNoDiacritics, '"everyone"');

*/

