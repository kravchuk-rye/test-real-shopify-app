import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { PolarisProvider } from "./components/providers/PolarisProvider";
import { QueryProvider } from "./components/providers/QueryProvider";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <BrowserRouter>
      <PolarisProvider>
        <QueryProvider>
          <NavigationMenu
            navigationLinks={[
              {
                label: "Page name",
                destination: "/pagename",
              },
            ]}
          />
          <Routes pages={pages} />
        </QueryProvider>
      </PolarisProvider>
    </BrowserRouter>
  );
}
