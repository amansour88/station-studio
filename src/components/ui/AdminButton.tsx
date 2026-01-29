import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

const AdminButton = () => {
  return (
    <Link
      to="/admin/login"
      className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-primary/90 hover:bg-primary text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      title="لوحة التحكم"
    >
      <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
    </Link>
  );
};

export default AdminButton;
