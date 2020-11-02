import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import Layout from 'ant-design-vue/lib/layout'
import Menu from 'ant-design-vue/lib/menu'
import Button from 'ant-design-vue/lib/button'
import Breadcrumb from 'ant-design-vue/lib/breadcrumb'
import Table from 'ant-design-vue/lib/table'
import Card from 'ant-design-vue/lib/card'
import Input from 'ant-design-vue/lib/input'
import Popconfirm from 'ant-design-vue/lib/popconfirm'
import Tag from 'ant-design-vue/lib/tag'
import Divider from 'ant-design-vue/lib/divider'
import Modal from 'ant-design-vue/lib/modal'
import Form from 'ant-design-vue/lib/form'
import Upload from 'ant-design-vue/lib/upload'
import 'ant-design-vue/dist/antd.css'

import localForage from 'localforage'

const app = createApp(App)

app.use(router)

app.use(Layout)
app.use(Menu)
app.use(Button)
app.use(Breadcrumb)
app.use(Table)
app.use(Card)
app.use(Input)
app.use(Popconfirm)
app.use(Tag)
app.use(Divider)
app.use(Modal)
app.use(Form)
app.use(Upload)

app.config.globalProperties.$store = localForage.createInstance({
  name: 'tables',
})

app.config.globalProperties.$createHash = (length) =>
  Array.from(Array(+length || 24), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')

app.mount('#app')
