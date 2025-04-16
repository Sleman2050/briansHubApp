// src/pages/Users.js

import React, { useState } from "react";
import UsersTable from "../../admin/UsersTable";
import SearchBar from "../../admin/ui/SearchBar";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Users Management</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      <UsersTable searchTerm={searchTerm} />
    </div>
  );
};

export default Users;
