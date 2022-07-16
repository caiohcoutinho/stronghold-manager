let View = function(code, label){
    this.code = code;
    this.label = label;
}

export const RESOURCE = new View('RESOURCE', 'Resources');
export const RECIPE = new View('RECIPE', 'Recipes');
export const WORKER = new View('WORKER', 'Workers');
export const DATE = new View('DATE', 'Date');
export const STRONGHOLD = new View('STRONGHOLD', 'Strongholds');
export const VIEWS = [RESOURCE, RECIPE, WORKER, DATE, STRONGHOLD];

