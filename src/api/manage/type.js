import request from '@/utils/request'

// 查询活动类型列表
export function listType(query) {
  return request({
    url: '/manage/type/list',
    method: 'get',
    params: query
  })
}

// 查询活动类型详细
export function getType(typeId) {
  return request({
    url: '/manage/type/' + typeId,
    method: 'get'
  })
}

// 新增活动类型
export function addType(data) {
  return request({
    url: '/manage/type',
    method: 'post',
    data: data
  })
}

// 修改活动类型
export function updateType(data) {
  return request({
    url: '/manage/type',
    method: 'put',
    data: data
  })
}

// 删除活动类型
export function delType(typeId) {
  return request({
    url: '/manage/type/' + typeId,
    method: 'delete'
  })
}
