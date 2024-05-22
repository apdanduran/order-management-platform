import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button } from "antd";
import {
  fetchBaskets,
  fetchOrders,
  fetchCouriers,
  updateOrderStatus,
} from "../api";

const BasketsTable = () => {
  const queryClient = useQueryClient();

  const {
    data: baskets,
    isLoading: basketsLoading,
    isError: basketsError,
  } = useQuery({
    queryKey: ["baskets"],
    queryFn: fetchBaskets,
  });

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const {
    data: couriers,
    isLoading: couriersLoading,
    isError: couriersError,
  } = useQuery({
    queryKey: ["couriers"],
    queryFn: fetchCouriers,
  });

  const mutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });

  if (basketsLoading || ordersLoading || couriersLoading) {
    return <div>Loading...</div>;
  }

  if (basketsError || ordersError || couriersError) {
    return <div>Error loading data</div>;
  }

  const courierMap = couriers
    ? couriers.reduce((map, courier) => {
        map[courier.id] = courier.name;
        return map;
      }, {})
    : {};

  const handleStatusChange = (orderId, status) => {
    mutation.mutate({ orderId, status });
  };

  const validStatuses = ["ON_THE_WAY", "DELIVERED", "NOT_DELIVERED"];

  const basketData = baskets
    ? baskets
        .filter((basket) => basket.status === "ON_THE_WAY")
        .map((basket) => {
          const basketOrders = basket.orders
            .map((orderId) =>
              orders
                ? orders.find((order) => order.id === String(orderId))
                : null
            )
            .filter(
              (order) => order !== null && validStatuses.includes(order.status)
            );

          const allOrdersDelivered = basketOrders.every(
            (order) => order.status === "DELIVERED"
          );

          if (allOrdersDelivered) {
            return null;
          }

          return {
            key: basket.id,
            courierName: courierMap[basket.courier_id],
            orders: basketOrders,
          };
        })
        .filter(Boolean)
    : [];

  const columns = [
    {
      title: "Kurye İsmi",
      dataIndex: "courierName",
      key: "courierName",
    },
    {
      title: "Siparişler",
      dataIndex: "orders",
      key: "orders",
      render: (orders) => (
        <ul>
          {orders.map((order) => (
            <li
              key={order.id}
              style={{
                marginBottom: "16px",
                padding: "10px",
                backgroundColor:
                  order.status === "DELIVERED"
                    ? "#d4edda"
                    : order.status === "NOT_DELIVERED"
                    ? "#f8d7da"
                    : "#fff3cd",
                borderRadius: "4px",
              }}
            >
              <p>Adres: {order.address}</p>
              <p>Ödeme: {order.payment}</p>
              <p>Teslimat Süresi: {order.delivery_time}</p>
              <p>Siparişler:</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
              <p>Status: {order.status}</p>
              <Button
                type="primary"
                onClick={() => handleStatusChange(order.id, "DELIVERED")}
                style={{ marginRight: "8px" }}
              >
                Teslim Edildi
              </Button>
              <Button
                type="default"
                onClick={() => handleStatusChange(order.id, "NOT_DELIVERED")}
              >
                Teslim Edilemedi
              </Button>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return <Table dataSource={basketData} columns={columns} />;
};

export default BasketsTable;
