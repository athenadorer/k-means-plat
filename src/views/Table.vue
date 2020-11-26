<template>
  <a-card title="表详情" style="width: 100%; min-height: calc(100vh - 32px)"
    ><template #extra
      ><a-button @click="$router.go(-1)">返回</a-button></template
    ><a-table
      :columns="table.columns"
      :data-source="table.dataSource"
      row-key="id"
      ><template #operation="{ record }">
        <span v-if="record.editable">
          <a class="operation" @click="save()">保存</a>
          <a-divider type="vertical" />
          <a class="operation" @click="cancel()">取消</a>
        </span>
        <span v-else>
          <a
            class="operation"
            v-bind="editingKey !== '' ? { disabled: 'disabled' } : {}"
            @click="edit(record.key)"
            >编辑</a
          >
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="remove(record.key)"
          >
            <a
              v-bind="editingKey !== '' ? { disabled: 'disabled' } : {}"
              class="operation"
              >删除</a
            ></a-popconfirm
          >
        </span>
      </template>
      <template
        v-for="column in columns"
        #[column]="{ text, record }"
        :key="column"
      >
        <div>
          <a-input
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            @change="(e) => onChange(record.key, column, e.target.value)"
            @blur="(e) => onBlur(record.key, column, e.target.value)"
          />
          <template v-else> {{ text }}({{ typeof text }}) </template>
        </div>
      </template>
    </a-table>
  </a-card>
</template>

<script>
export default {
  data() {
    return {
      table: {
        columns: [],
        dataSource: [],
      },
      editingKey: '',
      editCache: null,
    }
  },
  computed: {
    columns() {
      return this.table.columns
        .filter((column) => column.dataIndex !== 'operation')
        .map((column) => column.dataIndex)
    },
  },
  mounted() {
    this.fetch()
  },
  methods: {
    fetch() {
      this.$store
        .getItem(this.$route.params.key)
        .then((table) => (this.table = table))
        .then(() => {
          this.table.columns = this.table.columns.map((column) => ({
            ...column,
            slots: { customRender: column.dataIndex },
          }))
          this.table.columns.push({
            title: '操作',
            dataIndex: 'operation',
            width: 105,
            slots: { customRender: 'operation' },
          })
          this.table.dataSource = this.table.dataSource.map((dataRow) => ({
            ...dataRow,
            key: this.$createHash(),
          }))
        })
    },
    remove(key) {
      this.table.dataSource = this.table.dataSource.filter(
        (dataRow) => dataRow.key !== key
      )
    },
    edit(key) {
      this.table.dataSource = this.table.dataSource.map((dataRow) => {
        if (dataRow.key === key) {
          this.editCache = JSON.parse(JSON.stringify(dataRow))
          dataRow.editable = true
        }
        return dataRow
      })
      this.editingKey = key
    },
    save() {
      this.table.dataSource = this.table.dataSource.map((dataRow) => {
        if (dataRow.key === this.editingKey) {
          dataRow.editable = false
        }
        return dataRow
      })
      this.editingKey = ''
    },
    cancel() {
      this.table.dataSource = this.table.dataSource.map((dataRow) => {
        if (dataRow.key === this.editingKey) {
          dataRow = this.editCache
        }
        return dataRow
      })
      this.editingKey = ''
    },
    onChange(key, column, value) {
      this.table.dataSource = this.table.dataSource.map((dataRow) => {
        if (dataRow.key === key) {
          dataRow[column] = value
        }
        return dataRow
      })
    },
    onBlur(key, column, value) {
      this.table.dataSource = this.table.dataSource.map((dataRow) => {
        if (dataRow.key === key) {
          if (value !== '') {
            dataRow[column] = Number.isNaN(+value) ? value : +value
          }
        }
        return dataRow
      })
    },
  },
}
</script>

<style scoped>
a.operation {
  user-select: none;
}
</style>
