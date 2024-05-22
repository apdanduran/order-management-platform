import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Divider, Button, Empty } from "antd";
import { fetchCouriers, fetchOrders } from "../api";

const App = () => {
  const {
    data: couriers,
    isLoading: isLoadingCouriers,
    isError: isErrorCouriers,
  } = useQuery({
    queryKey: ["couriers"],
    queryFn: fetchCouriers,
  });
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const [onRouteCourierId, setOnRouteCourierId] = useState(null);
  const queryClient = useQueryClient();
  const validStatuses = ["READY"];

  const updateOrdersStatus = async (courierId) => {
    const ordersToUpdate = orders
      .filter(
        (order) =>
          order.courier_id === courierId && validStatuses.includes(order.status)
      )
      .map((order) => ({ ...order, status: "ON_THE_WAY" }));

    try {
      await Promise.all(
        ordersToUpdate.map((order) =>
          fetch(`http://localhost:3000/orders/${order.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "ON_THE_WAY" }),
          })
        )
      );
      queryClient.invalidateQueries("orders");
    } catch (error) {
      console.error("Error updating orders status:", error);
    }
  };

  const handleOnRoute = (courierId) => {
    setOnRouteCourierId(courierId);
    updateOrdersStatus(courierId);
  };

  if (isLoadingCouriers || isLoadingOrders) return <div>Loading...</div>;
  if (isErrorCouriers || isErrorOrders)
    return <div>An error occurred while fetching data</div>;

  const couriersWithOrders = couriers.filter((courier) =>
    orders.some((order) => order.courier_id === courier.id)
  );

  const courierOrders = couriersWithOrders
    .filter((courier) => courier.id !== onRouteCourierId)
    .map((courier) => ({
      ...courier,
      orders: orders.filter(
        (order) =>
          order.courier_id === courier.id &&
          validStatuses.includes(order.status)
      ),
    }))
    .filter((courier) => courier.orders.length > 0);

  return (
    <div
      style={{
        width: "100%",
        overflow: "auto",
        height: "calc(100% - 64px)",
        padding: "100px",
      }}
    >
      <h1
        style={{
          fontSize: "1.5em",
          marginBottom: "20px",
          fontWeight: "bold",
          width: "100%",
        }}
      >
        SEPET
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {courierOrders.length === 0 ? (
          <Empty />
        ) : (
          courierOrders.map((courier) => (
            <Card
              key={courier.id}
              title={courier.name}
              style={{
                borderColor:
                  onRouteCourierId === courier.id ? "green" : "initial",
                height: "fit-content",
              }}
              actions={[
                <Button
                  key="on-route"
                  onClick={() => handleOnRoute(courier.id)}
                >
                  Yola Çıktı
                </Button>,
              ]}
            >
              {courier.orders.map((order, index) => (
                <div key={order.id}>
                  <p>
                    <strong>Sipariş ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Adress:</strong> {order.address}
                  </p>
                  <p>
                    <strong>Ödeme:</strong> {order.payment}
                  </p>
                  <p>
                    <strong>Teslimat Süresi:</strong> {order.delivery_time}
                  </p>
                  <p>
                    <strong>Durum:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Siparişler:</strong>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                    </ul>
                  </p>
                  {index < courier.orders.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
