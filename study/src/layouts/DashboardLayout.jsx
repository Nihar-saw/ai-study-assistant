import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import { Toaster } from "react-hot-toast";

const DashboardLayout = () => {
  const location = useLocation();
  const isNotesPage = location.pathname === "/notes";

  return (
    <div className={`flex bg-[#f5f7fb] text-gray-900 ${isNotesPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Sidebar />
      <main className="min-w-0 flex-grow flex flex-col">
        {isNotesPage ? (
          <div className="flex-grow h-screen overflow-hidden">
            <Outlet />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[1440px] px-6 py-6 flex-grow">
            <Outlet />
          </div>
        )}
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout;
