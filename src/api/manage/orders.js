import request from '@/utils/request'

// 查询服务订单列表
export function listOrders(query) {
  return request({
    url: '/manage/orders/list',
    method: 'get',
    params: query
  })
}

// 查询服务订单详细
export function getOrders(orderId) {
  return request({
    url: '/manage/orders/' + orderId,
    method: 'get'
  })
}
//查询服务订单项根据订单id
export function getOrderItems(orderId) {
  return request({
    url: '/manage/orders/items/' + orderId,
    method: 'get'
  })
}
// 新增服务订单
export function addOrders(data) {
  return request({
    url: '/manage/orders',
    method: 'post',
    data: data
  })
}

// 修改服务订单
export function updateOrders(data) {
  return request({
    url: '/manage/orders',
    method: 'put',
    data: data
  })
}

// 删除服务订单
export function delOrders(orderId) {
  return request({
    url: '/manage/orders/' + orderId,
    method: 'delete'
  })
}
