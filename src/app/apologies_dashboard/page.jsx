// app/admin/dashboard/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const MOCK_APOLOGIES = [
    // {
    //     id: '1',
    //     title: 'Leaking tap in bathroom',
    //     category: 'plumbing',
    //     studentName: 'Aisha Khan',
    //     roomNumber: '203',
    //     status: 'pending',
    //     date: '2025-03-22',
    //     priority: 'medium',
    // },
    // {
    //     id: '2',
    //     title: 'Light bulb needs replacement',
    //     category: 'electricity',
    //     studentName: 'Priya Sharma',
    //     roomNumber: '115',
    //     status: 'resolved',
    //     date: '2025-03-20',
    //     priority: 'low',
    // },
    // {
    //     id: '3',
    //     title: 'Roommate conflict regarding study hours',
    //     category: 'roommate',
    //     studentName: 'Meera Patel',
    //     roomNumber: '302',
    //     status: 'in-review',
    //     date: '2025-03-25',
    //     priority: 'high',
    // },
    // {
    //     id: '4',
    //     title: 'Lost my student ID card',
    //     category: 'lost-found',
    //     studentName: 'Sarah Johnson',
    //     roomNumber: '127',
    //     status: 'pending',
    //     date: '2025-03-24',
    //     priority: 'medium',
    // },
    // {
    //     id: '5',
    //     title: 'Common room needs cleaning',
    //     category: 'cleanliness',
    //     studentName: 'Fatima Ali',
    //     roomNumber: '215',
    //     status: 'resolved',
    //     date: '2025-03-19',
    //     priority: 'medium',
    // },
];



const APOLOGY_CATEGORIES = [
    { id: 'all', name: 'All Apologies', icon: LayoutDashboard },
    { id: 'outing', name: 'Outing', icon: Users },
    { id: 'misconduct', name: 'Misconduct', icon: AlertCircle },
];

export default function AdminDashboard() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const filteredApologies = MOCK_APOLOGIES.filter(apology => {
        const matchesCategory = selectedCategory === 'all' || apology.category === selectedCategory;
        const matchesStatus = statusFilter === 'all' || apology.status === statusFilter;
        const matchesSearch = apology.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apology.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apology.roomNumber.includes(searchQuery);

        return matchesCategory && matchesStatus && matchesSearch;
    });

    const handleReviewApology = (apologyId) => {
        router.push(`/admin/apology/${apologyId}`);
    };


    const CategoryIcon = ({ category }) => {
        const foundCategory = APOLOGY_CATEGORIES.find(cat => cat.id === category);
        const Icon = foundCategory ? foundCategory.icon : AlertCircle;
        return <Icon className="h-4 w-4" />;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
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
                    {APOLOGY_CATEGORIES.map((category) => {
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
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
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

            {/* Mobile sidebar */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <aside className="w-64 h-full bg-white overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <nav className="p-4 space-y-1 mt-14">
                            {APOLOGY_CATEGORIES.map((category) => {
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

            {/* Main content */}
            <main className="flex-1  pt-16 md:pt-0">
                <div className="p-6">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {APOLOGY_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'All Apologies'}
                            </h1>
                            <p className="text-gray-600">Manage Student Apologies</p>
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


                    {/* Search and filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
                        <div className="relative flex-1 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                                <Search className="h-4 w-4" />
                            </div>
                            <Input
                                placeholder="Search apologies, students or room numbers..."
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
                                    <SelectItem value="resolved" className="focus:bg-green-50 focus:text-green-900">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Reviewd</span>
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
                                                <Label htmlFor="category"> Apology Category</Label>
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

                    {/* Apologies list */}
                    <div className="space-y-4">
                        {filteredApologies.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No apologies found</h3>
                                <p className="text-gray-600">
                                    {searchQuery ? 'Try adjusting your search or filters' : 'There are no apologies in this category yet'}
                                </p>
                            </div>
                        ) : (
                            filteredApologies.map((apology) => (
                                <div
                                    key={apology.id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                                >
                                    <div className="p-4 md:p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                                                    <CategoryIcon category={apology.category} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{apology.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                                        <span>{apology.studentName}</span>
                                                        <span>•</span>
                                                        <span>Room {apology.roomNumber}</span>
                                                        <span>•</span>
                                                        <span>{new Date(apology.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReviewApology(apology.id)}
                                            >
                                                View Details
                                            </Button>
                                            {apology.status !== 'resolved' && (
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