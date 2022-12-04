import { createApp } from 'vue'
import {Notify, Quasar} from 'quasar'
import App from './App.vue'

// Import Quasar icon libraries and css
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

const app = createApp(App);

app.use(Quasar, {
    plugins: {
        notify: Notify
    },
})

app.mount('#app');