require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const order = require("./orderschema")
const user = require("./userschema");
const menu = require("./schema");
const cart = require("./cartschema")
const address = require("./addressschema");


const app = express();

// ================= Middleware =================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const allowedOrigins = [
  "http://localhost:5173",
" https://coffeeafrontend.onrender.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ================= Database =================

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Database Connection Error:", err);
  });

// ================= JWT Permission Middleware =================

function permission(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY
    );

    req.user = decoded;
console.log("Decoded:", decoded);

    next();
  } 
catch (e) {
  console.log(e.name);

  if (e.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token Expired",
    });
  }

  if (e.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
  return res.status(500).json({
    message: "Authentication failed"
});
}
}
// ================= Home =================

app.get("/", (req, res) => {
  res.send("Welcome! Enter /dataget");
});
// ================= Get Products =================

app.get("/dataget", async (req, res) => {

    try {

        const data = await menu.find();

        res.json(data);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error"
        });

    }

});

// ================= Add Product =================
/*
app.post("/addproduct", async (req, res) => {

    const data = req.body;

    try {

        if (!data.productName) {

            return res.status(400).json({
                message: "Product Name Required"
            });

        }

        if (!data.price) {

            return res.status(400).json({
                message: "Price Required"
            });

        }

        await menu.create(data);

        res.status(201).json({
            message: "Product Added"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
*/
// ================= Add To Cart =================

