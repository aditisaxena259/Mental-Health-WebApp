// app/student/dashboard/page.js
'use client';

import React from 'react';
import {useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Clock,
    Filter,
    Search,
    User,
    LogOut,
    CheckCircle,
    XCircle,
    AlertCircle,
    Droplet,
    Zap,
    Trash2,
    Users,
    Menu,
    X,
    AlertTriangle
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for student complaints
const MOCK_STUDENT_COMPLAINTS = [
    {
        id: '101',
        title: 'Water leakage in bathroom',
        category: 'plumbing',
        status: 'pending',
        date: '2025-03-24',
        description: 'There is water leaking from the shower head even when turned off. This is causing water wastage and making the floor slippery.',
        lastUpdate: '2025-03-24T10:30:00',
    },
    {
        id: '102',
        title: 'Missing laundry from common area',
        category: 'lost-found',
        status: 'in-review',
        date: '2025-03-22',
        description: 'I left my clothes in the dryer yesterday evening around 7 PM and when I went to collect them at 9 PM, they were missing. The clothes include 3 t-shirts and 2 pairs of jeans.',
        lastUpdate: '2025-03-23T14:15:00',
    },
    {
        id: '103',
        title: 'Faulty power outlet near study desk',
        category: 'electricity',
        status: 'resolved',
        date: '2025-03-18',
        description: 'The power outlet near my study desk is not working properly. It works intermittently which is affecting my ability to charge my laptop while studying.',
        lastUpdate: '2025-03-20T11:45:00',
        resolvedOn: '2025-03-20T11:45:00',
    },
];

// Complaint categories
const COMPLAINT_CATEGORIES = [
    { id: 'roommate', name: 'Roommate Issues', icon: Users },
    { id: 'cleanliness', name: 'Cleanliness', icon: Trash2 },
    { id: 'plumbing', name: 'Plumbing', icon: Droplet },
    { id: 'electricity', name: 'Electricity', icon: Zap },
    { id: 'lost-found', name: 'Lost & Found', icon: Search },
    { id: 'other', name: 'Other Issues', icon: AlertCircle },
];

// Student information
const STUDENT_INFO = {
    name: 'Aisha Khan',
    id: '23BCE2139',
    room: '203',
    block: 'A Block',
    floor: '2nd Floor',
    course: 'B.Tech, Computer Science',
    year: '3rd Year',
    avatar: '/avatars/student.jpg',
};

export default function StudentDashboard() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [newComplaintOpen, setNewComplaintOpen] = useState(false);
    const [newComplaint, setNewComplaint] = useState({
        title: '',
        category: '',
        description: ''
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Filter complaints based on search query and status filter
    const filteredComplaints = MOCK_STUDENT_COMPLAINTS.filter(complaint => {
        const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleViewComplaint = (complaintId) => {
        router.push(`/student/complaints/${complaintId}`);
    };

    const handleNewComplaintSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would submit this to your API
        console.log('New complaint submitted:', newComplaint);
        alert('Complaint submitted successfully!');
        setNewComplaintOpen(false);
        setNewComplaint({ title: '', category: '', description: '' });
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

    const getCategoryIcon = (categoryId) => {
        const category = COMPLAINT_CATEGORIES.find(cat => cat.id === categoryId);
        const Icon = category ? category.icon : AlertCircle;
        return <Icon className="h-4 w-4" />;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <Link href="/student/dashboard">
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
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-64 h-full bg-white overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-4 mt-14">
                            <div className="flex items-center gap-3 mb-6 p-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={STUDENT_INFO.avatar} alt={STUDENT_INFO.name} />
                                    <AvatarFallback>{STUDENT_INFO.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{STUDENT_INFO.name}</p>
                                    <p className="text-sm text-gray-600">{STUDENT_INFO.id}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <Link href="/student/dashboard" className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md bg-indigo-50 text-indigo-900 font-medium">
                                    <Clock className="h-5 w-5" />
                                    <span>My Complaints</span>
                                </Link>
                                <Link href="/student/profile" className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md text-gray-700 hover:bg-gray-100">
                                    <User className="h-5 w-5" />
                                    <span>Profile</span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-3 w-full px-4 py-3 justify-start text-left text-sm rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 pt-16 md:pt-6 pb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar - desktop */}
                    <aside className="hidden md:block w-64 space-y-6">
                        <div className="mb-6">
                            <Link href="/student/dashboard">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">H</span>
                                    </div>
                                    <h1 className="text-xl font-bold text-indigo-900">HostelCare</h1>
                                </div>
                            </Link>
                        </div>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={STUDENT_INFO.avatar} alt={STUDENT_INFO.name} />
                                        <AvatarFallback>{STUDENT_INFO.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{STUDENT_INFO.name}</p>
                                        <p className="text-sm text-gray-600">{STUDENT_INFO.id}</p>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Room:</span>
                                        <span className="font-medium">{STUDENT_INFO.room}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Block:</span>
                                        <span className="font-medium">{STUDENT_INFO.block}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Floor:</span>
                                        <span className="font-medium">{STUDENT_INFO.floor}</span>
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t space-y-2">
                                    <Link href="/student/profile">
                                        <Button variant="outline" className="w-full justify-start">
                                            <User className="h-4 w-4 mr-2" />
                                            View Profile
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="w-full justify-start">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Need Help?</CardTitle>
                                <CardDescription>Contact your hostel warden</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/avatars/warden.jpg" alt="Warden" />
                                        <AvatarFallback>SW</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">Dr. Sunita Walia</p>
                                        <p className="text-xs text-gray-600">Head Warden</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                    Contact Warden
                                </Button>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
                                <p className="text-gray-600">Track and manage your hostel complaints</p>
                            </div>

                            <Dialog open={newComplaintOpen} onOpenChange={setNewComplaintOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Complaint
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[525px] bg-white">
                                    <form onSubmit={handleNewComplaintSubmit} >
                                        <DialogHeader>
                                            <DialogTitle>Submit a New Complaint</DialogTitle>
                                            <DialogDescription>
                                                Please provide details about the issue you're experiencing.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Complaint Title</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="Brief title for your complaint"
                                                    value={newComplaint.title}
                                                    onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={newComplaint.category}
                                                    onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value })}
                                                    required
                                                >
                                                    <SelectTrigger id="category">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COMPLAINT_CATEGORIES.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                <div className="flex items-center gap-2">
                                                                    {React.createElement(category.icon, { className: "h-4 w-4" })}
                                                                    <span>{category.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="Please provide detailed information about your complaint"
                                                    rows={5}
                                                    value={newComplaint.description}
                                                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="attachments">Attachments (Optional)</Label>
                                                <Input id="attachments" type="file" />
                                                <p className="text-xs text-gray-500">Upload images or documents related to your complaint (max 5MB)</p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setNewComplaintOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Submit Complaint</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Filters and search */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search complaints..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-review">In Review</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <Card className="bg-amber-50 border-amber-200">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">Pending</p>
                                        <p className="text-2xl font-bold text-amber-900">
                                            {MOCK_STUDENT_COMPLAINTS.filter(c => c.status === 'pending').length}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">In Review</p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            {MOCK_STUDENT_COMPLAINTS.filter(c => c.status === 'in-review').length}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Resolved</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {MOCK_STUDENT_COMPLAINTS.filter(c => c.status === 'resolved').length}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Complaints list */}
                        <Tabs defaultValue="all" className="mb-6">
                            <TabsList>
                                <TabsTrigger value="all">All Complaints</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all" className="mt-4">
                                {filteredComplaints.length === 0 ? (
                                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">No complaints found</h3>
                                        <p className="text-gray-600 mb-4">
                                            {searchQuery ? 'Try adjusting your search or filters' : 'You haven\'t submitted any complaints yet'}
                                        </p>
                                        <Button onClick={() => setNewComplaintOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Submit a Complaint
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredComplaints.map(complaint => (
                                            <div
                                                key={complaint.id}
                                                className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                                                onClick={() => handleViewComplaint(complaint.id)}
                                            >
                                                <div className="p-4 md:p-6 cursor-pointer">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                                                                {getCategoryIcon(complaint.category)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                                                    <span>Complaint #{complaint.id}</span>
                                                                    <span>•</span>
                                                                    <span>{formatDate(complaint.date)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {getStatusBadge(complaint.status)}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{complaint.description}</p>
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-xs text-gray-500">
                                                            Last updated: {new Date(complaint.lastUpdate).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: 'numeric',
                                                                hour12: true
                                                            })}
                                                        </div>
                                                        <Button variant="ghost" size="sm">View Details</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="active" className="mt-4">
                                <div className="space-y-4">
                                    {filteredComplaints.filter(c => c.status !== 'resolved').length === 0 ? (
                                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">No active complaints</h3>
                                            <p className="text-gray-600 mb-4">All your complaints have been resolved</p>
                                            <Button onClick={() => setNewComplaintOpen(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Submit a Complaint
                                            </Button>
                                        </div>
                                    ) : (
                                        filteredComplaints
                                            .filter(c => c.status !== 'resolved')
                                            .map(complaint => (
                                                <div
                                                    key={complaint.id}
                                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                                                    onClick={() => handleViewComplaint(complaint.id)}
                                                >
                                                    <div className="p-4 md:p-6 cursor-pointer">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                                                                    {getCategoryIcon(complaint.category)}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                                                        <span>Complaint #{complaint.id}</span>
                                                                        <span>•</span>
                                                                        <span>{formatDate(complaint.date)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {getStatusBadge(complaint.status)}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{complaint.description}</p>
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-xs text-gray-500">
                                                                Last updated: {new Date(complaint.lastUpdate).toLocaleString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: 'numeric',
                                                                    minute: 'numeric',
                                                                    hour12: true
                                                                })}
                                                            </div>
                                                            <Button variant="ghost" size="sm">View Details</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="resolved" className="mt-4">
                                <div className="space-y-4">
                                    {filteredComplaints.filter(c => c.status === 'resolved').length === 0 ? (
                                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                            <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">No resolved complaints</h3>
                                            <p className="text-gray-600">None of your complaints have been resolved yet</p>
                                        </div>
                                    ) : (
                                        filteredComplaints
                                            .filter(c => c.status === 'resolved')
                                            .map(complaint => (
                                                <div
                                                    key={complaint.id}
                                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                                                    onClick={() => handleViewComplaint(complaint.id)}
                                                >
                                                    <div className="p-4 md:p-6 cursor-pointer">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                                                                    {getCategoryIcon(complaint.category)}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                                                        <span>Complaint #{complaint.id}</span>
                                                                        <span>•</span>
                                                                        <span>{formatDate(complaint.date)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {getStatusBadge(complaint.status)}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{complaint.description}</p>
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-xs text-gray-500">
                                                                Resolved on: {new Date(complaint.resolvedOn).toLocaleString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: 'numeric',
                                                                    minute: 'numeric',
                                                                    hour12: true
                                                                })}
                                                            </div>
                                                            <Button variant="ghost" size="sm">View Details</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </div>
    );
}