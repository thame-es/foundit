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
        <Body className="bg-[#f3f4f6] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
            <Section className="mt-[32px]">
              <Img
                src={`${appUrl}/logo.png`}
                width="40"
                height="40"
                alt="FoundIt Logo"
                className="my-0 mx-auto block"
              />
            </Section>
            
            <Heading className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0">
              You have a new message! 📩
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{senderName}</strong> sent you a message regarding <strong>"{itemTitle}"</strong>.
            </Text>
            
            <Section className="bg-[#f9fafb] border border-solid border-[#e5e7eb] rounded-lg p-[16px] my-[24px]">
              <Text className="text-[#374151] text-[14px] leading-[24px] italic m-0">
                "{messageSnippet.length > 150 ? messageSnippet.substring(0, 150) + '...' : messageSnippet}"
              </Text>
            </Section>
            
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#2563eb] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={`${appUrl}/dashboard/messages`}
              >
                Reply to Message
              </Button>
            </Section>
            
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
              You are receiving this because you have notifications enabled for FoundIt.
              <br />
              <Link href={`${appUrl}/dashboard/settings`} className="text-[#2563eb] underline">
                Update Notification Preferences
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MessageNotificationEmail;
