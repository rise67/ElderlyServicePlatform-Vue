<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:items:add']"
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
          v-hasPermi="['manage:items:edit']"
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
          v-hasPermi="['manage:items:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:items:export']"
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
      :data="itemsList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column label="序号" align="center" prop="itemId" />
      <el-table-column
        label="订单号"
        align="center"
        prop="orderId"
        :show-overflow-tooltip="true"
        min-width="150"
      />
      <el-table-column label="服务人员" align="center" prop="serviceId" />
      <el-table-column label="小时单价" align="center" prop="hourlyRate" />
      <el-table-column label="服务时长" align="center" prop="serviceHours" />
      <el-table-column
        label="服务开始时间"
        align="center"
        prop="startTime"
        width="150"
      >
        <template #default="scope">
          <span>{{
            parseTime(scope.row.startTime, "{y}-{m}-{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="服务结束时间"
        align="center"
        prop="endTime"
        width="150"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, "{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单项金额" align="center" prop="itemAmount" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="130"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:items:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:items:remove']"
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

    <!-- 添加或修改订单明细对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="itemsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入关联订单号" />
        </el-form-item>
        <el-form-item label="服务人员" prop="serviceId">
          <el-input v-model="form.serviceId" placeholder="请输入服务人员" />
        </el-form-item>
        <el-form-item label="小时单价" prop="hourlyRate">
          <el-input v-model="form.hourlyRate" placeholder="请输入小时单价" />
        </el-form-item>
        <el-form-item label="服务时长" prop="serviceHours">
          <el-input v-model="form.serviceHours" placeholder="请输入服务时长" />
        </el-form-item>
        <el-form-item label="服务开始时间" prop="startTime">
          <el-date-picker
            clearable
            v-model="form.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择服务开始时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="服务结束时间" prop="endTime">
          <el-date-picker
            clearable
            v-model="form.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择服务结束时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="单项金额" prop="itemAmount">
          <el-input v-model="form.itemAmount" placeholder="请输入单项金额" />
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

<script setup name="Items">
import {
  listItems,
  getItems,
  delItems,
  addItems,
  updateItems,
} from "@/api/manage/items";

const { proxy } = getCurrentInstance();

const itemsList = ref([]);
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
  },
  rules: {},
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单明细列表 */
function getList() {
  loading.value = true;
  listItems(queryParams.value).then((response) => {
    itemsList.value = response.rows;
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
    itemId: null,
    orderId: null,
    serviceId: null,
    hourlyRate: null,
    serviceHours: null,
    startTime: null,
    endTime: null,
    itemAmount: null,
  };
  proxy.resetForm("itemsRef");
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
  ids.value = selection.map((item) => item.itemId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加订单明细";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _itemId = row.itemId || ids.value;
  getItems(_itemId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改订单明细";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["itemsRef"].validate((valid) => {
    if (valid) {
      if (form.value.itemId != null) {
        updateItems(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addItems(form.value).then((response) => {
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
  const _itemIds = row.itemId || ids.value;
  proxy.$modal
    .confirm('是否确认删除订单明细编号为"' + _itemIds + '"的数据项？')
    .then(function () {
      return delItems(_itemIds);
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
    "manage/items/export",
    {
      ...queryParams.value,
    },
    `items_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
