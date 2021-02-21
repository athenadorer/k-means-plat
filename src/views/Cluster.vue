<template>
  <a-card class="main"
    ><template #title
      >{{ title
      }}<a-tag v-if="title" class="mode" color="#41b883"
        ><DotChartOutlined />&nbsp;聚类模式</a-tag
      ></template
    ><template #extra
      ><a-button @click="$router.go(-1)">返回</a-button></template
    >
    <a-tabs
      v-model:activeKey="activeKey"
      hide-add
      type="editable-card"
      @edit="onEdit"
    >
      <a-tab-pane key="original" tab="原始数据" :closable="false">
        <a-form layout="inline" :model="options" style="margin-bottom: 16px">
          <a-form-item label="簇数量">
            <a-input-number
              v-model:value="options.k"
              :min="1"
              :max="
                options.initMethod === 0
                  ? dataSource.length
                  : new Set(pointList.map((e) => String(e.coords))).size
              "
            />
          </a-form-item>
          <a-form-item label="初始化方法">
            <a-radio-group v-model:value="options.initMethod">
              <a-radio-button :value="0"
                ><span>随机划分方法</span
                ><a-tooltip
                  title="在范围内随机的生成中心点，簇数量不能大于数据集中行的数量。"
                  ><QuestionCircleOutlined
                /></a-tooltip>
              </a-radio-button>
              <a-radio-button :value="1"
                ><span>Forgy方法</span
                ><a-tooltip
                  title="在数据集中随机选择中心点，簇数量不能大于数据集中不重复的数据行的数量。"
                  ><QuestionCircleOutlined
                /></a-tooltip>
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="操作">
            <a-button type="primary" @click="init">初始化中心点</a-button>
          </a-form-item>
          <a-form-item>
            <a-input-group compact>
              <a-input
                readonly
                value="进行"
                class="input2span"
                style="width: 3.5em"
              />
              <a-input-number v-model:value="options.iterate" :min="1" />
              <a-input
                readonly
                value="次"
                class="input2span"
                style="width: 2.5em"
              />
              <a-button type="primary" @click="iterate">聚类迭代</a-button>
            </a-input-group>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="run">聚类直到完成</a-button>
          </a-form-item>
        </a-form>
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
          <template
            v-for="columnName in userColumnNames"
            #[columnName+`-render`]="{ text }"
            :key="`${columnName}-render`"
            ><span :class="typeof text">{{
              Number.isInteger(text) ? text.toFixed(1) : text
            }}</span>
          </template>
          <template
            v-for="column in userColumns"
            #[column.dataIndex+`-title`]
            :key="`${column.dataIndex}-title`"
            ><span>{{ column.dataIndex }}</span>
            <a-tooltip :title="column.data ? '数据列' : '无关列'">
              <component
                :is="
                  column.data ? 'CheckCircleOutlined' : 'MinusCircleOutlined'
                "
                style="cursor: default"
              ></component>
            </a-tooltip>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane
        v-for="cluster in clusters"
        :key="cluster.key"
        :tab="cluster.title"
        :closable="true"
      >
        <div
          v-if="cluster.data.clusterSet[0].center.length <= 3"
          id="chart"
          style="width: 50%; height: 500px"
        />
        <a-table
          :columns="cluster.table.columns"
          :data-source="cluster.table.dataSource"
          :loading="loading"
          :pagination="{ pageSize: Infinity, hideOnSinglePage: true }"
          bordered
          :default-expanded-row-keys="
            cluster.data.clusterSet
              .filter((cluster) => cluster.members.length)
              .map((cluster) => cluster.id)
          "
          row-key="id"
        >
          <template #expandedRowRender="{ record }">
            <a-table
              :columns="record.innerTable.columns"
              :data-source="record.innerTable.dataSource"
              :loading="loading"
              :pagination="{ pageSize: Infinity, hideOnSinglePage: true }"
              row-key="__id__"
              class="inner"
              ><template #__id__="{ text }"
                ><span style="width: max-content; display: inline-block">
                  {{ text }}
                </span></template
              >
              <template
                v-for="columnName in userColumnNames"
                #[columnName+`-render`]="{ text }"
                :key="`${columnName}-render`"
                ><span :class="typeof text">{{
                  Number.isInteger(text) ? text.toFixed(1) : text
                }}</span>
              </template>
              <template
                v-for="column in userColumns"
                #[column.dataIndex+`-title`]
                :key="`${column.dataIndex}-title`"
                ><span>{{ column.dataIndex }}</span>
                <a-tooltip :title="column.data ? '数据列' : '无关列'">
                  <component
                    :is="
                      column.data
                        ? 'CheckCircleOutlined'
                        : 'MinusCircleOutlined'
                    "
                    style="cursor: default"
                  ></component>
                </a-tooltip>
              </template>
            </a-table>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  CloseCircleFilled,
  DotChartOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue'

import 'echarts-gl'

