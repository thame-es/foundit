import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface MessageNotificationEmailProps {
  senderName: string;
  itemTitle: string;
  messageSnippet: string;
  appUrl: string;
}

export const MessageNotificationEmail = ({
  senderName,
  itemTitle,
  messageSnippet,
  appUrl,
}: MessageNotificationEmailProps) => {
  const previewText = `New Message from ${senderName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#e4e4e7] rounded-xl my-[40px] mx-auto overflow-hidden max-w-[500px] bg-white shadow-sm">
            
            {/* Hero Header with Brand Colors */}
            <Section className="bg-[#4f46e5] px-[40px] py-[30px] text-center">
              <Text className="text-white text-[24px] font-black tracking-tight m-0 p-0">
                FoundIt
              </Text>
            </Section>
            
            <Section className="px-[40px] py-[32px]">
              <Heading className="text-[#18181b] text-[20px] font-bold p-0 my-[0] mx-0 text-center">
                You have a new message! 📩
              </Heading>
              
              <Text className="text-[#3f3f46] text-[15px] leading-[26px] mt-[24px]">
                <strong>{senderName}</strong> sent you a message regarding <strong>"{itemTitle}"</strong>.
              </Text>
              
              {/* Premium Message Bubble */}
              <Section className="bg-[#eef2ff] border border-solid border-[#c7d2fe] rounded-xl p-[20px] my-[24px] shadow-sm">
                <Text className="text-[#3730a3] text-[15px] leading-[26px] italic m-0">
                  "{messageSnippet.length > 150 ? messageSnippet.substring(0, 150) + '...' : messageSnippet}"
                </Text>
              </Section>
              
              <Section className="text-center mt-[36px] mb-[36px]">
                <Button
                  className="bg-[#4f46e5] rounded-full text-white text-[14px] font-bold no-underline text-center px-8 py-4 shadow-sm"
                  href={`${appUrl}/dashboard/messages`}
                >
                  Reply to Message
                </Button>
              </Section>
              
              <Hr className="border border-solid border-[#e4e4e7] my-[26px] mx-0 w-full" />
              
              <Text className="text-[#71717a] text-[12px] leading-[24px] text-center">
                You are receiving this because you have notifications enabled for FoundIt.
                <br />
                <Link href={`${appUrl}/dashboard/settings`} className="text-[#4f46e5] font-medium underline">
                  Update Notification Preferences
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MessageNotificationEmail;
