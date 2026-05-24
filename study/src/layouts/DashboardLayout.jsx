import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import { Toaster } from "react-hot-toast";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f7f8fb] text-gray-900">
      <Sidebar />
      <main className="min-w-0 flex-grow overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout;
