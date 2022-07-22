CREATE TABLE public.stronghold
(
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    owner_id character varying(255) NOT NULL,
    PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
);

ALTER TABLE public.stronghold
    OWNER to "stronghold-manager";

ALTER TABLE public.stronghold
    ADD CONSTRAINT stronghold_owner_id_user_id FOREIGN KEY (owner_id)
    REFERENCES public.stronghold_user (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

