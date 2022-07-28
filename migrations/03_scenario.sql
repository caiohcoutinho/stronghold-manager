CREATE TABLE public.scenario
(
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    owner_id character varying(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT scenario_owner_id_user_id FOREIGN KEY (owner_id)
        REFERENCES public.stronghold_user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE public.scenario
    OWNER to "stronghold-manager";

ALTER TABLE public.stronghold
    ADD COLUMN scenario_id character varying(255);

ALTER TABLE public.stronghold
    ADD CONSTRAINT stronghold_scenario_id FOREIGN KEY (scenario_id)
    REFERENCES public.scenario (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;