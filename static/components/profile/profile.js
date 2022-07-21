import { logUser, mounted } from './login.js'

export default {
    data() {
      return {}
    },
    computed:{
        hasUserProfile: function(){
            return this.$store.state.userProfile.idToken != null;
        },
        hasLoggedOut: function(){
            return this.$store.state.hasLoggedOut;
        }
    },
    methods:{
        logUser: function(response){
//            console.log("ID: " + userId);
//            console.log('Full Name: ' + responsePayload.name);
//            console.log('Given Name: ' + responsePayload.given_name);
//            console.log('Family Name: ' + responsePayload.family_name);
//            console.log("Image URL: " + responsePayload.picture);
//            console.log("Email: " + responsePayload.email);
            this.$store.dispatch("loginUser", logUser(response));
        },
        logOut: function() {
            this.$store.dispatch("logOut");
        }
    },
    mounted: function(){
        mounted(this);
    },
    template:
    `
        <div class="profileArea">
            <div id="buttonDiv" v-if="!hasUserProfile && !hasLoggedOut"/>
            <div class="loggedUserProfileDiv" v-if="hasUserProfile && !hasLoggedOut">
                <table class="loggedUserProfileTable">
                    <tr>
                        <td><img class="profileImage" v-bind:src="this.$store.state.userProfile.picture" /></td>
                        <td><span>{{this.$store.state.userProfile.name}}</span></td>
                        <td><span class="logOutLink" @click="logOut">Log out</span></td>
                    </tr>
                </table>
            </div>
            <div class="loggedUserProfileDiv" v-if="hasLoggedOut">Please refresh page to login</div>
        </div>
    `
}