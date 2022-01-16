
import {createApp} from "vue";
import App from './App.vue';

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;
const app = createApp(App).mount('#app');