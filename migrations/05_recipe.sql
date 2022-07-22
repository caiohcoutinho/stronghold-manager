CREATE TABLE public.recipe
(
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    owner_id character varying(255) NOT NULL,
    scenario_id character varying(255),
    PRIMARY KEY (id),
    CONSTRAINT recipe_owner_id_user_id FOREIGN KEY (owner_id)
        REFERENCES public.stronghold_user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT recipe_scenario_id FOREIGN KEY (scenario_id)
        REFERENCES public.scenario (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
);

ALTER TABLE public.recipe
    OWNER to "stronghold-manager";