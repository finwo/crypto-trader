export const auth = {
  algorithms          : ['HS256'],                               // Keep it simple
  credentialsRequired : false,                                   // We'll handle unauth errors ourselves
  requestProperty     : 'auth',                                  // How we make data available to the api
  secret              : process.env.AUTH_SECRET || 'change_me',  // Fetch non-hardcoded auth secret
};
