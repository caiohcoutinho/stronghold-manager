export default {
    data() {
      return {}
    },
    methods:{
    },
    mounted: function (){
        let userId = "1234abcd-1234-abcd-1234-12341234abcd";
        console.log("ID: " + userId);
        this.$store.commit("loginUser", {userId: userId});
        console.log("Using local profile.")
    },
    template:
    `
        <div id="buttonDiv">Using local profile.</div>
    `
}