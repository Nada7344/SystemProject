const express =require ("express");
const app=express();
const User = require('./models/Users');
const Cart=require('./models/Cart');
const mongoose=require("mongoose");
const bodyP =require("body-parser")
const bcrypt=require("bcryptjs");
const multer=require("multer");
const path=require("path");

const {body ,validationResult}=require("express-validator");
app.use(express.json());

mongoose
.connect('mongodb://127.0.0.1:27017/ourstor')
.then(() => {console.log('connected to MongoDB')})  
.catch((error) => {console.log('faild connect to mongodb'+error)})

app.get("/user",async (req, res) => {
try{
    const user= await User.find({});
    res.status(200).json(user);
}catch(error){
res.status(400).jason({message: error.message})
}

});



app.post('/signUp',  [body("username","username required and  must have min 4 characterand max 30 character ").isLength({min:4,max:30}).notEmpty(),
body('password','password required must be min 8 character').isLength({min:8}).notEmpty(),
body('phoneNumber','wrong phone namber').isLength({min:11,max:11}).notEmpty(),
body('email','wrong email').isEmail().notEmpty()],async (req, res,next) => {
       
  
try{
    //get user object from body 
    let userParam = req.body;
    // validate       
     
          
     
    const error=validationResult(req);
      
    if (!error.isEmpty()) {  
         res.status(400).json( {error : error.array()});
      }
    // const isValid = validator.validate(userParam.email);
            
     
    // if( !isValid){    
    //     res.status(400).json({ message: 'wrong email' });
    // }
        
    if (await User.findOne({ email: userParam.email })) {
        res.status(400).send( 'email "' + userParam.email + '" is already exist');
    }
    if (await User.findOne({ phoneNumber: userParam.phoneNumber })) {
        res.status(400).send( 'phone "' + userParam.phoneNumber + '" is already exist');
    }
    
  
        
    const salt=await bcrypt.genSalt(10);
    req.body.password=await bcrypt.hash(req.body.password,salt)

    const user = new User(userParam);  
   
    // save user
     const result= await user.save(); 

     res.status(201).send(result)

}catch(err)
{
    res.status(400).send('server error: '+ err);
}

});



app.post('/login',  async (req, res) => {


    try{
        //get user object from body 
        let userParam = req.body;
        // validate
          
      let user = await User.findOne({email: userParam.email});


        if (!user) {
            res.status(400).send( 'wrong email or password');
        }


const passwordMatch= await bcrypt.compare(userParam.password,user.password)
        
        // const salt=await bcrypt.genSalt(10);
        // req.body.password=await bcrypt.hash(req.body.password,salt)
    
       if(passwordMatch){
        res.status(201).send( ' login successfully!')
       }else{

        res.status(400).send( 'wrong email or password ')
       }
       

    
    }catch(err)
    {
        res.status(400).send('server error: '+ err);
    }


    
    });





    app.put('/update/:email', [body("username","username required and  must have min 4 characterand max 30 character ").isLength({min:4,max:30}).notEmpty(),
    body('password','password required must be min 8 character').isLength({min:8}).notEmpty(),
    body('phoneNumber','wrong phone namber').isLength({min:11,max:11}).notEmpty(),
    body('email','wrong email').isEmail().notEmpty()],async (req, res) => {
        try{   
        
        let userParam = req.body;

          
     
    const error=validationResult(req);
      
    if (!error.isEmpty()) {  
         res.status(400).json( {error : error.array()});
      }

        if(userParam.password){
    const salt=await bcrypt.genSalt(10);
    req.body.password=await bcrypt.hash(req.body.password,salt)
        }
        
        let user = await User.findOneAndUpdate({email :req.params.email},{
            username: userParam.username,
            email:userParam.email,
            password:userParam.password,
            phoneNumber:userParam.phoneNumber

        },{new:true});


if(user){
    res.status(201).json( ' updated successfully!')
}




        }catch(err)
    {
        res.status(400).json('server error: '+ err);
    }

    });






    app.get('/userslist/:email', async (req, res) => {
        //get all users only admin

 try{  

const userAdmin=await User.findOne({email: req.params.email});

if(userAdmin.Admin){
const users=await  User.find().select("-password");
res.status(200).json(users);  
}else{
    res.status(201).json( ' not allowed to you')

}
 
}catch(err)
{
res.status(400).json('server error: '+ err);
}


});





app.get('/user/:email', async (req, res) => {


    try{  

    const user=await User.findOne({email :req.params.email}).select("-password");

    if(user){

        res.status(200).json(user); 
    }else{
        res.status(400).json("user not found");
    }
 
    }catch(err)  
    {
    res.status(400).json('server error: '+ err);
    }

});




app.delete('/deletuser/:email', async (req, res) => { 

   
    try{  

    const user=await User.findOneAndDelete({email :req.params.email})


    if(user){

        res.status(200).json({message: "user deleted successfully! "});
    }else{
       
       
        res.status(400).json({message:"user not found"});
    }
 
    }catch(err)  
    {
    res.status(400).json('server error: '+ err);
    }  

});

const storage=multer.diskStorage({
destination:function(req,file,cb){  
    
    cb(null,path.join(__dirname,"./images"));
},
filename:function(req,file,cb){

    cb(null,file.originalname);

}

});

const uploud=multer({storage});

app.post('/image',uploud.single("image") ,async (req, res) => { 

    res.status(200).json({message: "image uplouded successfully! "});

})   

app.post('/cart/:id', async (req, res) => {

    try {

    const { productId, quantity, name, price } = req.body;

         const userId =req.params;

      let cart = await Cart.findOne({userId});
  
      if (cart) {
      
         cart.products[itemIndex++]= cart.products.push({ productId, quantity, name, price });
          
        cart = await cart.save();
        return res.status(201).send(cart);
    
      } else {
        //no cart for user, create new cart
        const newCart = await Cart.create({
          userId,
          products: [{ productId, quantity, name, price }]
        });
  
        return res.status(201).send(newCart);
      
      }  
    } catch (err) {

      res.status(400).send("Something went wrong"+err);
    }
  });



 
       


app.listen(3000,()=>{console.log(" server runing on port 3000")})

