<template>
  <div>
    <div style="border: 1px solid #ccc; margin-top: 10px">
      <toolbar :editor="editorRef" :default-config="toolbarConfig" :mode="mode" style="border-bottom: 1px solid #ccc" />
      <editor
        :value="modelValue"
        :default-config="editorConfig"
        mode="simple"
        style="height: 400px; overflow-y: auto"
        @on-created="handleCreated"
        @on-change="handleChange"
        @on-destroyed="handleDestroyed"
        @on-focus="handleFocus"
        @on-blur="handleBlur"
        @custom-alert="customAlert"
        @custom-paste="customPaste"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import '@wangeditor/editor/dist/css/style.css';

import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';

// 1. 【v-model 核心1】接收入参，保留默认值（建议空字符串，更贴合实际业务，可自行修改）
const props = defineProps({
  modelValue: {
    type: String,
    default: '', // 原'<p>hello</p>'改为空，父组件可自由传初始值
  },
});

// 2. 【v-model 核心2】定义更新事件，赋值给变量方便调用（原有只定义未赋值）
const emit = defineEmits(['update:modelValue']);

// 编辑器实例，必须用 shallowRef，wangEditor 官方要求！
const editorRef = shallowRef<any>(null); // TS 加 any 避免类型报错，新手友好

// 移除原有独立的valueHtml：直接复用modelValue做预览，无需额外变量，减少冗余
// const valueHtml = ref('<p>hello</p>');

// 工具栏配置，可按需扩展
const toolbarConfig = {};
// 编辑器配置，保留原有占位符
const editorConfig = ref({ placeholder: '请输入内容...' });
// 编辑器模式，和template中mode一致
const mode = ref('simple');

// 3. 【v-model 核心3】监听父组件modelValue变化，同步更新编辑器（父组件改值，编辑器实时响应）
// 解决：父组件修改v-model绑定值，编辑器内容不更新的问题
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    const editor = editorRef.value;
    if (!editor || newVal === oldVal) return; // 避免无意义更新和循环
    // 同步编辑器内容，保持和父组件v-model一致
    console.log('-----');
    console.log(editor.getAllMenuKeys());
    editor.setHtml(newVal || '');
  },
  { immediate: true }, // 立即执行：确保初始值正常回显
);

// 模拟ajax异步获取内容【示例】：父组件场景下直接修改v-model即可，此处仅做演示
onMounted(() => {
  // 实际项目中：父组件通过接口获取值后，直接赋值给v-model绑定的变量，编辑器会自动同步
  // setTimeout(() => {
  //   emit('update:modelValue', '<p>模拟 Ajax 异步设置内容</p>');
  // }, 1500);
});

// 组件销毁时销毁编辑器，防止内存泄漏，保留原有逻辑
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
  editorRef.value = null; // 释放引用，TS 更规范
});

// 编辑器创建完成：记录实例，保留原有逻辑
const handleCreated = (editor: any) => {
  console.log('created', editor);
  editorRef.value = editor; // 记录editor实例，核心！
};

// 4. 【v-model 核心4】编辑器内容变化，触发事件更新父组件v-model
// 同时保留原有打印日志，不改动原有逻辑
const handleChange = (editor: any) => {
  const latestHtml = editor.getHtml();
  console.log('change:', latestHtml);
  // 触发update事件，把最新内容回传给父组件，v-model自动更新
  emit('update:modelValue', latestHtml);
};

// 以下所有回调方法：完全保留你原有代码，无任何修改
const handleDestroyed = (editor: any) => {
  console.log('destroyed', editor);
  editorRef.value = null;
};
const handleFocus = (editor: any) => {
  console.log('focus', editor);
};
const handleBlur = (editor: any) => {
  console.log('blur', editor);
};
const customAlert = (info: string, type: string) => {
  alert(`【自定义提示】${type} - ${info}`);
};
const customPaste = (editor: any, event: ClipboardEvent, callback: (flag: boolean) => void) => {
  console.log('ClipboardEvent 粘贴事件对象', event);
  // 自定义插入内容
  // editor.insertText('xxx');
  // 阻止默认粘贴行为
  callback(true);
  // callback(true) // 返回 true ，继续默认的粘贴行为
};

// 以下所有操作方法：完全保留你原有代码，无任何修改
const insertText = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.insertText('hello world');
};
const printHtml = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  console.log('当前编辑器HTML：', editor.getHtml());
};
const disable = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.disable();
};

// 可选：对外暴露编辑器方法，父组件可通过ref调用（如手动插入内容、禁用等）
defineExpose({
  insertText,
  printHtml,
  disable,
  getEditor: () => editorRef.value, // 获取编辑器实例
});
</script>
