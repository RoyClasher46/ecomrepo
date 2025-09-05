const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    
            productId: { type: mongoose.Schema.Types.ObjectId, 
                        ref: "product", 
                        required: true 
                       },
            userId: {  
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user",
                    required: true
                    },
            quantity: { type: Number, 
                        default: 1,
                        required: true 
                      },
            status: { type: String, 
                      default: "Pending" 
                    }, // Pending, Accepted, Rejected
            createdAt: { type: Date, 
                default: Date.now }

});

module.exports= mongoose.model("order",orderSchema);