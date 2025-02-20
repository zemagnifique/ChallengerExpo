
INSERT INTO users (username, password) 
VALUES ('user1', 'user1'), ('user2', 'user2')
ON CONFLICT (username) DO NOTHING;
