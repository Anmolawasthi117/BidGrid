import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  // Placeholder stats - will be dynamic in later phases
  const stats = [
    { label: "Active RFPs", value: "0", icon: FileText, color: "emerald", change: null },
    { label: "Total Vendors", value: "0", icon: Users, color: "blue", change: null },
    { label: "Pending Proposals", value: "0", icon: Clock, color: "amber", change: null },
    { label: "Completed", value: "0", icon: CheckCircle2, color: "purple", change: null },
  ];

  const quickActions = [
    { label: "Add Vendor", icon: Plus, href: "/vendors", color: "emerald" },
    { label: "Create RFP", icon: FileText, href: "/rfps/create", color: "blue" },
    { label: "View Comparisons", icon: BarChart3, href: "#", color: "purple", disabled: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, <span className="text-emerald-600">{user?.username || "User"}</span>
          </h1>
          <p className="text-slate-600 mt-1">
            Here's an overview of your procurement activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                      {stat.change && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
                          <TrendingUp className="w-4 h-4" />
                          {stat.change}
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-100`} style={{ backgroundColor: stat.color === "emerald" ? "#d1fae5" : stat.color === "blue" ? "#dbeafe" : stat.color === "amber" ? "#fef3c7" : "#f3e8ff" }}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} style={{ color: stat.color === "emerald" ? "#059669" : stat.color === "blue" ? "#2563eb" : stat.color === "amber" ? "#d97706" : "#9333ea" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link 
                key={action.label} 
                to={action.disabled ? "#" : action.href}
                className={action.disabled ? "pointer-events-none" : ""}
              >
                <Card className={`group cursor-pointer transition-all duration-300 ${action.disabled ? "opacity-50" : "hover:shadow-lg hover:border-emerald-200"}`}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div 
                      className={`p-3 rounded-xl transition-colors duration-300`}
                      style={{ 
                        backgroundColor: action.color === "emerald" ? "#d1fae5" : action.color === "blue" ? "#dbeafe" : "#f3e8ff"
                      }}
                    >
                      <action.icon 
                        className="w-6 h-6" 
                        style={{ color: action.color === "emerald" ? "#059669" : action.color === "blue" ? "#2563eb" : "#9333ea" }} 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{action.label}</p>
                      {action.disabled && (
                        <p className="text-xs text-slate-400">Coming in Phase 2</p>
                      )}
                    </div>
                    {!action.disabled && (
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Get Started with BidGrid</h3>
                  <p className="text-emerald-100 max-w-xl">
                    Start by adding your vendors to the address book. Then you'll be ready to create 
                    AI-powered RFPs and compare proposals in our smart grid.
                  </p>
                </div>
                <Link to="/vendors">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 shadow-lg whitespace-nowrap">
                    Add Your First Vendor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
