<template>
  <div class="app-container">
    <!-- 时间过滤器 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" class="filter-container">
      <el-form-item label="统计周期">
        <el-radio-group v-model="queryParams.period" @change="handlePeriodChange">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="quarter">本季度</el-radio-button>
          <el-radio-button label="year">本年</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="queryParams.period === 'custom'">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="fetchData">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="card-panel">
      <el-col :span="6" v-for="item in overviewData" :key="item.id">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="card-item">
            <div class="card-icon" :style="{ background: item.color }">
              <el-icon :size="24" color="#fff">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value">
                <count-to
                  :start-val="0"
                  :end-val="item.value"
                  :duration="2000"
                  :decimals="item.decimals || 0"
                  separator=","
                />
                <span class="card-unit" v-if="item.unit">{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>订单趋势分析</span>
              <el-radio-group v-model="orderChartType" size="small" @change="updateOrderChart">
                <el-radio-button label="count">订单量</el-radio-button>
                <el-radio-button label="amount">金额</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="orderChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>服务分布</span>
            </div>
          </template>
          <div ref="serviceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>热门服务人员排行</span>
            </div>
          </template>
          <div ref="providerChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 活动参与统计图表 -->
    <el-row :gutter="20" class="chart-row" v-if="false">
      <el-col :span="24">
      <el-card shadow="hover" class="chart-card">
        <template #header>
        <div class="chart-header">
          <span>活动参与统计</span>
          <el-radio-group v-model="activityChartType" size="small" @change="updateActivityChart">
          <el-radio-button label="participants">报名人数</el-radio-button>
          <el-radio-button label="signIn">签到人数</el-radio-button>
          <el-radio-button label="rating">平均评分</el-radio-button>
          </el-radio-group>
        </div>
        </template>
        <div ref="activityChartRef" class="chart-container"></div>
      </el-card>
      </el-col>
    </el-row>
    <!-- 详细数据表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="table-header">
          <span>服务类型数据明细</span>
          <!-- <el-button type="primary" size="small" @click="handleExport">导出数据</el-button> -->
        </div>
      </template>
      <el-table :data="tableData" border style="width: 100%" :stripe="true">
        <el-table-column prop="serviceName" label="服务类型" align="center" />
        <el-table-column prop="orderCount" label="订单数量" align="center" sortable />
        <el-table-column prop="totalIncome" label="总收入(元)" align="center" sortable>
          <template #default="scope">
            {{ scope.row.totalIncome.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="服务用户数" align="center" sortable />
        <el-table-column prop="avgPrice" label="平均单价(元)" align="center" sortable>
          <template #default="scope">
            {{ scope.row.avgPrice.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  <el-card shadow="hover" class="table-card">
    <template #header>
    <div class="table-header">
      <span>活动参与统计</span>
    </div>
    </template>
    <el-table :data="[
    { activityName: '春季养生健康讲座', totalParticipants: 1, signInCount: 1, signInRate: 100, avgRating: 5 },
    { activityName: '五一劳动，强身健体', totalParticipants: 1, signInCount: 1, signInRate: 100, avgRating: 5 },
    { activityName: '兴趣书法', totalParticipants: 1, signInCount: 1, signInRate: 100, avgRating: 5 },
    { activityName: '广场舞', totalParticipants: 2, signInCount: 2, signInRate: 100, avgRating: 5 },
    { activityName: '下棋', totalParticipants: 1, signInCount: 1, signInRate: 100, avgRating: 5 }
    ]" border style="width: 100%" :stripe="true">
    <el-table-column prop="activityName" label="活动名称" align="center" />
    <el-table-column prop="totalParticipants" label="报名人数" align="center" sortable />
    <el-table-column prop="signInCount" label="签到人数" align="center" sortable />
    <el-table-column prop="signInRate" label="签到率" align="center">
      <template #default="scope">
      {{ scope.row.signInRate }}%
      </template>
    </el-table-column>
    <el-table-column prop="avgRating" label="平均评分" align="center">
      <template #default="scope">
      {{ scope.row.avgRating ? scope.row.avgRating.toFixed(1) : '-' }}
      </template>
    </el-table-column>
    </el-table>
  </el-card>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { getCurrentInstance } from 'vue';
import * as echarts from 'echarts';
import { CountTo } from 'vue3-count-to';
import { 
  getOrderCount, 
  getTotalIncome, 
  getActiveUserCount, 
  getOrderTrend, 
  getServiceDistribution, 
  getOrderStatusDistribution, 
  getProviderRanking, 
  getServiceDetailStats,
  getActivityParticipantStats 
} from '@/api/manage/statistics';

const { proxy } = getCurrentInstance();

// 图表实例
let orderChart = null;
let serviceChart = null;
let statusChart = null;
let providerChart = null;

// DOM引用
const orderChartRef = ref(null);
const serviceChartRef = ref(null);
const statusChartRef = ref(null);
const providerChartRef = ref(null);

// 查询参数
const queryParams = reactive({
  period: 'month', // 默认查询本月数据
  startDate: '',
  endDate: ''
});

// 自定义日期范围
const dateRange = ref([]);

// 概览数据
const overviewData = ref([
  { 
    id: 1, 
    title: '总订单数', 
    value: 0, 
    icon: 'Tickets', 
    color: '#409EFF', 
    compare: 0 
  },
  { 
    id: 2, 
    title: '总收入', 
    value: 0, 
    icon: 'Money', 
    color: '#67C23A', 
    unit: '元', 
    decimals: 2, 
    compare: 0 
  },
  { 
    id: 3, 
    title: '活跃用户', 
    value: 0, 
    icon: 'User', 
    color: '#E6A23C', 
    compare: 0 
  },
  { 
    id: 4, 
    title: '完成率', 
    value: 0, 
    icon: 'CircleCheck', 
    color: '#F56C6C', 
    unit: '%', 
    compare: 0 
  }
]);

// 图表数据
const orderChartData = ref({
  dates: [],
  countData: [],
  amountData: []
});

const serviceDistribution = ref([]);
const statusDistribution = ref([]);
const providerRanking = ref([]);

// 表格数据
const tableData = ref([]);

// 订单图表类型
const orderChartType = ref('count');

// 活动参与数据
const activityParticipantData = ref([]);

// 处理周期变更
const handlePeriodChange = (period) => {
  // 根据选择的周期设置日期范围
  if (period !== 'custom') {
    dateRange.value = [];
    
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      // 本周
      startDate.setDate(now.getDate() - now.getDay());
    } else if (period === 'month') {
      // 本月
      startDate.setDate(1);
    } else if (period === 'quarter') {
      // 本季度
      const quarter = Math.floor(now.getMonth() / 3);
      startDate.setMonth(quarter * 3);
      startDate.setDate(1);
    } else if (period === 'year') {
      // 本年
      startDate.setMonth(0);
      startDate.setDate(1);
    }
    
    startDate.setHours(0, 0, 0, 0);
    
    queryParams.startDate = formatDate(startDate);
    queryParams.endDate = formatDate(now);
  }
};

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 重置查询
const resetQuery = () => {
  queryParams.period = 'month';
  dateRange.value = [];
  handlePeriodChange('month');
  fetchData();
};

// 获取统计数据
const fetchData = async () => {
  // 如果是自定义日期，需要设置开始和结束日期
  if (queryParams.period === 'custom' && dateRange.value && dateRange.value.length === 2) {
    queryParams.startDate = dateRange.value[0];
    queryParams.endDate = dateRange.value[1];
  }

  try {
    // 构建查询参数
    const params = {
      startDate: queryParams.startDate,
      endDate: queryParams.endDate
    };

    // 获取当前期间数据
    const [
      totalOrders,
      totalIncome,
      activeUsers,
      completedOrders,
      orderTrendData,
      serviceDistributionData,
      statusDistributionData,
      providerRankingData,
      serviceDetailsData,
      activityParticipantStatsData
    ] = await Promise.all([
      getOrderCount(params),
      getTotalIncome(params),
      getActiveUserCount(params),
      getOrderCount({ ...params, orderStatus: '2' }),
      getOrderTrend({ ...params, interval: queryParams.period === 'year' || queryParams.period === 'quarter' ? 'month' : 'day' }),
      getServiceDistribution(params),
      getOrderStatusDistribution(params),
      getProviderRanking(params),
      getServiceDetailStats(params),
      getActivityParticipantStats(params)
    ]);

    // 更新活动参与数据
    activityParticipantData.value = activityParticipantStatsData;
    
    // 获取上一期间数据用于计算环比
    const prevParams = calculatePrevPeriodParams();
    const [
      prevTotalOrders,
      prevTotalIncome,
      prevActiveUsers,
      prevCompletedOrders
    ] = await Promise.all([
      getOrderCount(prevParams),
      getTotalIncome(prevParams),
      getActiveUserCount(prevParams),
      getOrderCount({ ...prevParams, orderStatus: '1' })
    ]);

    // 计算完成率和环比
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const prevCompletionRate = prevTotalOrders > 0 ? Math.round((prevCompletedOrders / prevTotalOrders) * 100) : 0;
    
    const orderCompare = calculateGrowthRate(totalOrders, prevTotalOrders);
    const incomeCompare = calculateGrowthRate(totalIncome, prevTotalIncome);
    const userCompare = calculateGrowthRate(activeUsers, prevActiveUsers);
    const rateCompare = completionRate - prevCompletionRate;

    // 更新概览数据
    overviewData.value[0].value = totalOrders;
    overviewData.value[0].compare = orderCompare;
    
    overviewData.value[1].value = totalIncome;
    overviewData.value[1].compare = incomeCompare;
    
    overviewData.value[2].value = activeUsers;
    overviewData.value[2].compare = userCompare;
    
    overviewData.value[3].value = completionRate;
    overviewData.value[3].compare = rateCompare;
    
    // 更新图表数据
    orderChartData.value = {
      dates: orderTrendData.map(item => item.date),
      countData: orderTrendData.map(item => item.count),
      amountData: orderTrendData.map(item => item.amount)
    };
    
    serviceDistribution.value = serviceDistributionData;
    statusDistribution.value = statusDistributionData;
    providerRanking.value = providerRankingData;
    
    // 更新表格数据
    tableData.value = serviceDetailsData;
    
    // 更新图表
    nextTick(() => {
      initOrderChart();
      initServiceChart();
      initStatusChart();
      initProviderChart();
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    proxy.$modal.msgError('获取统计数据失败');
  }
};

// 计算增长率
const calculateGrowthRate = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

// 计算上一个周期的参数
const calculatePrevPeriodParams = () => {
  const prevParams = {};
  const currentStart = new Date(queryParams.startDate);
  const currentEnd = new Date(queryParams.endDate);
  
  // 计算当前周期的天数
  const diffInTime = currentEnd.getTime() - currentStart.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24)) + 1;
  
  // 计算上一周期的结束日期（当前开始日期的前一天）
  const prevEnd = new Date(currentStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  
  // 计算上一周期的开始日期
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - diffInDays + 1);
  
  // 格式化日期
  prevParams.startDate = formatDate(prevStart);
  prevParams.endDate = formatDate(prevEnd);
  
  return prevParams;
};

// 更新订单图表
const updateOrderChart = () => {
  if (orderChart) {
    const option = {
      series: [
        {
          name: orderChartType.value === 'count' ? '订单数量' : '订单金额',
          data: orderChartType.value === 'count' ? orderChartData.value.countData : orderChartData.value.amountData,
        }
      ]
    };
    orderChart.setOption(option);
  }
};

// 初始化订单趋势图表
const initOrderChart = () => {
  if (!orderChartRef.value) return;
  
  // 销毁旧图表
  if (orderChart) {
    orderChart.dispose();
  }
  
  orderChart = echarts.init(orderChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: orderChartData.value.dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: orderChartType.value === 'count' ? '订单数量' : '订单金额',
        type: 'line',
        data: orderChartType.value === 'count' ? orderChartData.value.countData : orderChartData.value.amountData,
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#409EFF'
        },
        emphasis: {
          focus: 'series'
        }
      }
    ]
  };
  
  orderChart.setOption(option);
  
  window.addEventListener('resize', () => {
    orderChart && orderChart.resize();
  });
};

