import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  CheckCircle2,
  Eye,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchRFPs } from "@/store/slices/rfpSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { rfps, loading } = useSelector((state) => state.rfp);
  const { vendors } = useSelector((state) => state.vendors);

  // Fetch RFPs on mount
  useEffect(() => {
    dispatch(fetchRFPs());
  }, [dispatch]);

  // Calculate stats
  const activeRFPs = rfps.filter(r => r.status === "sent").length;
  const draftRFPs = rfps.filter(r => r.status === "drafting" || r.status === "draft").length;
  const closedRFPs = rfps.filter(r => r.status === "closed").length;

  const stats = [
    { label: "Active RFPs", value: activeRFPs.toString(), icon: FileText, color: "emerald" },
    { label: "Total Vendors", value: vendors?.length?.toString() || "0", icon: Users, color: "blue" },
    { label: "In Progress", value: draftRFPs.toString(), icon: Clock, color: "amber" },
    { label: "Completed", value: closedRFPs.toString(), icon: CheckCircle2, color: "purple" },
  ];

  const quickActions = [
    { label: "Add Vendor", icon: Plus, href: "/vendors", color: "emerald" },
    { label: "Create RFP", icon: FileText, href: "/rfps/create", color: "blue" },
    { label: "View All RFPs", icon: BarChart3, href: "#rfps", color: "purple" },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      drafting: { variant: "secondary", label: "Drafting" },
      draft: { variant: "secondary", label: "Draft" },
      sent: { variant: "default", label: "Sent" },
      closed: { variant: "success", label: "Closed" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
                    </div>
                    <div className={`p-3 rounded-xl`} style={{ backgroundColor: stat.color === "emerald" ? "#d1fae5" : stat.color === "blue" ? "#dbeafe" : stat.color === "amber" ? "#fef3c7" : "#f3e8ff" }}>
                      <stat.icon className="w-6 h-6" style={{ color: stat.color === "emerald" ? "#059669" : stat.color === "blue" ? "#2563eb" : stat.color === "amber" ? "#d97706" : "#9333ea" }} />
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
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-200">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div 
                      className="p-3 rounded-xl transition-colors duration-300"
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
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* RFPs List */}
        <motion.div
          id="rfps"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Your RFPs</h2>
            <Link to="/rfps/create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New RFP
              </Button>
            </Link>
          </div>

          {rfps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No RFPs yet</h3>
                <p className="text-slate-400 mb-4">Create your first RFP to get started</p>
                <Link to="/rfps/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create RFP
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rfps.map((rfp) => (
                <Card key={rfp._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-800">
                            {rfp.title || "Untitled RFP"}
                          </h3>
                          {getStatusBadge(rfp.status)}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">
                          {rfp.description || "No description"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Created {new Date(rfp.createdAt).toLocaleDateString()}
                          {rfp.sentAt && ` • Sent ${new Date(rfp.sentAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {rfp.status === "sent" && (
                          <Link to={`/rfps/${rfp._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View Proposals
                            </Button>
                          </Link>
                        )}
                        {(rfp.status === "drafting" || rfp.status === "draft") && (
                          <Link to="/rfps/create">
                            <Button size="sm" variant="outline">
                              Continue
                            </Button>
                          </Link>
                        )}
                        {rfp.status === "closed" && (
                          <Link to={`/rfps/${rfp._id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
