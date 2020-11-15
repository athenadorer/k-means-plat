<template>
  <a-card title="表详情" style="width: 100%; min-height: calc(100vh - 32px)"
    ><template #extra
      ><a-button @click="this.$router.go(-1)">返回</a-button></template
    ><a-table
      :columns="table.columns"
      :data-source="table.dataSource"
      row-key="id"
    >
    </a-table>
    {{ JSON.stringify(table) }}
  </a-card>
</template>

<script>
export default {
  data() {
    return {
      table: {},
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    fetch() {
      this.$store
        .getItem(this.$route.params.key)
        .then((table) => (this.table = table))
    },
  },
}
</script>
