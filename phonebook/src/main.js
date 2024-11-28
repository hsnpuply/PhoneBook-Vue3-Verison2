/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker'


// Composables
import { createApp } from 'vue'
import './assets/tailwind.css'


const app = createApp(App)
app.component('DatePicker', Vue3PersianDatetimePicker)

registerPlugins(app)
app.use(Vue3PersianDatetimePicker, {
    name: 'CustomDatePicker',
    props: {
      format: 'YYYY-MM-DD HH:mm',
      displayFormat: 'jYYYY-jMM-jDD',
      editable: false,
      inputClass: 'form-control my-custom-class-name',
      placeholder: 'Please select a date',
      altFormat: 'YYYY-MM-DD HH:mm',
      color: '#00acc1',
      autoSubmit: false,
      //...
      //... And whatever you want to set as default.
      //...
    }
  }).mount('#app')
