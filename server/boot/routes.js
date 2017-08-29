module.exports = function(app) {
  var request = require('request');
  var moment = require('moment');
  var multer  = require('multer');
  var upload = multer({dest : 'uploads/'+moment().format('MMMM')});
  var users = app.models.user;
  var reports =  app.models.Report;
  var projects =  app.models.Project;
  var form1 = app.models.Form1;
  var form2 = app.models.Form2;
  var rid_office = app.models.rid_office;
  var rid_agency = app.models.rid_agency;
  var uploads = app.models.Uploads;
  

  const CLIENT_ID = "70114818671-0eh6dgjq1fbl1s4j26a3unhukpvi7ars.apps.googleusercontent.com";
  const CLIENT_SECRET = "RX-GqHqsEWRMk1fmLnv-h7iT";
  const REDIRECT_URL = "http://localhost:3000/auth/google/callback";
 
 app.get('/', function(req, res) {
    console.log(req.cookies);
    var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    if(!req.cookies['access_token']){
      res.render('pages/index.html');
    }else{
      res.render('pages/index.html', { user : user });
    }
  });
  

  app.get('/login', function(req, res, next) {
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;
  var plus = google.plus('v1');

  var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  var scopes = [
      "https://www.googleapis.com/auth/userinfo.email"
    ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes, // If you only need one scope you can pass it as a string
  });

  //res.render('pages/index', { url: url });
  console.log(url);
  res.redirect(url);
});

