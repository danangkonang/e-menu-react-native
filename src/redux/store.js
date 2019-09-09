import { createStore, combineReducers, applyMiddleware } from 'redux';
import users from './reducers/Users';
import { logger } from './middleware';

const reducers = combineReducers({
  users
})

const store = createStore(
  reducers,
  applyMiddleware(logger)
);

export default store
