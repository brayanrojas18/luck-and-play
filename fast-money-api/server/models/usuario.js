var config = require("../../server/config.json");
var senderAddress = "testing@lagocha2020.com";
var ObjectID = require("mongodb").ObjectID;

module.exports = function (Usuario) {
  Usuario.defineProperty("role_id", { type: ObjectID, default: null });

  Usuario.afterRemote("login", async function (ctx, result, next) {
    console.log("login", ctx.req.query.info);
    // var Token = Usuario.app.models.Token
    // var TokenHistory = Usuario.app.models.TokenHistory
    // var t = await Token.findOne({
    //   where: {
    //     usuario: result.userId
    //   }
    // })
    // // console.log(token)
    // if (!t)
    //   Token.create({
    //     token: result.id,
    //     usuario: result.userId
    //   })
    // else {
    //   t.token = result.id
    //   t.save()
    // }

    // TokenHistory.create({
    //   token: result.id,
    //   usuario: result.userId,
    //   info: ctx.req.query.info ? JSON.parse(ctx.req.query.info) : {}
    // })

    // Usuario.app.io.emit('login-' + result.userId, result.id)

    // next()
    return;
  });

  // Usuario.observe('access', async function(ctx) {
  //   if(ctx.query && ctx.query.where && ctx.query.where.punto && typeof ctx.query.where.punto == "string")
  //     ctx.query.where.punto = ObjectID(ctx.query.where.punto)
  //   if(ctx.query && ctx.query.where && ctx.query.where.ciudad && typeof ctx.query.where.ciudad == "string")
  //     ctx.query.where.ciudad = ObjectID(ctx.query.where.ciudad)
  //   return
  // });

  //send verification email after registration
  // Usuario.afterRemote('create', function(context, user, next) {
  //   var options = {
  //     type: 'email',
  //     to: user.email,
  //     from: senderAddress,
  //     subject: 'Thanks for registering.',
  //     template: path.resolve(__dirname, '../../server/views/verify.ejs'),
  //     redirect: '/verified',
  //     user: user
  //   };

  //   user.verify(options, function(err, response) {
  //     if (err) {
  //       Usuario.deleteById(user.id);
  //       return next(err);
  //     }
  //     context.res.render('response', {
  //       title: 'Signed up successfully',
  //       content: 'Please check your email and click on the verification link ' +
  //           'before logging in.',
  //       redirectTo: '/',
  //       redirectToLinkText: 'Log in'
  //     });
  //   });
  // });

  // Method to render
  // Usuario.afterRemote('prototype.verify', function(context, user, next) {
  //   context.res.render('response', {
  //     title: 'A Link to reverify your identity has been sent '+
  //       'to your email successfully',
  //     content: 'Please check your email and click on the verification link '+
  //       'before logging in',
  //     redirectTo: '/',
  //     redirectToLinkText: 'Log in'
  //   });
  // });

  //send password reset link when requested
  Usuario.on("resetPasswordRequest", function (info) {
    var url = "https://" + config.host_public + "/reset-password";
    var html =
      'Click <a href="' +
      url +
      "?access_token=" +
      info.accessToken.id +
      '">aquí</a> para restaurar su contraseña';

    Usuario.app.models.Email.send(
      {
        to: info.email,
        from: senderAddress,
        subject: "Restaurar clave",
        html: html,
      },
      function (err) {
        if (err)
          return console.log("> error sending password reset email", err);
        console.log("> sending password reset email to:", info.email);
      }
    );
  });

  //render UI page after password change
  Usuario.afterRemote("changePassword", function (context, user, next) {
    context.res.render("response", {
      title: "Contraseña cambiada exitosamente",
      content: "Por favor ingrese de nuevo con su nueva clave",
      redirectTo: "/",
      redirectToLinkText: "Iniciar sesión",
    });
  });

  //render UI page after password reset
  Usuario.afterRemote("setPassword", function (context, user, next) {
    context.res.render("response", {
      title: "Contraseña reseteada exitosamente",
      content: "Su contraseña ha sido modificada exitosamente",
      redirectTo: "http://lagocha2020.com/",
      redirectToLinkText: "Iniciar sesión",
    });
  });

  // REMOTE METHODS
  const validate_user = async (wallet) => {
    var user_model = Usuario.app.models.usuario;
    let user = await user_model.find({
      where: {
        role: "user",
        wallet: wallet,
      },
    });
    user = user.length ? user[0] : {};
    return user;
  };

  Usuario.validate_user = async function (wallet) {
    var result = await validate_user(wallet);
    return result;
  };

  Usuario.remoteMethod("validate_user", {
    accepts: [
      {
        arg: "wallet",
        type: "string",
      },
    ],
    returns: { arg: "result", type: "object" },
  });

  const save_user = async (data) => {
    var user_model = Usuario.app.models.usuario;
    let user = user_model.create(data);
    return user;
  };

  Usuario.save_user = async function (data) {
    var result = await save_user(data);
    return result;
  };

  Usuario.remoteMethod("save_user", {
    accepts: [
      {
        arg: "data",
        type: "object",
      },
    ],
    returns: { arg: "result", type: "object" },
  });
};