// google callback 
app.get('/auth/google/callback', function(req, res, next) {
  console.log(req.query);
  //var thecode=req.query.code;
  var code = req.query.code;
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;

  var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  oauth2Client.getToken(code, function (err, tokens) {
  // Now tokens contains an access_token and an optional refresh_token. Save them.
  console.log('get_token : '+tokens);
  var accessToken = tokens.access_token;
  console.log('acctoken : '+accessToken);

  var url="https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+accessToken;
  request(url, function (error, response, body){
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      console.log('body:', body); 

  var body_obj=JSON.parse(body);

  var emp_gmail = body_obj.email;
  var url_emp = "http://flowto.rid.go.th/api/Empemails/getaccount/"+emp_gmail;
  request(url_emp, function (error, response, body){
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      console.log('body:', body);
      // don't have email in Emp_email
      if(response && response.statusCode != 200){
        res.redirect('/')
      }else{    // have email in Emp_email
        var emp_data = JSON.parse(body);
        //console.log(emp_data.Account.email);

        var data = emp_data.Account.email.split('@');
        var username = data[0];
        //console.log(username);
      
        var newUser = {};
        newUser.email=emp_data.Account.email;
        newUser.username= username; //split email
        newUser.password="owlahedwig";

        var filter={
          where:{"email":emp_data.Account.email} 
        };

        users.find(filter, function(err, theUser) {
          if(err) {
            console.log("nothing user")
          }else{
            if(theUser.length>0){ // have account
              users.login(newUser, function (err, accessToken) {
                console.log('user_token : '+JSON.stringify(accessToken.id)); 
                console.log(accessToken.id);      // => GOkZRwg... the access token
                console.log(accessToken.ttl);     // => 1209600 time to live
                console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                console.log(accessToken.userId);

              res.cookie('access_token',accessToken.id);
              res.cookie('username', newUser.username);
              res.cookie('email', newUser.email);
              res.cookie('userId', accessToken.userId);

              //res.cookie('access_token', accessToken.id, { signed: true });
              //res.cookie('username', username, { signed: true });
              res.redirect('/');
              }); // login
            }else{ // not have account
              users.create(newUser, function(err, user) {
                  console.log(user);
                users.login(newUser, function (err, accessToken) {
                  console.log('user_token : '+JSON.stringify(accessToken.id)); 
                  console.log(accessToken.id);      // => GOkZRwg... the access token
                  console.log(accessToken.ttl);     // => 1209600 time to live
                  console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                  console.log(accessToken.userId);  
                
                res.cookie('access_token',accessToken.id);
                res.cookie('username', newUser.username);
                res.cookie('email', newUser.email);
                res.cookie('userId', accessToken.userId);

                //res.cookie('access_token', accessToken.id, { signed: true });
                //res.cookie('username', username, { signed: true });
                res.redirect('/');
                }); // login
              }); // create
            }
          } // bigger else
        }); // user filter
        
      }

      }); // request
});
    }); // google get token
  });  // google callback

  //test login and check email
  app.get('/user', function(req, res, next) {
      var newUser = {};
        newUser.email="irrigation.wag@gmail.com";
        newUser.username= "irrigation.wag"; //split email
        newUser.password="owlahedwig";


        var filter={
          where:{"email":"irrigation.wag@gmail.com"} 
        };

        users.find(filter, function(err, theUser) {
          if(err) {
            console.log("nothing user")
          }else{
            if(theUser.length>0){ // have account
              users.login(newUser, function (err, accessToken) {
                console.log('user_token : '+JSON.stringify(accessToken.id)); 
                console.log(accessToken.id);      // => GOkZRwg... the access token
                console.log(accessToken.ttl);     // => 1209600 time to live
                console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                console.log(accessToken.userId);

              res.cookie('access_token',accessToken.id);
              res.cookie('username', newUser.username);
              res.cookie('email', newUser.email);
              res.cookie('userId', accessToken.userId);
              res.redirect('/');
              }); // login
            }else{ // not have account
              users.create(newUser, function(err, user) {
                  console.log(user);
                users.login(newUser, function (err, accessToken) {
                  console.log('user_token : '+JSON.stringify(accessToken.id)); 
                  console.log(accessToken.id);      // => GOkZRwg... the access token
                  console.log(accessToken.ttl);     // => 1209600 time to live
                  console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                  console.log(accessToken.userId);  
                
                res.cookie('access_token',accessToken.id);
                res.cookie('username', newUser.username);
                res.cookie('email', newUser.email);
                res.cookie('userId', accessToken.userId);
                res.redirect('/');
                }); // login
              }); // create
            }
          } // bigger else
        }); // user filter
 
  }); // get /user

 //log a user out
  app.get('/logout', function(req, res, next) {
    console.log('accessToken : '+req.accessToken);
    console.log('ck-acctk : '+req.cookies['access_token']);
    if (!req.cookies['access_token']) {
      return res.sendStatus(401);
    }else{
      res.clearCookie('access_token');
      res.clearCookie('username');
      res.clearCookie('email');
      res.clearCookie('userId');
      users.logout(req.cookies['access_token'], function(err) {
        if (err) return next(err);
        res.redirect('https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000/'); //on successful logout, redirect
      }); // logout loopback
    } // else
  }); //get logout

/* ------------- Form ----------------- */

app.get('/formPage',function(req, res, next) {
  var user = {};
  user.email = req.cookies['email'];
  user.username = req.cookies['username'];
  console.log("formPage Time : "+moment().locale('th').format('LLLL'));
  var date = moment().locale('th').format('DD MMMM YYYY')
  res.render('pages/form.html', {user:user, date:date})    
});

app.get('/form',function(req, res, next) {
  console.log(req.query);
  var user = {};
  user.email = req.cookies['email'];
  user.username = req.cookies['username'];
  var date = moment().locale('th').format('DD MMMM YYYY');
 
  rid_office.find({order: 'id ASC'},function(err,data){
    var office_lists = data;
    rid_agency.find({order: 'id ASC'},function(err,data){
      var agency_lists = data 
      var select_lists = {};
      select_lists.agency = agency_lists;
      select_lists.office = office_lists;
      //console.log(select_lists);

    if(req.query.form == 'form1'){
      console.log('Form1'); 
      res.render('pages/form1.html', 
        { user : user ,
          select_lists : select_lists, 
          date : date
        });

    }if(req.query.form == 'form2'){
      console.log('Form2');
      res.render('pages/form2.html', 
        { user : user ,
          select_lists : select_lists, 
          date : date
        });
    }

    });
  });
});

