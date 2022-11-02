import { FeatureCard, IntroductionPage } from "@shopify/channels-ui";

export default function HomePage() {
  return (
    <IntroductionPage title="Get started with RYE sales channel">
      <FeatureCard
        title="Sell your products on RYE"
        feature="RYE Shopping"
        portrait
        description="Let customers discover and purchase your products directly on RYE."
        badgeText="Free"
        primaryAction={{
          content: "Start setup",
          url: "/Onboarding",
        }}
      >
        <img
          width="100%"
          src="https://burst.shopifycdn.com/photos/laptop-from-above.jpg?width=750&format=pjpg"
        />
      </FeatureCard>
    </IntroductionPage>
  );
}
