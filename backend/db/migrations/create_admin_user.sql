INSERT INTO admins (
    username,
    email,
    password,
    role,
    createdAt,
    updatedAt
) VALUES (
    'sagar',
    'sagar@gmail.com',
    'sagar@123',
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

DELETE FROM admins WHERE username = 'sagar'; 