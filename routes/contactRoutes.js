import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();


// SEND MESSAGE
router.post("/contact", async (req, res) => {
  console.log("API HIT");

  try {

    const { fullName, email, subject, company, message } = req.body;

    const newMessage = new Contact({
      fullName,
      email,
      subject,
      company,
      message
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message saved successfully"
    });

  } catch (error) {
    console.error("SAVE ERROR:", error); 
    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
});


// FETCH ALL MESSAGES (ADMIN)
router.get("/messages", async (req, res) => {

  try {

    const messages = await Contact.find().sort({ createdAt: -1 });

    res.json(messages);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});

export default router;