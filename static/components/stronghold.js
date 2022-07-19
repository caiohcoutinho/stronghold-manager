export default {
    computed: {
        strongholds() {
            return this.$store.state.strongholds;
        }
    },
    created() {
    },
    methods: {
    },
    mounted: function(){
        this.$store.dispatch("loadStrongholds");
    },
    template:
    `
        <h1>Stronghold</h1>
        <ul>
            <li v-for="stronghold in strongholds">
                #{{stronghold.id}} - {{stronghold.name}}
            </li>
        </ul>
    `
}