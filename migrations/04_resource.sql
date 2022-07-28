CREATE TABLE public.resource
(
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    owner_id character varying(255) NOT NULL,
    scenario_id character varying(255),
    PRIMARY KEY (id),
    CONSTRAINT resource_owner_id_user_id FOREIGN KEY (owner_id)
        REFERENCES public.stronghold_user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT resource_scenario_id FOREIGN KEY (scenario_id)
        REFERENCES public.scenario (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE public.resource
    ADD COLUMN icon character varying(255);

ALTER TABLE public.resource
    ADD COLUMN hex character varying(255);

ALTER TABLE public.resource
    ADD COLUMN filter character varying(2048);

ALTER TABLE public.resource
    OWNER to "stronghold-manager";