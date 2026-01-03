import React, { useState } from "react";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import Orders from "./order";
import UploadProduct from "./uploadproduct";
import ManageProducts from "./manageproduct";
import ListedProducts from "./listedproducts";

const App = () => {
  const [page, setPage] = useState("dashboard");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const renderPage = () => {
    switch(page) {
      case "orders": return <Orders />;
      case "upload": return <UploadProduct />;
      case "manage": return <ManageProducts selectedProduct={selectedProduct} />;
      case "listed": return <ListedProducts setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/30 flex transition-colors duration-300">
      <Sidebar setPage={setPage} currentPage={page} />
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;
