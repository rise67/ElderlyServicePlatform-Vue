import request from '@/utils/request'

// 查询活动参与列表
export function listParticipant(query) {
  return request({
    url: '/manage/participant/list',
    method: 'get',
    params: query
  })
}

// 查询活动参与详细
export function getParticipant(participantId) {
  return request({
    url: '/manage/participant/' + participantId,
    method: 'get'
  })
}

// 新增活动参与
export function addParticipant(data) {
  return request({
    url: '/manage/participant',
    method: 'post',
    data: data
  })
}

// 修改活动参与
export function updateParticipant(data) {
  return request({
    url: '/manage/participant',
    method: 'put',
    data: data
  })
}

// 删除活动参与
export function delParticipant(participantId) {
  return request({
    url: '/manage/participant/' + participantId,
    method: 'delete'
  })
}

// 活动签到
export function signInActivity(data) {
  return request({
    url: '/manage/participant/signin',
    method: 'put',
    data: data
  })
}

// 取消报名
export function cancelRegistration(participantId) {
  return request({
    url: `/manage/participant/cancel/${participantId}`,
    method: 'put'
  })
}

// 提交活动反馈
export function submitActivityFeedback(data) {
  return request({
    url: '/manage/participant/feedback',
    method: 'put',
    data: data
  })
}
