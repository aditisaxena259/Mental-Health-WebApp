// app/admin/dashboard/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import {  toast } from 'react-toastify';
import {
    LayoutDashboard,
    Users,
    Droplet,
    Zap,
    Search,
    Trash2,
    AlertCircle,
    User,
    LogOut,
    CheckCircle,
    Menu,
    X,
    FileText,
    ArrowRight,
    FilterIcon, 
    SlidersHorizontal, 
    Clock,  
    RefreshCw, 
    ListFilter 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
  } from "@/components/ui/popover";
  
  import { Label } from "@/components/ui/label";

// Mock data for complaints
const MOCK_COMPLAINTS = [
    {
        id: '1',
        title: 'Leaking tap in bathroom',
        category: 'plumbing',
        studentName: 'Aisha Khan',
        roomNumber: '203',
        status: 'pending',
        date: '2025-03-22',
        priority: 'medium',
    },
    {
        id: '2',
        title: 'Light bulb needs replacement',
        category: 'electricity',
        studentName: 'Priya Sharma',
        roomNumber: '115',
        status: 'resolved',
        date: '2025-03-20',
        priority: 'low',
    },
    {
        id: '3',
        title: 'Roommate conflict regarding study hours',
        category: 'roommate',
        studentName: 'Meera Patel',
        roomNumber: '302',
        status: 'in-review',
        date: '2025-03-25',
        priority: 'high',
    },
    {
        id: '4',
        title: 'Lost my student ID card',
        category: 'lost-found',
        studentName: 'Sarah Johnson',
        roomNumber: '127',
        status: 'pending',
        date: '2025-03-24',
        priority: 'medium',
    },
    {
        id: '5',
        title: 'Common room needs cleaning',
        category: 'cleanliness',
        studentName: 'Fatima Ali',
        roomNumber: '215',
        status: 'resolved',
        date: '2025-03-19',
        priority: 'medium',
    },
];

const MONTHLY_STATS = {
    total: 42,
    resolved: 28,
    pending: 9,
    inReview: 5,
    resolutionRate: '67%',
    avgResolutionTime: '2.3 days'
};

const COMPLAINT_CATEGORIES = [
    { id: 'all', name: 'All Complaints', icon: LayoutDashboard },
    { id: 'roommate', name: 'Roommate Issues', icon: Users },
    { id: 'cleanliness', name: 'Cleanliness', icon: Trash2 },
    { id: 'plumbing', name: 'Plumbing', icon: Droplet },
    { id: 'electricity', name: 'Electricity', icon: Zap },
    { id: 'lost-found', name: 'Lost & Found', icon: Search },
    { id: 'other', name: 'Other Issues', icon: AlertCircle },
];

