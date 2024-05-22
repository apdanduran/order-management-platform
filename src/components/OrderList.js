import React from "react";
import PropTypes from "prop-types";
//c
const OrderList = ({ record }) => {
  if (!record || !record.items || record.items.length === 0) {
    return <p>No items available</p>;
  }

  return (
    <div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {record.items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

OrderList.propTypes = {
  record: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
};

export default OrderList;
