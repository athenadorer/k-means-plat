import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'ant-design-vue/dist/antd.css'
import Breadcrumb from 'ant-design-vue/lib/breadcrumb'
import Button from 'ant-design-vue/lib/button'
import Card from 'ant-design-vue/lib/card'
import Divider from 'ant-design-vue/lib/divider'
import Form from 'ant-design-vue/lib/form'
import Input from 'ant-design-vue/lib/input'
import Layout from 'ant-design-vue/lib/layout'
import Menu from 'ant-design-vue/lib/menu'
import Modal from 'ant-design-vue/lib/modal'
import Popconfirm from 'ant-design-vue/lib/popconfirm'
import Table from 'ant-design-vue/lib/table'
import Tag from 'ant-design-vue/lib/tag'
import Upload from 'ant-design-vue/lib/upload'
import Select from 'ant-design-vue/lib/select'
import Radio from 'ant-design-vue/lib/radio'

import localForage from 'localforage'

const app = createApp(App)

app.use(router)

app.use(Breadcrumb)
app.use(Button)
app.use(Card)
app.use(Divider)
app.use(Form)
app.use(Input)
app.use(Layout)
app.use(Menu)
app.use(Modal)
app.use(Popconfirm)
app.use(Table)
app.use(Tag)
app.use(Upload)
app.use(Select)
app.use(Radio)

app.config.globalProperties.$store = localForage.createInstance({
  name: 'tables',
})

app.config.globalProperties.$createHash = (length) =>
  Array.from(Array(+length || 24), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')

app.mount('#app')
