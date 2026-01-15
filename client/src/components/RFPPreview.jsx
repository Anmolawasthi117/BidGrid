import { motion } from "framer-motion";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Package, 
  CheckCircle2,
  Edit2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function RFPPreview({ rfp, onEdit, isComplete }) {
  // Show empty state if no RFP data yet
  if (!rfp) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            RFP Preview
          </h3>
          <p className="text-slate-400 text-sm max-w-xs">
            {isComplete 
              ? "Loading RFP details..." 
              : "Chat with the AI to generate your RFP. The preview will appear here once complete."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";
    const currency = budget.currency || "USD";
    const symbol = currency === "USD" ? "$" : currency;
    if (budget.min && budget.max) {
      return `${symbol}${budget.min.toLocaleString()} - ${symbol}${budget.max.toLocaleString()}`;
    }
    if (budget.max) {
      return `Up to ${symbol}${budget.max.toLocaleString()}`;
    }
    return "Not specified";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              </div>
              <CardTitle className="text-xl">{rfp.title || "Untitled RFP"}</CardTitle>
            </div>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {rfp.description && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
              <p className="text-sm text-slate-600">{rfp.description}</p>
            </div>
          )}

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Package className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Quantity</p>
                <p className="font-semibold text-slate-800">
                  {rfp.quantity || "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Budget</p>
                <p className="font-semibold text-slate-800">
                  {formatBudget(rfp.budget)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg col-span-2">
              <Calendar className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Deadline</p>
                <p className="font-semibold text-slate-800">
                  {formatDate(rfp.deadline)}
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {rfp.requirements && rfp.requirements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Requirements</h4>
              <ul className="space-y-2">
                {rfp.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specs */}
          {rfp.specs && Object.keys(rfp.specs).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Specifications</h4>
              <div className="space-y-1">
                {Object.entries(rfp.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-500 capitalize">{key}</span>
                    <span className="text-slate-800 font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RFPPreview;
