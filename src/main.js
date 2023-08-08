import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from '../src/router/router'
import axios from 'axios'
// import Vue from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'
createApp(App)
.component('vue-draggable-resizable', VueDraggableResizable)
.use(router)
.mount('#app')
