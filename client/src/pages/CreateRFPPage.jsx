import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Send, Sparkles, ArrowLeft, Save, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessage, TypingIndicator } from "@/components/ChatMessage";
import RFPPreview from "@/components/RFPPreview";
import { sendMessage, addUserMessage, clearChat, updateRFP } from "@/store/slices/rfpSlice";

function CreateRFPPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatMessages, sending, currentRfp, isComplete, currentRfpId, error } = useSelector(
    (state) => state.rfp
  );
  const { vendors } = useSelector((state) => state.vendors);

  const [inputValue, setInputValue] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [showVendorSelect, setShowVendorSelect] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sending]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const message = inputValue.trim();
    setInputValue("");
    
    // Add user message immediately for UI feedback
    dispatch(addUserMessage(message));
    
    // Send to API
    dispatch(sendMessage({ message, rfpId: currentRfpId }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    dispatch(clearChat());
    setSelectedVendors([]);
    setShowVendorSelect(false);
  };

  const handleSaveWithVendors = async () => {
    if (selectedVendors.length === 0) {
      setShowVendorSelect(true);
      return;
    }

    await dispatch(updateRFP({ 
      id: currentRfpId, 
      data: { vendors: selectedVendors } 
    }));
    
    navigate("/rfps");
  };

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
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Create RFP
                </h1>
                <p className="text-sm text-slate-500">
                  Chat with AI to generate your RFP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chatMessages.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleNewChat}>
                  New Chat
                </Button>
              )}
              {isComplete && (
                <Button size="sm" onClick={handleSaveWithVendors}>
                  <Save className="w-4 h-4 mr-2" />
                  Save RFP
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Split view */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Chat Panel */}
          <Card className="flex flex-col h-full">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {chatMessages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      AI RFP Assistant
                    </h3>
                    <p className="text-slate-500 max-w-sm mb-6">
                      Describe what you need to procure and I'll help you create a professional RFP.
                    </p>
                    <div className="space-y-2 text-sm text-slate-400">
                      <p>💡 "I need 50 office chairs, ergonomic, budget around $10k"</p>
                      <p>💡 "Looking for IT services for a 6-month project"</p>
                      <p>💡 "Need to order laptops for new employees"</p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {chatMessages.map((msg, index) => (
                      <ChatMessage
                        key={index}
                        message={msg}
                        isUser={msg.role === "user"}
                      />
                    ))}
                    {sending && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Error display */}
              {error && (
                <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you need to procure..."
                    className="flex-1 resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[50px] max-h-[150px]"
                    rows={1}
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sending}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <div className="h-full overflow-y-auto">
            <RFPPreview rfp={currentRfp} isComplete={isComplete} />

            {/* Vendor Selection - Show when RFP is complete */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-semibold text-slate-800">Select Vendors</h4>
                    </div>
                    {vendors.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No vendors yet.{" "}
                        <Link to="/vendors" className="text-emerald-600 hover:underline">
                          Add vendors
                        </Link>{" "}
                        to send this RFP.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {vendors.map((vendor) => (
                          <label
                            key={vendor._id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedVendors.includes(vendor._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVendors([...selectedVendors, vendor._id]);
                                } else {
                                  setSelectedVendors(
                                    selectedVendors.filter((id) => id !== vendor._id)
                                  );
                                }
                              }}
                              className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {vendor.name}
                              </p>
                              <p className="text-xs text-slate-500">{vendor.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRFPPage;
