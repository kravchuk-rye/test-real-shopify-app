import React, { useState } from 'react';
import { SettingsPage, AccountConnection } from '@shopify/channels-ui';
import { Card } from '@shopify/polaris';

export default function MySettingsPage() {
  // setup states to track account connection for this example
  // account connection status and details should come from your database
  const [accountConnected, setAccountConnected] = useState(true);

  const handleAccountConnect = () => {
    // surface your platform's authentication in a modal or popup
    setAccountConnected(true);
  };

  const handleAccountDisconnect = () => {
    // disconnect account in your database
    setAccountConnected(false);
  };

  // set AccountConnection props based on whether an account is connected
  const accountConnectionProps = accountConnected
    ? {
        content: 'example@mockingbird.com',
        avatarUrl: 'https://burst.shopifycdn.com/photos/fashion-model-in-fur.jpg?width=373',
        action: {
          content: 'Disconnect',
          onAction: handleAccountDisconnect,
        },
        connected: true,
      }
    : {
        content: 'No account connected',
        action: {
          content: 'Connect',
          onAction: handleAccountConnect,
        },
        connected: false,
      };

  return (
    <SettingsPage title="Settings">
      <SettingsPage.Section
        title="Account"
        description="Your Shopify products are synced with this Mockingbird Account"
      >
        <Card>
          <AccountConnection {...accountConnectionProps} />
        </Card>
      </SettingsPage.Section>
    </SettingsPage>
  );
}
