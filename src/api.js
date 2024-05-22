// src/api.js
import axios from "axios";

const fetchBaskets = async () => {
  const { data } = await axios.get("http://localhost:3000/baskets");
  return data;
};

const fetchOrders = async () => {
  const { data } = await axios.get("http://localhost:3000/orders");
  return data;
};

const fetchCouriers = async () => {
  const { data } = await axios.get("http://localhost:3000/couriers");
  return data;
};
const updateOrderStatus = async (orderId, status) => {
  const { data } = await axios.patch(
    `http://localhost:3000/orders/${orderId}`,
    { status }
  );
  return data;
};

export { fetchBaskets, fetchOrders, fetchCouriers, updateOrderStatus };
