import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Shield, 
  Settings,
  Send,
  ArrowLeft
} from 'lucide-react';

const mockContacts = [
  {
    id: 1,
    name: 'Alice.eth',
    avatar: 'https://github.com/shadcn.png',
    lastMessage: 'Hey, how is the project going?',
    online: true,
  },
  {
    id: 2,
    name: 'Bob.sol',
    avatar: 'https://github.com/shadcn.png',
    lastMessage: 'Can you check the latest smart contract?',
    online: false,
  },
];

const mockMessages = {
  1: [
    { sender: 'You', text: 'Hey, how is the project going?', time: '10:30 AM' },
    { sender: 'Alice.eth', text: 'Going well! Should have an update by EOD.', time: '10:32 AM' },
  ],
  2: [
    { sender: 'Bob.sol', text: 'Can you check the latest smart contract?', time: 'Yesterday' },
  ],
};

const Chat = () => {
  const [activeContact, setActiveContact] = useState(mockContacts[0]);
  const [messages, setMessages] = useState(mockMessages[activeContact.id]);
  const [newMessage, setNewMessage] = useState('');
  const [showChatArea, setShowChatArea] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const newMsg = { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleContactClick = (contact: typeof mockContacts[0]) => {
    setActiveContact(contact);
    setMessages(mockMessages[contact.id] || []);
    setShowChatArea(true);
  };

  const userRole = window.location.pathname.includes('client') ? 'Client' : 'Freelancer';
  const dashboardHome = userRole === 'Client' ? '/client-dashboard' : '/freelancer-dashboard';

  const navLinks = [
    { href: dashboardHome, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/gigs', label: 'Gigs', icon: Briefcase },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/contracts', label: 'Contracts', icon: Shield },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout navLinks={navLinks} userName="User.eth" userRole={userRole}>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Contacts Sidebar */}
        <div className={`w-full md:w-1/4 border-r flex-col bg-card ${showChatArea ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          <ScrollArea className="flex-1">
            {mockContacts.map(contact => (
              <div 
                key={contact.id} 
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-muted ${activeContact.id === contact.id ? 'bg-muted' : ''}`}
                onClick={() => handleContactClick(contact)}
              >
                <Avatar>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-3/4 flex-col ${showChatArea ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 border-b flex items-center gap-4 bg-card">
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setShowChatArea(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={activeContact.avatar} />
              <AvatarFallback>{activeContact.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{activeContact.name}</h3>
              <p className={`text-sm ${activeContact.online ? 'text-green-500' : 'text-muted-foreground'}`}>
                {activeContact.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6 bg-background" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-xs sm:max-w-md ${msg.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{msg.text}</p>
                    <p className="text-xs text-right mt-1 opacity-70">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-card">
            <div className="relative">
              <Input 
                placeholder="Type a message..." 
                className="pr-12"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button size="icon" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
