import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(createPersistedState());

export { store };

export * from './modules/customer';
export * from './modules/notification';
export * from './modules/permission';
export * from './modules/project';
export * from './modules/setting';
export * from './modules/tabs-router';
export * from './modules/task';
export * from './modules/user';

export default store;
