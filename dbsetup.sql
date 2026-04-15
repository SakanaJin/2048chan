DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'chanuser') THEN
    CREATE USER chanuser WITH ENCRYPTED PASSWORD 'password';
  END IF;
END
$$;

SELECT 'CREATE DATABASE chan OWNER chanuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chan')\gexec

GRANT ALL ON SCHEMA public TO chanuser;