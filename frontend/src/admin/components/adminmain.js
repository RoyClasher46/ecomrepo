import React, { useState } from "react";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import Orders from "./order";
import UploadProduct from "./uploadproduct";
import ManageProducts from "./manageproduct";
import AdminLogin from "../../components/adminlogin";


const App = () => {
  const [page, setPage] = useState("dashboard");
  const [selectedProduct, setSelectedProduct] = useState(null);


  const renderPage = () => {
    switch(page) {
      case "orders": return <Orders />;
      case "upload": return <UploadProduct />;
      case "manage": return <ManageProducts selectedProduct={selectedProduct}  />;
      default: return <Dashboard setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  

  return (
    <div style={{ display: "flex" }}>
      <Sidebar setPage={setPage} />
      <div style={{ padding: "20px", flex: 1 }}>
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
