import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Mail, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-32 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/50 rounded-full blur-3xl" />
        </div>
        
        <motion.div 
          className="mx-auto max-w-4xl text-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div 
            variants={fadeInUp}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              <Zap className="w-4 h-4" />
              AI-Powered Procurement
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6"
          >
            Automate Your{" "}
            <span className="text-gradient">Procurement</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-10"
          >
            Transform messy vendor emails into a clean, financial comparison matrix. 
            Turn chaos into a decision with <strong className="text-slate-800">BidGrid</strong>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <Button size="xl" className="btn-shine w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            variants={fadeInUp}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Free forever for small teams
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Setup in 5 minutes
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform your procurement process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="text-sm font-bold text-emerald-600 mb-2">Step 1</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Chat Your RFP</h3>
                <p className="text-slate-600">
                  Describe what you need in plain English. Our AI structures your request into a professional RFP document.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-sm font-bold text-blue-600 mb-2">Step 2</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Email Vendors</h3>
                <p className="text-slate-600">
                  Select vendors from your address book. BidGrid sends personalized emails and tracks all responses automatically.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-10 h-10 text-purple-600" />
                </div>
                <div className="text-sm font-bold text-purple-600 mb-2">Step 3</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Compare & Decide</h3>
                <p className="text-slate-600">
                  View all proposals in a beautiful comparison grid. Make data-driven decisions with AI-extracted insights.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Teams Choose BidGrid
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for procurement professionals who value their time
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: "Save 10+ Hours", desc: "Per procurement cycle", color: "emerald" },
              { icon: Shield, title: "Enterprise Secure", desc: "SOC 2 compliant", color: "blue" },
              { icon: Users, title: "Unlimited Vendors", desc: "Grow without limits", color: "purple" },
              { icon: Zap, title: "AI-Powered", desc: "Gemini 1.5 Flash", color: "amber" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <feature.icon className={`w-10 h-10 mx-auto mb-4 text-${feature.color}-400`} />
                <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to streamline your procurement?
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Join procurement teams already saving hours every week.
          </p>
          <Link to="/register">
            <Button size="xl" className="bg-white text-emerald-600 hover:bg-slate-100 shadow-xl hover:shadow-2xl">
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold text-white">
              Bid<span className="text-emerald-400">Grid</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm">
              © 2026 BidGrid. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
