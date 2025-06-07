import request from '@/utils/request'

// 查询老人信息列表
export function listElderly(query) {
  return request({
    url: '/manage/elderly/list',
    method: 'get',
    params: query
  })
}

// 查询老人信息详细
export function getElderly(id) {
  return request({
    url: '/manage/elderly/' + id,
    method: 'get'
  })
}

// 新增老人信息
export function addElderly(data) {
  return request({
    url: '/manage/elderly',
    method: 'post',
    data: data
  })
}

// 修改老人信息
export function updateElderly(data) {
  return request({
    url: '/manage/elderly',
    method: 'put',
    data: data
  })
}

// 删除老人信息
export function delElderly(id) {
  return request({
    url: '/manage/elderly/' + id,
    method: 'delete'
  })
}
