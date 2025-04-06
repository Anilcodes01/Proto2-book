import DashboardComp from "@/components/DahsboardComp";
import SideBar from "@/components/Sidebar";


export default function dashboard() {

    return <div className="w-full flex items-center justify-center min-h-screen bg-white text-black">
        <SideBar />

       <DashboardComp />
        
    </div>
}