import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Trophy,
  Star,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

function RFPDetailPage() {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [error, setError] = useState(null);
  const [expandedProposal, setExpandedProposal] = useState(null);

  // Fetch RFP and proposals
  const fetchData = async () => {
    try {
      const res = await axios.get(`/rfps/${id}/proposals`);
      setRfp(res.data.data.rfp);
      setProposals(res.data.data.proposals);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load RFP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Ingest emails
  const handleIngestEmails = async () => {
    setIngesting(true);
    try {
      const res = await axios.post(`/ingestion/${id}/ingest`);
      const result = res.data.data;
      alert(`Processed ${result.processed} new proposals from ${result.total} emails`);
      fetchData(); // Refresh proposals
    } catch (err) {
      alert(err.response?.data?.message || "Failed to ingest emails");
    } finally {
      setIngesting(false);
    }
  };

  // Get AI recommendation
  const handleGetRecommendation = async () => {
    setLoadingRec(true);
    try {
      const res = await axios.get(`/ingestion/${id}/recommendation`);
      setRecommendation(res.data.data.recommendation);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to get recommendation");
    } finally {
      setLoadingRec(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: "secondary",
      parsed: "info",
      reviewed: "default",
      shortlisted: "warning",
      rejected: "destructive",
      awarded: "success",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getBestPrice = () => {
    if (proposals.length === 0) return null;
    const prices = proposals
      .map(p => p.parsedData?.price?.amount || p.price?.amount || 0)
      .filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">{error}</p>
            <Link to="/dashboard">
              <Button variant="outline" className="mt-4">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bestPrice = getBestPrice();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  {rfp?.title || "RFP Details"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(rfp?.status)}
                  <span className="text-sm text-slate-500">
                    {proposals.length} proposal{proposals.length !== 1 ? "s" : ""} received
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleIngestEmails}
                disabled={ingesting}
              >
                {ingesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Check for Vendor Replies
              </Button>
              <Button 
                size="sm" 
                onClick={handleGetRecommendation}
                disabled={loadingRec || proposals.length === 0}
              >
                {loadingRec ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Get AI Recommendation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* AI Recommendation Card */}
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Sparkles className="w-5 h-5" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendation.recommendation && (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-emerald-100">
                      <Trophy className="w-10 h-10 text-amber-500" />
                      <div>
                        <p className="text-sm text-slate-500">Recommended Vendor</p>
                        <p className="text-xl font-bold text-slate-800">
                          {recommendation.recommendation.winner}
                        </p>
                        <Badge variant="success" className="mt-1">
                          {recommendation.recommendation.confidence} confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2">Why this vendor?</h4>
                      <p className="text-slate-600 text-sm">
                        {recommendation.recommendation.reason}
                      </p>
                    </div>

                    {recommendation.recommendation.risks?.length > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Risks to Consider</p>
                          <ul className="text-sm text-amber-700 list-disc list-inside">
                            {recommendation.recommendation.risks.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {recommendation.recommendation.secondChoice && (
                      <div className="text-sm text-slate-500">
                        <strong>Alternative:</strong> {recommendation.recommendation.secondChoice} - {recommendation.recommendation.secondChoiceReason}
                      </div>
                    )}
                  </>
                )}

                {recommendation.summary && (
                  <p className="text-sm text-slate-600 italic">{recommendation.summary}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* RFP Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="font-semibold text-slate-800">
                    {rfp?.budget?.max ? `$${rfp.budget.max.toLocaleString()}` : "Flexible"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Deadline</p>
                  <p className="font-semibold text-slate-800">
                    {rfp?.deadline ? new Date(rfp.deadline).toLocaleDateString() : "Flexible"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Proposals</p>
                  <p className="font-semibold text-slate-800">{proposals.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Best Price</p>
                  <p className="font-semibold text-emerald-600">
                    {bestPrice ? `$${bestPrice.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Vendor Proposals
            </CardTitle>
            <CardDescription>
              AI-parsed proposals from vendor email responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No proposals yet</h3>
                <p className="text-slate-400 mb-4">
                  Click "Check for Vendor Replies" to fetch and parse vendor emails
                </p>
                <Button onClick={handleIngestEmails} disabled={ingesting}>
                  <Mail className="w-4 h-4 mr-2" />
                  Check for Vendor Replies
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <Card key={proposal._id} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-800">
                              {proposal.vendorName || proposal.vendorEmail}
                            </h3>
                            {getStatusBadge(proposal.status)}
                            {proposal.source === "email" && (
                              <Badge variant="outline" className="text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Badge>
                            )}
                            {proposal.completeness > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {proposal.completeness}% complete
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Price</p>
                              <p className="font-semibold text-slate-800">
                                {proposal.parsedData?.price?.amount || proposal.price?.amount
                                  ? `$${(proposal.parsedData?.price?.amount || proposal.price?.amount).toLocaleString()}`
                                  : "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Timeline</p>
                              <p className="font-semibold text-slate-800">
                                {proposal.parsedData?.timeline || proposal.timeline || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">AI Score</p>
                              <p className="font-semibold text-slate-800">
                                {proposal.aiScore ? `${proposal.aiScore}/100` : "—"}
                              </p>
                            </div>
                          </div>

                          {proposal.parsedData?.summary && (
                            <p className="text-sm text-slate-600 mt-2 italic">
                              "{proposal.parsedData.summary}"
                            </p>
                          )}

                          {proposal.parsedData?.keyPoints?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {proposal.parsedData.keyPoints.slice(0, 3).map((point, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedProposal(
                            expandedProposal === proposal._id ? null : proposal._id
                          )}
                        >
                          {expandedProposal === proposal._id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded View */}
                      {expandedProposal === proposal._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 pt-4 border-t border-slate-200"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
                            {proposal.parsedData?.terms?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Terms</h4>
                                <ul className="text-sm text-slate-600 list-disc list-inside">
                                  {proposal.parsedData.terms.map((term, i) => (
                                    <li key={i}>{term}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {proposal.parsedData?.conditions?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Conditions</h4>
                                <ul className="text-sm text-slate-600 list-disc list-inside">
                                  {proposal.parsedData.conditions.map((cond, i) => (
                                    <li key={i}>{cond}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {proposal.originalEmail && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                Original Email
                              </h4>
                              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
                                {proposal.originalEmail}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RFPDetailPage;
