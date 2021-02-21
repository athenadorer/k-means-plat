<template>
  <a-card class="main"
    ><template #title
      >{{ title
      }}<a-tag v-if="editMode" class="mode" color="#40a9ff"
        ><FormOutlined />&nbsp;编辑模式</a-tag
      ></template
    ><template #extra
      ><input
        ref="fileInput"
        type="file"
        accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style="display: none"
        @change="$refs.fileInput.files.length && parse()"
      /><a-button
        v-if="editMode"
        :disabled="editingRow !== false"
        type="primary"
        @click="resetId"
        >重置编号</a-button
      ><a-button
        v-if="editMode"
        :disabled="editingRow !== false"
        type="primary"
        @click="$refs.fileInput.click()"
        >导入数据</a-button
      ><a-button
        v-if="editMode"
        :disabled="editingRow !== false"
        type="primary"
        @click="append"
        >增加数据</a-button
      ><a-button
        type="primary"
        :disabled="editingRow !== false"
        @click="editMode ? exitEditMode(true) : (editMode = true)"
        >{{ editMode ? '保存编辑' : '编辑模式' }}</a-button
      ><a-button
        :disabled="editingRow !== false"
        v-bind="editMode ? { type: 'danger' } : {}"
        @click="editMode ? exitEditMode(false) : $router.go(-1)"
        >{{ editMode ? '退出编辑' : '返回' }}</a-button
      ></template
    >
    <div style="margin-bottom: 24px">
      <a-spin :spinning="loading">
        <a-collapse>
          <a-collapse-panel header="有效性检查"
            ><a-list size="small" bordered :data-source="validators">
              <template #renderItem="{ item }">
                <a-list-item :class="item.state"
                  ><component
                    :is="getIcon(item.state)"
                    style="margin-right: 8px"
                  ></component
                  >{{ item.text }}</a-list-item
                >
              </template>
            </a-list>
          </a-collapse-panel></a-collapse
        >
        <a-list
          size="small"
          bordered
          :data-source="[validity]"
          style="border-top: 0"
          ><template #renderItem="{ item }">
            <a-list-item :class="item.state" style="padding: 12px 16px"
              ><component
                :is="getIcon(item.state)"
                style="margin-right: 8px"
              ></component
              >{{ item.text }}</a-list-item
            >
          </template></a-list
        ></a-spin
      >
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{ pageSize: Infinity, hideOnSinglePage: true }"
      bordered
      row-key="__id__"
      ><template #__id__="{ text }"
        ><span style="width: max-content; display: inline-block">
          {{ text }}
        </span></template
      >
      <template #__operation__="{ record }">
        <span v-if="record.__id__ === editingRow" style="white-space: nowrap">
          <a class="operation" @click="exitEditRow(true)">保存</a>
          <a-divider type="vertical" />
          <a class="operation" @click="exitEditRow(false)">取消</a>
        </span>
        <span v-else style="white-space: nowrap">
          <a
            class="operation"
            v-bind="
              !editMode || editingRow !== false ? { disabled: 'disabled' } : {}
            "
            @click="editRow(record.__id__)"
            >编辑</a
          >
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="removeRow(record.__id__)"
            ><a
              v-bind="
                !editMode || editingRow !== false
                  ? { disabled: 'disabled' }
                  : {}
              "
              class="operation"
              >删除</a
            ></a-popconfirm
          >
        </span>
      </template>
      <template
        v-for="(columnName, index) in userColumnNames"
        #[columnName+`-render`]="{ text, record }"
        :key="`${columnName}-render`"
      >
        <div>
          <a-input
            v-if="record.__id__ === editingRow"
            :ref="`input${record.__id__}.${index}`"
            style="margin: -5px 0"
            :value="text"
            @change="(e) => onChange(record.__id__, columnName, e.target.value)"
            @blur="(e) => onBlur(record.__id__, columnName, e.target.value)"
            @pressEnter="exitEditRow(true)"
          />
          <template v-else>
            <span :class="typeof text">{{
              Number.isInteger(text) ? text.toFixed(1) : text
            }}</span>
          </template>
        </div>
      </template>
      <template
        v-for="column in userColumns"
        #[column.dataIndex+`-title`]
        :key="`${column.dataIndex}-title`"
        ><span>{{ column.dataIndex }}</span>
        <a-tooltip :title="column.data ? '数据列' : '无关列'">
          <component
            :is="column.data ? 'CheckCircleOutlined' : 'MinusCircleOutlined'"
            :style="{ cursor: editMode ? 'pointer' : 'default' }"
            @click="column.data = editMode ? !column.data : column.data"
          ></component>
        </a-tooltip>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { toRaw } from 'vue'
