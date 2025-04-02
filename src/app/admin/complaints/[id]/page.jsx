// app/admin/complaints/[id]/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Clock,
    MessageSquare,
    Paperclip,
    Send,
    CheckCircle,
    UserCircle,
    Calendar,
    MapPin,
    Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for a specific complaint
const MOCK_COMPLAINT = {
    id: '3',
    title: 'Roommate conflict regarding study hours',
    description: `My roommate plays music during study hours despite multiple requests to use headphones. This has been affecting my exam preparation for the past week. I've tried discussing this with her but we haven't reached a resolution.`,
    category: 'roommate',
    studentName: 'Meera Patel',
    studentId: '21BCE2067',
    roomNumber: '302',
    floor: '3rd Floor',
    block: 'B Block',
    status: 'in-review',
    priority: 'high',
    date: '2025-03-25T14:30:00',
    timeline: [
        {
            id: 1,
            type: 'status-change',
            status: 'pending',
            timestamp: '2025-03-25T14:30:00',
            user: 'system'
        },
        {
            id: 2,
            type: 'message',
            content: 'We have received your complaint and will look into it shortly.',
            timestamp: '2025-03-25T14:35:00',
            user: {
                name: 'System Notification',
                role: 'system',
            }
        },
        {
            id: 3,
            type: 'status-change',
            status: 'in-review',
            timestamp: '2025-03-25T16:45:00',
            user: {
                name: 'Dr. Sunita Walia',
                role: 'warden',
                avatar: '/avatars/warden.jpg'
            }
        },
        {
            id: 4,
            type: 'message',
            content: `I have noted your complaint. I'll be scheduling a meeting with both you and your roommate to discuss this issue.Please check your email for the meeting details.',
      timestamp: '2025-03-25T16:50:00`,
            user: {
                name: 'Dr. Sunita Walia',
                role: 'warden',
                avatar: '/avatars/warden.jpg'
            }
        },
        {
            id: 5,
            type: 'message',
            content: `Thank you for your prompt response. I'll be available for the meeting as per your schedule.',
      timestamp: '2025-03-25T17:15:00`,
            user: {
                name: 'Meera Patel',
                role: 'student',
                avatar: '/avatars/student.jpg'
            }
        }
    ],
    attachments: [
        {
            id: 1,
            name: 'image.jpg',
            size: '1.2 MB',
            type: 'image/jpeg',
            url: '/attachments/conversation.jpg'
        }
    ]
};

export default function ComplaintDetailPage({ params }) {
    const router = useRouter();
    const complaintId = params.id;
    const [newMessage, setNewMessage] = useState('');
    const [newStatus, setNewStatus] = useState(MOCK_COMPLAINT.status);
    const [newPriority, setNewPriority] = useState(MOCK_COMPLAINT.priority);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        // In a real app, you would send this to your API
        alert(`Message sent: ${newMessage}`);
        setNewMessage('');
    };

    const handleStatusChange = (status) => {
        setNewStatus(status);
        // In a real app, you would update the status via API
        alert(`Status updated to: ${status}`);
    };

    const handlePriorityChange = (priority) => {
        setNewPriority(priority);
        // In a real app, you would update the priority via API
        alert(`Priority updated to: ${priority}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
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
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High Priority</Badge>;
            case 'medium':
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Medium Priority</Badge>;
            case 'low':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low Priority</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Back button and complaint title */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        className="mb-2 pl-0 hover:bg-transparent hover:text-indigo-700"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to complaints
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{MOCK_COMPLAINT.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                <span>Complaint #{MOCK_COMPLAINT.id}</span>
                                <span>•</span>
                                <span>Reported on {formatDate(MOCK_COMPLAINT.date)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getPriorityBadge(MOCK_COMPLAINT.priority)}
                            {getStatusBadge(MOCK_COMPLAINT.status)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content - complaint details and timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Complaint details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Complaint Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-line mb-6">{MOCK_COMPLAINT.description}</p>

                                {MOCK_COMPLAINT.attachments.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                                        <div className="space-y-2">
                                            {MOCK_COMPLAINT.attachments.map(attachment => (
                                                <div
                                                    key={attachment.id}
                                                    className="flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-gray-50"
                                                >
                                                    <Paperclip className="h-4 w-4 text-gray-500" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                                                        <p className="text-xs text-gray-500">{attachment.size}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">View</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline and responses */}
                        <Card>
                            <Tabs defaultValue="timeline">
                                <CardHeader className="pb-0">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Communication History</CardTitle>
                                        <TabsList>
                                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                            <TabsTrigger value="respond">Respond</TabsTrigger>
                                        </TabsList>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <TabsContent value="timeline" className="mt-4 space-y-6">
                                        {MOCK_COMPLAINT.timeline.map((item) => (
                                            <div key={item.id} className="relative pl-6 pb-6 before:absolute before:left-2 before:top-2 before:h-full before:w-[1px] before:bg-gray-200 last:before:h-0">
                                                <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    {item.type === 'status-change' ? (
                                                        <Clock className="h-2 w-2 text-indigo-700" />
                                                    ) : (
                                                        <MessageSquare className="h-2 w-2 text-indigo-700" />
                                                    )}
                                                </div>

                                                {item.type === 'status-change' ? (
                                                    <div>
                                                        <p className="text-sm text-gray-600">
                                                            Status changed to <span className="font-medium">{item.status}</span>
                                                            {item.user !== 'system' && item.user.name && (
                                                                <> by {item.user.name}</>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Avatar className="h-6 w-6">
                                                                {item.user.avatar ? (
                                                                    <AvatarImage src={item.user.avatar} alt={item.user.name} />
                                                                ) : null}
                                                                <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-medium">{item.user.name}</p>
                                                                <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="pl-8">
                                                            <p className="text-sm text-gray-700 whitespace-pre-line">{item.content}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="respond" className="mt-4 space-y-4">
                                        <Textarea
                                            placeholder="Type your response here..."
                                            className="min-h-[120px]"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <div className="flex justify-between">
                                            <Button variant="outline" size="sm">
                                                <Paperclip className="h-4 w-4 mr-2" />
                                                Attach File
                                            </Button>
                                            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Response
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Sidebar - student info and actions */}
                    <div className="space-y-6">
                        {/* Student information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src="/avatars/student.jpg" alt={MOCK_COMPLAINT.studentName} />
                                        <AvatarFallback>{MOCK_COMPLAINT.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">{MOCK_COMPLAINT.studentName}</h3>
                                        <p className="text-sm text-gray-600">{MOCK_COMPLAINT.studentId}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Room {MOCK_COMPLAINT.roomNumber}</p>
                                            <p className="text-xs text-gray-600">{MOCK_COMPLAINT.block}, {MOCK_COMPLAINT.floor}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <UserCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">B.Tech, Computer Science</p>
                                            <p className="text-xs text-gray-600">3rd Year</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Resident Since</p>
                                            <p className="text-xs text-gray-600">August 2022</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Complaint History</p>
                                            <p className="text-xs text-gray-600">2 previous complaints</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <Button variant="outline" className="w-full">
                                        <UserCircle className="h-4 w-4 mr-2" />
                                        View Full Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Update Status</label>
                                    <Select value={newStatus} onValueChange={handleStatusChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in-review">In Review</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Update Priority</label>
                                    <Select value={newPriority} onValueChange={handlePriorityChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-2">
                                    <Button className="w-full" variant="default">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Resolved
                                    </Button>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Button className="w-full" variant="outline">
                                        Schedule Meeting
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        Forward to Senior Warden
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        Print Complaint
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}