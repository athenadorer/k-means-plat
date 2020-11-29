<template>
  <a-card title="数据输入" style="width: 100%; min-height: calc(100vh - 32px)">
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
    </a-table>
    <CreateTable
      v-if="createModal"
      :visible="createModal.visible"
      @close="onClose"
      @after-close="createModal = undefined"
    />
  </a-card>
</template>

<script>
import CreateTable from '@/components/CreateTable.vue'

export default {
  components: {
    CreateTable,
  },
  data() {
    return {
      loading: true,
      createModal: undefined,
      columns: [
        {
          title: '表名',
          dataIndex: 'name',
        },
        {
          title: '列名',
          dataIndex: 'columns',
        },
        {
          title: '数据源',
          width: '70%',
          ellipsis: true,
          dataIndex: 'dataSource',
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
            dataSource: JSON.stringify(
              table.dataSource.map((dataRow) => {
                delete dataRow.__id__
                return dataRow
              })
            ),
            timestamp: table.timestamp,
          })
        })
        .then(() => {
          this.dataSource = dataSource.sort(
            (ta, tb) => tb.timestamp - ta.timestamp
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
    onClose(changed) {
      this.createModal.visible = false
      if (changed) this.fetch()
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
</style>
