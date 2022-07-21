import { parseJwt } from '../jwtParser.js'

export const logUser = function (response) {
    let idToken = response.credential;
    let responsePayload = parseJwt(response.credential);
    let userId = responsePayload.sub;
//            console.log("ID: " + userId);
//            console.log('Full Name: ' + responsePayload.name);
//            console.log('Given Name: ' + responsePayload.given_name);
//            console.log('Family Name: ' + responsePayload.family_name);
//            console.log("Image URL: " + responsePayload.picture);
//            console.log("Email: " + responsePayload.email);
    return {idToken: idToken, userId: userId, picture: responsePayload.picture,
        email: responsePayload.email, name: responsePayload.given_name};
};

export const mounted = function (component){
     google.accounts.id.initialize({
       client_id: "240439775239-khrfib64ndsij9nndeoprqrg1gkogn4r.apps.googleusercontent.com",
       callback: component.logUser
     });
     google.accounts.id.renderButton(
       document.getElementById("buttonDiv"),
       { theme: "outline", size: "large" }  // customization attributes
     );
}