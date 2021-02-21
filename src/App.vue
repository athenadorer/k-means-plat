<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" theme="light" collapsible>
      <a-menu
        v-model:selected-keys="selectedKeys"
        mode="inline"
        style="user-select: none"
        :default-open-keys="['function']"
      >
        <a-menu-item key="home">
          <HomeOutlined /><span>首页</span>
        </a-menu-item>
        <a-sub-menu key="function">
          <template #title>
            <span><AppstoreOutlined /><span>功能</span></span>
          </template>
          <a-menu-item key="tables"
            ><TableOutlined /><span>数据输入</span></a-menu-item
          >
          <a-menu-item key="clusters">
            <DotChartOutlined /><span>聚类分析</span></a-menu-item
          >
          <a-menu-item key="history">
            <HistoryOutlined /><span>历史记录</span>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="about"
          ><InfoCircleOutlined /><span>关于</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content style="margin: 16px; margin-right: 0">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import {
  HistoryOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  DotChartOutlined,
  TableOutlined,
} from '@ant-design/icons-vue'
export default {
  components: {
    HistoryOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    AppstoreOutlined,
    DotChartOutlined,
    TableOutlined,
  },
  data() {
    return {
      collapsed: false,
    }
  },
  computed: {
    selectedKeys: {
      get() {
        return [this.$route.name]
      },
      set([routeName]) {
        this.$router.push({ name: routeName })
      },
    },
  },
}
</script>

<style>
html {
  overflow-y: scroll;
}

.ant-card.main {
  width: 100%;
  min-height: calc(100vh - 32px);
}

.ant-tooltip-placement-top .ant-tooltip-arrow::before,
.ant-tooltip-placement-topLeft .ant-tooltip-arrow::before,
.ant-tooltip-placement-topRight .ant-tooltip-arrow::before {
  transform: translateY(-6.53553391px) rotate(45deg);
}
</style>
