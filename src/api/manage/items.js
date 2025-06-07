import request from '@/utils/request'

// 查询订单明细列表
export function listItems(query) {
  return request({
    url: '/manage/items/list',
    method: 'get',
    params: query
  })
}

// 查询订单明细详细
export function getItems(itemId) {
  return request({
    url: '/manage/items/' + itemId,
    method: 'get'
  })
}

// 新增订单明细
export function addItems(data) {
  return request({
    url: '/manage/items',
    method: 'post',
    data: data
  })
}

// 修改订单明细
export function updateItems(data) {
  return request({
    url: '/manage/items',
    method: 'put',
    data: data
  })
}

// 删除订单明细
export function delItems(itemId) {
  return request({
    url: '/manage/items/' + itemId,
    method: 'delete'
  })
}
