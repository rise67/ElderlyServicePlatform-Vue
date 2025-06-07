import request from '@/utils/request'

// 查询服务信息列表
export function listServices() {
  return request({
    url: '/manage/services/list',
    method: 'get'
  })
}

// 查询服务信息详细
export function getServices(id) {
  return request({
    url: '/manage/services/' + id,
    method: 'get'
  })
}

// 新增服务信息
export function addServices(data) {
  return request({
    url: '/manage/services',
    method: 'post',
    data: data
  })
}

// 修改服务信息
export function updateServices(data) {
  return request({
    url: '/manage/services',
    method: 'put',
    data: data
  })
}

// 删除服务信息
export function delServices(id) {
  return request({
    url: '/manage/services/' + id,
    method: 'delete'
  })
}
