import { createStore } from 'vuex';
import VueCookies from 'vue-cookies';

export default createStore({
    state() {
        return {
            login: '',
        };
    },
    mutations: {
        setLogin(state, login) {
            state.login = login;
        },
    },
    actions: {
        loadLoginFromCookies({ commit }) {
            const login = VueCookies.get('login');
            if (login) {
                commit('setLogin', login);
            }
        },
    },
});
