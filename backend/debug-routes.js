const express = require('express');
const app = express();

console.log("Testing authRoutes...");
try { app.use('/', require('./routes/authRoutes')); console.log("authRoutes OK"); } catch (e) { console.error("authRoutes FAILED:", e.message); }

console.log("Testing productRoutes...");
try { app.use('/', require('./routes/productRoutes')); console.log("productRoutes OK"); } catch (e) { console.error("productRoutes FAILED:", e.message); }

console.log("Testing orderRoutes...");
try { app.use('/', require('./routes/orderRoutes')); console.log("orderRoutes OK"); } catch (e) { console.error("orderRoutes FAILED:", e.message); }

console.log("Testing cartRoutes...");
try { app.use('/', require('./routes/cartRoutes')); console.log("cartRoutes OK"); } catch (e) { console.error("cartRoutes FAILED:", e.message); }

console.log("Testing adminRoutes...");
try { app.use('/', require('./routes/adminRoutes')); console.log("adminRoutes OK"); } catch (e) { console.error("adminRoutes FAILED:", e.message); }

console.log("Testing chatRoutes...");
try { app.use('/', require('./routes/chatRoutes')); console.log("chatRoutes OK"); } catch (e) { console.error("chatRoutes FAILED:", e.message); }

console.log("DONE");
