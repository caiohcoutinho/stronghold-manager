export default {
    computed: {
        strongholds() {
            return this.$store.state.strongholds;
        },
        hasUserProfile() {
            return this.$store.getters.hasUserProfile
        }
    },
    created() {
    },
    methods: {
        loadStrongholds(){
            this.$store.dispatch("loadStrongholds");
        }
    },
    mounted: function(){
        if(this.hasUserProfile) {
            this.loadStrongholds();
        }
    },
    watch: {
        hasUserProfile(newValue, oldValue){
            if (newValue) {
                this.loadStrongholds();
            }
        }
    },
    template:
    `
        <h1>Stronghold</h1>
        <div v-if="!hasUserProfile">
            <h5>Please login</h5>
        </div>
        <div v-if="hasUserProfile">
            <ul>
                <li v-for="stronghold in strongholds">
                    #{{stronghold.id}} - {{stronghold.name}}
                </li>
            </ul>
        </div>
    `
}