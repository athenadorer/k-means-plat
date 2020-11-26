<template>
  <a-modal
    title="创建数据表"
    :visible="visible"
    :mask-closable="false"
    centered
    @cancel="close(false)"
  >
    <input
      ref="fileInput"
      type="file"
      accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      style="display: none"
      @change="$refs.fileInput.files.length && prepare()"
    />
    <a-button
      type="primary"
      style="width: 100%"
      @click="$refs.fileInput.click()"
    >
      <FileExcelOutlined />通过Excel文件创建
    </a-button>
    <template v-if="options.visible">
      <a-select
        v-model:value="options.sheetSelected"
        style="width: 100%; margin: 20px 0"
        placeholder="选择要解析的数据表"
        @change="parse"
      >
        <a-select-option
          v-for="sheet in options.sheets"
          :key="sheet"
          :value="sheet"
          >{{ sheet }}</a-select-option
        >
      </a-select>
      <a-radio-group
        v-model:value="options.preheaderIsColumn"
        style="width: 100%"
        @change="parse"
      >
        <a-radio-button :value="true" style="width: 50%; text-align: center"
          >将首行解析为列名</a-radio-button
        >
        <a-radio-button :value="false" style="width: 50%; text-align: center"
          >将首行解析为数据</a-radio-button
        >
      </a-radio-group>
    </template>
    <a-divider />
    <template #footer>
      <!-- <span class="prompt" :class="prompt.type"
        ><component
          :is="promptIcons[prompt.type]"
          style="margin-right: 4px"
        />{{ prompt.text }}</span
      > -->
      <a-button @click="close(false)">取消</a-button>
      <a-button type="primary" @click="submit">创建</a-button>
    </template>
    <a-form ref="tableForm" layout="vertical" :model="table"
      ><a-form-item
        ref="name"
        label="数据表名"
        name="name"
        :rules="{
          required: true,
          message: '请输入数据表名',
          trigger: 'change',
        }"
      >
        <a-input
          v-model:value="table.name"
          placeholder="请输入数据表名"
        /> </a-form-item
      ><a-form-item
        v-for="(column, index) in table.columns"
        :key="column.key"
        required
        :label="index === 0 ? '数据列（特征维度）' : ''"
        :name="['columns', index, 'value']"
        :rules="columnRule"
        ><a-input
          v-model:value="column.value"
          placeholder="请输入列名"
          style="margin-right: 8px; width: calc(100% - 32px)"
        />
        <MinusCircleOutlined
          :class="{ disabled: table.columns.length === 1 }"
          @click="remove(index)"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="dashed" style="width: 100%" @click="append">
          <PlusOutlined />增加一列
        </a-button>
      </a-form-item></a-form
    >
  </a-modal>
</template>

