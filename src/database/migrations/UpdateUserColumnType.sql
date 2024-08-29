ALTER TABLE [User] ALTER COLUMN [FirstName] NVARCHAR(255) NOT NULL;

ALTER TABLE [User] ALTER COLUMN [LastName] NVARCHAR(255) NOT NULL;

-- Tìm tên ràng buộc khóa duy nhất
SELECT 
    name AS ConstraintName
FROM 
    sys.objects
WHERE 
    type = 'UQ' AND OBJECT_NAME(parent_object_id) = 'User';

	-- Nếu có ràng buộc, xóa chúng
-- ALTER TABLE [User] DROP CONSTRAINT <constraint_name>;
	-- Thay <ConstraintName> bằng tên ràng buộc thực tế
ALTER TABLE [User] DROP CONSTRAINT UQ_b000857089edf6cae23b9bc9b8e;
ALTER TABLE [User] DROP CONSTRAINT UQ_b7eee57d84fb7ed872e660197fb;
ALTER TABLE [User] DROP CONSTRAINT UQ_65763d09370eff7fc4b68ebaa78;


ALTER TABLE [User] ALTER COLUMN [Username] NVARCHAR(255) NOT NULL;

-- Tạo lại ràng buộc khóa duy nhất (nếu cần)
--ALTER TABLE [User] ADD CONSTRAINT UQ_Username UNIQUE ([Username]);

ALTER TABLE [User] ALTER COLUMN [Email] NVARCHAR(255) NOT NULL;

-- Tạo lại ràng buộc khóa duy nhất (nếu cần)
--ALTER TABLE [User] ADD CONSTRAINT UQ_Email UNIQUE ([Username]);

ALTER TABLE [User] ALTER COLUMN [Password] NVARCHAR(255) NOT NULL;


ALTER TABLE [User] DROP CONSTRAINT DF_bd28a342e20ee15edc3dff782ca;

ALTER TABLE [User] ALTER COLUMN [ProfilePic] NVARCHAR(255) NOT NULL;

-- Tạo lại ràng buộc giá trị mặc định (nếu cần)
--ALTER TABLE [User] ADD CONSTRAINT DF_ProfilePic DEFAULT 'default_value' FOR [ProfilePic];
