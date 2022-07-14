import Profile from './profile.js';

export default {
    data() {
      return {
        salute: 'Hey pal!'
      }
    },
    components: {
        Profile
    },
    template:
    `
        <div>
            <h1>Welcome</h1>
            <ul>
              <li>Resource</li>
              <li>Recipe</li>
              <li>Worker</li>
              <li>Date</li>
              <li>Stronghold</li>
              <li>Login</li>
            </ul>
        </div>

        <Profile></Profile>
    `
}