app.post("/cart", permission, async (req, res) => {

    try {

        const cartdata = {
    ...req.body,
    userId: req.user.id
};

        const cartsave = await cart.create(cartdata);
if(!cartsave){
     res.status(401).json({

            message: "cart not added",


        });
}
else {


        res.status(201).json({

            message: "cart added go to cart page",

            data: cartsave

        });
    }
    } catch (e) {

       
        res.status(500).json({

            message: "Error",

            error: e.message

        });

    }

});
app.post("/cart/merge", permission, async (req, res) => {
  try {

    const localCart = req.body;

    if (!Array.isArray(localCart) || localCart.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    const saveCart = [];

    for (const item of localCart) {

      const cartItem = await cart.create({
        ...item,
        userId: req.user.id,
        totalprice:item.price*item.quantity
      });

      saveCart.push(cartItem);

    }

    res.status(201).json({
      message: "Cart merged successfully",
      data: saveCart
    });

  } catch (e) {
    res.status(500).json({
      message: "Error",
      error: e.message
    });
  }
});



app.get("/cartget", permission, async (req, res) => {
    try {

        const cartsend = await cart.find({
            userId: req.user.id
        });

        const addressData = await address.findOne({
    userId: req.user.id
});

        res.status(200).json({
    cart: cartsend,
    address: addressData
});
    } catch (e) {

        console.log(e);

        res.status(500).json({
            message: "Error",
            error: e.message
        });

    }
});
// ================= Get Cart =================
/*
app.get("/orderpage/:id", permission, async (req, res) => {

    const { id } = req.params;

    const orderData = await cart.findById(id);

    const addressData = await address.findOne({
        userId: req.user.id
    });

    res.status(200).json({
        cart: orderData,
        address: addressData
    });

});
*/
// ================= Update Product Image =================
/*
app.patch("/update/:id", async (req, res) => {

    const id = req.params.id;

    try {

        const result = await menu.updateOne(

            {

                _id: id

            },

            {

                $set: {

                    image: req.body.image

                }

            }

        );

        console.log(result);

        res.status(200).json({

            message: "Image Updated"

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Update Failed"

        });

    }

});
*/
// ================= Signup =================

app.post("/signup", async (req, res) => {

    try {

        const signdata = req.body;
if(Object.keys(signdata).length===0){
    return res.status(404).json({
         message: "Request data is empty"
    })
}
        const checkname = await user.findOne({
            name: signdata.name
        });

        if (checkname) {
            return res.status(400).json({
                message: "Name already exists"
            });
        }

        const checkphone = await user.findOne({
            phonenumber: signdata.phonenumber
        });

        if (checkphone) {
            return res.status(400).json({
                message: "Phone Number already exists"
            });
        }

        const checkemail = await user.findOne({
            email: signdata.email
        });

        if (checkemail) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashpassword = await bcrypt.hash(
            signdata.password,
            10
        );

        signdata.password = hashpassword;

        const sendsign = await user.create(signdata);
        const token = jwt.sign({
            id:sendsign._id,
            email:sendsign.email
        },
        process.env.SECRET_KEY,
        {
            expiresIn:"1d",
        }
        )
    const { password, ...safeUser } = sendsign.toObject();

return res.status(201).json({
message: "Signup Successful",
data: safeUser,
token
});


    } catch (e) {

        console.log(e);

        return res.status(500).json({

            message: "something went wrong please try again",

            error: e.message

        });

    }

});

// ================= Login =================

app.post("/login", async (req, res) => {

    try {

const logindata = req.body;
if(Object.keys(logindata).length===0){
return res.status(400).json({message:"data feild is empty"})
}
        if (!logindata.email) {
            return res.status(400).json({
                message: "Email field is required"
            });
        }

        if (!logindata.password) {
            return res.status(400).json({
                message: "Password field is required"
            });
        }

        const findlogin = await user.findOne({
            email: logindata.email
        });

        if (!findlogin) {
            return res.status(400).json({
                message: "your Email is not matching"
            });
        }

        const checkpassword = await bcrypt.compare(
            logindata.password,
            findlogin.password
        );

        if (!checkpassword) {
            return res.status(400).json({
                message: "Invalid Password"
            });
        }

     const token = jwt.sign(
  {
    id: findlogin._id,
    email: findlogin.email
  },
  process.env.SECRET_KEY,
  {
    expiresIn: "1d"
  }
);

        return res.status(200).json({

            message: "Login Successful",

            token: token

        });

    } catch (e) {

        return res.status(500).json({

            message: "something went wrong ",

            error: e.message

        });

    }

});

// ================= Add Address (Protected) =================
app.post("/address", permission, async (req, res) => {
  try {

    const addressdata = req.body;

    if (!addressdata.name) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    if (!addressdata.phonenumber) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    if (!addressdata.address) {
      return res.status(400).json({
        message: "Address is required"
      });
    }

    if (!addressdata.city) {
      return res.status(400).json({
        message: "City is required"
      });
    }

    if (!addressdata.zipcode) {
      return res.status(400).json({
        message: "Zipcode is required"
      });
    }

    const exist = await address.findOne({
      userId: req.user.id
    });

    if (exist) {

      await address.updateOne(
        {
          userId: req.user.id
        },
        {
          $set: {
            name: addressdata.name,
            phonenumber: addressdata.phonenumber,
            address: addressdata.address,
            city: addressdata.city,
            zipcode: addressdata.zipcode
          }
        }
      );

      return res.status(200).json({
        message: "Address Updated Successfully"
      });

    } else {

      const addresssave = await address.create({
        ...addressdata,
        userId: req.user.id
      });

      return res.status(201).json({
        message: "Address Added Successfully",
        datasave: addresssave
      });

    }

  } catch (e) {

    console.log(e);

    return res.status(500).json({
      message: "something went wrong please try again ",
      error: e.message
    });

  }
});

// ================= Get Address =================
/*
app.get("/addressget", async (req, res) => {

    try {

        const addressres = await address.find();

        res.status(200).json({

            message: "Data fetched successfully",

            store: addressres

        });

    } catch (e) {

        res.status(500).json({

            message: "There is an error",

            error: e.message

        });

    }

});
*/

/*
//=======================[orderpagedata]====================
app.get("/orderpage/:id", permission, async (req, res) => {

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "Id is not there"
        });
    }
const orderData = await cart.findOne({
    _id: id,
    userId: req.user.id
});

    if (!orderData) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

     const addressData = await address.findOne({
        _id:userId,
     })
if (!addressData) {
    return res.status(404).json({
        message: "Address not found"
    });
}

    res.status(200).json({
        message: "Data is sending...",
        cart: orderData,
        address: addressData

    });
});
*/

app.get("/addressget", permission, async (req, res) => {
    try {
        const addressData = await address.findOne({
            userId: req.user.id
        });

        return res.status(200).json({
            message: "Data fetched successfully",
            store: addressData
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

app.get("/orderpage/:id", permission, async (req, res) => {
    try {
        const { id } = req.params;

        const orderData = await cart.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!orderData) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const addressData = await address.findOne({
            userId: req.user.id
        });

        if (!addressData) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        return res.status(200).json({
            message: "Data is sending...",
            cart: orderData,
            address: addressData
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

app.post("/ordersubmit", permission, async (req, res) => {
  try {

    console.log(req.body);

    const orderdata = {
      ...req.body,
      userId: req.user.id
    };

    const submitorder = await order.create(orderdata);

    return res.status(201).json({
      message: "Order placed successfully",
      data: submitorder
    });

  } catch (e) {

    console.log(e); // Terminal me asli error dikhega

    return res.status(500).json({
      message: "Error",
      error: e.message
    });

  }
});

app.get("/myorder", permission, async (req, res) => {

    console.log("MYORDER HIT");

    try {

        const finddetails = await order
        .findOne({ userId: req.user.id })
        .sort({createdAt:-1});


        if (!finddetails) {
            return res.status(404).json({
                message:"Not found"
            });
        }


        res.status(200).json({
            message:"ok",
            orderdata:finddetails
        });


    } catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });
    }

});
// ================= Server =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});
