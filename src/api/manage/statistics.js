import request from '@/utils/request'

// 获取订单数量
export function getOrderCount(query) {
  return request({
    url: '/manage/statistics/orderCount',
    method: 'get',
    params: query
  })
}

// 获取总收入
export function getTotalIncome(query) {
  return request({
    url: '/manage/statistics/totalIncome',
    method: 'get',
    params: query
  })
}

// 获取活跃用户数
export function getActiveUserCount(query) {
  return request({
    url: '/manage/statistics/activeUserCount',
    method: 'get',
    params: query
  })
}

// 获取订单趋势
export function getOrderTrend(query) {
  return request({
    url: '/manage/statistics/orderTrend',
    method: 'get',
    params: query
  })
}

// 获取服务类型分布
export function getServiceDistribution(query) {
  return request({
    url: '/manage/statistics/serviceDistribution',
    method: 'get',
    params: query
  })
}

// 获取订单状态分布
export function getOrderStatusDistribution(query) {
  return request({
    url: '/manage/statistics/orderStatusDistribution',
    method: 'get',
    params: query
  })
}

// 获取服务人员排行
export function getProviderRanking(query) {
  return request({
    url: '/manage/statistics/providerRanking',
    method: 'get',
    params: query
  })
}

// 获取服务类型详细统计
export function getServiceDetailStats(query) {
  return request({
    url: '/manage/statistics/serviceDetailStats',
    method: 'get',
    params: query
  })
}

  // 获取活动详情统计
export function getActivityDetailStats(query) {
  return request({
    url: '/manage/statistics/activityDetailStats',
    method: 'get',
    params: query
  })
}

// 获取活动参与统计数据
export function getActivityParticipantStats(query) {
  return request({
    url: '/manage/statistics/activityParticipantStats',
    method: 'get',
    params: query
  })
}
