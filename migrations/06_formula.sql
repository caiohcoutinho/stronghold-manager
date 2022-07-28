CREATE TABLE public.formula_node
(
    node_id character varying(255) NOT NULL,
    node_type character varying(255) NOT NULL,
    parent_id character varying(255),
    resource_id character varying(255),
    quantity bigint,
    PRIMARY KEY (node_id),
    CONSTRAINT formula_node_resource_id FOREIGN KEY (resource_id)
        REFERENCES public.resource (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE public.formula_node
    ADD CONSTRAINT formula_node_parent_id FOREIGN KEY (parent_id)
    REFERENCES public.formula_node (node_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE public.formula_node
    ADD COLUMN owner_id character varying(255) NOT NULL;

ALTER TABLE public.formula_node
    ADD COLUMN root_node_id character varying(255);
ALTER TABLE public.formula_node
    ADD CONSTRAINT formula_node_root_node_id FOREIGN KEY (root_node_id)
    REFERENCES public.formula_node (node_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE public.recipe
    ADD COLUMN formula_id character varying(255);
ALTER TABLE public.recipe
    ADD CONSTRAINT recipe_formula_id FOREIGN KEY (formula_id)
    REFERENCES public.formula_node (node_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;