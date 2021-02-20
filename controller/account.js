module.exports = [

  {
    method: 'get',
    path  : '/api/account/me',
    name  : 'account.me',
    async handler(req, res) {
      if (!req.auth.ok) return new app.HttpUnauthorized({ok:false,message:'Authentication required'});
      return new app.HttpOk({ok:true,account:req.auth.account});
    },
  },

];
