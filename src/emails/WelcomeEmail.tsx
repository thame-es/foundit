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

interface WelcomeEmailProps {
  displayName: string;
  appUrl: string;
}

export const WelcomeEmail = ({
  displayName,
  appUrl,
}: WelcomeEmailProps) => {
  const previewText = `Welcome to FoundIt, ${displayName}! 🎉`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#e4e4e7] rounded-xl my-[40px] mx-auto overflow-hidden max-w-[500px] bg-white shadow-sm">
            
            {/* Hero Header with Brand Colors */}
            <Section className="bg-[#4f46e5] px-[40px] py-[40px] text-center">
              <Text className="text-white text-[32px] font-black tracking-tight m-0 p-0">
                FoundIt
              </Text>
              <Text className="text-indigo-100 text-[16px] mt-2 mb-0 font-medium">
                The community for lost & found
              </Text>
            </Section>
            
            <Section className="px-[40px] py-[32px]">
              <Heading className="text-[#18181b] text-[24px] font-bold p-0 my-[0] mx-0 text-center">
                Welcome to the community!
              </Heading>
              
              <Text className="text-[#3f3f46] text-[15px] leading-[26px] mt-[24px]">
                Hello <strong>{displayName}</strong>,
              </Text>
              
              <Text className="text-[#3f3f46] text-[15px] leading-[26px]">
                We are absolutely thrilled to have you join us. FoundIt is the premier platform designed to help people recover their lost belongings, or safely return items they've found.
              </Text>
              
              <Text className="text-[#3f3f46] text-[15px] leading-[26px]">
                Whether you lost something precious or found something looking for its home, you are in the right place. Ready to get started?
              </Text>
              
              <Section className="text-center mt-[36px] mb-[36px]">
                <Button
                  className="bg-[#4f46e5] rounded-full text-white text-[14px] font-bold no-underline text-center px-8 py-4 shadow-sm"
                  href={`${appUrl}/search`}
                >
                  Explore Recent Items
                </Button>
              </Section>
              
              <Hr className="border border-solid border-[#e4e4e7] my-[26px] mx-0 w-full" />
              
              <Text className="text-[#71717a] text-[13px] leading-[24px]">
                If you didn't create an account with FoundIt, you can safely ignore this email. No further action is required.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
