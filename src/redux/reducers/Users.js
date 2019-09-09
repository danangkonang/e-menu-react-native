const initialState = {
    data: [],
    isLoading: false
  }
  
  const users = (state = initialState, action) => {
    switch (action.type) {
      case 'GET_USERS':
        return {
          ...state,
          data: action.payload,
          isLoading: false
        }
      case 'GET_USERS_PENDING':
        return {
          ...state,
          isLoading: true
        }   
      default:
        return state;
    }
  }
  
  export default users;