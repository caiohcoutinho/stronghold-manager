CREATE TABLE public.stronghold_user
(
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    picture character varying(2048) NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE public.stronghold_user
    OWNER to "stronghold-manager";


ALTER TABLE public.stronghold
ADD CONSTRAINT stronghold_owner_id_user_id FOREIGN KEY (owner_id)
REFERENCES public.stronghold_user (id) MATCH SIMPLE
ON UPDATE NO ACTION
ON DELETE NO ACTION;