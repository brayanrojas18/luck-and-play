var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

module.exports = function(Model, options) {
  // Model is the model class
  // options is an object containing the config properties from model definition
  Model.defineProperty('createdAt', {type: Date, default: '$now'});
  Model.defineProperty('updatedAt', {type: Date, default: '$now'});

  Model.observe('before save', async function(ctx) {

    var data = ctx.instance || ctx.data

    if(ctx.isNewInstance){
      if(!data.createdAt){
        data.createdAt = new Date()
      }
    }
    else{
      data.updatedAt = new Date()
    }

    if(!Model.definition || !Model.definition.properties || typeof Model.definition.properties != 'object')
      return

    for(var i in Model.definition.properties){
      // if(data[i]){
      //   if(Model.definition.properties[i].type == Date){
      //     data[i + '_search'] = moment(data[i]).format('YYYY-MM-DD HH:mm:ss')
      //   }
      //   else{
      //     data[i + '_search'] = String(data[i])
      //   }
      // }
      if(Model.definition.properties[i].type && Model.definition.properties[i].type.constructor.name == 'Function' && Model.definition.properties[i].type.name == 'ObjectID' && (typeof data[i] == "string" || typeof data[i] == "number"))
        data[i] = ObjectID(data[i])
    }

    // almaceno en string los valores para poder realizar busquedas
    // Object.keys(data).filter(v => v.split('_search').length == 1).forEach(v => data[v + '_search'] = String(data[v]))


    // console.log(ctx.instance)

    return
  });

  Model.observe('access', async function(ctx) {

    if(!ctx.query)
      ctx.query = {}

    if(!ctx.query.where)
      ctx.query.where = {}

    if(!Model.definition || !Model.definition.properties || typeof Model.definition.properties != 'object')
      return

    // console.log(ctx.query)

    for(var i in Model.definition.properties){
      if(Model.definition.properties[i].type && Model.definition.properties[i].type.constructor.name == 'Function' && Model.definition.properties[i].type.name == 'ObjectID' && (ctx.query && ctx.query.where && ctx.query.where[i] && (typeof ctx.query.where[i] == "string" || typeof ctx.query.where[i] == "number")))
        ctx.query.where[i] = ObjectID(ctx.query.where[i])
    }

    // console.log(ctx.query)

    return
  });

  Model.observe('after save', async function (ctx){

    // setRelationCount(ctx)
    // socketInformSave(ctx)

  })

  Model.observe('before delete', async function (ctx){
    // socketInformDelete(ctx)
    // await deleteRelations(ctx)
  })

  async function informMultiUpdated(ctx){

    if(!ctx.instance && !ctx.isNewInstance){

      let records = await Model.find({
        where: ctx.where
      })

      records.forEach(record => {
        socketInformSave({
          instance: {
            ...record.toJSON(),
            ...ctx.data
          }
        })
      })

    }

  } 

  async function setRelationCount(ctx){

    const relations = Model.definition.settings.relations

    for(let rel in relations){

      let relation = relations[rel]

      if(relation.type == 'belongsTo'){
        setRelationCountBelongsTo(relation, ctx)
      }

    }

  }

  async function setRelationCountBelongsTo(relation, ctx){

    // Obtengo el modelo relacionado que se va a actualizar
    const modelRel = Model.app.models().find(v => v.modelName == relation.model)

    if(modelRel){
      
      // Obtengo el id del modelo relacionado
      const modelId = ctx.instance[relation.foreignKey]

      if(modelId){

        // Obtengo la cantidad de registros con esa relación
        let count = await Model.count({
          [relation.foreignKey]: modelId
        })

        // le asigno la cantidad al modelo relacionado
        modelRel.upsertWithWhere({
          id: modelId
        }, {
          ['_count_' + Model.modelName]: count
        })

      }

    }

  }

  function socketInformSave(ctx){
    // Nombre base
    let room = Model.modelName
    let event = 'created'

    if(ctx.instance){

      if(!ctx.isNewInstance){
        room += ':' + String(ctx.instance.id)
        event = 'updated'
      }
  
      socketEmitAdmin(room, event, ctx.instance)

    }
  }

  async function socketInformDelete(ctx){
    // Nombre base
    let room = Model.modelName
    let event = 'deleted'

    let docs = await Model.find({
      where: ctx.where
    })

    docs.forEach(doc => socketEmitAdmin(`${room}:${String(doc.id)}`, event, doc.toJSON()))

  }

  function socketEmitAdmin(room, evento, data){
    // console.log(room, evento, JSON.stringify(data), `${room}:${evento}`)
    Model.app.io.in(room).emit(`${room}:${evento}`, data)
  }

  async function deleteRelations(ctx){

    let relations = Model.app.models().filter(v => v.definition.settings.relations && Object.keys(v.definition.settings.relations).filter(r => v.definition.settings.relations[r].model == Model.modelName && v.definition.settings.relations[r].type == "belongsTo").length)

    if(relations.length){

      let docs = await Model.find({
        where: ctx.where
      })
      
      docs.forEach(doc => {

        relations.forEach(relation => {

          for(let i in relation.definition.settings.relations){

            let rel = relation.definition.settings.relations[i]

            if(rel.model == Model.modelName && rel.type == "belongsTo"){

              relation.destroyAll({
                [rel.foreignKey]: doc.id
              })

            }

          }

        })

      })

    }

  }
  
}