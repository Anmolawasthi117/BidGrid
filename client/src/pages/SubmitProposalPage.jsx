import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import axios from "../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitProposalPage() {
  const { rfpId } = useParams();
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    vendorName: "",
    vendorEmail: "",
    priceAmount: "",
    currency: "USD",
    timeline: "",
    deliveryDate: "",
    terms: "",
    notes: "",
  });

  // Fetch RFP details
  useEffect(() => {
    const fetchRFP = async () => {
      try {
        const res = await axios.get(`/proposals/rfp/${rfpId}`);
        setRfp(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "RFP not found or not accepting proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchRFP();
  }, [rfpId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`/proposals/rfp/${rfpId}/submit`, {
        vendorName: formData.vendorName,
        vendorEmail: formData.vendorEmail,
        price: {
          amount: parseFloat(formData.priceAmount),
          currency: formData.currency,
        },
        timeline: formData.timeline,
        deliveryDate: formData.deliveryDate || undefined,
        terms: formData.terms || undefined,
        notes: formData.notes || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";
    const symbol = budget.currency === "USD" ? "$" : budget.currency;
    if (budget.min && budget.max) {
      return `${symbol}${budget.min.toLocaleString()} - ${symbol}${budget.max.toLocaleString()}`;
    }
    return "Flexible";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error && !rfp) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load RFP</h2>
            <p className="text-slate-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-emerald-800 mb-2">
                Proposal Submitted!
              </h2>
              <p className="text-emerald-600 mb-4">
                Your proposal has been received. The buyer will review and get back to you.
              </p>
              <p className="text-sm text-emerald-500">
                You can close this page now.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Submit Your Proposal</h1>
          <p className="text-slate-500">Powered by BidGrid</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* RFP Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{rfp.title}</CardTitle>
              <CardDescription>RFP Details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rfp.description && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
                  <p className="text-sm text-slate-600">{rfp.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600">Budget: {formatBudget(rfp.budget)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600">
                    Deadline: {rfp.deadline ? new Date(rfp.deadline).toLocaleDateString() : "Flexible"}
                  </span>
                </div>
              </div>

              {rfp.requirements?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {rfp.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposal Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Proposal</CardTitle>
              <CardDescription>Fill in your details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendorName">Your Name / Company *</Label>
                    <Input
                      id="vendorName"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleChange}
                      required
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorEmail">Email *</Label>
                    <Input
                      id="vendorEmail"
                      name="vendorEmail"
                      type="email"
                      value={formData.vendorEmail}
                      onChange={handleChange}
                      required
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priceAmount">Price (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="priceAmount"
                        name="priceAmount"
                        type="number"
                        value={formData.priceAmount}
                        onChange={handleChange}
                        required
                        placeholder="5000"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        required
                        placeholder="2 weeks"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <textarea
                    id="terms"
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    placeholder="Payment terms, warranty, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    placeholder="Any other information..."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Proposal
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SubmitProposalPage;
