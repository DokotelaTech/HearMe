const User = require("../database/models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// REGISTER USER
exports.register = async (req, res) => {

  try {

    // get data from request body
    const { username, email, password } = req.body;


    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });


    // create verification token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    // verification link
    const verifyLink =
      `http://localhost:5000/api/auth/verify/${token}`;


    // send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,

      subject: "Verify Your Email",

      html: `
        <h2>Email Verification</h2>

        <p>Click below to verify:</p>

        <a href="${verifyLink}">
          Verify Email
        </a>
      `,
    });


    // response
    res.json({
      message:
        "Registration successful. Check your email.",
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};



// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {

    try {
        // decode token
        const decoded = jwt.verify(
            req.params.token,
            process.env.JWT_SECRET
        );

        // update user
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { isVerified: true },
            { new: true }
        );

        // check if user exists
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        console.log(updatedUser);

        // redirect AFTER verification
        res.redirect('/login');

    } catch (error) {

        console.log(error);

        res.status(400).send("Invalid or expired token");

    }
};