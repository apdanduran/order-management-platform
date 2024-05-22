import PropTypes from "prop-types";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, Button } from "antd";
import { fetchBaskets, fetchCouriers } from "../api";

const Actions = ({ record }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(
    record?.courier_id || ""
  );
  const queryClient = useQueryClient();

  const {
    data: couriers,
    error: couriersError,
    isLoading: isCouriersLoading,
  } = useQuery({
    queryKey: "couriers",
    queryFn: fetchCouriers,
  });

  const {
    data: basketsData,
    error: basketsError,
    isLoading: basketsLoading,
  } = useQuery({
    queryKey: "baskets",
    queryFn: fetchBaskets,
  });

  const updateStatus = async () => {
    setIsLoading(true);
    try {
      let newStatus;
      switch (record?.status) {
        case "PREPARING":
          newStatus = "PREPARED";
          break;
        case "PREPARED":
          newStatus = "READY";
          break;
        case "READY":
          newStatus = "ONTHEWAY";
          break;
        default:
          break;
      }
      const response = await fetch(
        `http://localhost:3000/orders/${record.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...record, status: newStatus }),
        }
      );
      if (!response.ok) {
        throw new Error("Status update failed");
      }
      await queryClient.invalidateQueries("orders");
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PREPARING":
        return "Hazırlanıyor";
      case "PREPARED":
        return "Hazırlandı";
      case "READY":
        return "Yolda";
      default:
        return "Yolda";
    }
  };

  const handleCourierChange = async (value) => {
    setSelectedCourier(value);

    try {
      // Siparişi güncelle
      const updatedOrder = { ...record, courier_id: value };
      const response = await fetch(
        `http://localhost:3000/orders/${record.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedOrder),
        }
      );
      if (!response.ok) {
        throw new Error("Order update failed");
      }

      // Seçilen kurye için mevcut bir sepet var mı kontrol et
      let basket = basketsData.find((basket) => basket.courier_id === value);

      // Mevcut bir sepet yoksa yeni bir sepet oluştur
      if (!basket) {
        basket = {
          id: value,
          courier_id: value,
          status: "ON_THE_WAY",
          orders: [`${record.id}`],
        };

        const basketResponse = await fetch(`http://localhost:3000/baskets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basket),
        });
        if (!basketResponse.ok) {
          throw new Error("Basket creation failed");
        }
      } else {
        // Sepet varsa ve sipariş zaten sepette değilse, sepete ekle
        if (!basket.orders.includes(Number(record.id))) {
          basket.orders.push(Number(record.id));

          const basketResponse = await fetch(
            `http://localhost:3000/baskets/${basket.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(basket),
            }
          );
          if (!basketResponse.ok) {
            throw new Error("Basket update failed");
          }
        }
      }

      // Sipariş ve sepetler verisini geçersiz kıl ve yeniden yükle
      await queryClient.invalidateQueries("orders");
      await queryClient.invalidateQueries("baskets");
    } catch (error) {
      console.error("Courier assignment error:", error);
    }
  };

  if (isCouriersLoading || basketsLoading) {
    return <div>Loading...</div>;
  }

  if (couriersError || basketsError) {
    return <div>Error: {couriersError?.message || basketsError?.message}</div>;
  }

  const isStatusEditable = (status) => {
    return (
      status !== "ON_THE_WAY" &&
      status !== "DELIVERED" &&
      status !== "NOT_DELIVERED"
    );
  };

  return (
    <div>
      {!record?.courier_id && record?.status !== "READY" ? (
        <Button onClick={updateStatus} loading={isLoading}>
          {getStatusLabel(record?.status)}
        </Button>
      ) : (
        <Select
          defaultValue={selectedCourier}
          style={{ width: 120 }}
          disabled={!isStatusEditable(record?.status)}
          onChange={handleCourierChange}
          value={selectedCourier}
        >
          <Select.Option value="" disabled>
            Kurye Seç
          </Select.Option>
          {couriers.map((courier) => (
            <Select.Option key={courier.id} value={courier.id}>
              {courier.name}
            </Select.Option>
          ))}
        </Select>
      )}
    </div>
  );
};

Actions.propTypes = {
  record: PropTypes.shape({
    courier_id: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default Actions;
