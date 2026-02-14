<template>
  <form-create class="common-form-container" :rule="rule" v-model:api="api" :option="options" />
</template>
<script setup lang="ts">
import { ref } from 'vue';

const api = ref({});
const options = ref({
  onSubmit: (formData: any) => {
    console.log(formData);
  },
  resetBtn: true,
});
const rule = ref([
  {
    type: 'input',
    field: 'goods_name',
    title: '商品名称',
    value: 'form-create',
    col: {
      span: 6,
    },
  },
  {
    type: 'checkbox',
    field: 'label',
    title: '标签',
    value: [0, 1, 2, 3],
    options: [
      { label: '好用', value: 0 },
      { label: '快速', value: 1 },
      { label: '高效', value: 2 },
      { label: '全能', value: 3 },
    ],
  },
]);
</script>
