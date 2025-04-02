// app/student/complaints/[id]/page.js
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
    XCircle,
    AlertCircle,
    User,
    Calendar,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Mock data for a specific complaint
const MOCK_COMPLAINT = {
    id: '101',
    title: 'Water leakage in bathroom',
    description: 'There is water leaking from the shower head even when turned off. This is causing water wastage and making the floor slippery. I first noticed this issue three days ago, and it has gotten worse since then.',
    category: 'plumbing',
    status: 'in-review',
    priority: 'medium',
    date: '2025-03-24T10:30:00',
    timeline: [
        {
            id: 1,
            type: 'status-change',
            status: 'pending',
            timestamp: '2025-03-24T10:30:00',
            user: 'system'
        },
        {
            id: 2,
            type: 'message',
            content: 'Thank you for reporting this issue. Your complaint has been registered in our system.',
            timestamp: '2025-03-24T10:35:00',
            user: {
                name: 'System Notification',
                role: 'system',
            }
        },
        {
            id: 3,
            type: 'status-change',
            status: 'in-review',
            timestamp: '2025-03-25T09:15:00',
            user: {
                name: 'Dr. Sunita Walia',
                role: 'warden',
                avatar: '/avatars/warden.jpg'
            }
        },
        {
            id: 4,
            type: 'message',
            content: 'I have assigned a plumber to check your bathroom. They will visit your room today between 2-4 PM. Please ensure someone is present in the room during this time.',
            timestamp: '2025-03-25T09:20:00',
            user: {
                name: 'Dr. Sunita Walia',
                role: 'warden',
                avatar: '/avatars/warden.jpg'
            }
        },
        {
            id: 5,
            type: 'message',
            content: 'Thank you for the update. I will be in my room during that time.',
            timestamp: '2025-03-25T09:45:00',
            user: {
                name: 'Aisha Khan',
                role: 'student',
                avatar: '/avatars/student.jpg'
            }
        }
    ],
    attachments: [
        {
            id: 1,
            name: 'leaking_shower.jpg',
            size: '2.4 MB',
            type: 'image/jpeg',
            url: '/attachments/leaking_shower.jpg'
        }
    ],
    progressSteps: [
        { id: 'submitted', label: 'Submitted', completed: true, current: false },
        { id: 'in-review', label: 'In Review', completed: false, current: true },
        { id: 'assigned', label: 'Assigned', completed: false, current: false },
        { id: 'resolved', label: 'Resolved', completed: false, current: false }
    ]
};

export default function StudentComplaintDetail({ params }) {
    const router = useRouter();
    const complaintId = params.id;
    const [newMessage, setNewMessage] = useState('');
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [satisfaction, setSatisfaction] = useState(null);
    const [feedbackComment, setFeedbackComment] = useState('');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        // In a real app, you would send this to your API
        alert(`Message sent: ${newMessage}`);
        setNewMessage('');
    };

    const handleSubmitFeedback = () => {
        // In a real app, you would submit this feedback to your API
        alert(`Feedback submitted: ${satisfaction ? 'Satisfied' : 'Unsatisfied'}, Comment: ${feedbackComment}`);
        setFeedbackDialogOpen(false);
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

    // Calculate progress percentage based on completed steps
    const calculateProgress = () => {
        const totalSteps = MOCK_COMPLAINT.progressSteps.length;
        const completedSteps = MOCK_COMPLAINT.progressSteps.filter(step => step.completed).length;
        const currentStep = MOCK_COMPLAINT.progressSteps.findIndex(step => step.current);

        // If there's a current step, add half a step to the progress
        return ((completedSteps + (currentStep !== -1 ? 0.5 : 0)) / totalSteps) * 100;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Back button and complaint title */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        className="mb-2 pl-0 hover:bg-transparent hover:text-indigo-700"
                        onClick={() => router.push('/student/dashboard')}
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
                        <div>
                            {getStatusBadge(MOCK_COMPLAINT.status)}
                        </div>
                    </div>
                </div>

                {/* Progress tracker */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium">Complaint Progress</h3>
                                <span className="text-sm text-gray-600">
                                    {Math.round(calculateProgress())}% Complete
                                </span>
                            </div>
                            <Progress value={calculateProgress()} className="h-2" />
                            <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                {MOCK_COMPLAINT.progressSteps.map((step) => (
                                    <div key={step.id} className="space-y-1">
                                        <div className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center ${step.completed
                                            ? 'bg-green-100'
                                            : step.current
                                                ? 'bg-blue-100'
                                                : 'bg-gray-100'
                                            }`}>
                                            {step.completed ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : step.current ? (
                                                <Clock className="h-4 w-4 text-blue-600" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                            )}
                                        </div>
                                        <p className={`text-xs ${step.completed
                                            ? 'text-green-700 font-medium'
                                            : step.current
                                                ? 'text-blue-700 font-medium'
                                                : 'text-gray-500'
                                            }`}>
                                            {step.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Complaint details */}
                <Card className="mb-6">
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
                <Card className="mb-6">
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
                                    placeholder="Type your message here..."
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
                                        Send Message
                                    </Button>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    {MOCK_COMPLAINT.status === 'resolved' ? (
                        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Provide Feedback
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Satisfaction Feedback</DialogTitle>
                                    <DialogDescription>
                                        Please rate your satisfaction with the resolution of this complaint.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="flex justify-center gap-6">
                                        <button
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${satisfaction === true
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSatisfaction(true)}
                                        >
                                            <ThumbsUp className={`h-8 w-8 ${satisfaction === true ? 'text-green-500' : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${satisfaction === true ? 'text-green-700' : 'text-gray-600'}`}>Satisfied</span>
                                        </button>
                                        <button
                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${satisfaction === false
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSatisfaction(false)}
                                        >
                                            <ThumbsDown className={`h-8 w-8 ${satisfaction === false ? 'text-red-500' : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${satisfaction === false ? 'text-red-700' : 'text-gray-600'}`}>Unsatisfied</span>
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="feedback" className="text-sm font-medium">Additional Comments</label>
                                        <Textarea
                                            id="feedback"
                                            placeholder="Please share your thoughts on how this complaint was handled..."
                                            value={feedbackComment}
                                            onChange={(e) => setFeedbackComment(e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmitFeedback} disabled={satisfaction === null}>
                                        Submit Feedback
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Complaint
                            </Button>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Request Urgent Review
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}