var cpUpload = upload.fields([{ name: 'photos', maxCount: 20 }]);
//var newFilename = upload.rename(fieldname, filename.replace(ext, '')) + ext;
app.post('/sendForm', cpUpload, function(req, res, next) {
  console.log('form : '+req.query.form);
  //var date = moment().format();  
  var date = moment().locale('th').format('DD MMMM YYYY');  
  var form = req.query.form;
  if( form == 'form1') {
    //console.log(req.files['photos'][0].originalname);
    var theForm1 = {
      "office_name" : req.body.InputOfficeName,
      "agency_name" : req.body.InputAgencyName,
      "province" : req.body.province,
      "SPK_time" : req.body.SPK_time,
      "SPK_person" : req.body.SPK_person,
      "JMC_time" : req.body.JMC_time,
      "JMC_person" : req.body.JMC_person,
      "news" : req.body.InputNews,
      "date" : date,
      "user_id" : req.cookies['userId']
    };
//console.log(req.files['photos']);
    form1.upsert(theForm1, function(err, callback) {
      //console.log(callback);
      /*var date = moment().format();               
      console.log(date);*/
      var id = callback.id;
      console.log(id);

      for(var i = 0; i < req.files['photos'].length;i++){
        var pack = {
            name : req.files['photos'][i].originalname,
            path : req.files['photos'][i].path,
            form1_id : id
        }
        uploads.upsert(pack,function(err,callback){
          console.log(callback);
        });
      }
     res.redirect('/formPage'); 
    });

  }if( form == 'form2') {
    console.log(req.body);
    var theForm2 = {
      "office_name" : req.body.InputOfficeName,
      "agency_name" : req.body.InputAgencyName,
      "firstName" : req.body.firstName,
      "lastName" : req.body.lastName,
      "do" : req.body.Do,
      "dont" : req.body.Dont,
      "reason" : req.body.reason,
      "process1" : req.body.process1,
      "process2" : req.body.process2,
      "process3" : req.body.process3,
      "process4" : req.body.process4,
      "process5" : req.body.process5,
      "note" : req.body.note,
      "form2_date" : date,
      "user_id" : req.cookies['userId']
    };
    form2.upsert(theForm2, function(err, callback) {
      //console.log(callback);
      //var message = "กรอกข้อมูลสำเร็จ";
      res.redirect('/formPage');  
    });
  }
});

/* ------------ Flowto Project ----------- */

app.get('/projectPage',function(req, res, next) {
  console.log(req.cookies);
  console.log('cookies_accTK : '+req.cookies['access_token']);
  console.log('cookies_username : '+req.cookies['username']);
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    if(!req.cookies['access_token']){
      return res.sendStatus(401);
    }else{

      projects.find({},function(err,data){
        var lists = data;
        console.log(lists);
        //console.log(lists.length);
        //var number = lists.length;
        res.render('pages/project.html', { user: user ,lists : lists});   
      });
      
    }
});

app.post('/add',function(req, res, next) {
  console.log(req.body.name);
  console.log(req.body.action);
  console.log(req.body);

  if(!req.cookies['access_token']){
    return res.sendStatus(401);
  }else{
     //var date = moment().format().replace(/T/, ' ');      // replace T with a space
    var date = moment().format();               
    console.log(date);
    var theProject = {
      "name" : req.body.name,
      "project_date" : date,
      "user_id" : req.cookies['userId']
    };
    projects.upsert(theProject, function(err, callback) {
      //console.log(callback);
      res.redirect('/projectPage');  
    });
  }
});  // post data to report model (/add)
 
