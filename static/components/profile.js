export default {
    data() {
      return {}
    },
    methods:{
        logUser: function(response){
            let idToken = response.credential;
            let responsePayload = parseJwt(response.credential);
            let userId = responsePayload.sub;
//            console.log("ID: " + userId);
//            console.log('Full Name: ' + responsePayload.name);
//            console.log('Given Name: ' + responsePayload.given_name);
//            console.log('Family Name: ' + responsePayload.family_name);
//            console.log("Image URL: " + responsePayload.picture);
//            console.log("Email: " + responsePayload.email);
            this.$store.commit("loginUser", {idToken: idToken, userId: userId});
        }
    },
    mounted: function (){
      google.accounts.id.initialize({
        client_id: "240439775239-khrfib64ndsij9nndeoprqrg1gkogn4r.apps.googleusercontent.com",
        callback: this.logUser
      });
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }  // customization attributes
      );
    },
    template:
    `
        <div id="buttonDiv"></div>
    `
}