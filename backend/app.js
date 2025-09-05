const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const userModel = require("./models/user-model");
const productModel = require("./models/product-model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./config/multer-config");



app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true})); 

const cors = require("cors");
const orderModel = require("./models/order-model");
app.use(cors({ origin: "http://localhost:3000", credentials: true }));


mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error: ", err));


app.post('/api/login',async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email or password is incorrect" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

        const token = jwt.sign({ email: user.email, userid: user._id }, "jpjpjp");

        // Set cookie correctly
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        res.status(200).json({ message: "Login Successfully"});

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// In your app.js or routes file
app.get("/products", async (req, res) => {
    try {
        let products = await productModel.find();
         const formattedProducts = products.map(p => ({
            _id: p._id,
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image.toString("base64"), // buffer → base64
    }));
        res.status(200).json(formattedProducts);   // only products, no login message
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.get('/api/logout',isLoggedIn,(req, res) => {
    res.cookie('token', '',{
        httpOnly: true,
        secure: false,       // true if using HTTPS
        sameSite: 'lax',     // same as when you set it
        expires: new Date(0) // immediately expires
    });
    //res.redirect("/adminlogin");
    res.json({ message: 'Logged out successfully' });
});

app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Use async/await for findOne
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // bcrypt callbacks
        bcrypt.genSalt(12, (err, salt) => {
            if (err) return res.status(500).json({ message: "Something went wrong" });

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.status(500).json({ message: "Something went wrong" });

                // Use async/await for create
                const newUser = await userModel.create({ name, email, password: hash });

                const token = jwt.sign({ email: newUser.email, userid: newUser._id }, "jpjpjp");

                // Set cookie
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    expires: new Date(0)
                });

                res.status(200).json({ message: "User registered successfully" });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/uploadproduct', upload.single("image"), async (req, res) => {
    const { name,description,price} = req.body;

    try {
        // Use async/await for create
        const newProduct = await productModel.create({ name, description, price,
            image: req.file.buffer,

        });
        res.status(200).json({ message: "product uploaded" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await productModel.find();

    // Convert Buffer image → base64 string
    const updatedProducts = products.map((p) => ({
      ...p._doc,
      image: p.image.toString("base64"),
    }));

    res.json(updatedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/order', isLoggedIn, async (req, res) => {

    const { productId, quantity } = req.body;

    try {
        const user = await userModel.findById(req.user.userid);
        if (!user) return res.status(400).json({ message: "User not found" });
        const newOrder = { productId, quantity, status: "Pending" };
        user.orders.push(newOrder);
        await user.save();
        const newOrderr = await orderModel.create({ productId, quantity, status: "Pending",userId: req.user.userid});
        res.status(200).json({ message: "Order placed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/api/myorders', isLoggedIn, async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user.userid })  // fetch orders for logged-in user
      .populate("productId", "name price"); // also get product info

    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//admin side myorders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("productId", "name price")
      .populate("userId", "username email"); // show who placed the order

    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status (Admin only)
  app.put('/api/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body; // "Accepted" or "Rejected"

      const order = await orderModel.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate("productId", "name price")
      .populate("userId", "name email");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

//delete product(Admin only)
app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update product
app.put("/products/:id", async (req, res) => {
  try {
    const { name, price } = req.body;
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { name, price },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    console.error("Product Update Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});







app.get('/api/checkauth', isLoggedIn, (req, res) => {
    res.status(200).json({ message: 'User authenticated', user: req.user });
});

app.post('/api/adminlogin', async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email , isadmin:true});
        if (!user) return res.status(400).json({ message: "Email or password is incorrect" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

        const token = jwt.sign({ email: user.email, userid: user._id }, "jpjpjp");

        // Set cookie correctly
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        res.status(200).json({ message: "Login Successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
 
});

app.get("/api/admin/dashboard", isLoggedIn, (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard" });
});

app.get("/api/admin/checkauth", isLoggedIn, (req, res) => {
  res.json({ authenticated: true });
});





function isLoggedIn(req, res, next) {
    if(req.cookies.token==="") res.send("You must be logged in");
    else{
        let data = jwt.verify(req.cookies.token, "jpjpjp");
        req.user = data;
    }
    next();
}


app.listen(5000);