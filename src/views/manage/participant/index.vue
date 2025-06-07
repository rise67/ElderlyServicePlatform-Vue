<template>
  <div class="app-container">
    <!-- 查询条件区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="活动名称" prop="activityId">
        <el-select v-model="queryParams.activityId" placeholder="请选择活动" clearable style="width: 240px">
          <el-option 
            v-for="item in activityOptions" 
            :key="item.activityId" 
            :label="item.activityName" 
            :value="item.activityId" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户姓名" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择用户" clearable filterable style="width: 240px">
          <el-option 
            v-for="item in userOptions" 
            :key="item.id" 
            :label="item.name" 
            :value="item.id" 
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:participant:add']"
        >新增参与</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Check"
          :disabled="multiple"
          @click="handleBatchSignIn"
          v-hasPermi="['manage:participant:edit']"
        >批量签到</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:participant:remove']"
        >批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:participant:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据展示标签页 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部参与" name="all"></el-tab-pane>
      <el-tab-pane label="已报名" name="registered"></el-tab-pane>
      <el-tab-pane label="已签到" name="checked"></el-tab-pane>
      <el-tab-pane label="已完成" name="completed"></el-tab-pane>
      <el-tab-pane label="已取消" name="canceled"></el-tab-pane>
    </el-tabs>

    <!-- 活动参与列表 -->
    <el-table v-loading="loading" :data="filteredParticipantList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="participantId" width="80" />
      <el-table-column label="用户姓名" align="center" prop="userName" min-width="100" />
      <el-table-column label="活动名称" align="center" prop="activityName" :show-overflow-tooltip="true" min-width="150" />
      <!-- 活动时间 -->
      <el-table-column label="活动时间" align="center" min-width="200">
        <template #default="scope">
          <div>开始: {{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</div>
          <div>结束: {{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</div>
        </template>
      </el-table-column>

      <!-- 报名时间 -->
      <el-table-column label="报名时间" align="center" prop="registerTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.registerTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="参与状态" align="center" prop="participantStatus" width="100">
        <template #default="scope">
          <dict-tag :options="participant_statu" :value="scope.row.participantStatus"/>
        </template>
      </el-table-column>

      <!-- 签到时间 -->
      <el-table-column label="签到时间" align="center" width="160">
        <template #default="scope">
          <span>{{ scope.row.signInTime ? parseTime(scope.row.signInTime, '{y}-{m}-{d} {h}:{i}:{s}') : '未签到' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="评分" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.rating">{{ scope.row.rating }}星</span>
          <span v-else>未评分</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240">
        <template #default="scope">
          <!-- 手动签到按钮 -->
          <el-button 
            v-if="scope.row.participantStatus === 0" 
            link type="success" 
            icon="Check"
            @click="handleSignIn(scope.row)"
            v-hasPermi="['manage:participant:edit']"
          >签到</el-button>
          
          <!-- 查看评价按钮 -->
          <el-button 
            v-if="scope.row.feedback" 
            link type="primary" 
            icon="View"
            @click="viewFeedback(scope.row)"
          >查看评价</el-button>
          
          <!-- 编辑按钮 -->
          <el-button 
            link type="primary" 
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:participant:edit']"
          >编辑</el-button>
          
          <!-- 删除按钮 -->
          <el-button 
            link type="danger" 
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:participant:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="participantRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="活动名称" prop="activityId">
          <el-select v-model="form.activityId" placeholder="请选择活动" filterable style="width: 100%">
            <el-option
              v-for="item in activityOptions"
              :key="item.activityId"
              :label="item.activityName + (item.activityStatus ? ' (' + item.activityStatus + ')' : '')"
              :value="item.activityId"
              :disabled="item.activityStatus === '已结束'"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户姓名" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户" filterable style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报名时间" prop="registerTime">
          <el-date-picker clearable
            v-model="form.registerTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择报名时间"
            disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="参与状态" prop="participantStatus">
          <el-select v-model="form.participantStatus" placeholder="请选择参与状态">
            <el-option
              v-for="dict in participant_statu"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签到时间" prop="signInTime" v-if="form.participantStatus >= 1">
          <el-date-picker clearable
            v-model="form.signInTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择签到时间"
            disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="评分" prop="rating" v-if="form.participantStatus >= 3">
          <el-rate v-model="form.rating" :max="5" show-score />
        </el-form-item>
        <el-form-item label="参与反馈" prop="feedback" v-if="form.participantStatus >= 3">
          <el-input v-model="form.feedback" type="textarea" :rows="4" placeholder="请输入反馈内容"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量签到对话框 -->
    <el-dialog title="批量签到" v-model="batchSignInOpen" width="500px" append-to-body>
      <p>您将为以下 {{ ids.length }} 名参与者执行签到操作：</p>
      <el-table :data="selectedRows" stripe style="width: 100%">
        <el-table-column label="用户姓名" prop="userName" />
        <el-table-column label="活动名称" prop="activityName" :show-overflow-tooltip="true" />
      </el-table>
      <el-form ref="batchSignInRef" :model="batchSignInForm" label-width="100px">
        <el-form-item label="签到时间" prop="signInTime">
          <el-date-picker 
            v-model="batchSignInForm.signInTime" 
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="签到时间为系统当前时间"
            disabled
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmBatchSignIn">确认签到</el-button>
          <el-button @click="batchSignInOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看评价对话框 -->
    <el-dialog title="用户评价" v-model="viewFeedbackOpen" width="500px" append-to-body>
      <div v-if="currentActivity">
        <div class="info-row">
          <span class="info-label">活动名称：</span>
          <span class="info-content">{{ currentActivity.activityName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">用户姓名：</span>
          <span class="info-content">{{ currentFeedback.userName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">评分：</span>
          <el-rate 
            v-model="currentFeedback.rating" 
            disabled 
            show-score 
            text-color="#ff9900"
          />
        </div>
        <el-divider></el-divider>
        <p>反馈内容：</p>
        <div class="feedback-content">{{ currentFeedback.feedback }}</div>
        <p>提交时间：{{ parseTime(currentFeedback.feedbackTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewFeedbackOpen = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Participant">
import { getCurrentInstance, ref, reactive, toRefs, computed, onMounted, watch } from 'vue';
import { 
  listParticipant, 
  getParticipant, 
  delParticipant, 
  addParticipant, 
  updateParticipant,
} from "@/api/manage/participant";
import { listActivity, getActivity } from "@/api/manage/activity";
import { listElderly } from "@/api/manage/elderly";
import { parseTime } from '@/utils/ruoyi';

// 修改formatDate函数，使用年月日时分秒格式
function formatDate(date, includeTime = true) {
  if (!date) {
    return '';
  }
  // 如果是字符串日期，直接返回
  if (typeof date === 'string') {
    // 处理已经格式化的日期字符串，包含完整时间
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
      return date;
    }
    // 处理已经格式化的日期字符串，缺少秒
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(date)) {
      return date + ':00'; // 添加秒
    }
    // 如果是纯日期格式，添加时间部分
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date + ' 00:00:00'; // 添加默认时间和秒
    }
  }
  
  // 使用parseTime格式化，包含完整时间部分
  return parseTime(date, '{y}-{m}-{d} {h}:{i}:{s}');
}

const { proxy } = getCurrentInstance();
const { participant_statu } = proxy.useDict('participant_statu');

// 数据列表和选项
const participantList = ref([]);
const userOptions = ref([]);
const activityOptions = ref([]);
const selectedRows = ref([]);

// 页面状态
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const title = ref("");
const open = ref(false);
const batchSignInOpen = ref(false);
const viewFeedbackOpen = ref(false);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const activeTab = ref('all');

// 当前选中的活动和反馈
const currentActivity = ref(null);
const currentFeedback = ref({
  participantId: null,
  userName: '',
  rating: null,
  feedback: '',
  feedbackTime: null
});

// 表单数据
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityId: null,
    userId: null,
    activityStatus: null,
    participantStatus: null
  },
  form: {
    participantId: null,
    activityId: null,
    userId: null,
    registerTime: formatDate(new Date(), true),
    participantStatus: 0,
    signInTime: null,
    rating: null,
    feedback: '',
    remark: ''
  },
  rules: {
    activityId: [
      { required: true, message: "活动不能为空", trigger: "change" }
    ],
    userId: [
      { required: true, message: "用户不能为空", trigger: "change" }
    ],
    registerTime: [
      { required: true, message: "报名时间不能为空", trigger: "blur" }
    ],
    participantStatus: [
      { required: true, message: "参与状态不能为空", trigger: "change" }
    ],
    rating: [
      { 
        validator: (rule, value, callback) => {
          // 只有在"已完成"状态下才验证评分
          if (form.value.participantStatus >= 3 && (value === null || value === undefined)) {
            callback(new Error("评分不能为空"));
          } else {
            callback();
          }
        },
        trigger: "change"
      }
    ],
    feedback: [
      {
        validator: (rule, value, callback) => {
          // 只有在"已完成"状态下才验证反馈
          if (form.value.participantStatus >= 3 && (!value || value.trim() === '')) {
            callback(new Error("反馈内容不能为空"));
          } else {
            callback();
          }
        },
        trigger: "blur"
      }
    ]
  },
  batchSignInForm: {
    signInTime: formatDate(new Date(), true)
  }
});

const { queryParams, form, rules, batchSignInForm } = toRefs(data);

// 根据标签页过滤数据
const filteredParticipantList = computed(() => {
  switch (activeTab.value) {
    case 'registered':
      return participantList.value.filter(item => item.participantStatus === 0);
    case 'checked':
      return participantList.value.filter(item => item.participantStatus === 1);
    case 'canceled':
      return participantList.value.filter(item => item.participantStatus === 2);
    case 'completed':
      return participantList.value.filter(item => item.participantStatus === 3);
    default:
      return participantList.value;
  }
});

/** 查询活动参与列表 */
function getList() {
  loading.value = true;
  
  // 确保已加载用户和活动数据
  Promise.all([
    userOptions.value.length ? Promise.resolve() : getUsers(),
    activityOptions.value.length ? Promise.resolve() : getActivities()
  ]).then(() => {
    // 获取参与列表数据
    return listParticipant(queryParams.value);
  }).then(response => {
    // 处理后端返回的数据，添加活动详情和用户名称
    const participantData = response.rows;
    
    // 获取活动详情并合并数据
    const activityPromises = [...new Set(participantData.map(item => item.activityId))]
      .map(activityId => {
        const activity = activityOptions.value.find(a => a.activityId === activityId);
        if (activity) {
          return Promise.resolve(activity);
        } else {
          return getActivity(activityId);
        }
      });
    
    return Promise.all(activityPromises).then(activities => {
      const activityMap = new Map();
      activities.forEach(activity => {
        if (activity) {
          activityMap.set(activity.activityId, activity);
        }
      });
      
      participantList.value = participantData.map(item => {
        const activity = activityMap.get(item.activityId) || {};
        return {
          ...item,
          activityName: activity.activityName || '未知活动',
          startTime: activity.startTime,
          endTime: activity.endTime,
          location: activity.location,
          userName: findUserNameById(item.userId)
        };
      });
      
      total.value = response.total;
      loading.value = false;
    });
  }).catch(error => {
    console.error("获取数据失败:", error);
    loading.value = false;
  });
}

/** 获取用户列表 */
function getUsers() {
  return listElderly({pageNum: 1, pageSize: 1000}).then(response => {
    userOptions.value = response.rows || [];
  });
}

/** 获取活动列表 */
function getActivities() {
  return listActivity({pageNum: 1, pageSize: 1000}).then(response => {
    activityOptions.value = response.rows || [];
  });
}

/** 根据用户ID查找用户名称 */
function findUserNameById(userId) {
  if (!userId) return '未知用户';
  
  const user = userOptions.value.find(item => item.id === userId);
  return user ? user.name : '未知用户';
}

/** 根据活动ID查找活动名称 */
function findActivityNameById(activityId) {
  if (!activityId) return '未知活动';
  
  const activity = activityOptions.value.find(item => item.activityId === activityId);
  return activity ? activity.activityName : '未知活动';
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    participantId: null,
    activityId: null,
    userId: null,
    registerTime: formatDate(new Date(), true),
    participantStatus: 0,
    signInTime: null,
    rating: null,
    feedback: '',
    remark: ''
  };
  proxy.resetForm("participantRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  activeTab.value = 'all';
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.participantId);
  selectedRows.value = selection;
  single.value = selection.length != 1;
  multiple.value = selection.length === 0;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  // 过滤已结束的活动
  const now = new Date();
  const availableActivities = activityOptions.value.filter(activity => {
    if (!activity.endTime) return true;
    const endTime = new Date(activity.endTime);
    return now <= endTime;
  });
  
  if (availableActivities.length === 0) {
    proxy.$modal.msgError("当前没有可报名的活动");
    return;
  }
  
  open.value = true;
  title.value = "添加活动参与";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _participantId = row.participantId || ids.value[0];
  getParticipant(_participantId).then(response => {
    form.value = response.data;
    
    // 如果是修改签到状态，需要检查活动时间
    if (row.participantStatus === 0 && form.value.participantStatus === 1) {
      const now = new Date();
      const startTime = new Date(row.startTime);
      const endTime = new Date(row.endTime);
      
      if (now < startTime) {
        proxy.$modal.msgWarning("注意：活动尚未开始，不建议手动签到");
      }
      
      if (now > endTime) {
        proxy.$modal.msgWarning("注意：活动已结束，不建议手动签到");
      }
    }
    
    open.value = true;
    title.value = "修改活动参与";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["participantRef"].validate(valid => {
    if (valid) {
      // 获取选择的活动信息
      const selectedActivity = activityOptions.value.find(item => item.activityId === form.value.activityId);
      
      if (selectedActivity) {
        const now = new Date();
        const startTime = new Date(selectedActivity.startTime);
        const endTime = new Date(selectedActivity.endTime);
        
        // 如果是新增报名，检查活动是否已结束
        if (!form.value.participantId && now > endTime) {
          proxy.$modal.msgError("该活动已结束，不能再报名");
          return;
        }
        
        // 如果是修改为签到状态，检查活动是否开始
        if (form.value.participantStatus === 1) {
          if (now < startTime) {
            proxy.$modal.msgError("活动尚未开始，不能签到");
            return;
          }
          
          if (now > endTime) {
            proxy.$modal.msgError("活动已结束，不能签到");
            return;
          }
        }
      }
      
      // 检查是否存在相同用户-活动组合
      const isDuplicate = form.value.participantId ? false : participantList.value.some(
        item => item.activityId === form.value.activityId && 
               item.userId === form.value.userId
      );
      
      if (isDuplicate) {
        proxy.$modal.msgError("该用户已经参与了此活动，不能重复添加");
        return;
      }
      
      // 准备提交数据，克隆表单对象以避免直接修改
      const submitData = { ...form.value };
      
      // 如果参与状态不是"已完成"(3)，则清除评分和反馈
      if (submitData.participantStatus < 3) {
        submitData.rating = null;
        submitData.feedback = '';
      }
      
      if (submitData.participantId != null) {
        updateParticipant(submitData).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addParticipant(submitData).then(response => {
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
  const _participantIds = row ? row.participantId : ids.value;
  proxy.$modal.confirm('是否确认删除活动参与编号为"' + _participantIds + '"的数据项？').then(function() {
    return delParticipant(_participantIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 处理活动签到 */
function handleSignIn(row) {
  // 检查活动时间范围
  const now = new Date();
  const startTime = new Date(row.startTime);
  const endTime = new Date(row.endTime);
  
  if (now < startTime) {
    proxy.$modal.msgError("活动尚未开始，不能签到");
    return;
  }
  
  if (now > endTime) {
    proxy.$modal.msgError("活动已结束，不能签到");
    return;
  }
  
  // 单个签到，使用通用的更新接口
  const formattedTime = parseTime(now, '{y}-{m}-{d} {h}:{i}:{s}');
  
  const signInData = {
    participantId: row.participantId,
    signInTime: formattedTime,
    participantStatus: 1 // 已签到状态
  };
  
  updateParticipant(signInData).then(response => {
    proxy.$modal.msgSuccess("签到成功");
    getList(); // 刷新列表
  }).catch(error => {
    console.error("签到失败:", error);
    proxy.$modal.msgError(error.message || "签到失败，请稍后重试");
  });
}

/** 处理批量签到 */
function handleBatchSignIn() {
  // 检查所选择的记录状态
  const invalidSelections = selectedRows.value.filter(row => row.participantStatus !== 0);
  if (invalidSelections.length > 0) {
    proxy.$modal.msgError("只能对未签到的记录执行批量签到操作");
    return;
  }
  
  batchSignInForm.value.signInTime = formatDate(new Date(), true);
  batchSignInOpen.value = true;
}

/** 确认批量签到 */
function confirmBatchSignIn() {
  // 检查选中的活动的时间范围
  const now = new Date();
  
  // 检查是否有未开始的活动
  const notStartedActivities = selectedRows.value.filter(row => {
    const startTime = new Date(row.startTime);
    return now < startTime;
  });
  
  if (notStartedActivities.length > 0) {
    const activityNames = notStartedActivities.map(row => row.activityName).join('、');
    proxy.$modal.msgError(`以下活动尚未开始，不能签到: ${activityNames}`);
    return;
  }
  
  // 检查是否有已结束的活动
  const endedActivities = selectedRows.value.filter(row => {
    const endTime = new Date(row.endTime);
    return now > endTime;
  });
  
  if (endedActivities.length > 0) {
    const activityNames = endedActivities.map(row => row.activityName).join('、');
    proxy.$modal.msgError(`以下活动已结束，不能签到: ${activityNames}`);
    return;
  }
  
  // 始终使用当前时间作为签到时间
  const formattedTime = parseTime(now, '{y}-{m}-{d} {h}:{i}:{s}');
  
  const signInPromises = ids.value.map(participantId => {
    return updateParticipant({
      participantId: participantId,
      signInTime: formattedTime,
      participantStatus: 1 // 已签到状态
    });
  });
  
  Promise.all(signInPromises)
    .then(() => {
      proxy.$modal.msgSuccess("批量签到成功");
      batchSignInOpen.value = false;
      getList();
    })
    .catch(error => {
      console.error("批量签到失败:", error);
      proxy.$modal.msgError("批量签到失败，请稍后重试");
    });
}

/** 查看反馈 */
function viewFeedback(row) {
  currentActivity.value = {
    activityId: row.activityId,
    activityName: row.activityName
  };
  
  currentFeedback.value = {
    participantId: row.participantId,
    userName: row.userName,
    rating: row.rating || 0, // 如果没有评分，显示0分而不是5分
    feedback: row.feedback || '暂无反馈内容',
    feedbackTime: row.updateTime
  };
  
  viewFeedbackOpen.value = true;
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/participant/export', {
    ...queryParams.value
  }, `活动参与记录_${new Date().getTime()}.xlsx`);
}

/** 处理标签页切换 */
function handleTabClick() {
  // 标签切换时应用过滤，但不需要重新请求数据
  if (participantList.value.length === 0) {
    getList();
  }
}

// 监听参与状态变化，动态调整表单字段
watch(() => form.value.participantStatus, (newVal, oldVal) => {
  // 当状态变为已签到时，自动设置签到时间
  if (newVal === 1 && !form.value.signInTime) {
    form.value.signInTime = formatDate(new Date(), true);
  }
  
  // 当状态从已完成变为其他状态，清除评分和反馈
  if (oldVal >= 3 && newVal < 3) {
    form.value.rating = null;
    form.value.feedback = '';
  }
  
  // 当状态变为已完成且没有评分时，设置默认评分
  if (newVal >= 3 && form.value.rating === null) {
    form.value.rating = 5;
  }
});

// 组件挂载时加载数据
onMounted(async () => {
  try {
    await Promise.all([getUsers(), getActivities()]);
    
    // 过滤活动列表，添加活动状态
    activityOptions.value = activityOptions.value.map(activity => {
      const now = new Date();
      const startTime = new Date(activity.startTime);
      const endTime = new Date(activity.endTime);
      
      let status = '';
      if (now < startTime) {
        status = '未开始';
      } else if (now > endTime) {
        status = '已结束';
      } else {
        status = '进行中';
      }
      
      return {
        ...activity,
        activityStatus: status
      };
    });
    
    getList();
  } catch (error) {
    console.error("初始数据加载失败:", error);
    loading.value = false;
  }
});
</script>

<style scoped>
.feedback-content {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  min-height: 80px;
  margin-bottom: 15px;
}
.info-row {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}
.info-label {
  font-weight: bold;
  width: 90px;
  color: #606266;
}
.info-content {
  flex: 1;
}
.el-tabs {
  margin-bottom: 15px;
}
</style>