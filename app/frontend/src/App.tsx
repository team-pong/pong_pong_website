import { BrowserRouter, Route, Switch } from 'react-router-dom'
import '/src/App.css'

function NotFound() {
  return (
    <h1>404</h1>
  );
}

const App = (): JSX.Element => {
  return (
        <BrowserRouter>
          <Switch>
            <Route component={NotFound}/>
          </Switch>
        </BrowserRouter>
  );
}

export default App;