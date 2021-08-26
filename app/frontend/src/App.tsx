import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Login from './component/login/Login';
import MainPage from './component/mainpage/MainPage';
import '/src/App.scss'

function NotFound() {
  return (
    <h1>404</h1>
  );
}

const App = (): JSX.Element => {
  return (
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/mainpage" component={MainPage} />
            <Route component={NotFound} />
          </Switch>
        </BrowserRouter>
  );
}

export default App;