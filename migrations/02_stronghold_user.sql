CREATE TABLE public.stronghold_user
(
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    picture character varying(2048) NOT NULL,
    PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

ALTER TABLE public.stronghold_user
    OWNER to "stronghold-manager";