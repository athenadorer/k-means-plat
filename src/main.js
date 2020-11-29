import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'ant-design-vue/dist/antd.css'
import Breadcrumb from 'ant-design-vue/lib/breadcrumb'
import Button from 'ant-design-vue/lib/button'
import Card from 'ant-design-vue/lib/card'
import Collapse from 'ant-design-vue/lib/collapse'
import Divider from 'ant-design-vue/lib/divider'
import Form from 'ant-design-vue/lib/form'
import Input from 'ant-design-vue/lib/input'
import Layout from 'ant-design-vue/lib/layout'
import List from 'ant-design-vue/lib/list'
import Menu from 'ant-design-vue/lib/menu'
import Modal from 'ant-design-vue/lib/modal'
import Popconfirm from 'ant-design-vue/lib/popconfirm'
import Radio from 'ant-design-vue/lib/radio'
import Select from 'ant-design-vue/lib/select'
import Table from 'ant-design-vue/lib/table'
import Tag from 'ant-design-vue/lib/tag'
import Tooltip from 'ant-design-vue/lib/tooltip'
import Upload from 'ant-design-vue/lib/upload'

import axios from 'axios'

import localForage from 'localforage'

const app = createApp(App)

app.use(router)

app.use(Breadcrumb)
app.use(Button)
app.use(Card)
app.use(Collapse)
app.use(Divider)
app.use(Form)
app.use(Input)
app.use(Layout)
app.use(List)
app.use(Menu)
app.use(Modal)
app.use(Popconfirm)
app.use(Radio)
app.use(Select)
app.use(Table)
app.use(Tag)
app.use(Tooltip)
app.use(Upload)

app.config.globalProperties.$http = axios

app.config.globalProperties.$store = localForage.createInstance({
  name: 'tables',
})

app.config.globalProperties.$createHash = (length) =>
  Array.from(Array(+length || 24), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')

app.config.globalProperties.$deepClone = (object) =>
  JSON.parse(JSON.stringify(object))

app.mount('#app')
