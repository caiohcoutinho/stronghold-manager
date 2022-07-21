import { Log, LOG_TYPE_ERROR, LOG_TYPE_INFO } from '../logs.js'
import { Alert, ALERT_TYPE_ERROR, ALERT_TYPE_INFO } from '../alerts/alerts.js'

export default {
    computed: {
        alerts() {
            return this.$store.state.alerts;
        }
    },
    created() {
    },
    methods: {
        getAlertClass(alert){
            switch(alert.type) {
              case ALERT_TYPE_ERROR:
                return 'alert-danger';
              case ALERT_TYPE_INFO:
                return 'alert-info';
              default:
                return 'alert-light';
            }
        }
    },
    mounted: function(){
    },
    components: {
        ALERT_TYPE_INFO, ALERT_TYPE_ERROR
    },
    template:
    `
        <div class="alertsArea">
            <div v-for="alert in alerts"
                class="alert alert-dismissible fade show"
                role="alert" :class="[getAlertClass(alert)]">
              <strong>#{{alert.id}} Error</strong>: {{alert.text}}.
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    `
}