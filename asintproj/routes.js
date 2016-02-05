import React from 'react';
import { Route } from 'react-router';
import App from './containers/App';
import Login from './components/Login';
import Account from './components/Account';
import Logout from './components/Logout';
import Register from './components/Register';
import Createpost from './components/Createpost';
import Comments from './components/Comments';

export default (
  <Route path="/" component={App}>
    <Route path="account"
        component={Account} />
    <Route path="login"
        component={Login} />  
     <Route path="logout"
     	component={Logout} />
     <Route path="register"
     	component={Register} /> 
    <Route path="create"
        component={Createpost} />
    <Route path="comments/:pid"
        component={Comments} />
  </Route>
);
