-- Tìm tên của constraint mặc định
SELECT name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('User')
  AND col_name(parent_object_id, parent_column_id) = 'ProfilePic';

  /*
  SELECT 
    name AS ConstraintName
FROM 
    sys.default_constraints
WHERE 
    parent_object_id = OBJECT_ID('dbo.User') 
    AND parent_column_id = (
        SELECT column_id 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.User') 
          AND name = 'ProfilePic'
    );

-- Delete Constraint
ALTER TABLE dbo.[User]
DROP CONSTRAINT [TênConstraint];

-- Add new constraint
ALTER TABLE dbo.[User]
ADD CONSTRAINT DF_User_ProfilePic 
DEFAULT 'https://res.cloudinary.com/dq4kbmkrf/image/upload/v1724569868/images/profilePic.png' 
FOR ProfilePic;

*/

EXEC sp_help 'dbo.User';