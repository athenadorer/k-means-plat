<template>
  <a-card title="数据输入" class="main">
    <template #extra>
      <a-button type="primary" @click="createModal = { visible: true }"
        >创建新表</a-button
      >
      <a-button @click="fetch">刷新</a-button>
    </template>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :show-header="Boolean(dataSource.length)"
      bordered
      ><template #operation="{ record }">
        <a class="operation" @click="check(record.key)">查看</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="确定要删除吗？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="remove(record.key)"
        >
          <a class="operation">删除</a>
        </a-popconfirm>
      </template>
      <template #validity="{ text }">
        <a-tag style="user-select: none; font-size: 14px" :color="text.state"
          ><component :is="getIcon(text.state)" />&nbsp;{{ text.text }}</a-tag
        >
      </template>
      <template #createTime="{ text }">{{
        `${text.toLocaleDateString()} ${text.toTimeString()}`
      }}</template>
    </a-table>
    <CreateTable
      v-if="createModal"
      :visible="createModal.visible"
      @close="createModal.visible = false"
      @after-close="createModal = undefined"
    />
  </a-card>
</template>

<script>
import CreateTable from '@/components/CreateTable.vue'
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'

export default {
  components: {
    CreateTable,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
  },
  data() {
    return {
      loading: true,
      createModal: undefined,
      columns: [
        {
          title: '数据表名',
          ellipsis: true,
          dataIndex: 'name',
        },
        {
          title: '数据列',
          ellipsis: true,
          dataIndex: 'columns',
        },
        {
          title: '创建时间',
          ellipsis: true,
          dataIndex: 'createTime',
          slots: { customRender: 'createTime' },
        },
        {
          title: '数据量',
          width: 74,
          dataIndex: 'dataVolume',
        },
        {
          title: '有效性',
          width: 192,
          dataIndex: 'validity',
          slots: { customRender: 'validity' },
        },
        {
          title: '操作',
          width: 106,
          dataIndex: 'operation',
          slots: { customRender: 'operation' },
        },
      ],
      dataSource: [],
    }
  },
  mounted() {
    window.store = this.$store
    this.fetch()
  },
  methods: {
    log(...args) {
      console.log('log', ...args)
    },
    fetch() {
      this.loading = true
      const dataSource = []
      this.$store
        .iterate((table, key) => {
          dataSource.push({
            key,
            name: table.name,
            columns: String(
              table.columns.map((column) => column.dataIndex).join(' ')
            ),
            dataVolume: table.dataSource.length,
            validity: table.validity,
            createTime: new Date(table.timestamp),
          })
        })
        .then(() => {
          this.dataSource = dataSource.sort(
            (ta, tb) => tb.createTime - ta.createTime
          )
        })
        .finally(() => {
          this.loading = false
        })
    },
    remove(key) {
      this.$store.removeItem(key).then(this.fetch)
    },
    check(key) {
      this.$router.push({ name: 'table', params: { key } })
    },
    getIcon(state) {
      if (state === 'success') return 'CheckCircleOutlined'
      if (state === 'warning') return 'ExclamationCircleOutlined'
      if (state === 'error') return 'CloseCircleOutlined'
    },
  },
}
</script>

<style scoped>
a.operation {
  user-select: none;
}

.ant-btn + .ant-btn {
  margin-left: 8px;
}

.ant-tag.state {
  font-size: 14px;
  margin-left: 8px;
}

::v-deep(td),
::v-deep(th) {
  white-space: nowrap;
}
</style>