export default function AdminDashboard() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const filteredComplaints = MOCK_COMPLAINTS.filter(complaint => {
        const matchesCategory = selectedCategory === 'all' || complaint.category === selectedCategory;
        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
        const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            complaint.roomNumber.includes(searchQuery);

        return matchesCategory && matchesStatus && matchesSearch;
    });

    const handleReviewComplaint = (complaintId) => {
        router.push(`/admin/complaints/${complaintId}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'resolved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Resolved</Badge>;
            case 'in-review':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Review</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High</Badge>;
            case 'medium':
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Medium</Badge>;
            case 'low':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low</Badge>;
            default:
                return null;
        }
    };

    const CategoryIcon = ({ category }) => {
        const foundCategory = COMPLAINT_CATEGORIES.find(cat => cat.id === category);
        const Icon = foundCategory ? foundCategory.icon : AlertCircle;
        return <Icon className="h-4 w-4" />;
    };

    const logout = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/logout', {
            method: 'POST', // Ensure the backend allows POST for logout
            credentials: 'include', // Important! Allows cookies to be sent with the request
          });
      
          if (response.ok) {
            toast.success('Logged out successfully!');
            router.push('/login'); // Redirect user to login page
          } else {
            toast.error('Logout failed. Please try again.');
          }
        } catch (error) {
          toast.error('Something went wrong. Please try again later.');
        }
      };      
    

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 h-screen sticky top-0">
                <div className="p-6">
                    <Link href="/admin/dashboard">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">H</span>
                            </div>
                            <h1 className="text-xl font-bold text-indigo-900">HostelCare</h1>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {COMPLAINT_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md transition-colors ${selectedCategory === category.id
                                    ? 'bg-indigo-50 text-indigo-900 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{category.name}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t mt-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-gray-100 transition-colors">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/warden.jpg" alt="Warden" />
                                    <AvatarFallback>SW</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">Dr. Sunita Walia</p>
                                    <p className="text-xs text-gray-500">Head Warden</p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-all"
                                >
                                    Logout
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Mobile menu button */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <Link href="/landing">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">H</span>
                        </div>
                        <h1 className="text-xl font-bold text-indigo-900">HostelCare</h1>
                    </div>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <aside className="w-64 h-full bg-white overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <nav className="p-4 space-y-1 mt-14">
                            {COMPLAINT_CATEGORIES.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <button
                                        key={category.id}
                                        className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md transition-colors ${selectedCategory === category.id
                                            ? 'bg-indigo-50 text-indigo-900 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => {
                                            setSelectedCategory(category.id);
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{category.name}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t">
                            <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-gray-100 transition-colors">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/warden.jpg" alt="Warden" />
                                    <AvatarFallback>SW</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">Dr. Sunita Walia</p>
                                    <p className="text-xs text-gray-500">Head Warden</p>
                                </div>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            <main className="flex-1  pt-16 md:pt-0">
                <div className="p-6">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {COMPLAINT_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'All Complaints'}
                            </h1>
                            <p className="text-gray-600">Manage and respond to student complaints</p>
                        </div>

                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group"
                            variant="default"
                        >
                            <FileText className="h-4 w-4 group-hover:animate-pulse" />
                            Generate Monthly Report
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                        </Button>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden border-none">
                            <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-indigo-900">Complaint Overview</CardTitle>
                                        <CardDescription className="text-indigo-600">Current month statistics</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pb-2">
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="p-4 bg-indigo-50 rounded-lg transition-transform hover:scale-105">
                                        <p className="text-sm font-medium text-indigo-600 mb-1 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Total Complaints
                                        </p>
                                        <p className="text-3xl font-bold text-indigo-900">{MONTHLY_STATS.total}</p>
                                        <p className="text-xs text-indigo-500 mt-1">+12% from last month</p>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-lg transition-transform hover:scale-105">
                                        <p className="text-sm font-medium text-green-600 mb-1 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Resolution Rate
                                        </p>
                                        <p className="text-3xl font-bold text-green-800">{MONTHLY_STATS.resolutionRate}</p>
                                        <p className="text-xs text-green-500 mt-1">+5% from last month</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg transition-transform hover:scale-105">
                                    <p className="text-sm font-medium text-blue-600 mb-1 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Avg. Resolution Time
                                    </p>
                                    <p className="text-3xl font-bold text-blue-800">{MONTHLY_STATS.avgResolutionTime}</p>
                                    <p className="text-xs text-blue-500 mt-1">-8% from last month</p>
                                </div>
                            </CardContent>

                        </Card>

                        {/* Status Breakdown Card */}
                        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden border-none">
                            <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-purple-900">Status Breakdown</CardTitle>
                                        <CardDescription className="text-purple-600">Complaint status distribution</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center transition-transform hover:translate-x-1">
                                        <span className="flex items-center gap-2">
                                            <div className="p-1.5 bg-green-100 rounded-full">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="font-medium text-green-800">Resolved</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-green-700">{MONTHLY_STATS.resolved}</span>
                                            <div className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">
                                                +8%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-amber-50 rounded-lg flex justify-between items-center transition-transform hover:translate-x-1">
                                        <span className="flex items-center gap-2">
                                            <div className="p-1.5 bg-amber-100 rounded-full">
                                                <Clock className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <span className="font-medium text-amber-800">Pending</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-amber-700">{MONTHLY_STATS.pending}</span>
                                            <div className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded-full">
                                                -3%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center transition-transform hover:translate-x-1">
                                        <span className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 rounded-full">
                                                <RefreshCw className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-blue-800">In Review</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-blue-700">{MONTHLY_STATS.inReview}</span>
                                            <div className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                                                +5%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Total Complaints</span>
                                        <span className="font-semibold">{MONTHLY_STATS.total}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden border-none">
                            <CardHeader className="bg-gradient-to-r from-teal-50 to-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-teal-900">Quick Actions</CardTitle>
                                        <CardDescription className="text-teal-600">Frequently used tasks</CardDescription>
                                    </div>
                                    <div className="bg-teal-100 rounded-full">
                                        <Zap className="h-5 w-5 text-teal-700" />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className=" space-y-3">

                                <button className="w-full group flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all">
                                    <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 mr-3">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-blue-800">View Student Directory</p>
                                        <p className="text-xs text-blue-600">Access student information</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                                </button>

                                <button className="w-full group flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all">
                                    <div className="p-2 bg-amber-100 rounded-full group-hover:bg-amber-200 mr-3">
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-amber-800">Send Announcements</p>
                                        <p className="text-xs text-amber-600">Notify students of updates</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                                </button>

                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <button className="w-full text-center text-sm text-teal-600 hover:text-teal-800 font-medium py-2">
                                        View all actions
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
    <div className="relative flex-1 group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200">
            <Search className="h-4 w-4" />
        </div>
        <Input
            placeholder="Search complaints, students or room numbers..."
            className="pl-10 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg shadow-sm transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
            <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
            >
                <X className="h-4 w-4" />
            </button>
        )}
    </div>
    
    <div className="flex gap-2 md:gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] border-gray-200 hover:border-indigo-300 rounded-lg shadow-sm transition-all duration-200 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <div className="flex items-center gap-2">
                    <FilterIcon className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Filter by status" />
                </div>
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-lg border-gray-200 overflow-hidden">
                <div className="py-2 px-3 bg-indigo-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-indigo-800">Filter by Status</p>
                </div>
                <SelectItem value="all" className="focus:bg-indigo-50 focus:text-indigo-900">
                    <div className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4" />
                        <span>All Statuses</span>
                    </div>
                </SelectItem>
                <SelectItem value="pending" className="focus:bg-amber-50 focus:text-amber-900">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span>Pending</span>
                    </div>
                </SelectItem>
                <SelectItem value="in-review" className="focus:bg-blue-50 focus:text-blue-900">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <span>In Review</span>
                    </div>
                </SelectItem>
                <SelectItem value="resolved" className="focus:bg-green-50 focus:text-green-900">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Resolved</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
        
        <div className="hidden md:block">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="border-gray-200 hover:border-indigo-300 rounded-lg shadow-sm transition-all duration-200 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        <span>Advanced</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-md shadow-lg border-gray-200">
                    <div className="p-3 bg-indigo-50 border-b border-gray-100">
                        <h3 className="font-medium text-indigo-900">Advanced Filters</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date-range">Date Range</Label>
                            <Select defaultValue="last-week">
                                <SelectTrigger id="date-range">
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                    <SelectItem value="last-week">Last 7 days</SelectItem>
                                    <SelectItem value="last-month">Last 30 days</SelectItem>
                                    <SelectItem value="custom">Custom range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Complaint Category</Label>
                            <Select defaultValue="all">
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="cleaning">Cleaning</SelectItem>
                                    <SelectItem value="network">Network Issues</SelectItem>
                                    <SelectItem value="room">Room Issues</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select defaultValue="all">
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                            <Button variant="outline" size="sm">Reset</Button>
                            <Button size="sm">Apply Filters</Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    </div>
</div>

                    <div className="space-y-4">
                        {filteredComplaints.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No complaints found</h3>
                                <p className="text-gray-600">
                                    {searchQuery ? 'Try adjusting your search or filters' : 'There are no complaints in this category yet'}
                                </p>
                            </div>
                        ) : (
                            filteredComplaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                                >
                                    <div className="p-4 md:p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                                                    <CategoryIcon category={complaint.category} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                                        <span>{complaint.studentName}</span>
                                                        <span>•</span>
                                                        <span>Room {complaint.roomNumber}</span>
                                                        <span>•</span>
                                                        <span>{new Date(complaint.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end md:self-auto">
                                                {getPriorityBadge(complaint.priority)}
                                                {getStatusBadge(complaint.status)}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReviewComplaint(complaint.id)}
                                            >
                                                View Details
                                            </Button>
                                            {complaint.status !== 'resolved' && (
                                                <Button size="sm">Review & Respond</Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}