let View = function(code, label) {
    this.code = code;
    this.label = label;
}

export const RESOURCE = new View('RESOURCE', 'Resources');
export const RECIPE = new View('RECIPE', 'Recipes');
export const WORKER = new View('WORKER', 'Workers');
export const DATE = new View('DATE', 'Date');
export const STRONGHOLD = new View('STRONGHOLD', 'Strongholds');
export const SCENARIO = new View('SCENARIO', 'Scenario');
export const DASHBOARD = new View('DASHBOARD', 'Dashboard');
export const ICON = new View('ICON', 'Icon');
export const LOGS = new View('LOGS', 'Logs');

export const VIEWS = [DASHBOARD, SCENARIO, STRONGHOLD, RESOURCE, RECIPE, WORKER, DATE, ICON, LOGS];

export const ALERT_MAX_SIZE = 400;
export const ALERT_FADE_TIME = 10 * 1000;
export const TEXT_INPUT_THROTTLE = 500;