export default {
  components: {
    CheckCircleOutlined,
    MinusCircleOutlined,
    CheckCircleFilled,
    ExclamationCircleFilled,
    CloseCircleFilled,
    DotChartOutlined,
    QuestionCircleOutlined,
  },
  data() {
    return {
      loading: true,
      title: '',
      columns: [],
      dataSource: [],
      activeKey: 'original',
      clusters: [],
      options: {
        k: 3,
        iterate: 1,
        initMethod: 0,
      },
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
    pointList() {
      return this.dataSource.map((dataRow) => ({
        id: dataRow.__id__,
        coords: this.dataColumns.map(
          (dataColumn) => dataRow[dataColumn.dataIndex]
        ),
      }))
    },
  },
  mounted() {
    this.fetch()
  },
  methods: {
    log(...args) {
      console.log(...args)
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
    generate(key, data) {
      return {
        key,
        title: `聚类-${key.slice(0, 4)}`,
        data,
        table: {
          columns: [
            {
              title: '簇编号',
              dataIndex: 'id',
              width: 75,
            },
            {
              title: '点数量',
              dataIndex: 'number',
            },
            {
              title: '簇中心',
              dataIndex: 'center',
            },
          ],
          dataSource: data.clusterSet.map((cluster) => ({
            id: cluster.id,
            center: cluster.center.toString(),
            number: cluster.members.length,
            innerTable: {
              columns: [
                ...this.columns,
                {
                  title: '与簇中心欧氏距离',
                  dataIndex: 'distance',
                },
              ],
              dataSource: this.dataSource
                .filter((dataRow) =>
                  cluster.members
                    .map((point) => point.id)
                    .includes(dataRow.__id__)
                )
                .map((dataRow) => ({
                  ...dataRow,
                  distance: cluster.members.find(
                    (point) => point.id === dataRow.__id__
                  ).distance,
                })),
            },
          })),
        },
      }
    },
    chart(chart, data, d) {
      if (d === 2) {
        chart.setOption({
          tooltip: {
            formatter: (data) =>
              data.value[2] === 'center'
                ? `Cluster ${data.seriesIndex + 1} Center (${data.value.slice(
                    0,
                    2
                  )})`
                : `Point ${data.value[2]} (${data.value.slice(0, 2)})
                      Distance: ${data.value[3]}`,
          },
          xAxis: {},
          yAxis: {},
          series: data.clusterSet.map((cluster) => ({
            symbolSize: (data) => (data[2] === 'center' ? 20 : 10),
            data: [
              [...cluster.center, 'center'],
              ...cluster.members.map((point) => [
                ...point.coords,
                point.id,
                point.distance,
              ]),
            ],
            type: 'scatter',
          })),
        })
      } else if (d === 3) {
        chart.setOption({
          tooltip: {
            formatter: (data) =>
              data.value[3] === 'center'
                ? `Cluster ${data.seriesIndex + 1} Center (${data.value.slice(
                    0,
                    3
                  )})`
                : `Point ${data.value[3]} (${data.value.slice(0, 3)})
                      Distance: ${data.value[4]}`,
          },
          grid3D: {},
          xAxis3D: {},
          yAxis3D: {},
          zAxis3D: {},
          series: data.clusterSet.map((cluster) => ({
            symbolSize: (data) => (data[3] === 'center' ? 20 : 10),
            data: [
              [...cluster.center, 'center'],
              ...cluster.members.map((point) => [
                ...point.coords,
                point.id,
                point.distance,
              ]),
            ],
            type: 'scatter3D',
          })),
        })
      }
    },
    execute(response) {
      let key = this.$createHash()
      this.clusters.push(this.generate(key, response.data))
      this.activeKey = key
      let d = response.data.clusterSet[0].center.length
      if (d === 2 || d === 3)
        this.$nextTick(() => {
          this.chart(
            this.$echarts.init(document.getElementById('chart')),
            response.data,
            d
          )
        })
    },
    init() {
      this.$http
        .post('cluster/init', {
          k: this.options.k,
          pointList: this.pointList,
          initMethod: this.options.initMethod,
        })
        .then(this.execute)
        .catch((error) => {
          console.log(error)
        })
    },
    iterate() {
      this.$http
        .post('cluster/iterate', {
          k: this.options.k,
          pointList: this.pointList,
          initMethod: this.options.initMethod,
        })
        .then(this.execute)
        .catch((error) => {
          console.log(error)
        })
    },
    run() {
      this.$http
        .post('cluster/run', {
          k: this.options.k,
          pointList: this.pointList,
          initMethod: this.options.initMethod,
        })
        .then(this.execute)
        .catch((error) => {
          console.log(error)
        })
    },
    getIcon(state) {
      if (state === 'success') return 'CheckCircleFilled'
      if (state === 'warning') return 'ExclamationCircleFilled'
      if (state === 'error') return 'CloseCircleFilled'
    },
    onEdit(targetKey, action) {
      this[action](targetKey)
    },
    remove(targetKey) {
      this.clusters = this.clusters.filter(
        (cluster) => cluster.key !== targetKey
      )
      if (this.activeKey === targetKey) {
        this.activeKey = 'original'
      }
    },
  },
}
</script>

<style scoped>
.input2span {
  background-color: #fafafa;
  pointer-events: none;
  text-align: center;
  padding: 4px 0;
}

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

.inner ::v-deep(table) {
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
