if (!user.isVerified) {

  return res.json({
    message: "Please verify your email first",
  });

}