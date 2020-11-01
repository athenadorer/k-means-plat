import { createApp } from 'vue';
import App from './App.vue';
import Layout from 'ant-design-vue/lib/layout';
import Menu from 'ant-design-vue/lib/menu';
import Button from 'ant-design-vue/lib/button';
import Breadcrumb from 'ant-design-vue/lib/breadcrumb';
import 'ant-design-vue/dist/antd.css';

const app = createApp(App);
app.use(Layout);
app.use(Menu);
app.use(Button);
app.use(Breadcrumb);
app.mount('#app');