// 初始化服务分布图表
const initServiceChart = () => {
  if (!serviceChartRef.value) return;
  
  if (serviceChart) {
    serviceChart.dispose();
  }
  
  serviceChart = echarts.init(serviceChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: serviceDistribution.value.map(item => item.name)
    },
    series: [
      {
        name: '服务类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: serviceDistribution.value
      }
    ]
  };
  
  serviceChart.setOption(option);
  
  window.addEventListener('resize', () => {
    serviceChart && serviceChart.resize();
  });
};

// 初始化订单状态图表
const initStatusChart = () => {
  if (!statusChartRef.value) return;
  
  if (statusChart) {
    statusChart.dispose();
  }
  
  statusChart = echarts.init(statusChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: statusDistribution.value.map(item => item.name)
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        data: statusDistribution.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c} ({d}%)'
        }
      }
    ]
  };
  
  statusChart.setOption(option);
  
  window.addEventListener('resize', () => {
    statusChart && statusChart.resize();
  });
};

// 初始化服务人员排行图表
const initProviderChart = () => {
  if (!providerChartRef.value) return;
  
  if (providerChart) {
    providerChart.dispose();
  }
  
  providerChart = echarts.init(providerChartRef.value);
  
  // 图表数据准备
  const providerNames = providerRanking.value.map(item => item.name);
  const providerValues = providerRanking.value.map(item => item.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: providerNames.reverse(),
      axisLabel: {
        formatter: function(value) {
          if (value.length > 6) {
            return value.substring(0, 6) + '...';
          }
          return value;
        }
      }
    },
    series: [
      {
        name: '服务订单数',
        type: 'bar',
        data: providerValues.reverse(),
        itemStyle: {
          color: function(params) {
            // 生成渐变色
            const colorList = ['#83bff6', '#188df0', '#005eaa'];
            return colorList[params.dataIndex % 3];
          }
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  };
  
  providerChart.setOption(option);
  
  window.addEventListener('resize', () => {
    providerChart && providerChart.resize();
  });
};

// // 导出数据
// const handleExport = () => {
//   exportStatisticsData({
//     ...queryParams
//   }).then(response => {
//     proxy.download(response.msg);
//   });
// };

// 页面加载时初始化
onMounted(() => {
  handlePeriodChange(queryParams.period);
  fetchData();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-panel {
  margin-bottom: 20px;
  
  .card-item {
    display: flex;
    align-items: center;
    
    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
    }
    
    .card-content {
      flex: 1;
      
      .card-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .card-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        display: flex;
        align-items: baseline;
        
        .card-unit {
          font-size: 12px;
          color: #909399;
          margin-left: 5px;
        }
      }
      
      .card-compare {
        margin-top: 5px;
        font-size: 12px;
        display: flex;
        align-items: center;
        
        .up {
          color: #67C23A;
          display: flex;
          align-items: center;
        }
        
        .down {
          color: #F56C6C;
          display: flex;
          align-items: center;
        }
        
        .compare-text {
          color: #909399;
          margin-left: 5px;
        }
      }
    }
  }
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .chart-container {
    height: 350px;
  }
}

.table-card {
  margin-bottom: 20px;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.growth-up {
  color: #67C23A;
}

.growth-down {
  color: #F56C6C;
}

// 响应式调整
@media (max-width: 1200px) {
  .card-panel {
    .el-col {
      width: 50%;
      margin-bottom: 20px;
    }
  }
  
  .chart-row {
    .el-col {
      width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .card-panel {
    .el-col {
      width: 100%;
    }
  }
}
</style>