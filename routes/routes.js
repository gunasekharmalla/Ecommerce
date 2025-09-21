const express = require("express")
const app = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../Schemas/User")
const Prod = require("../Schemas/Product")
const Order = require("../Schemas/Order")
const RoleAuth = require("../middlewares/RoleAuth")
const Auth = require("../middlewares/Auth")


app.post("/register", async (req,res)=>{
try{
    const {name, email, password, role} = req.body;
    if(!name || !email || !password) return res.status(401).json({message: "input fields are required"})
    
    const existmail = await User.findOne({email})
    if(existmail)  return res.status(401).json({message: "mail exist already"})
    
    const hashpwd = await bcrypt.hash(password, 10)

    const newUser = new User({name, email, password: hashpwd, role: role || "user"})
    await newUser.save()
    res.status(201).json({
        message: 'user created successfully',
        user: newUser
    })
}catch(err){
    res.status(500).json({message: err.message})
}
})

app.post("/login", async (req,res)=>{
    try{
    const {email, password} = req.body;
    if (!email || !password)  return res.status(401).json({message: "input fields are required"})

    const existUser = await User.findOne({email})
    if(!existUser)  return res.status(404).json({message: "user not found"})

    const matched = await bcrypt.compare(password, existUser.password)
     if(!matched) return res.json({message: "invalid password"}) 
        
        const token = jwt.sign(
            {id: existUser.id, role: existUser.role, name: existUser.name, email: existUser.email},
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )
        res.json({ message: "login success", token: token })
    } catch(err){ res.json({message: "token error"})
    }
    
})

app.get("/users", Auth, async (req,res)=>{
  try{
    const user = await User.find();
    if(!user) return res.status(404).json({message: "no user found"}) 
    res.json(user)
  }catch(err){
    res.status(404).json({message: err.message})
  }
})

app.get("/users/:id", Auth, async (req,res)=>{
  try{
    const {id} = req.params;
    if(!id) return res.status(400).json({message: "please enter user id "}) 
      const user = await User.findById(id)
    if(!user) res.status(404).json({message: "no user id found"})
    res.json({
  message: "user found", user: user})
  }catch(err){
    res.status(404).json({message: err.message})
  }
})

app.delete("/users/:email",Auth, RoleAuth("admin"), async (req,res)=>{
  try{
  const {email} = req.params;
  if(!email)  return res.status(401).json({message: "input field required"})
  const existmail = User.findOne({email})
   if(!existmail)  return res.status(401).json({message: "user not existed"}) 
  await User.deleteOne(email);
   res.json({message: "user deleted successfull"}) 
  }catch(err){
    res.status(400).json({message: err.message})
  }

})

      // Products  POST-ADMIN, GET-ID AUTH, GET-ALL, DELETE-ID ADMIN

app.post("/product", Auth, RoleAuth("admin"), async (req,res)=>{
    try{
        const {name, description, price, image, category} = req.body;
        if(!name || !description || !price || !image || !category) return res.status(401).json({message: "input fields are required"})
        const newProduct = new Prod({name, description, price, image, category})
        await newProduct.save()
        res.json({ message: "product created successfulyy", product: newProduct })
    }catch(err){
        res.json({message: err.message})
    }
})

app.get("/product/:id", async (req,res)=>{
    try{
    const {id} = req.params;
    const existProduct = await Prod.findById(id)
    if(!existProduct) return res.status(404).json({message: "product not found"})
    res.json({
        name: existProduct.name,
        description: existProduct.description,
        price: existProduct.price,
        image: existProduct.image
        })
    } catch(err){ res.json({message: err.message})}
})

app.delete("/product/:id", Auth, RoleAuth("admin"), (req,res)=>{
  try{
    const {id} = req.params;
    if(!id) return res.status(400).json({message: "please enter product id"}) 
    const product = Prod.findById(id);
    if(!product) return res.status(404).json({message: "product not found"})
    Prod.deleteOne(product)
   res.status(200).json({message: "product deleted "}) 
  }catch(err){
    res.status(500).json({message: err.message})
  }
})

app.get("/products", async (req,res)=>{
 await Prod.find().then((prod)=>{
    res.json(prod)
 }).catch(err=>{
    res.json({message: err.message})
 })
})



                // orders  POST AUTH, USER ORDERS AUTH,  GET-ALL ADMIN, 


app.post("/orders", Auth, async (req, res) => {
  try {
    const { products } = req.body; // [{productId, quantity}]
    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

   
    let totalPrice = 0;
    for (let item of products) {
      const product = await Prod.findById(item.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      totalPrice += product.price * item.quantity;
    }

    const newOrder = new Order({
      userId: req.user.id,
      userEmail: req.user.email,
      products,
      totalPrice,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get logged-in user's orders
app.get("/orders/my", Auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin)
app.get("/orders", Auth, RoleAuth("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("products.productId", "name price");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = app;