import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const metadata = {
  title: 'Contact Us | FoundIt',
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Get in Touch</h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          Have a question or need assistance? Our team is here to help you out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-[var(--bg-primary)] p-8 rounded-3xl border border-[var(--border-primary)] shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Send us a message</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="First Name" placeholder="John" />
              <Input label="Last Name" placeholder="Doe" />
            </div>
            <Input label="Email Address" type="email" placeholder="john@example.com" />
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Message</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] min-h-[150px]"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            
            <Button type="button" fullWidth>Send Message</Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8 lg:pl-8">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">Email Us</h4>
                  <p className="text-[var(--text-secondary)] mt-1">support@foundit.example.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">Live Chat</h4>
                  <p className="text-[var(--text-secondary)] mt-1">Available Mon-Fri, 9am - 5pm EST</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">Office</h4>
                  <p className="text-[var(--text-secondary)] mt-1">123 Tech Avenue, Suite 100<br/>San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