<script>
import {
  MinusCircleOutlined,
  PlusOutlined,
  FileExcelOutlined,
  // SmileOutlined,
  // MehOutlined,
  // FrownOutlined,
} from '@ant-design/icons-vue'
import message from 'ant-design-vue/lib/message'
import XLSX from 'xlsx'
export default {
  components: {
    MinusCircleOutlined,
    PlusOutlined,
    FileExcelOutlined,
    // SmileOutlined,
    // MehOutlined,
    // FrownOutlined,
  },
  props: {
    visible: Boolean,
  },
  emits: ['close'],
  data() {
    let validateSame = async (rule, value) => {
      if (!value) {
        return Promise.reject('请输入列名')
      } else if (
        this.table.columns.filter((column) => column.value === value).length > 1
      ) {
        return Promise.reject('列名不能重复')
      } else {
        return Promise.resolve()
      }
    }
    return {
      options: {
        visible: false,
        preheaderIsColumn: true,
        sheetSelected: undefined,
        sheets: [],
      },
      file: null,
      table: {
        name: '',
        columns: [],
        dataSource: [],
      },
      // promptIcons: {
      //   success: SmileOutlined,
      //   warning: MehOutlined,
      //   error: FrownOutlined,
      // },
      columnRule: { validator: validateSame, trigger: 'change' },
    }
  },
  // computed: {
  //   prompt() {
  //     if (this.table.columns.length <= 1) {
  //       return {
  //         type: 'error',
  //         text: '当前特征维度数量不足',
  //       }
  //     } else if (this.table.columns.length <= 3) {
  //       return {
  //         type: 'success',
  //         text: '当前特征维度数量良好',
  //       }
  //     } else {
  //       return {
  //         type: 'warning',
  //         text: '当前特征维度数量较多',
  //       }
  //     }
  //   },
  // },
  watch: {
    visible(visible) {
      if (visible) {
        this.table = {
          name: '',
          columns: [
            { key: this.$createHash(), value: '' },
            { key: this.$createHash(), value: '' },
          ],
          dataSource: [],
        }
      }
    },
  },
  methods: {
    prepare() {
      this.file = this.$refs.fileInput.files[0]
      this.$refs.fileInput.value = ''
      this.table.name = this.file.name.split('.')[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        this.options.sheets = workbook.SheetNames
        this.options.sheetSelected = undefined
        this.options.visible = true
      }
      reader.readAsArrayBuffer(this.file)
    },
    parse() {
      this.table.name = `${this.file.name.split('.')[0]}.${
        this.options.sheetSelected
      }`
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[this.options.sheetSelected]
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        })
        if (sheetData.length) {
          sheetData[0] = [...sheetData[0]]
          if (this.options.preheaderIsColumn) {
            sheetData[0] = sheetData[0].map((name) =>
              name ? String(name) : ''
            )
          } else {
            sheetData.unshift(sheetData[0].map(() => ''))
          }
          this.table.columns = sheetData[0].map((column, index) => ({
            key: this.table.columns[index]
              ? this.table.columns[index].key
              : this.$createHash(),
            value: column,
          }))
          this.table.dataSource = sheetData.slice(1)
        } else {
          this.table.columns = this.table.columns.map((column) => ({
            key: column.key,
            value: '',
          }))
          this.table.dataSource = []
        }
        this.$nextTick(() => {
          this.$refs.tableForm.validate()
        })
      }
      reader.readAsArrayBuffer(this.file)
    },
    append() {
      this.table.columns.push({ key: this.$createHash(), value: '' })
    },
    remove(index) {
      this.table.columns.splice(index, 1)
      this.table.dataSource.forEach((rowData) => rowData.splice(index, 1))
    },
    close(changed = false) {
      this.$emit('close', changed)
    },
    submit() {
      this.$refs.tableForm
        .validate()
        .then(() => {
          this.$store
            .setItem(this.$createHash(), {
              name: this.table.name,
              columns: this.table.columns.map((column) => ({
                title: column.value,
                dataIndex: column.value,
              })),
              dataSource: this.table.dataSource.map((rowData, rowIndex) => {
                const row = {}
                this.table.columns.forEach((column, index) => {
                  row[column.value] = rowData[index]
                  row.id = rowIndex + 1
                })
                return row
              }),
              timestamp: Date.now(),
            })
            .then(() => {
              message.success('创建成功')
              this.close(true)
            })
        })
        .catch(() => {})
    },
  },
}
</script>

<style scoped>
::placeholder,
::v-deep(.ant-form-explain) {
  user-select: none;
}

.anticon.disabled {
  pointer-events: none;
  opacity: 0.5;
}

/* .prompt {
  float: left;
  height: 32px;
  padding: 0 8px;
  line-height: 32px;
  user-select: none;
}

.prompt.success {
  background-color: rgb(246, 255, 237);
  border: 1px solid rgb(183, 235, 143);
}

.prompt.warning {
  background-color: rgb(255, 251, 230);
  border: 1px solid rgb(255, 229, 143);
}

.prompt.error {
  background-color: rgb(255, 241, 240);
  border: 1px solid rgb(255, 163, 158);
} */
</style>
