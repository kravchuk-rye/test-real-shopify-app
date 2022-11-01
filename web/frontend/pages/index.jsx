import { IntroductionPage } from "@shopify/channels-ui";
import { Button, Card } from "@shopify/polaris";

export default function HomePage() {
  return (
    <IntroductionPage title="Example channel">
      <Card title="Welcome" sectioned>
        <Button onClick={() => alert("Button clicked!")}>Example button</Button>
      </Card>
    </IntroductionPage>
  );
}
