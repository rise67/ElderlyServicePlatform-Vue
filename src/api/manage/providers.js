import request from '@/utils/request'

// 查询服务人员列表
export function listProviders(query) {
  return request({
    url: '/manage/providers/list',
    method: 'get',
    params: query
  })
}

// 查询服务人员详细
export function getProviders(id) {
  return request({
    url: '/manage/providers/' + id,
    method: 'get'
  })
}

// 新增服务人员
export function addProviders(data) {
  return request({
    url: '/manage/providers',
    method: 'post',
    data: data
  })
}

// 修改服务人员
export function updateProviders(data) {
  return request({
    url: '/manage/providers',
    method: 'put',
    data: data
  })
}

// 删除服务人员
export function delProviders(id) {
  return request({
    url: '/manage/providers/' + id,
    method: 'delete'
  })
}
