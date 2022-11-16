import React from 'react';
import { OverviewPage, FeatureListCard } from '@shopify/channels-ui';

export default function MyOverviewPage() {
  // the number of products publication to your app's
  const availableProductCount = 22;

  // the id of your app's publication
  const publicationId = 72112898104;

  // current shop domain
  const shopOrigin = 'test.myshopify.com';

  return (
    <OverviewPage title="Mockingbird channel overview">
      <OverviewPage.Section title="Manage your Mockingbird Features">
        <FeatureListCard
          features={[
            {
              title: 'Mockingbird Shopping',
              description:
                'Let customers discover and purchase your products directly on Mockingbird.',
              badge: {
                status: 'success',
                children: 'Active',
              },
              action: {
                content: 'View shop',
              },
            },
          ]}
        />
      </OverviewPage.Section>
    </OverviewPage>
  );
}
