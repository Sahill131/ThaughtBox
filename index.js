const express = require('express')
const app = express()
const usermodel = require("./models/user.js");
const postmodel = require("./models/post.js");
const bcrypt = require('bcrypt');
// const c = require('cookie-parser');
var jwt = require('jsonwebtoken');


app.use(require('cookie-parser')());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.set('view engine', 'ejs')


app.use(express.static('public'))


app.get('/', (req, res) => {
  res.render('index')
})

app.get('/login', (req, res) => {
  res.render('login')
})




app.post('/create', async (req, res) => {
  let { name, email, password, age, username } = req.body;
  let user = await usermodel.findOne({ email });
  if (user) return res.status(500).send("already registred")


  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {

      let user = await usermodel.create({
        name,
        username,
        email,
        password: hash,
        age,
      })

      var token = jwt.sign({ email: email }, 'shhhhh');
      res.cookie("token", token)


      res.redirect("/profile")

    });



  });








})



app.post('/in', async (req, res) => {
  let { email, password } = req.body

  let user = await usermodel.findOne({ email })
  if (!user) return res.status(500).send("something went wrong")



  bcrypt.compare(password, user.password, function (err, result) {




    var token = jwt.sign({ email: email }, 'shhhhh');
    res.cookie("token", token)

    res.redirect("/profile")

  });
})

app.get('/logout', (req, res) => {
  res.cookie("token", "")
  res.redirect("/login")

})


app.get('/profile', islogin, async (req, res) => {
  // let {email}=req.body
  let user = await usermodel.findOne({ email: req.user.email }).populate("posts")
 
  // res.render("profile",{ user })

  res.render("profile", { user })

})





function islogin(req, res, next) {
  if (req.cookies.token === "") res.redirect("/logout")
  else {
    let data = jwt.verify(req.cookies.token, "shhhhh")
    req.user = data;
    next();
  }
}

app.post('/post', islogin, async (req, res) => {

  let user= await usermodel.findOne({email:req.user.email})
  let {content}=req.body
  let posts=await postmodel.create({
    user:user._id,
    content:content

   
  })
  user.posts.push(posts._id);
   await user.save()

   res.redirect("/profile")
  

})









app.listen(3000, () => {
  console.log("Server running on port 3000 😎🔥")
})
