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
            addressLine: { type: String, default: "" },
            area: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pincode: { type: String, default: "" },
            deliveryAddress: { type: String, default: "" },
            deliveryPhone: { type: String, default: "" },
            deliveryPartnerName: { type: String, default: "" },
            deliveryPartnerPhone: { type: String, default: "" },
            trackingId: { type: String, default: "" },
            estimatedDelivery: { type: Date },
            createdAt: { type: Date, 
                default: Date.now }

});

module.exports= mongoose.model("order",orderSchema);