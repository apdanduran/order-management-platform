import {
  CodepenOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
//b
const items = [
  {
    key: "syp",
    label: "Sipariş Yönetim Paneli",
    icon: <SettingOutlined />,
    children: [
      {
        key: "orders",
        label: "Siparişler",
        icon: <ShoppingCartOutlined />,
      },
      {
        key: "couriers",
        label: "Sepet",
        icon: <CodepenOutlined />,
      },
      {
        label: "Yoldaki Siparişler",
        key: "ontheway",
        icon: <EnvironmentOutlined />,
      },
    ],
  },
];
const AppNavbar = () => {
  const navigate = useNavigate();

  const onClick = (e) => {
    navigate(`/${e.key}`);
  };

  return (
    <Menu
      onClick={onClick}
      style={{
        width: 256,
        height: "100%",
      }}
      defaultSelectedKeys={["order"]}
      defaultOpenKeys={["syp"]}
      mode="inline"
      items={items}
    />
  );
};
export default AppNavbar;
