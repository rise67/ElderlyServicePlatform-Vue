<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:services:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:services:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:services:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:services:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="servicesList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="服务名称" align="center" prop="serviceName"  width="120" />
      <el-table-column
        label="服务描述"
        align="center"
        prop="serviceDesc"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column label="服务价格" align="center" prop="price">
        <template #default="scope"> ￥{{ scope.row.price }} </template>
      </el-table-column>
      <el-table-column label="服务类别" align="center" prop="serviceCategory">
        <template #default="scope">
          <dict-tag
            :options="service_category"
            :value="scope.row.serviceCategory"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="具体详情"
        align="center"
        prop="details"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width" width="150"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:services:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:services:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改服务信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form
        ref="servicesRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="服务名称" prop="serviceName">
          <el-input v-model="form.serviceName" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="服务描述" prop="serviceDesc">
          <el-input v-model="form.serviceDesc" placeholder="请输入服务描述" />
        </el-form-item>
        <el-form-item label="服务价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入服务价格" />
        </el-form-item>
        <el-form-item label="服务类别" prop="serviceCategory">
          <el-select
            v-model="form.serviceCategory"
            placeholder="请选择服务类别"
            clearable
          >
            <el-option
              v-for="dict in service_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="具体详情" prop="details">
          <el-input
            v-model="form.details"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Services">
import {
  listServices,
  getServices,
  delServices,
  addServices,
  updateServices,
} from "@/api/manage/services";

const { proxy } = getCurrentInstance();
const { service_category } = proxy.useDict("service_category");

const servicesList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    serviceName: null,
    serviceCategory: null,
  },
  rules: {
    serviceName: [
      { required: true, message: "服务名称不能为空", trigger: "blur" },
    ],
    serviceDesc: [
      { required: true, message: "服务描述不能为空", trigger: "blur" },
    ],
    price: [{ required: true, message: "服务价格不能为空", trigger: "blur" }],
    serviceCategory: [
      { required: true, message: "服务类别不能为空", trigger: "blur" },
    ],
    details: [{ required: true, message: "具体详情不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询服务信息列表 */
function getList() {
  loading.value = true;
  listServices(queryParams.value).then((response) => {
    servicesList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    serviceName: null,
    serviceDesc: null,
    price: null,
    serviceCategory: null,
    details: null,
    createTime: null,
    dateTime: null,
    createBy: null,
    updateBy: null,
    remark: null,
  };
  proxy.resetForm("servicesRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加服务信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value;
  getServices(_id).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改服务信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["servicesRef"].validate((valid) => {
    if (valid) {
      if (form.value.id != null) {
        updateServices(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addServices(form.value).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除服务信息编号为"' + _ids + '"的数据项？')
    .then(function () {
      return delServices(_ids);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "manage/services/export",
    {
      ...queryParams.value,
    },
    `services_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
