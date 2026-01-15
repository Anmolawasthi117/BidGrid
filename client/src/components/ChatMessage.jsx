import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

// Function to strip JSON code blocks from AI responses
function stripJsonFromMessage(content) {
  if (!content) return "";
  
  // Remove ```json ... ``` blocks (with various whitespace)
  let cleaned = content.replace(/```json[\s\S]*?```/gi, "");
  
  // Also remove ``` ... ``` blocks that contain JSON-like content
  cleaned = cleaned.replace(/```[\s\S]*?```/gi, "");
  
  // Remove standalone JSON objects at the end of the message
  // This catches raw JSON that isn't wrapped in code blocks
  cleaned = cleaned.replace(/\s*\{[\s\S]*"isComplete"[\s\S]*\}\s*$/gi, "");
  
  return cleaned.trim();
}

function ChatMessage({ message, isUser }) {
  // For AI messages, strip out the JSON blocks
  const displayContent = isUser 
    ? message.content 
    : stripJsonFromMessage(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-emerald-500" : "bg-slate-700"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-emerald-500 text-white rounded-br-md"
            : "bg-slate-100 text-slate-800 rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 mb-4"
    >
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </motion.div>
  );
}

export { ChatMessage, TypingIndicator };

