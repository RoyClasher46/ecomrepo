const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const userModel = require("./models/user-model");
const productModel = require("./models/product-model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./config/multer-config");
const dotenv =require("dotenv").config({path :"./backend/.env"});
const {GoogleGenerativeAI} =require ("@google/generative-ai");
const cors = require("cors");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true})); 

const orderModel = require("./models/order-model");
app.use(cors({ origin: true, credentials: true }));

// ✅ Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔹 Store chat history (in-memory for now)
let chatHistory = [
  {
    role: "system",
    content:
      "You are a shopping cart negotiation bot. You should ONLY talk about the total cart value. \
      Never mention specific products like sneakers. Respond politely to offers. \
      Encourage the user to make an offer and negotiate discounts on the total cart amount.",
  },
];


// 🔹 Chat endpoint with memory
app.post("/chat", async (req, res) => {
  try {
    if (!req.body || !req.body.message) {
      return res.status(400).json({ reply: "⚠️ No message provided." });
    }

    const { message } = req.body;

    // keep track of chat
    chatHistory.push({ role: "user", content: message });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const historyPrompt = chatHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const result = await model.generateContent(historyPrompt);
    const reply = result.response.text();

    chatHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ reply: "⚠️ Something went wrong." });
  }
});








mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error: ", err));


app.post('/api/login',async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email or password is incorrect" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect" });

        const token = jwt.sign({ email: user.email, userid: user._id }, process.env.JWT_SECRET);

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
            category: p.category || "Self",
            isPopular: p.isPopular || false,
            createdAt: p.createdAt,
            image: p.image.toString("base64"),
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
    const { name,description,price, category, isPopular } = req.body;

    try {
        // Use async/await for create
        const normalizeCategory = (c) => {
          if (!c) return "Self";
          const t = String(c).trim();
          if (t.length === 0) return "Self";
          return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
        };

        const newProduct = await productModel.create({
          name,
          description,
          price,
          category: normalizeCategory(category),
          isPopular: isPopular === "true" || isPopular === true,
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
      category: p.category || "Self",
      isPopular: p.isPopular || false,
      createdAt: p.createdAt,
    }));

    res.json(updatedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || "Self",
      isPopular: product.isPopular || false,
      image: `data:image/jpeg;base64,${product.image.toString("base64")}`,
    });
  } catch (err) {
    console.error("Fetch single product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//reviews send by user
app.post("/api/products/:id/reviews", async (req, res) => {
  try {
    const { user, rating, comment } = req.body;
    const product = await productModel.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const newReview = { user, rating, comment };
    product.reviews.push(newReview);

    await product.save();
    res.json({ message: "Review added successfully", reviews: product.reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// review fetch
app.get("/api/products/:id/reviews", async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




app.post('/api/order', isLoggedIn, async (req, res) => {

    const { productId, quantity } = req.body;

    try {
        const user = await userModel.findById(req.user.userid);
        if (!user) return res.status(400).json({ message: "User not found" });

        
        const newOrder = await orderModel.create({ productId, quantity, status: "Pending",userId: req.user.userid});
        user.orders.push(newOrder);
        await user.save();

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
    const { name, price, description, category, isPopular } = req.body;
    const normalizeCategory = (c) => {
      if (!c) return "Self";
      const t = String(c).trim();
      if (t.length === 0) return "Self";
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    };
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        description,
        category: normalizeCategory(category),
        isPopular: isPopular !== undefined ? isPopular : undefined,
      },
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

// Toggle popular flag
app.put("/products/:id/popular", async (req, res) => {
  try {
    const { isPopular } = req.body;
    const updated = await productModel.findByIdAndUpdate(
      req.params.id,
      { isPopular: !!isPopular },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    console.error("Popular toggle error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//add to cart
app.post("/api/add-to-cart", isLoggedIn, async (req, res) => {
  const userId = req.user.userid;
  const { productId } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();
    res.status(200).json({ message: "Item added to cart" });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//get cart after refresh
app.get("/api/get-cart", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.userid)
      .populate("cart.product");

    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItems = user.cart.map(item => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image.toString("base64"),
      quantity: item.quantity
    }));

    res.status(200).json({ cart: cartItems });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});



//remove cart
app.post("/api/remove-to-cart", isLoggedIn, async (req, res) => {
  const userId = req.user.userid;
  const { productId } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (user.cart[itemIndex].quantity > 1) {
      user.cart[itemIndex].quantity -= 1;
    } else {
      // Remove the item completely
      user.cart.splice(itemIndex, 1);
    }

    await user.save();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//delete cart after order placed
app.post('/api/clear-cart', isLoggedIn, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userid);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        user.cart = [];
        await user.save();

        res.status(200).json({ message: "Cart cleared successfully." });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});



app.get('/api/checkauth', isLoggedIn, (req, res) => {
    res.status(200).json({ message: 'User authenticated', user: req.user });
});

app.post('/api/adminlogin', async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email , isAdmin:true});
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
        let data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        req.user = data;
    }
    next();
}




const path = require("path");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "../client/build", "index.html")
    );
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
