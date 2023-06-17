const mongoose = require('mongoose');


const sessionschema = new mongoose.Schema({
    nameUser: {
        type: String,
        required: true,
    },
    dateSession: {
        type: Date,
        default: Date.now,
    },
     
    postes: {
        type: [
            {
                name: {
                    type: String,
                    enum: ['1', '2', '3', '4', '5', '6', '7'],
                    required: true,
                    default: '1',
                },
                compteur: {
                    type: Number,
                    default: null,
                },
                CompteurR: {
                    type: Number,
                    default: null,
                },

            },
        ],
        validate: {
            validator: function (postes) {
                return postes.length <= 7;
            },
            message: 'Exceeded the maximum number of postes (7).',
        },
        default: [
            { name: '1', compteur: null, CompteurR: null },
            { name: '2', compteur: null,CompteurR: null },
            { name: '3',compteur: null,CompteurR: null },
            { name: '4', compteur: null,CompteurR: null },
            { name: '5',compteur: null,CompteurR: null },
            { name: '6', compteur: null,CompteurR: null },
            { name: '7',compteur: null,CompteurR: null },
          ],


              },
    fondInitial: { 
        type: String,
        required: true,
    },
    fondFinal: { 
        type: String,
        default: null,
    }, 
    SommeCopmteur: { 
         type: Number,
        default: null,

    } ,

    Nbheure: { 
        type: Number,
       default: null,

   } , 
   Somme : { 
    type: Number,
   default: null,
} ,

 

});

sessionschema.virtual('id').get(function () {
    return this._id.toHexString();
});

sessionschema.set('toJSON', {
    virtuals: true,
});

exports.Session = mongoose.model('Session', sessionschema);
exports.sessionschema = sessionschema;
