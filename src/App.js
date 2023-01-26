import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";

import Main from "./Main";

const App = ({ signOut }) => {
  return (
    <main>
      <Main signOut={signOut}></Main>
    </main>
  );
};

export default withAuthenticator(App);
