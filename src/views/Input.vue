<template>
  <a-card title="数据输入" style="width: 100%; min-height: calc(100vh - 32px)">
    <template #extra
      ><a-button type="primary" @click="visible = true">
        创建数据表
      </a-button></template
    >
    <a-table :columns="columns" :data-source="dataSource"
      ><template #operation="{ record }">
        <a @click="check(record.key)">查看</a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="确定要删除吗？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="remove(record.key)"
        >
          <a>删除</a>
        </a-popconfirm>
      </template>
    </a-table>
    <CreateTable :visible="visible" @close="onClose" />
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
      visible: false,
      columns: [
        {
          title: '表名',
          dataIndex: 'name',
        },
        {
          title: '哈希值',
          dataIndex: 'key',
        },
        {
          title: '列名',
          dataIndex: 'columns',
        },
        {
          title: '数据源',
          dataIndex: 'dataSource',
        },
        {
          title: '操作',
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
    fetch() {
      const dataSource = []
      this.$store
        .iterate((table, key) => {
          dataSource.push({
            key,
            name: table.name,
            columns: String(table.columns.map((column) => column.title)),
            dataSource: JSON.stringify(table.dataSource),
            timestamp: table.timestamp,
          })
        })
        .then(() => {
          this.dataSource = dataSource.sort(
            (ta, tb) => tb.timestamp - ta.timestamp
          )
        })
    },
    remove(key) {
      this.$store.removeItem(key).then(this.fetch)
    },
    check(key) {
      this.$store.getItem(key).then(console.log)
    },
    onClose(changed) {
      this.visible = false
      if (changed) this.fetch()
    },
  },
}
</script>

<style scoped></style>
