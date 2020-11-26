<template>
  <a-card title="数据输入" style="width: 100%; min-height: calc(100vh - 32px)">
    <template #extra
      ><a-button type="primary" @click="visible = true">
        创建数据表
      </a-button></template
    >
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :show-header="Boolean(dataSource.length)"
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
          width: '10%',
          dataIndex: 'name',
        },
        {
          title: '列名',
          width: '12%',
          dataIndex: 'columns',
        },
        {
          title: '数据源',
          ellipsis: true,
          dataIndex: 'dataSource',
        },
        {
          title: '操作',
          width: 105,
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
      this.$router.push({ name: 'table', params: { key } })
    },
    onClose(changed) {
      this.visible = false
      if (changed) this.fetch()
    },
  },
}
</script>

<style scoped>
a.operation {
  user-select: none;
}
</style>
