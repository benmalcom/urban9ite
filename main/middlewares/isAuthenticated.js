/**
 * Created by Malcom on 10/31/2016.
 */
module.exports =  function (req,res,next){
    if(req.isAuthenticated())return next();
    req.flash('danger', 'You need to be logged in.');
    res.redirect('/login');
};


