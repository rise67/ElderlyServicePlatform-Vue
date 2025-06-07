
@RestController
@RequestMapping("/manage/orders")
public class OrdersController {

    @Autowired
    private IOrdersService ordersService;

    @Autowired
    private IOrderItemsService orderItemsService;

    /**
     * 获取订单项详情
     */
    @GetMapping("/{orderId}/items")
    public AjaxResult getOrderItems(@PathVariable Long orderId) {
        List<OrderItems> items = orderItemsService.selectOrderItemsByOrderId(orderId);
        return AjaxResult.success(items);
    }

    /**
     * 新增订单
     */
    @PostMapping
    public AjaxResult add(@RequestBody Orders orders) {
        // 计算订单总价
        double totalAmount = calculateTotalAmount(orders.getOrderItems());
        orders.setTotalAmount(totalAmount);
        return toAjax(ordersService.insertOrders(orders));
    }

    /**
     * 修改订单
     */
    @PutMapping
    public AjaxResult edit(@RequestBody Orders orders) {
        // 计算订单总价
        double totalAmount = calculateTotalAmount(orders.getOrderItems());
        orders.setTotalAmount(totalAmount);
        return toAjax(ordersService.updateOrders(orders));
    }

    /**
     * 计算订单总价
     */
    private double calculateTotalAmount(List<OrderItems> items) {
        return items.stream().mapToDouble(OrderItems::getItemPrice).sum();
    }

}