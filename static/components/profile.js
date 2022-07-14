window.onLogin = function(){
    alert("onLogin");
}

export default {
    data() {
      return {}
    },
    template:
    `
        <div id="g_id_onload"
             data-client_id="240439775239-khrfib64ndsij9nndeoprqrg1gkogn4r.apps.googleusercontent.com"
             data-context="signin"
             data-ux_mode="popup"
             data-auto_prompt="false">
        </div>

        <div class="g_id_signin"
             data-type="standard"
             data-shape="rectangular"
             data-theme="outline"
             data-text="$ {button.text}"
             data-size="large"
             data-logo_alignment="left">
        </div>
    `
}