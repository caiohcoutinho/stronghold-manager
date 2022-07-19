export default {
    data() {
      return {}
    },
    methods:{
    },
    mounted: function (){
        let userId = "1234abcd-1234-abcd-1234-12341234abcd";
        let idToken = "1234abcd-1234-abcd-1234-12341234abcd";
        this.$store.commit("loginUser", {idToken: idToken, userId: userId});
        console.log("Using local profile.")
    },
    template:
    `
        <div id="buttonDiv">Using local profile.</div>
    `
}