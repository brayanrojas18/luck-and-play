
module.exports = function(Model, options) {
  // Model is the model class
  // options is an object containing the config properties from model definition

  Model.observe('after save', async function(ctx) {

    if(ctx.isNewInstance){

      Model.app.models.MetricStorage.create({
        model: Model.modelName,
        data: ctx.instance.toJSON(),
        hook: 'created'
      })

    }

  });

  Model.observe('before save', async function(ctx) {

    if(!ctx.isNewInstance){

      if(ctx.instance){

        let data = await Model.findById(ctx.instance.id)

        Model.app.models.MetricStorage.create({
          model: Model.modelName,
          before: data.toJSON(),
          data: ctx.instance.toJSON(),
          hook: 'updated'
        })

      }
      else {

        let data = await Model.find({
          where: ctx.where
        })

        data.forEach(v => {

          Model.app.models.MetricStorage.create({
            model: Model.modelName,
            before: v.toJSON(),
            data: {
              ...v.toJSON(),
              ...ctx.data
            },
            hook: 'updated'
          })

        })

      }


    }

  });

  Model.observe('before delete', async function(ctx){

    let regs = await Model.find({
      where: ctx.where
    })

    Model.app.models.MetricStorage.create(regs.map(v => ({
      model: Model.modelName,
      data: v.toJSON(),
      hook: 'deleted'
    })))

  })
  
}