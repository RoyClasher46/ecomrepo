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
      case "upload": return <UploadProduct setPage={setPage} />;
      case "manage": return <ManageProducts selectedProduct={selectedProduct} />;
      case "listed": return <ListedProducts setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex transition-colors duration-300">
      <Sidebar setPage={setPage} currentPage={page} />
      <div className="flex-1 overflow-auto w-full lg:ml-0">
        <div className="p-4 sm:p-6 md:p-8 pt-16 lg:pt-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;
