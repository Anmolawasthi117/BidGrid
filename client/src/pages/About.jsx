import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Code2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              About <span className="text-emerald-500">BidGrid</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Transforming how procurement teams work with AI-powered automation
            </p>
          </div>

          {/* Mission */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Procurement is the backbone of every business, yet it remains one of the most 
              time-consuming and chaotic processes. BidGrid was built to change that. We leverage 
              the power of AI to transform messy vendor communications into structured, 
              actionable insights—helping you make better decisions, faster.
            </p>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What Drives Us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Speed",
                  desc: "We believe procurement shouldn't take weeks. With AI, it takes minutes.",
                  color: "emerald",
                },
                {
                  icon: Shield,
                  title: "Trust",
                  desc: "Your data is yours. We're committed to enterprise-grade security.",
                  color: "blue",
                },
                {
                  icon: Code2,
                  title: "Innovation",
                  desc: "Built with cutting-edge tech: Google Gemini, LangChain, and modern web standards.",
                  color: "purple",
                },
                {
                  icon: Heart,
                  title: "Simplicity",
                  desc: "Complex problems deserve elegant solutions. We make procurement simple.",
                  color: "rose",
                },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="p-6 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <value.icon 
                    className="w-10 h-10 mb-4" 
                    style={{ 
                      color: value.color === "emerald" ? "#10b981" : 
                             value.color === "blue" ? "#3b82f6" : 
                             value.color === "purple" ? "#8b5cf6" : "#f43f5e" 
                    }} 
                  />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-600">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Built With</h2>
            <div className="flex flex-wrap gap-3">
              {[
                "React 19",
                "Redux Toolkit",
                "TailwindCSS",
                "Framer Motion",
                "Node.js",
                "Express",
                "MongoDB",
                "Google Gemini 1.5 Flash",
                "LangChain",
                "Resend",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to streamline your procurement?</h2>
            <Link to="/register">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About;
