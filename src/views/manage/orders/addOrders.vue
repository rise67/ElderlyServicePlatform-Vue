<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="step-container">
          <el-steps
            :active="activeStep"
            finish-status="success"
            align-center
            class="custom-steps"
          >
            <el-step title="选择老人">
              <template #icon>
                <el-icon><User /></el-icon>
              </template>
              <template #description>
                <span class="step-description">选择需要服务的老人</span>
              </template>
            </el-step>
            <el-step title="选择服务">
              <template #icon>
                <el-icon><Service /></el-icon>
              </template>
              <template #description>
                <span class="step-description">设置服务项目与时间</span>
              </template>
            </el-step>
            <el-step title="选择服务人员">
              <template #icon>
                <el-icon><UserFilled /></el-icon>
              </template>
              <template #description>
                <span class="step-description">指定提供服务的人员</span>
              </template>
            </el-step>
            <el-step title="确认订单">
              <template #icon>
                <el-icon><Check /></el-icon>
              </template>
              <template #description>
                <span class="step-description">确认并提交订单</span>
              </template>
            </el-step>
          </el-steps>
        </div>
      </template>
      <!-- 步骤1：选择老人 -->
      <div v-show="activeStep === 0">
        <div class="elderly-search-container">
          <el-input
            v-model="elderlySearchKeyword"
            placeholder="搜索老人姓名"
            class="search-input"
            clearable
            @input="handleElderlySearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-table :data="filteredElderlyList" stripe v-loading="loading">
          <!-- <el-table-column type="selection" width="55" align="center" /> -->
          <el-table-column
            prop="name"
            label="姓名"
            width="120"
            align="center"
          />
          <el-table-column
            prop="phone"
            label="联系电话"
            width="150"
            align="center"
          />
          <el-table-column label="性别" width="80" align="center">
            <template #default="scope">
              <dict-tag :options="elderly_sex" :value="scope.row.gender" />
            </template>
          </el-table-column>
          <el-table-column
            prop="address"
            label="地址"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            prop="healthDescription"
            label="健康描述"
            width="200"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="showElderlyDetailDialog(scope.row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getElderlyList"
        />

        <!-- 添加老人详情对话框 -->
        <el-dialog
          title="选择老人和填写服务地址"
          v-model="elderlyDetailDialogVisible"
          width="600px"
          destroy-on-close
        >
          <el-descriptions :column="1" border>
            <el-descriptions-item label="姓名">{{
              selectedElderlyTemp.name
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              selectedElderlyTemp.phone
            }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              <dict-tag :options="elderly_sex" :value="selectedElderlyTemp.gender" />
            </el-descriptions-item>
            <el-descriptions-item label="地址">{{
              selectedElderlyTemp.address
            }}</el-descriptions-item>
            <el-descriptions-item label="健康描述">
              {{ selectedElderlyTemp.healthDescription || "无" }}
            </el-descriptions-item>
          </el-descriptions>

          <el-form
            :model="tempOrderForm"
            label-width="100px"
            style="margin-top: 20px"
          >
            <el-form-item label="服务地址" prop="serviceAddress" required>
              <el-input
                v-model="tempOrderForm.serviceAddress"
                type="textarea"
                :rows="3"
                placeholder="请输入服务地址"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox
                v-model="useDefaultAddress"
                @change="handleUseDefaultAddress"
                >使用老人默认地址</el-checkbox
              >
            </el-form-item>
          </el-form>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="elderlyDetailDialogVisible = false"
                >取消</el-button
              >
              <el-button type="primary" @click="confirmElderlySelect"
                >确认选择</el-button
              >
            </span>
          </template>
        </el-dialog>

        <!-- 在选择完老人后显示的简要信息，点击查看可重新打开对话框 -->
        <el-alert
          v-if="selectedElderly"
          type="success"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <div class="elderly-selected-info">
            <div>
              已选择老人: <strong>{{ selectedElderly.name }}</strong> ({{
                selectedElderly.phone
              }})
            </div>
            <div class="elderly-selected-actions">
              <el-button link @click="showSelectedElderlyDetail"
                >查看详情</el-button
              >
              <el-button
                link
                @click="
                  selectedElderly = null;
                  orderForm.elderlyId = null;
                  orderForm.serviceAddress = '';
                "
              >
                取消选择
              </el-button>
            </div>
          </div>
        </el-alert>
      </div>
      <!-- 步骤2：选择服务 -->
      <div v-show="activeStep === 1">
        <el-table :data="serviceList" @selection-change="handleServiceSelect">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="serviceName" label="服务名称" width="120" align="center" />
          <el-table-column
        prop="serviceDesc"
        label="服务描述"
        show-overflow-tooltip
        align="center"
          />
          <el-table-column prop="price" label="价格(元/小时)" width="110" align="center" />

          <!-- 修改为分开的开始和结束时间 -->
          <el-table-column label="开始时间" width="180" align="center">
        <template #default="scope">
          <el-date-picker
            v-model="scope.row.startTime"
            type="datetime"
            placeholder="选择开始时间"
            :disabled="!scope.row.selected"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledStartDate"
            @change="() => handleStartTimeChange(scope.row)"
          />
        </template>
          </el-table-column>
          <el-table-column label="结束时间" width="180" align="center">
        <template #default="scope">
          <el-date-picker
            v-model="scope.row.endTime"
            type="datetime"
            placeholder="选择结束时间"
            :disabled="!scope.row.selected || !scope.row.startTime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="
          (time) => disabledEndDate(time, scope.row.startTime)
            "
            @change="() => handleEndTimeChange(scope.row)"
          />
        </template>
          </el-table-column>

          <el-table-column label="服务时长" width="80" align="center">
        <template #default="scope">
          <span>{{ scope.row.hours || 0 }}小时</span>
        </template>
          </el-table-column>
          <el-table-column label="小计(元)" width="80" align="center">
        <template #default="scope">
          <span>{{ scope.row.amount || 0 }}</span>
        </template>
          </el-table-column>
          
        </el-table>
        <div class="service-helper-text">
          <el-alert
            title="请先勾选服务，然后设置开始时间和结束时间，结束时间必须至少比开始时间晚1小时。"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </div>
      <!-- 步骤3：选择服务人员 -->
      <div v-show="activeStep === 2">
        <el-table :data="providerList" v-loading="providerLoading" stripe>
          <el-table-column prop="name" label="服务人员" align="center" />
          <el-table-column prop="age" label="年龄" width="80" align="center" />
          <el-table-column
        prop="experienceYears"
        label="从业年限"
        width="100"
        align="center"
          />
          <el-table-column label="性别" width="80" align="center">
        <template #default="scope">
          <dict-tag :options="elderly_sex" :value="scope.row.gender" />
        </template>
          </el-table-column>
          <el-table-column prop="contactNumber" label="联系电话" align="center" />
          <el-table-column prop="details" label="具体详情" show-overflow-tooltip align="center" />
          <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button
        link
        type="primary"
        @click="showProviderDetailDialog(scope.row)"
          >
        选择
          </el-button>
        </template>
          </el-table-column>
        </el-table>

        <!-- 服务人员详情对话框 -->
        <el-dialog
          title="选择服务人员"
          v-model="providerDetailDialogVisible"
          width="600px"
          destroy-on-close
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{
              providerTemp.name
            }}</el-descriptions-item>
            <el-descriptions-item label="年龄"
              >{{ providerTemp.age }}岁</el-descriptions-item
            >
            <el-descriptions-item label="性别">
              <dict-tag :options="elderly_sex" :value="providerTemp.gender" />
            </el-descriptions-item>
            <el-descriptions-item label="从业年限"
              >{{ providerTemp.experienceYears }}年</el-descriptions-item
            >
            <el-descriptions-item label="联系电话" :span="2">{{
              providerTemp.contactNumber
            }}</el-descriptions-item>
            <el-descriptions-item label="具体详情" :span="2">
              {{ providerTemp.details || "暂无介绍" }}
            </el-descriptions-item>
          </el-descriptions>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="providerDetailDialogVisible = false"
                >取消</el-button
              >
              <el-button type="primary" @click="confirmProviderSelect"
                >确认选择</el-button
              >
            </span>
          </template>
        </el-dialog>

        <!-- 已选择服务人员提示 -->
        <el-alert
          v-if="selectedProvider"
          type="success"
          :closable="false"
          style="margin-top: 20px"
        >
          <div class="provider-selected-info">
            <div>
              已选择服务人员: <strong>{{ selectedProvider.name }}</strong> ({{
                selectedProvider.contactNumber
              }})
            </div>
            <div class="provider-selected-actions">
              <el-button link @click="showSelectedProviderDetail"
                >查看详情</el-button
              >
              <el-button link @click="cancelProviderSelect">取消选择</el-button>
            </div>
          </div>
        </el-alert>
      </div>

      <!-- 步骤4：确认订单 -->
      <div v-show="activeStep === 3">
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="服务老人">{{
            selectedElderly?.name
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{
            selectedElderly?.phone
          }}</el-descriptions-item>
          <el-descriptions-item label="服务地址" :span="2">{{
            orderForm.serviceAddress
          }}</el-descriptions-item>
          <el-descriptions-item label="服务人员">{{
            selectedProvider?.name
          }}</el-descriptions-item>
          <el-descriptions-item label="服务人员电话">{{
            selectedProvider?.contactNumber
          }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">服务项目</el-divider>
        <el-table :data="selectedServices" border>
          <el-table-column prop="serviceName" label="服务名称" />
          <el-table-column prop="price" label="单价(元/小时)" width="120" />
          <el-table-column label="服务时间" width="400">
            <template #default="scope">
              <div>
                {{ parseTime(scope.row.startTime) }} 至
                {{ parseTime(scope.row.endTime) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="hours" label="服务时长(小时)" width="120" />
          <el-table-column label="小计(元)" width="120">
            <template #default="scope">
              <span>{{ scope.row.amount }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="order-total">
          <span>订单总金额：</span>
          <span class="amount">¥ {{ calculateTotal() }}</span>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="step-buttons">
        <el-button v-if="activeStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="activeStep < 3" type="primary" @click="nextStep"
          >下一步</el-button
        >
        <el-button v-else type="primary" @click="submitOrder"
          >提交订单</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script setup name="AddOrders">
import { getCurrentInstance, ref, reactive, onMounted } from "vue";
import { listElderly } from "@/api/manage/elderly";
import { listServices } from "@/api/manage/services";
import { listProviders } from "@/api/manage/providers";
import { addOrders } from "@/api/manage/orders";
import { addItems } from "@/api/manage/items"; // 新增导入
import { parseTime } from "@/utils/ruoyi";
import { Search, User, UserFilled, Check } from "@element-plus/icons-vue";

// 自定义Service图标
const Service = markRaw({
  render() {
    return h(
      "svg",
      {
        viewBox: "0 0 1024 1024",
        width: "1em",
        height: "1em",
        fill: "currentColor",
      },
      [
        h("path", {
          d: "M832 298.666667H597.333333c-12.8 0-21.333333-8.533333-21.333333-21.333334s8.533333-21.333333 21.333333-21.333333h234.666667c12.8 0 21.333333 8.533333 21.333333 21.333333s-8.533333 21.333333-21.333333 21.333334zM832 426.666667H597.333333c-12.8 0-21.333333-8.533333-21.333333-21.333334s8.533333-21.333333 21.333333-21.333333h234.666667c12.8 0 21.333333 8.533333 21.333333 21.333333s-8.533333 21.333333-21.333333 21.333334zM832 554.666667H597.333333c-12.8 0-21.333333-8.533333-21.333333-21.333334s8.533333-21.333333 21.333333-21.333333h234.666667c12.8 0 21.333333 8.533333 21.333333 21.333333s-8.533333 21.333333-21.333333 21.333334zM832 682.666667H192c-12.8 0-21.333333-8.533333-21.333333-21.333334s8.533333-21.333333 21.333333-21.333333h640c12.8 0 21.333333 8.533333 21.333333 21.333333s-8.533333 21.333333-21.333333 21.333334zM832 810.666667H192c-12.8 0-21.333333-8.533333-21.333333-21.333334s8.533333-21.333333 21.333333-21.333333h640c12.8 0 21.333333 8.533333 21.333333 21.333333s-8.533333 21.333333-21.333333 21.333334zM384 554.666667H192c-12.8 0-21.333333-8.533333-21.333333-21.333334V192c0-12.8 8.533333-21.333333 21.333333-21.333333h192c12.8 0 21.333333 8.533333 21.333333 21.333333v341.333333c0 12.8-8.533333 21.333333-21.333333 21.333334z",
        }),
      ]
    );
  },
});

// 搜索关键词
const elderlySearchKeyword = ref("");

// 对话框显示控制
const elderlyDetailDialogVisible = ref(false);

// 是否使用默认地址
const useDefaultAddress = ref(true);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: "",
});

// 总条数
const total = ref(0);

// 加载状态
const loading = ref(false);
const { proxy } = getCurrentInstance();
const { elderly_sex } = proxy.useDict("elderly_sex");

// 步骤控制
const activeStep = ref(0);

// 数据列表
const elderlyList = ref([]);
const serviceList = ref([]);
const providerList = ref([]);

// 选中的数据
const selectedElderly = ref(null);
const selectedServices = ref([]);
const selectedProvider = ref(null);

// 服务人员加载状态
const providerLoading = ref(false);
// 服务人员选择对话框相关
const providerDetailDialogVisible = ref(false);
const providerTemp = ref({});

// 订单表单
const orderForm = reactive({
  elderlyId: null,
  providerId: null,
  serviceAddress: "",
  orderItems: [],
});

// 临时选中的老人和表单数据
const selectedElderlyTemp = ref({});
const tempOrderForm = reactive({
  serviceAddress: "",
});

// 显示老人详情对话框
const showElderlyDetailDialog = (row) => {
  selectedElderlyTemp.value = row;
  tempOrderForm.serviceAddress = useDefaultAddress.value
    ? row.address || ""
    : "";
  elderlyDetailDialogVisible.value = true;
};

// 确认老人选择
const confirmElderlySelect = () => {
  if (!tempOrderForm.serviceAddress) {
    proxy.$modal.msgError("请填写服务地址");
    return;
  }

  // 更新选中老人
  selectedElderly.value = selectedElderlyTemp.value;
  orderForm.elderlyId =
    selectedElderlyTemp.value.elderlyId || selectedElderlyTemp.value.id;
  orderForm.serviceAddress = tempOrderForm.serviceAddress;

  elderlyDetailDialogVisible.value = false;
};

// 查看已选择老人详情
const showSelectedElderlyDetail = () => {
  if (selectedElderly.value) {
    selectedElderlyTemp.value = selectedElderly.value;
    tempOrderForm.serviceAddress = orderForm.serviceAddress;
    elderlyDetailDialogVisible.value = true;
  }
};

// 处理使用默认地址勾选变更
const handleUseDefaultAddress = (val) => {
  if (val && selectedElderlyTemp.value) {
    tempOrderForm.serviceAddress = selectedElderlyTemp.value.address || "";
  } else {
    tempOrderForm.serviceAddress = "";
  }
};
// 过滤后的老人列表
const filteredElderlyList = computed(() => {
  if (!elderlySearchKeyword.value) {
    return elderlyList.value;
  }
  return elderlyList.value.filter(
    (elderly) =>
      elderly.name &&
      elderly.name.toLowerCase().includes(elderlySearchKeyword.value.toLowerCase())
  );
});

// 获取老人列表 - 修改为分页查询
const getElderlyList = async () => {
  loading.value = true;
  const params = {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    name: queryParams.name,
  };
  const res = await listElderly(params);
  elderlyList.value = res.rows;
  total.value = res.total;
};

// 老人搜索处理
const handleElderlySearch = () => {
  queryParams.name = elderlySearchKeyword.value;
  queryParams.pageNum = 1;
  getElderlyList();
};

// 获取服务列表
const getServiceList = async () => {
  try {
    const res = await listServices();
    serviceList.value = res.rows.map((item) => ({
      ...item,
      startTime: null, // 改为独立的开始时间
      endTime: null, // 改为独立的结束时间
      selected: false,
      hours: 0,
      amount: 0,
    }));
  } catch (error) {
    proxy.$modal.msgError("获取服务列表失败");
  }
};

// 禁用开始日期（不能选择过去的日期）
const disabledStartDate = (time) => {
  return time.getTime() < Date.now();
};

// 禁用结束日期（不能选择早于开始时间的日期）
const disabledEndDate = (time, startTime) => {
  if (!startTime) return true;

  // 不能选择开始时间之前的时间
  const startDate = new Date(startTime);
  return time.getTime() <= startDate.getTime();
};

// 开始时间变更处理
const handleStartTimeChange = (row) => {
  if (!row.startTime) return;

  const startTime = new Date(row.startTime);

  // 如果结束时间存在且不满足至少1小时的要求，自动调整结束时间
  if (row.endTime) {
    const endTime = new Date(row.endTime);
    if (endTime <= startTime || endTime - startTime < 60 * 60 * 1000) {
      // 设置为开始时间后1小时
      const newEndTime = new Date(startTime);
      newEndTime.setHours(newEndTime.getHours() + 1);
      row.endTime = parseTime(newEndTime, "{y}-{m}-{d} {h}:{i}:{s}");
      proxy.$modal.msgInfo("已自动调整结束时间为开始时间后1小时");
    }
  } else {
    // 如果没有设置结束时间，默认设置为开始时间后1小时
    const newEndTime = new Date(startTime);
    newEndTime.setHours(newEndTime.getHours() + 1);
    row.endTime = parseTime(newEndTime, "{y}-{m}-{d} {h}:{i}:{s}");
  }

  // 更新服务时长和金额
  updateServiceTimeAndAmount(row);
};

// 结束时间变更处理
const handleEndTimeChange = (row) => {
  if (!row.endTime || !row.startTime) return;

  const startTime = new Date(row.startTime);
  const endTime = new Date(row.endTime);

  // 验证结束时间是否至少比开始时间晚1小时
  if (endTime <= startTime || endTime - startTime < 60 * 60 * 1000) {
    proxy.$modal.msgError("结束时间必须至少比开始时间晚1小时");

    // 自动修正：设置为开始时间后1小时
    const newEndTime = new Date(startTime);
    newEndTime.setHours(newEndTime.getHours() + 1);
    row.endTime = parseTime(newEndTime, "{y}-{m}-{d} {h}:{i}:{s}");
  }

  // 更新服务时长和金额
  updateServiceTimeAndAmount(row);
};

// 更新服务时长和金额计算
const updateServiceTimeAndAmount = (row) => {
  if (row.startTime && row.endTime) {
    const startTime = new Date(row.startTime);
    const endTime = new Date(row.endTime);

    // 计算服务时长（小时）
    const diffMs = endTime - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    // 向上取整到0.5小时，并确保至少1小时
    const roundedHours = Math.max(1, Math.round(diffHours * 2) / 2);
    row.hours = roundedHours;

    // 计算金额（单价 × 时长）
    const price = parseFloat(row.price || 0);
    row.amount = parseFloat((price * roundedHours).toFixed(2));

    console.log("更新服务时间和金额:", {
      startTime: row.startTime,
      endTime: row.endTime,
      hours: row.hours,
      amount: row.amount,
    });
  }
};

// 显示服务人员详情对话框
const showProviderDetailDialog = (row) => {
  providerTemp.value = row;
  providerDetailDialogVisible.value = true;
};

// 确认服务人员选择
const confirmProviderSelect = () => {
  // 更新选中服务人员
  selectedProvider.value = providerTemp.value;
  orderForm.providerId = providerTemp.value.id;
  providerDetailDialogVisible.value = false;
};

// 查看已选择服务人员详情
const showSelectedProviderDetail = () => {
  if (selectedProvider.value) {
    providerTemp.value = selectedProvider.value;
    providerDetailDialogVisible.value = true;
  }
};

// 取消服务人员选择
const cancelProviderSelect = () => {
  selectedProvider.value = null;
  orderForm.providerId = null;
};

// 获取服务人员列表
const getProviderList = async () => {
  providerLoading.value = true;
  try {
    const res = await listProviders();
    providerList.value = res.rows;
  } catch (error) {
    proxy.$modal.msgError("获取服务人员列表失败");
  } finally {
    providerLoading.value = false;
  }
};

// 服务选择处理
const handleServiceSelect = (selection) => {
  // 更新所有服务的选中状态
  serviceList.value.forEach((item) => {
    const isSelected = selection.some((s) => s.id === item.id);

    // 如果状态发生变化（从未选中到选中）
    if (isSelected && !item.selected) {
      item.selected = true;

      // 默认设置开始时间为当前时间后1小时
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      now.setSeconds(0);
      item.startTime = parseTime(now, "{y}-{m}-{d} {h}:{i}:{s}");

      // 默认设置结束时间为开始时间后1小时
      const end = new Date(now);
      end.setHours(end.getHours() + 1);
      item.endTime = parseTime(end, "{y}-{m}-{d} {h}:{i}:{s}");

      // 设置默认小时数和金额
      item.hours = 1;
      item.amount = parseFloat(item.price || 0);
    } else if (!isSelected && item.selected) {
      // 如果从选中变为未选中
      item.selected = false;
      item.startTime = null;
      item.endTime = null;
      item.hours = 0;
      item.amount = 0;
    }
  });

  // 更新选中的服务列表
  selectedServices.value = selection;
};

// 计算订单总金额
const calculateTotal = () => {
  let total = 0;

  // 遍历所有选中的服务
  if (selectedServices.value && selectedServices.value.length > 0) {
    for (const service of selectedServices.value) {
      // 使用服务小时数乘以单价
      const amount = parseFloat(service.amount || 0);
      if (!isNaN(amount)) {
        total += amount;
      }
    }
  }

  return total.toFixed(2);
};

// 上一步
const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
  }
};

// 下一步
const nextStep = () => {
  console.log("当前步骤:", activeStep.value);

  if (validateStep()) {
    activeStep.value++;
  }
};

// 步骤验证
const validateStep = () => {
  switch (activeStep.value) {
    case 0:
      console.log("验证第一步:", {
        elderlyId: orderForm.elderlyId,
        serviceAddress: orderForm.serviceAddress,
        selectedElderly: selectedElderly.value,
      }); // 添加调试日志
      if (!selectedElderly.value) {
        proxy.$modal.msgError("请选择老人");
        return false;
      }
      if (!orderForm.serviceAddress) {
        proxy.$modal.msgError("请填写服务地址");
        return false;
      }
      return true;
    case 1:
      if (selectedServices.value.length === 0) {
        proxy.$modal.msgError("请至少选择一项服务");
        return false;
      }

      // 验证每个服务的开始和结束时间
      for (const service of selectedServices.value) {
        if (!service.startTime || !service.endTime) {
          proxy.$modal.msgError("请为所有选中的服务设置开始和结束时间");
          return false;
        }

        const startTime = new Date(service.startTime);
        const endTime = new Date(service.endTime);

        // 验证结束时间是否至少比开始时间晚1小时
        if (endTime <= startTime || endTime - startTime < 60 * 60 * 1000) {
          proxy.$modal.msgError(
            `服务"${service.serviceName}"的结束时间必须至少比开始时间晚1小时`
          );
          return false;
        }
      }
      return true;
    case 2:
      if (!selectedProvider.value) {
        proxy.$modal.msgError("请选择服务人员");
        return false;
      }
      return true;
  }
  return true;
};

// 生成订单号
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `SO${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

// 标准化日期时间格式
const standardizeDateTime = (dateStr) => {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    // 格式化为 YYYY-MM-DD HH:MM:SS
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      " " +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":" +
      String(date.getSeconds()).padStart(2, "0")
    );
  } catch (e) {
    console.error("日期转换错误:", e);
    return dateStr;
  }
};

// 修改提交订单方法
const submitOrder = async () => {
  try {
    // 最终验证所有服务的时间设置
    for (const service of selectedServices.value) {
      if (!service.startTime || !service.endTime) {
        proxy.$modal.msgError(`请为服务"${service.serviceName}"设置完整的时间`);
        return;
      }

      const startTime = new Date(service.startTime);
      const endTime = new Date(service.endTime);

      console.log(`服务${service.serviceName}的时间验证:`, {
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        startObj: startTime,
        endObj: endTime,
        比较结果: endTime > startTime,
        时间差_毫秒: endTime - startTime,
        时间差_小时: (endTime - startTime) / (1000 * 60 * 60),
      });

      // 验证结束时间是否至少比开始时间晚1小时
      if (endTime <= startTime || endTime - startTime < 60 * 60 * 1000) {
        proxy.$modal.msgError(
          `服务"${service.serviceName}"的结束时间必须至少比开始时间晚1小时`
        );
        return;
      }
    }

    // 构建订单数据
    const orderNumber = generateOrderNumber();
    const orderData = {
      orderId: orderNumber,
      elderlyId: orderForm.elderlyId,
      providerId: orderForm.providerId,
      serviceAddress: orderForm.serviceAddress,
      totalAmount: parseFloat(calculateTotal()),
      orderStatus: "0",
    };

    // 构建订单项数据（为后续提交准备）
    const orderItemsData = selectedServices.value.map((service) => {
      // 标准化日期时间格式
      const standardizedStartTime = standardizeDateTime(service.startTime);
      const standardizedEndTime = standardizeDateTime(service.endTime);

      return {
        orderId: orderNumber,
        serviceId: service.id,
        hourlyRate: parseFloat(service.price),
        serviceHours: parseFloat(service.hours),
        startTime: standardizedStartTime,
        endTime: standardizedEndTime,
      };
    });

    console.log("提交的订单数据:", orderData);
    console.log("提交的订单项示例:", orderItemsData[0] || "无订单项");

    // 显示提交中状态
    const loading = proxy.$loading({
      lock: true,
      text: "正在提交订单...",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)",
    });

    try {
      // 首先提交订单
      const res = await addOrders(orderData);

      if (res.code === 200) {
        // 订单创建成功，获取实际订单ID（如果后端返回）
        const actualOrderId = res.data || orderNumber;

        // 确保订单项使用正确的订单ID
        orderItemsData.forEach((item) => {
          item.orderId = actualOrderId;
        });

        // 提交订单项 - 使用Promise.all并行处理所有请求
        try {
          const itemPromises = orderItemsData.map((item) => addItems(item));
          const results = await Promise.all(itemPromises);

          // 检查是否所有请求都成功
          const allSuccess = results.every((res) => res.code === 200);
          loading.close();

          if (allSuccess) {
            proxy.$modal.msgSuccess("订单和订单项提交成功");
          } else {
            console.warn("部分订单项提交失败:", results);
            proxy.$modal.msgWarning("订单创建成功，但部分订单项可能未完全保存");
          }

          // 无论订单项是否成功，都跳转到订单列表
          proxy.$router.push("/order/orders");
        } catch (itemError) {
          loading.close();
          console.error("订单项提交失败:", itemError);
          proxy.$modal.msgWarning(
            "订单创建成功，但订单项保存失败: " +
              (itemError.message || "未知错误")
          );
        }
      } else {
        loading.close();
        throw new Error(res.msg || "订单提交失败");
      }
    } catch (error) {
      loading.close();
      throw error;
    }
  } catch (error) {
    console.error("订单提交错误:", error);
    proxy.$modal.msgError(error.message || "订单提交失败");
  }
};

// 初始化数据
onMounted(() => {
  getElderlyList();
  getServiceList();
  getProviderList();
});
</script>

<style scoped>
.step-container {
  padding: 20px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.step-title {
  text-align: center;
  margin-bottom: 24px;
}

.step-title h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.step-subtitle {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.custom-steps {
  max-width: 900px;
  margin: 0 auto;
}

.custom-steps :deep(.el-step__title) {
  font-weight: 600;
}

.custom-steps :deep(.el-step__icon) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  transition: all 0.3s;
}

.custom-steps :deep(.el-step__icon.is-text) {
  border: 2px solid #c0c4cc;
  background-color: white;
}

.custom-steps :deep(.el-step__head.is-process .el-step__icon.is-text) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.custom-steps :deep(.el-step__head.is-finish .el-step__icon.is-text) {
  background-color: #95d475;
  border-color: #95d475;
}

.custom-steps :deep(.el-step__line) {
  background-color: #e4e7ed;
  height: 2px;
  top: 16px;
}

.step-description {
  font-size: 12px;
  color: #909399;
  display: block;
  margin-top: 4px;
}

.custom-steps :deep(.el-step__head.is-process) .el-icon {
  color: white;
}

.custom-steps :deep(.el-step__head.is-finish) .el-icon {
  color: white;
}

/* 添加响应式处理 */
@media (max-width: 768px) {
  .custom-steps :deep(.el-step__title),
  .custom-steps :deep(.step-description) {
    font-size: 12px;
  }

  .step-title h2 {
    font-size: 20px;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.step-buttons {
  margin-top: 20px;
  text-align: center;
}
.order-total {
  margin-top: 20px;
  text-align: right;
  font-size: 16px;
}
.order-total .amount {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
}
.el-divider {
  margin: 24px 0;
}
.service-helper-text {
  margin-top: 15px;
}
.elderly-search-container {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.search-input {
  width: 300px;
}

.selected-elderly-card {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.selected-elderly-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.selected-provider-card {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: 15px;
}
.elderly-selected-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.elderly-selected-actions {
  display: flex;
  gap: 10px;
}

/* 美化对话框样式 */
:deep(.el-dialog__header) {
  padding: 20px;
  margin-right: 0;
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.provider-selected-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.provider-selected-actions {
  display: flex;
  gap: 10px;
}
</style>
