DROP TABLE IF EXISTS "user";
DROP SEQUENCE IF EXISTS user_id_seq;
CREATE SEQUENCE user_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."user" (
    "id" integer DEFAULT nextval('user_id_seq') NOT NULL,
    "username" character varying(50) NOT NULL,
    "password" character varying(50) NOT NULL,
    "email" character varying(255) NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "user" ("id", "username", "password", "email") VALUES
(1,	'paule',	'herman',	'paule.herman@gmail.com'),
(2,	'theo',	'fenique',	'theo.fenique@gmail.com'),
(3,	'aymeric',	'moehn',	'aymeric.moehn@gmail.com'),
(4,	'samuel',	'belolo',	'samuel.belolo@gmail.com');