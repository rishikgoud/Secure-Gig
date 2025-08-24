import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface ChatWithUserProps {
  phoneNumber: string;
  userName?: string;
  message?: string;
  gigTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showConfirmation?: boolean;
}

const ChatWithUser: React.FC<ChatWithUserProps> = ({
  phoneNumber,
  userName = 'User',
  message = 'Hello, I want to connect with you!',
  gigTitle,
  className = '',
  variant = 'default',
  size = 'default',
  showConfirmation = true
}) => {
  const [showDialog, setShowDialog] = useState(false);

  // Format phone number (remove any non-digits except +)
  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  };

  // Create dynamic message with gig title if provided
  const createMessage = (): string => {
    if (gigTitle) {
      return `Hello ${userName}, I'm interested in your gig: ${gigTitle}. ${message}`;
    }
    return `Hello ${userName}, ${message}`;
  };

  // Generate WhatsApp URL
  const generateWhatsAppUrl = (): string => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(createMessage());
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  };

  const handleChatClick = () => {
    if (showConfirmation) {
      setShowDialog(true);
    } else {
      openWhatsApp();
    }
  };

  const openWhatsApp = () => {
    const whatsappUrl = generateWhatsAppUrl();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowDialog(false);
  };

  // Validate phone number format
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(formatPhoneNumber(phone));
  };

  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`opacity-50 cursor-not-allowed ${className}`}
        disabled
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat Unavailable
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleChatClick}
        className={`bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 transition-all duration-200 ${className}`}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat on WhatsApp
      </Button>

      {showConfirmation && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Chat on WhatsApp
              </DialogTitle>
              <DialogDescription>
                You will be redirected to WhatsApp to chat with <strong>{userName}</strong>.
                {gigTitle && (
                  <span className="block mt-2 text-sm">
                    Regarding: <em>{gigTitle}</em>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Pre-filled message:</p>
              <p className="text-sm italic">"{createMessage()}"</p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={openWhatsApp}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open WhatsApp
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ChatWithUser;