import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  CloseCircleFilled,
  FormOutlined,
} from '@ant-design/icons-vue'
import message from 'ant-design-vue/lib/message'
import XLSX from 'xlsx'
export default {
  components: {
    CheckCircleOutlined,
    MinusCircleOutlined,
    CheckCircleFilled,
    ExclamationCircleFilled,
    CloseCircleFilled,
    FormOutlined,
  },
  data() {
    return {
      loading: true,
      editMode: false,
      editingRow: false,
      title: '',
      columns: [],
      dataSource: [],
      dataSourceBackup: undefined,
    }
  },
  computed: {
    userColumns() {
      return this.columns.filter(
        (column) => !~['__id__', '__operation__'].indexOf(column.dataIndex)
      )
    },
    userColumnNames() {
      return this.userColumns.map((column) => column.dataIndex)
    },
    dataColumns() {
      return this.userColumns.filter((column) => column.data)
    },
    irrelevantColumns() {
      return this.userColumns.filter((column) => !column.data)
    },
    nextRowId() {
      return (
        Math.max(...this.dataSource.map((dataRow) => dataRow.__id__), 0) + 1
      )
    },
    validators() {
      const validators = []
      const dataValidator = {
        state: this.dataSource.length ? 'success' : 'error',
        text: this.dataSource.length ? '表中有数据' : '表中没有数据',
      }
      validators.push(dataValidator)
      const dataColumnValidator = {}
      if (this.dataColumns.length === 0) {
        dataColumnValidator.state = 'error'
        dataColumnValidator.text = '表中没有数据列'
      } else if (this.dataColumns.length === 1) {
        dataColumnValidator.state = 'warning'
        dataColumnValidator.text = '表中数据列较少'
      } else if (this.dataColumns.length > 3) {
        dataColumnValidator.state = 'warning'
        dataColumnValidator.text = '表中数据列较多'
      } else {
        dataColumnValidator.state = 'success'
        dataColumnValidator.text = '表中有数据列'
      }
      validators.push(dataColumnValidator)
      const irrelevantColumnValidator = {
        state: this.irrelevantColumns.length ? 'success' : 'warning',
        text: this.irrelevantColumns.length ? '表中有无关列' : '表中没有无关列',
      }
      validators.push(irrelevantColumnValidator)
      if (dataColumnValidator.state !== 'error') {
        const dataColumnTypeValidator = { state: 'error' }
        if (
          this.dataColumns.some((dataColumn) =>
            this.dataSource.some(
              (dataRow) =>
                dataRow[dataColumn.dataIndex] === undefined ||
                dataRow[dataColumn.dataIndex] === ''
            )
          )
        ) {
          dataColumnTypeValidator.text = '数据列中含有空值'
          validators.push(dataColumnTypeValidator)
        } else if (
          this.dataColumns.some((dataColumn) =>
            this.dataSource.some(
              (dataRow) =>
                typeof dataRow[dataColumn.dataIndex] === 'string' &&
                Number.isNaN(+dataRow[dataColumn.dataIndex])
            )
          )
        ) {
          dataColumnTypeValidator.text = '数据列中含有字符串'
          validators.push(dataColumnTypeValidator)
        }
      }
      if (irrelevantColumnValidator.state === 'success') {
        const irrelevantColumnTypeValidator = { state: 'warning' }
        if (
          this.irrelevantColumns.some((dataColumn) =>
            this.dataSource.some(
              (dataRow) =>
                dataRow[dataColumn.dataIndex] === undefined ||
                dataRow[dataColumn.dataIndex] === ''
            )
          )
        ) {
          irrelevantColumnTypeValidator.text = '无关列中含有空值'
          validators.push(irrelevantColumnTypeValidator)
        } else if (
          this.irrelevantColumns.some((dataColumn) =>
            this.dataSource.some(
              (dataRow) =>
                typeof dataRow[dataColumn.dataIndex] === 'number' ||
                !Number.isNaN(+dataRow[dataColumn.dataIndex])
            )
          )
        ) {
          irrelevantColumnTypeValidator.text = '无关列中含有数字'
          validators.push(irrelevantColumnTypeValidator)
        }
      }
      if (dataValidator.state === 'success') {
        const haveDuplicateRow =
          new Set(
            this.$deepClone(this.dataSource).map((dataRow) => {
              delete dataRow.__id__
              return JSON.stringify(dataRow)
            })
          ).size < this.dataSource.length
        const duplicateRowValidator = {
          state: haveDuplicateRow ? 'warning' : 'success',
          text: haveDuplicateRow ? '表中有重复行' : '表中没有重复行',
        }
        validators.push(duplicateRowValidator)
      }
      return validators
    },
    validity() {
      const validity = {}
      if (this.validators.some((validator) => validator.state === 'error')) {
        validity.state = 'error'
      } else if (
        this.validators.some((validator) => validator.state === 'warning')
      ) {
        validity.state = 'warning'
      } else {
        validity.state = 'success'
      }
      if (validity.state === 'error') {
        validity.text = '当前表不可进行聚类'
      } else {
        validity.text = '当前表可以进行聚类'
      }
      return validity
    },
  },
  mounted() {
    this.fetch()
  },
  methods: {
    log(...args) {
      console.log('log', ...args)
    },
    fetch() {
      this.loading = true
      this.$store
        .getItem(this.$route.params.key)
        .then((table) => {
          this.title = table.name
          this.columns = table.columns
          this.dataSource = table.dataSource
          if (!table.validity) {
            table.validity = this.validity
            this.$store.setItem(this.$route.params.key, table)
          }
        })
        .then(() => {
          this.columns = this.columns.map((column) => ({
            ...column,
            slots: {
              title: `${column.dataIndex}-title`,
              customRender: `${column.dataIndex}-render`,
            },
          }))
          this.columns.push({
            title: '操作',
            dataIndex: '__operation__',
            width: 106,
            slots: { customRender: '__operation__' },
          })
          this.columns.unshift({
            title: '编号',
            dataIndex: '__id__',
            width: 61,
            slots: { customRender: '__id__' },
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    exitEditMode(save) {
      this.editMode = false
      if (save) {
        this.$store.getItem(this.$route.params.key).then((table) => {
          table.columns = toRaw(
            this.columns.filter(
              (column) => ~this.userColumnNames.indexOf(column.dataIndex)
            )
          ).map(toRaw)
          table.dataSource = toRaw(this.dataSource).map(toRaw)
          table.validity = this.validity
          this.$store.setItem(this.$route.params.key, table).then(() => {
            message.success('已保存', 1)
          })
        })
      } else {
        this.fetch()
      }
    },
    parse() {
      this.file = this.$refs.fileInput.files[0]
      this.$refs.fileInput.value = ''
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        })
        const id = this.nextRowId
        const sheetDataSource = sheetData.map((sheetRow, rowIndex) => {
          const dataRow = {}
          dataRow.__id__ = id + rowIndex
          sheetRow.forEach((data, index) => {
            if (this.userColumnNames[index])
              dataRow[this.userColumnNames[index]] = data
          })
          return dataRow
        })
        this.dataSource = [...this.dataSource, ...sheetDataSource]
      }
      reader.readAsArrayBuffer(this.file)
    },
    append() {
      this.dataSourceBackup = this.$deepClone(this.dataSource)
      const id = this.nextRowId
      this.dataSource.push({ __id__: id })
      this.editingRow = id
      this.$nextTick(() => {
        window.scrollTo(0, document.body.scrollHeight)
        this.$refs[`input${id}.0`].focus()
      })
    },
    removeRow(id) {
      this.dataSource = this.dataSource.filter(
        (dataRow) => dataRow.__id__ !== id
      )
    },
    editRow(id) {
      this.dataSourceBackup = this.$deepClone(this.dataSource)
      this.editingRow = id
      this.$nextTick(() => {
        this.$refs[`input${id}.0`].select()
      })
    },
    exitEditRow(save) {
      this.editingRow = false
      if (!save) {
        this.dataSource = this.dataSourceBackup
      }
    },
    resetId() {
      this.dataSource = this.dataSource.map((dataRow, index) => ({
        ...dataRow,
        __id__: index + 1,
      }))
    },
    onChange(id, column, value) {
      this.dataSource = this.dataSource.map((dataRow) => {
        if (dataRow.__id__ === id) {
          dataRow[column] = value
        }
        return dataRow
      })
    },
    onBlur(id, column, value) {
      this.dataSource = this.dataSource.map((dataRow) => {
        if (dataRow.__id__ === id) {
          if (value.trim() === '') {
            delete dataRow[column]
          } else {
            dataRow[column] = Number.isNaN(+value) ? value.trim() : +value
          }
        }
        return dataRow
      })
    },
    getIcon(state) {
      if (state === 'success') return 'CheckCircleFilled'
      if (state === 'warning') return 'ExclamationCircleFilled'
      if (state === 'error') return 'CloseCircleFilled'
    },
  },
}
</script>

<style scoped>
a.operation,
.ant-tag,
::v-deep(.ant-collapse-header) {
  user-select: none;
}

.ant-btn + .ant-btn,
span + .anticon {
  margin-left: 8px;
}

.ant-tag.mode {
  font-size: 14px;
  margin-left: 8px;
}

.anticon.anticon-check-circle {
  color: #52c41a;
}

.anticon.anticon-minus-circle {
  color: #1890ff;
}

.anticon.anticon-exclamation-circle {
  color: #faad14;
}

.anticon.anticon-close-circle {
  color: #f5222d;
}

.ant-list-item.success {
  background-color: rgb(246, 255, 237);
}

.ant-list-item.warning {
  background-color: rgb(255, 251, 230);
}

.ant-list-item.error {
  background-color: rgb(255, 241, 240);
}

::v-deep(.ant-collapse-content-box) {
  padding: 0;
}

::v-deep(.ant-collapse-content .ant-list-bordered) {
  border: 0;
}

::v-deep(td:first-child),
::v-deep(th:first-child) {
  text-align: center;
}

::v-deep(th) {
  white-space: nowrap;
}

span.string {
  color: #c51916;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

span.string:before,
span.string:after {
  content: '"';
  color: #c51916;
}

span.number {
  color: #1c00cf;
}

span.undefined:before {
  content: 'undefined';
  color: #808080;
}
</style>
