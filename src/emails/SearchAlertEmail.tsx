import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface SearchAlertEmailProps {
  displayName: string;
  appUrl: string;
  searchName: string;
  itemTitle: string;
  itemUrl: string;
  itemLocation?: string;
}

export const SearchAlertEmail = ({
  displayName,
  appUrl,
  searchName,
  itemTitle,
  itemUrl,
  itemLocation,
}: SearchAlertEmailProps) => {
  const previewText = `New match for your saved search: ${searchName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#e4e4e7] rounded-xl my-[40px] mx-auto overflow-hidden max-w-[500px] bg-white shadow-sm">
            
            <Section className="bg-[#4f46e5] px-[40px] py-[24px] text-center">
              <Text className="text-white text-[24px] font-black tracking-tight m-0 p-0">
                FoundIt Alerts
              </Text>
            </Section>
            
            <Section className="px-[40px] py-[32px]">
              <Heading className="text-[#18181b] text-[20px] font-bold p-0 my-[0] mx-0 text-center">
                We found a possible match!
              </Heading>
              
              <Text className="text-[#3f3f46] text-[15px] leading-[26px] mt-[24px]">
                Hi <strong>{displayName}</strong>,
              </Text>
              
              <Text className="text-[#3f3f46] text-[15px] leading-[26px]">
                  We&apos;ve found some new items that match your search for &quot;{searchName}&quot;.
              </Text>
              
              <Section className="bg-[#f8fafc] rounded-lg p-4 my-6 border border-[#e2e8f0]">
                <Text className="text-[#0f172a] text-[16px] font-bold m-0 p-0">
                  {itemTitle}
                </Text>
                {itemLocation && (
                  <Text className="text-[#64748b] text-[14px] mt-1 mb-0 p-0">
                    Location: {itemLocation}
                  </Text>
                )}
              </Section>
              
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#4f46e5] rounded-full text-white text-[14px] font-bold no-underline text-center px-8 py-4 shadow-sm"
                  href={`${appUrl}${itemUrl}`}
                >
                  View Details & Claim
                </Button>
              </Section>
              
              <Hr className="border border-solid border-[#e4e4e7] my-[26px] mx-0 w-full" />
              
              <Text className="text-[#71717a] text-[13px] leading-[24px]">
                You are receiving this because you enabled email alerts for this saved search. You can turn off these alerts at any time from your <Link href={`${appUrl}/dashboard/saved-searches`} className="text-[#4f46e5] underline">Saved Searches Dashboard</Link>.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SearchAlertEmail;
