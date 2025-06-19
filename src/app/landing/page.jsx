"use client";

import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Bell, FileText, MessageSquare, LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function WardenDashboard() {
  const router = useRouter();
  const [wardenName, setWardenName] = useState("Dr. Sunita Walia");
  const [pendingApologies, setPendingApologies] = useState(5);
  const [pendingComplaints, setPendingComplaints] = useState(3);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
      
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (route) => {
    router.push(`/${route}_dashboard`);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 12px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center px-4 md:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              HC
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">HostelCare</h1>
              <p className="text-xs text-slate-500">University Management System</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative hover:bg-indigo-50 transition-colors"
                  >
                    <Bell size={20} />
                    {(pendingApologies + pendingComplaints > 0) && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {pendingApologies + pendingComplaints}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex items-center gap-3 border-l pl-5 border-slate-200">
              <Avatar className="h-10 w-10 ring-2 ring-indigo-100">
                <AvatarImage src="/warden-avatar.png" alt="Warden" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800">SJ</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-slate-800">{wardenName}</p>
                <p className="text-xs text-slate-500">Warden</p>
              </div>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/warden-avatar.png" alt="Warden" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-800">SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{wardenName}</p>
                    <p className="text-xs text-slate-500">Warden</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 py-2"
                >
                  <Bell size={18} />
                  Notifications
                  {(pendingApologies + pendingComplaints > 0) && (
                    <Badge className="ml-auto bg-red-500 text-white">
                      {pendingApologies + pendingComplaints}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Log out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 md:py-8 w-full">
        {/* Welcome section */}
        <section className="mb-8 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{greeting}, {wardenName}</h2>
              <p className="text-slate-500 mt-1">Welcome to your dashboard</p>
            </div>
            <div className="flex flex-col items-end bg-indigo-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">{currentDate}</p>
              <p className="text-xl font-semibold text-indigo-700">{currentTime}</p>
            </div>
          </div>
        </section>


        {/* Card section */}
        <section className="flex flex-col items-center justify-center py-6">
          <h2 className="text-xl font-semibold text-center mb-8 text-slate-800">What would you like to manage today?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="cursor-pointer h-full border border-slate-200 hover:border-indigo-300 transition-all duration-300 overflow-hidden"
                onClick={() => handleCardClick("apologies")}
              >
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <FileText className="h-6 w-6" />
                    Apology Letters
                  </CardTitle>
                  <CardDescription>
                    Review student apology submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <FileText className="w-40 h-40 text-indigo-500" />
                      </div>
                    </div>
                    <div className="text-center z-10">
                      <p className="text-4xl font-bold text-indigo-600">{pendingApologies}</p>
                      <p className="text-indigo-700 font-medium">Pending Reviews</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Access and manage all student apology letters for late entries, absences, and other hostel rule violations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant={pendingApologies > 0 ? "default" : "outline"} className={pendingApologies > 0 ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-slate-100 text-slate-600"}>
                    {pendingApologies > 0 ? "Requires Attention" : "All Reviewed"}
                  </Badge>
                  <Button variant="ghost" className="ml-auto text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                    View All
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card 
                className="cursor-pointer h-full border border-slate-200 hover:border-purple-300 transition-all duration-300 overflow-hidden"
                onClick={() => handleCardClick("complaint")}
              >
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <MessageSquare className="h-6 w-6" />
                    Complaints
                  </CardTitle>
                  <CardDescription>
                    Address student issues and concerns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <MessageSquare className="w-40 h-40 text-purple-500" />
                      </div>
                    </div>
                    <div className="text-center z-10">
                      <p className="text-4xl font-bold text-purple-600">{pendingComplaints}</p>
                      <p className="text-purple-700 font-medium">Pending Complaints</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Review and resolve student complaints regarding facilities, roommates, security, and other hostel-related concerns.
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant={pendingComplaints > 0 ? "default" : "outline"} className={pendingComplaints > 0 ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-slate-100 text-slate-600"}>
                    {pendingComplaints > 0 ? "Requires Attention" : "All Resolved"}
                  </Badge>
                  <Button variant="ghost" className="ml-auto text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                    View All
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} University Ladies Hostel Administration System</p>
          <div className="flex items-center gap-4">
            <Button variant="link" size="sm" className="text-slate-500 hover:text-indigo-600">Help</Button>
            <Button variant="link" size="sm" className="text-slate-500 hover:text-indigo-600">Privacy</Button>
            <Button variant="link" size="sm" className="text-slate-500 hover:text-indigo-600">Terms</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}