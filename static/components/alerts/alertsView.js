export default {
    computed: {
        alerts() {
            return this.$store.state.alerts;
        }
    },
    created() {
    },
    methods: {
    },
    mounted: function(){

    },
    template:
    `
        <div class="alertsArea">
            <div v-for="alert in alerts" class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>#{{alert.id}} Error</strong>: {{alert.text}}.
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    `
}