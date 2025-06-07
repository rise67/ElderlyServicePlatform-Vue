<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动名称" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入活动名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动类型" prop="activityTypeId">
        <el-select v-model="queryParams.activityTypeId" placeholder="请选择活动类型" clearable>
          <el-option
            v-for="item in activityTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:activity:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:activity:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:activity:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:activity:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="活动序号" align="center" prop="activityId" />
      <el-table-column label="封面图" align="center" prop="coverImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.coverImage" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="活动名称" align="center" prop="activityName" />
      <el-table-column label="活动类型" align="center" prop="activityTypeId">
        <template #default="scope">
          {{ getActivityTypeName(scope.row.activityTypeId) }}
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动地址" align="center" prop="location" />
      <el-table-column label="最大参与人数" align="center" prop="maxParticipants" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:activity:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:activity:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改活动信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="activityRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型" prop="activityTypeId">
          <el-select v-model="form.activityTypeId" placeholder="请选择活动类型" style="width: 100%">
            <el-option
              v-for="item in activityTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择开始时间"
            :disabledDate="disabledStartDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择结束时间"
            :disabledDate="disabledEndDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动地址" prop="location">
          <el-input v-model="form.location" placeholder="请输入活动地址" />
        </el-form-item>
        <el-form-item label="参与人数" prop="maxParticipants">
          <el-input-number v-model="form.maxParticipants" :min="1" placeholder="请输入最大参与人数" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverImage">
          <image-upload 
            v-model="form.coverImage" 
            :limit="1" 
            :file-size="5" 
            :is-show-tip="true"
            :file-type="['jpg']"
            tip-text="只能上传JPG格式图片，大小不超过5MB" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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

<script setup name="Activity">
import { ref, reactive, toRefs, getCurrentInstance, watch, onMounted } from 'vue';
import { parseTime } from '@/utils/ruoyi';
import { listActivity, getActivity, delActivity, addActivity, updateActivity } from "@/api/manage/activity";
import { listType } from "@/api/manage/type";

const { proxy } = getCurrentInstance();

const activityList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const activityTypeOptions = ref([]);

// 获取活动类型并转换格式
function getActivityTypes() {
  return listType().then(response => {
    // 原始数据
    const typeData = response.rows || [];
    // 转换为dict-tag需要的格式
    activityTypeOptions.value = typeData.map(item => ({
      value: item.typeId,
      label: item.typeName
    }));
    console.log("活动类型数据:", activityTypeOptions.value);
  });
}

// 辅助函数：根据类型ID获取类型名称
function getActivityTypeName(typeId) {
  const type = activityTypeOptions.value.find(item => item.value === typeId);
  return type ? type.label : '未知类型';
}

// 禁用开始日期（不能选择过去的日期）
function disabledStartDate(time) {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期
}

// 禁用结束日期（不能早于开始日期）
function disabledEndDate(time) {
  if (!form.value.startTime) {
    return time.getTime() < Date.now() - 8.64e7;
  }
  
  const startDate = new Date(form.value.startTime);
  const timeDate = new Date(time);
  
  // 清除时间部分，只比较日期
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const timeDay = new Date(timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate());
  
  // 允许选择同一天，但不能早于开始日期
  return timeDay < startDay;
}

/** 查询活动信息列表 */
function getList() {
  loading.value = true;
  Promise.all([
    listActivity(queryParams.value),
    activityTypeOptions.value.length ? Promise.resolve() : getActivityTypes()
  ]).then(([response]) => {
    activityList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  }).catch(error => {
    console.error("获取活动列表失败:", error);
    loading.value = false;
  });
}

/** 表单重置 */
function reset() {
  form.value = {
    activityId: null,
    activityName: null,
    activityTypeId: null,
    startTime: null,
    endTime: null,
    location: null,
    maxParticipants: 30,
    coverImage: null,
    remark: null
  };
  
  // 重置表单校验
  if (proxy.$refs["activityRef"]) {
    proxy.$refs["activityRef"].resetFields();
  }
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityName: null,
    activityTypeId: null,
    status: null,
  },
  rules: {
    activityName: [
      { required: true, message: "活动名称不能为空", trigger: "blur" }
    ],
    activityTypeId: [
      { required: true, message: "活动类型不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "开始时间不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "结束时间不能为空", trigger: "blur" },
      { 
        validator: (rule, value, callback) => {
          if (value && form.value.startTime) {
            const startTime = new Date(form.value.startTime).getTime();
            const endTime = new Date(value).getTime();
            if (endTime <=startTime) {
              callback(new Error('结束时间不能早于开始时间'));
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ],
    location: [
      { required: true, message: "活动地址不能为空", trigger: "blur" }
    ],
    maxParticipants: [
      { required: true, message: "最大参与人数不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

// 监听开始时间变化，确保结束时间始终正确
watch(() => form.value.startTime, (newStartTime) => {
  if (newStartTime && form.value.endTime) {
    const startTime = new Date(newStartTime).getTime();
    const endTime = new Date(form.value.endTime).getTime();
    
    if (endTime < startTime) {
      // 如果结束时间早于开始时间，自动调整结束时间
      const newEndTime = new Date(startTime);
      newEndTime.setHours(newEndTime.getHours() + 1); // 设置为开始时间后1小时
      form.value.endTime = parseTime(newEndTime, '{y}-{m}-{d} {h}:{i}:{s}');
      
      proxy.$message({
        message: '结束时间已自动调整为开始时间后1小时',
        type: 'warning'
      });
    }
  }
});

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
  ids.value = selection.map(item => item.activityId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加活动信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _activityId = row.activityId || ids.value
  getActivity(_activityId).then(response => {
    // 确保有活动类型数据
    if (activityTypeOptions.value.length === 0) {
      getActivityTypes();
    }
    form.value = response.data;
    open.value = true;
    title.value = "修改活动信息";
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["activityRef"].validate(valid => {
    if (valid) {
      // 额外检查开始时间和结束时间
      if (form.value.startTime && form.value.endTime) {
        const startTime = new Date(form.value.startTime).getTime();
        const endTime = new Date(form.value.endTime).getTime();
        
        console.log("提交前时间验证:", {
          startTime: form.value.startTime,
          endTime: form.value.endTime,
          startTimeMs: startTime,
          endTimeMs: endTime,
          isValid: endTime >= startTime
        });
        
        if (endTime < startTime) {
          proxy.$modal.msgError("结束时间不能早于开始时间");
          return;
        }
      }
      if (form.value.activityId != null) {
        updateActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).catch(error => {
          console.error("修改活动失败:", error);
          if (error.message && error.message.includes("constraint")) {
            proxy.$modal.msgError("提交失败：开始时间必须早于结束时间");
          } else {
            proxy.$modal.msgError("修改失败：" + (error.message || "未知错误"));
          }
        });
      } else {
        addActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        }).catch(error => {
          console.error("新增活动失败:", error);
          if (error.message && error.message.includes("constraint")) {
            proxy.$modal.msgError("提交失败：开始时间必须早于结束时间");
          } else {
            proxy.$modal.msgError("新增失败：" + (error.message || "未知错误"));
          }
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _activityIds = row.activityId || ids.value;
  proxy.$modal.confirm('是否确认删除活动信息编号为"' + _activityIds + '"的数据项？').then(function() {
    return delActivity(_activityIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/activity/export', {
    ...queryParams.value
  }, `activity_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getActivityTypes().then(() => {
    getList();
  });
});
</script>
