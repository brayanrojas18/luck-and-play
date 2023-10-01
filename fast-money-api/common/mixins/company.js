var ObjectID = require('mongodb').ObjectID;
var loopback = require('loopback')

module.exports = function(Model, options) {
  // Model is the model class
  // options is an object containing the config properties from model definition
  Model.defineProperty('companyId', {type: ObjectID});


  Model.observe('before save', async function(ctx) {
    var headers = Model.app.get('headers')
    if(headers?.company && ctx.instance)
      ctx.instance.companyId = ObjectID(headers.company)
    return
  });

  Model.observe('access', async function(ctx) {
    var headers = Model.app.get('headers')
    if(headers?.company){
      if(!ctx.query)
        ctx.query = {}
      if(!ctx.query.where)
        ctx.query.where = {}
      ctx.query.where.companyId = ObjectID(headers.company)
      // console.log(ctx)
    }
    return
  });

  Model.observe('before delete', async function(ctx){

    let regs = await Model.find({
      where: ctx.where
    })

    for(let reg of regs){

      Model.app.models().forEach(modelo => {

        if(!modelo.definition?.settings?.relations || typeof modelo.definition.settings.relations != 'object'){
          return
        } 

        Object.values(modelo.definition.settings.relations).forEach(relation => {

          if(relation.type == 'belongsTo' && relation.model == Model.name){

            Model.app.models[relation.model]?.destroyAll({
              [relation.foreignKey]: reg.id
            })

          }

        })

      })

    }

  })
  
}