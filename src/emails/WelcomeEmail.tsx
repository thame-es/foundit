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
              Welcome to FoundIt!
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {displayName},
            </Text>
            
            <Text className="text-black text-[14px] leading-[24px]">
              We are thrilled to have you join our community. FoundIt is the best place to help people recover their lost belongings, or find something you've lost yourself.
            </Text>
            
            <Section className="text-center mt-[32px] mb-[32px]">
              <Img
                src="https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif"
                width="100%"
                alt="Welcome Animation"
                className="my-0 mx-auto block rounded-lg max-w-[400px]"
              />
            </Section>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Ready to get started? Check out the latest items reported in your area:
            </Text>
            
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#2563eb] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={`${appUrl}/search`}
              >
                Browse Recent Items
              </Button>
            </Section>
            
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you didn't create an account with FoundIt, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
