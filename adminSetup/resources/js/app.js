/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');
import { Form, HasError, AlertError } from 'vform';
import moment from 'moment';
import VueProgressBar from 'vue-progressbar';
import swal from 'sweetalert2';


import Gate from "./Gate";
Vue.prototype.$gate = new Gate(window.user);

window.swal = swal;


const toast = swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000
});

window.toast = toast;


const options = {
    color: '#bffaf3',
    failedColor: '#874b4b',
    thickness: '5px',
}

window.Form = Form;

Vue.component(HasError.name, HasError);
Vue.component(AlertError.name, AlertError);
Vue.use(VueProgressBar, options);
Vue.component('pagination', require('laravel-vue-pagination'));


import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    { path: '/dashboard', component: require('./components/Dashboard.vue').default },
    { path: '/developer', component: require('./components/Developer.vue').default },
    { path: '/profile', component: require('./components/Profile.vue').default },
    { path: '/users', component: require('./components/Users.vue').default },
    { path: '/*', component: require('./components/Notfound.vue').default }
]

const router = new VueRouter({
    mode: 'history',
    routes // short for `routes: routes`
})

Vue.filter('uptext', function (text) {
    if (!text) return ''
    text = text.toString()
    return text.charAt(0).toUpperCase() + text.slice(1)
});

Vue.filter('humantime', function (date) {
    return moment(date).format("MMM Do YY");
});

window.Fire = new Vue();


Vue.component(
    'passport-clients',
    require('./components/passport/Clients.vue').default
);

Vue.component(
    'passport-authorized-clients',
    require('./components/passport/AuthorizedClients.vue').default
);

Vue.component(
    'passport-personal-access-tokens',
    require('./components/passport/PersonalAccessTokens.vue').default
);

Vue.component(
    'not-found',
    require('./components/Notfound.vue').default
);


/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i);
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default));

Vue.component('example-component', require('./components/ExampleComponent.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
    el: '#app',
    router,
    data:{
        search:''
    },
    methods:{
        searchit: _.debounce(()=>{
            Fire.$emit('searching');
        }, 2000),
        printme() {
            window.print();
        }
    }
});
