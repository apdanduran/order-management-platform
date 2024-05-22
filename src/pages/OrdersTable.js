import { Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import Actions from "../components/Actions";
import OrderList from "../components/OrderList";
import { fetchOrders } from "../api";

const OrdersTable = () => {
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Adres",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Ödeme",
      dataIndex: "payment",
      key: "payment",
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Siparişler",
      key: "orders",
      render: (text, record) => <OrderList record={record} />,
    },
    {
      title: "Kurye",
      key: "courier",
      render: (text, record) => <Actions record={record} />,
    },
  ];

  if (isLoadingOrders) {
    return <div>Loading...</div>;
  }

  if (isErrorOrders) {
    return <div>Error: {isErrorOrders.message}</div>;
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        width: "100%",
        margin: "100px auto",
      }}
    >
      <p style={{ fontSize: "1.5em", fontWeight: "bold" }}>Siparişler</p>
      <Table columns={columns} dataSource={orders} />
    </div>
  );
};

export default OrdersTable;
