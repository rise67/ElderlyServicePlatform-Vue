import request from '@/utils/request'

// 查询活动信息列表
export function listActivity(query) {
  return request({
    url: '/manage/activity/list',
    method: 'get',
    params: query
  })
}

// 查询活动信息详细
export function getActivity(activityId) {
  return request({
    url: '/manage/activity/' + activityId,
    method: 'get'
  })
}

// 新增活动信息
export function addActivity(data) {
  return request({
    url: '/manage/activity',
    method: 'post',
    data: data
  })
}

// 修改活动信息
export function updateActivity(data) {
  return request({
    url: '/manage/activity',
    method: 'put',
    data: data
  })
}

// 删除活动信息
export function delActivity(activityId) {
  return request({
    url: '/manage/activity/' + activityId,
    method: 'delete'
  })
}
