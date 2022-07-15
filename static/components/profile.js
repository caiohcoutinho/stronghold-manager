function handleCredentialResponse(response) {
  console.log("Encoded JWT ID token: " + response.credential);
  let responsePayload = parseJwt(response.credential);

   console.log("ID: " + responsePayload.sub);
   console.log('Full Name: ' + responsePayload.name);
   console.log('Given Name: ' + responsePayload.given_name);
   console.log('Family Name: ' + responsePayload.family_name);
   console.log("Image URL: " + responsePayload.picture);
   console.log("Email: " + responsePayload.email);
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

export default {
    data() {
      return {}
    },
    mounted: function (){
      google.accounts.id.initialize({
        client_id: "240439775239-khrfib64ndsij9nndeoprqrg1gkogn4r.apps.googleusercontent.com",
        callback: handleCredentialResponse
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