export default {
    computed: {
        logs() {
            return this.$store.state.logs;
        }
    },
    created() {
    },
    methods: {
    },
    template:
    `
        <h1>Logs</h1>
        <ul>
            <li v-for="log in logs">
                {{log.creationDate}} - {{log.type}} - {{log.text}}
            </li>
        </ul>
    `
}