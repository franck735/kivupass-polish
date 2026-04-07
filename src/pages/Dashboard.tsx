import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MyTickets } from "@/components/dashboard/MyTickets";
import { EventsCatalog } from "@/components/dashboard/EventsCatalog";
import { ProfilePage } from "@/components/dashboard/ProfilePage";
import { MessagesPage } from "@/components/dashboard/MessagesPage";
import { CreateEvent } from "@/components/dashboard/CreateEvent";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("tickets");

  const renderContent = () => {
    switch (activeTab) {
      case "tickets": return <MyTickets />;
      case "events": return <EventsCatalog />;
      case "create": return <CreateEvent />;
      case "profile": return <ProfilePage />;
      case "messages": return <MessagesPage />;
      default: return <MyTickets />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
