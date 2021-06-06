CREATE TABLE [IF NOT EXISTS] users (
  id serial PRIMARY KEY,
	username VARCHAR ( 50 ) UNIQUE NOT NULL,
	password VARCHAR ( 50 ) NOT NULL,
	email VARCHAR ( 255 ) UNIQUE NOT NULL,
);

INSERT INTO 
    users (username, password, email)
VALUES
    ('paule','herman', 'paule.herman@gmail.com'),
    ('theo','fenique', 'theo.fenique@gmail.com'),
    ('aymeric','moehn', 'aymeric.moehn@gmail.com'),
    ('samuel','belolo', 'samuel.belolo@gmail.com');