app.get('/chkdelete',function(req, res, next) {
  console.log(req.query.id);
  var id =  req.query.id;
 
  projects.findById(id, function(err, callback) {
    console.log(callback);
    res.send(callback);
    console.log('delete');
  });
});

app.post('/delete',function(req, res, next) {
  projects.destroyById(req.body.delid, function(err, callback) {
    console.log(callback);
    console.log('Delete');
    res.redirect('/projectPage'); 
  });

});

app.get('/TheProject',function(req, res, next) {
  console.log(req.query.id); 
  var id =  req.query.id; // project id
  projects.findById(id, function(err, callback) {
    console.log(callback);
    var data = callback;
    var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    
    var filter={
          where:{"projectId": data.id}
        };
    var projectId = data.id;
    var projectName = data.name
    reports.find(filter, function(err, data) {
      console.log("TheProject"+JSON.stringify(data));
      console.log(req.cookies);
      var RPobj = {};
      RPobj.meta= {projectId : projectId};
      RPobj.data = data;
      RPobj.name = {projectName : projectName}
      res.render('pages/report.html', {user: user , RPobj : RPobj});
    });

  });
});

/*-------- Flowto Report ----------*/

app.post('/addReport',function(req, res, next) {
  console.log(req.body);
  if(!req.cookies['access_token']){
    return res.sendStatus(401);
  }else{
    var date = moment().format();
    var theReport = {
      "title" : req.body.title,
      "user_id" : req.cookies['userId'],
      "projectId" : req.body.project_id,
      "created" : date
    };
    reports.upsert(theReport, function(err, callback) {
      console.log(callback);
      res.redirect('/TheProject?id='+callback.projectId);  
    });
  }
});  // post data to report model (/add)
 
app.get('/chkdelRP',function(req, res, next) {
  console.log(req.query.id);
  var id =  req.query.id;
 
  reports.findById(id, function(err, callback) {
    console.log(callback);
    res.send(callback);
    console.log('delete');
  });
});

app.post('/deleteReport',function(req, res, next) {
  console.log("deleteReport pro_id "+req.body.pro_id);
  reports.destroyById(req.body.delid, function(err){
    if(err){
      console.log("err "+err);
    }else{
      console.log('Delete');
      res.redirect('/TheProject?id='+req.body.pro_id); 
    }  
  }); 
});

app.get('/modify',function(req, res, next) {
  console.log(req.query.id);
  var id =  req.query.id;
  reports.findById(id, function(err, callback) {
    console.log(callback);
    var data = callback;   
    var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];

    console.log(req.cookies);
    if(req.cookies['userId'] != data.user_id){
      console.log("userId is loggin in : "+ req.cookies['userId']);
      console.log("userId was created : "+data.user_id);
      // ให้ alert ว่า ไม่สามารถแก้ไขได้เนื่องจากไม่ใช่เจ้าของรายงานนี้
      res.redirect('/TheProject?id='+data.projectId);  
    }else{
      res.render('pages/modify.html', {user: user , data : data});
    }   
  });
});

app.post('/cksave',function(req, res) {
  console.log(req.body);
  var data = req.body.description;

//var date = moment().format();
  var theReport = {
    "id" : req.body.RP_id,
    "user_id" : req.cookies['userId'],
    "projectId" : req.body.project_id,
    "description" : data
  };
  console.log(theReport);
  reports.upsert(theReport, function(err, callback) {
    console.log(callback);
    res.redirect('/TheProject?id='+callback.projectId);  
    //res.redirect('/projectPage');
  });

});

app.get('/view_report', function(req, res) {
  console.log(req.query.id);
  var id =  req.query.id;
  var user = {};
  user.email = req.cookies['email'];
  user.username = req.cookies['username'];

  reports.findById(id, function(err, callback) {
    console.log('view_report ' + callback);
    var RBbody = callback;
  
    res.render('pages/view_report.html', { user : user, RBbody : RBbody});
  });
});

}