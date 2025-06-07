<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <el-form-item label="老人姓名" prop="elderlyName">
        <el-input
          v-model="queryParams.elderlyName"
          placeholder="请输入老人姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="服务人员" prop="providerName">
        <el-input
          v-model="queryParams.providerName"
          placeholder="请输入服务人员姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    

    <el-table
      v-loading="loading"
      :data="ordersList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="orderId" />
      <el-table-column label="老人" align="center" prop="elderlyIdDisplay" />
      <el-table-column
        label="服务人员"
        align="center"
        prop="providerIdDisplay"
      />
      <el-table-column label="服务地址" align="center" prop="serviceAddress" />
      <el-table-column label="订单总金额" align="center" prop="totalAmount" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column
        label="下单时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleViewDetail(scope.row)"
            v-hasPermi="['manage:orders:items']"
            >查看订单详情</el-button
          >
          <el-button
            link
            type="success"
            icon="Edit"
            @click="handleUpdateStatus(scope.row)"
            v-hasPermi="['manage:orders:edit']"
            >修改状态</el-button
          >
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:orders:remove']"
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

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailOpen" width="600px" append-to-body>
      <div class="order-header" v-if="currentOrder">
        <h3>订单信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{
            currentOrder.orderId
          }}</el-descriptions-item>
          <el-descriptions-item label="老人">{{
            currentOrder.elderlyIdDisplay
          }}</el-descriptions-item>
          <el-descriptions-item label="服务人员">{{
            currentOrder.providerIdDisplay
          }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <dict-tag
              :options="order_status"
              :value="currentOrder.orderStatus"
            />
          </el-descriptions-item>
          <el-descriptions-item label="服务地址">{{
            currentOrder.serviceAddress
          }}</el-descriptions-item>
          <el-descriptions-item label="订单总金额">{{
            currentOrder.totalAmount
          }}</el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">
            {{ parseTime(currentOrder.createTime, "{y}-{m}-{d} {h}:{i}:{s}") }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentOrder.remark || "无" }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <h3>服务项目</h3>
      <el-table :data="orderDetailItems" border style="width: 100%">
        <el-table-column prop="itemName" label="服务名称" />
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="scope">
            <span>{{
              parseTime(scope.row.startTime, "{y}-{m}-{d} {h}:{i}")
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="scope">
            <span>{{
              parseTime(scope.row.endTime, "{y}-{m}-{d} {h}:{i}")
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="hourlyRate" label="服务价格" />
        <el-table-column prop="serviceHours" label="服务时长" />
        <el-table-column prop="itemAmount" label="总价" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="success"
            @click="handleUpdateStatusFromDetail"
            v-hasPermi="['manage:orders:edit']"
            >修改状态</el-button
          >
          <el-button type="primary" @click="detailOpen = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 订单状态修改对话框 -->
    <el-dialog
      title="修改订单状态"
      v-model="statusDialogVisible"
      width="500px"
      append-to-body
    >
      <el-form ref="statusFormRef" :model="statusForm" label-width="100px">
        <el-form-item label="订单号">
          <span>{{ statusForm.orderId }}</span>
        </el-form-item>
        <el-form-item label="老人">
          <span>{{ statusForm.elderlyIdDisplay }}</span>
        </el-form-item>
        <el-form-item label="服务人员">
          <span>{{ statusForm.providerIdDisplay }}</span>
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-select
            v-model="statusForm.orderStatus"
            placeholder="请选择订单状态"
          >
            <el-option
              v-for="dict in order_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="statusForm.remark"
            type="textarea"
            placeholder="请输入状态变更备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmUpdateStatus"
            >确 定</el-button
          >
          <el-button @click="statusDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Orders">
import { getCurrentInstance, ref, reactive, toRefs, onMounted } from "vue";
import {
  listOrders,
  getOrders,
  delOrders,
  addOrders,
  updateOrders,
  getOrderItems,
} from "@/api/manage/orders";
import { listElderly } from "@/api/manage/elderly";
import { listProviders } from "@/api/manage/providers";
import { listServices } from "@/api/manage/services";

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict("order_status");

const ordersList = ref([]);
const elderlyOptions = ref([]);
const providerOptions = ref([]);
const serviceOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const orderDetailItems = ref([]);
const currentOrder = ref(null);
// 添加状态修改相关变量
const statusDialogVisible = ref(false);
const statusForm = ref({
  orderId: null,
  orderStatus: null,
  remark: "",
  elderlyIdDisplay: "",
  providerIdDisplay: "",
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    elderlyName: null,  // 改为elderlyName用于名称搜索
    elderlyId: null,    // 保留elderlyId以备需要
    providerName: null, // 添加providerName用于名称搜索
    providerId: null,   // 保留providerId以备需要
    orderStatus: null,
  },
  rules: {
    elderlyId: [{ required: true, message: "老人ID不能为空", trigger: "blur" }],
    providerId: [
      { required: true, message: "服务人员ID不能为空", trigger: "blur" },
    ],
    orderTime: [
      { required: true, message: "下单时间不能为空", trigger: "blur" },
    ],
    serviceAddress: [
      { required: true, message: "服务地址不能为空", trigger: "blur" },
    ],
    totalAmount: [
      { required: true, message: "订单总金额不能为空", trigger: "blur" },
    ],
    orderStatus: [
      { required: true, message: "订单状态不能为空", trigger: "change" },
    ],
  },
});

// 详情对话框数据
const detailOpen = ref(false);

/** 查看订单项详情 */
function handleViewDetail(row) {
  const _orderId = row.orderId || ids.value;
  currentOrder.value = row;

  // 确保已加载服务数据
  const loadData = serviceOptions.value.length
    ? Promise.resolve()
    : getServices();

  loadData
    .then(() => {
      return getOrderItems(_orderId);
    })
    .then((response) => {
      if (response.code === 200) {
        // 处理数据，添加服务名称
        orderDetailItems.value = response.data.map((item) => ({
          ...item,
          itemName:
            findServiceNameById(item.serviceId) ||
            item.itemName ||
            `未知服务(${item.serviceId})`,
        }));
        console.log("订单项详情数据:", orderDetailItems.value);
        detailOpen.value = true;
      } else {
        proxy.$modal.msgError(response.msg || "获取订单详情失败");
      }
    })
    .catch((error) => {
      console.error("获取订单项详情失败:", error);
      proxy.$modal.msgError("获取订单详情失败");
    });
}

const { queryParams, form, rules } = toRefs(data);

/** 查询服务订单列表 */
function getList() {
  loading.value = true;
  Promise.all([
    elderlyOptions.value.length ? Promise.resolve() : getElderlys(),
    providerOptions.value.length ? Promise.resolve() : getProviders(),
    serviceOptions.value.length ? Promise.resolve() : getServices(),
  ])
    .then(() => {
      // 名称搜索前置处理：如果输入了名称但未指定ID，通过名称查找对应的ID
      const params = { ...queryParams.value };

      // 如果输入了老人姓名，通过名称查找对应的ID
      if (params.elderlyName && !params.elderlyId) {
        const matchedElderly = elderlyOptions.value.find(
          elderly => elderly.name && elderly.name.includes(params.elderlyName)
        );
        if (matchedElderly) {
          params.elderlyId = matchedElderly.id;
          console.log("已根据姓名匹配到老人ID:", params.elderlyId);
        }
      }

      // 如果输入了服务人员姓名，通过名称查找对应的ID
      if (params.providerName && !params.providerId) {
        const matchedProvider = providerOptions.value.find(
          provider => provider.name && provider.name.includes(params.providerName)
        );
        if (matchedProvider) {
          params.providerId = matchedProvider.id;
          console.log("已根据姓名匹配到服务人员ID:", params.providerId);
        }
      }

      return listOrders(params);
    })
    .then((response) => {
      // 处理数据,添加老人名和服务人员名称
      ordersList.value = response.rows.map((order) => {
        const elderlyId = order.elderlyId || order.userId; // 支持两种可能的字段名
        return {
          ...order,
          elderlyIdDisplay: findElderlyNameById(elderlyId) || `未知老人(${elderlyId})`,
          providerIdDisplay: findProviderNameById(order.providerId) || `未知服务人员(${order.providerId})`,
        };
      });
      total.value = response.total;
      loading.value = false;
    })
    .catch((error) => {
      console.error("获取订单列表失败:", error);
      loading.value = false;
    });
}

/** 获取老人列表 */
function getElderlys() {
  return listElderly({ pageNum: 1, pageSize: 1000 }).then((response) => {
    if (response.code === 200) {
      elderlyOptions.value = response.rows || [];
      console.log("成功获取老人列表数据:", elderlyOptions.value);
    } else {
      console.error("获取老人列表失败:", response.msg);
      elderlyOptions.value = [];
    }
    return response;
  }).catch(error => {
    console.error("获取老人列表异常:", error);
    elderlyOptions.value = [];
    return Promise.reject(error);
  });
}

/** 获取服务人员列表 */
function getProviders() {
  return listProviders({ pageNum: 1, pageSize: 1000 }).then((response) => {
    if (response.code === 200) {
      providerOptions.value = response.rows || [];
      console.log("成功获取服务人员列表数据:", providerOptions.value);
    } else {
      console.error("获取服务人员列表失败:", response.msg);
      providerOptions.value = [];
    }
    return response;
  }).catch(error => {
    console.error("获取服务人员列表异常:", error);
    providerOptions.value = [];
    return Promise.reject(error);
  });
}

/** 获取服务列表 */
function getServices() {
  return listServices({ pageNum: 1, pageSize: 1000 }).then((response) => {
    if (response.code === 200) {
      serviceOptions.value = response.rows || [];
      console.log("成功获取服务列表数据:", serviceOptions.value);
    } else {
      console.error("获取服务列表失败:", response.msg);
      serviceOptions.value = [];
    }
    return response;
  }).catch(error => {
    console.error("获取服务列表异常:", error);
    serviceOptions.value = [];
    return Promise.reject(error);
  });
}

/** 根据老人ID查找老人名称 */
function findElderlyNameById(elderlyId) {
  if (!elderlyId) return "未知老人";

  // 添加类型转换，确保比较一致性
  const elderly = elderlyOptions.value.find((item) => {
    return String(item.id) === String(elderlyId);
  });
  
  if (elderly) {
    return elderly.name;
  } else {
    console.log("未找到老人:", elderlyId, "可用的老人列表:", elderlyOptions.value);
    return null;
  }
}

/** 根据服务人员ID查找服务人员名称 */
function findProviderNameById(providerId) {
  if (!providerId) return "未知服务人员";

  // 添加类型转换，确保比较一致性
  const provider = providerOptions.value.find((item) => 
    String(item.id) === String(providerId)
  );
  
  return provider ? provider.name : null;
}

/** 根据服务ID查找服务名称 */
function findServiceNameById(serviceId) {
  if (!serviceId) return "未知服务";

  // 添加类型转换，确保比较一致性
  const service = serviceOptions.value.find(
    (item) => String(item.serviceId) === String(serviceId) || String(item.id) === String(serviceId)
  );
  
  return service ? service.serviceName : null;
}

// 表单重置
function reset() {
  form.value = {
    orderId: null,
    elderlyId: null,
    providerId: null,
    serviceAddress: null,
    totalAmount: null,
    orderStatus: null,
    createTime: null,
    updateTime: null,
    remark: null,
  };
  proxy.resetForm("ordersRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.elderlyName = null; // 确保重置老人姓名
  queryParams.value.elderlyId = null;   // 确保重置老人ID
  queryParams.value.providerName = null; // 确保重置服务人员姓名
  queryParams.value.providerId = null;   // 确保重置服务人员ID
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.orderId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加服务订单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _orderId = row.orderId || ids.value;
  getOrders(_orderId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改服务订单";
  });
}


/** 删除按钮操作 */
function handleDelete(row) {
  const _orderIds = row.orderId || ids.value;
  proxy.$modal
    .confirm('是否确认删除服务订单编号为"' + _orderIds + '"的数据项？')
    .then(function () {
      return delOrders(_orderIds);
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
    "manage/orders/export",
    {
      ...queryParams.value,
    },
    `orders_${new Date().getTime()}.xlsx`
  );
}

/** 修改订单状态按钮操作 */
function handleUpdateStatus(row) {
  statusForm.value = {
    orderId: row.orderId,
    orderStatus: parseInt(row.orderStatus),
    remark: row.remark || "",
    elderlyIdDisplay: row.elderlyIdDisplay,
    providerIdDisplay: row.providerIdDisplay,
  };
  statusDialogVisible.value = true;
}

/** 从订单详情中修改状态 */
function handleUpdateStatusFromDetail() {
  if (!currentOrder.value) return;

  statusForm.value = {
    orderId: currentOrder.value.orderId,
    orderStatus: parseInt(currentOrder.value.orderStatus),
    remark: currentOrder.value.remark || "",
    elderlyIdDisplay: currentOrder.value.elderlyIdDisplay,
    providerIdDisplay: currentOrder.value.providerIdDisplay,
  };
  detailOpen.value = false; // 关闭详情对话框
  statusDialogVisible.value = true; // 打开状态修改对话框
}

/** 确认修改订单状态 */
function confirmUpdateStatus() {
  // 构建要提交的数据
  const updateData = {
    orderId: statusForm.value.orderId,
    orderStatus: statusForm.value.orderStatus,
    remark: statusForm.value.remark,
  };

  updateOrders(updateData)
    .then((response) => {
      proxy.$modal.msgSuccess("订单状态修改成功");
      statusDialogVisible.value = false;
      getList(); // 刷新列表
    })
    .catch((error) => {
      console.error("修改订单状态失败:", error);
      proxy.$modal.msgError("修改订单状态失败，请稍后重试");
    });
}

// 组件挂载时加载数据
onMounted(async () => {
  try {
    await Promise.all([getElderlys(), getProviders(), getServices()]);
    getList();
  } catch (error) {
    console.error("初始数据加载失败:", error);
    loading.value = false;
  }
});
</script>

<style scoped>
.el-descriptions {
  margin: 20px 0;
}
.dialog-footer {
  padding: 20px 0 0;
  text-align: right;
}
.order-header {
  margin-bottom: 20px;
}
h3 {
  margin: 15px 0;
  font-weight: 500;
  color: #303133;
}
</style>