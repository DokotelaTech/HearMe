const User =
require("../database/models/users");

// GET CONVERSATIONS

const getConversations =
async (req,res) => {

    try{

        // LATER:
        // FETCH REAL CONVERSATIONS

        return res.status(200).json({

            conversations:[
                {
                    _id:"1",
                    firstName:"John",
                    lastName:"Doe",
                    lastMessage:
                    "Hello doctor"
                }
            ]
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

// GET MESSAGES

const getConversationMessages =
async (req,res) => {

    try{

        const conversationId =
            req.params.id;

        return res.status(200).json({

            messages:[
                {
                    sender:"client",
                    text:"Hello therapist",
                    createdAt:new Date()
                }
            ]
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

// SEND MESSAGE

const sendMessage =
async (req,res) => {

    try{

        const {
            conversationId,
            text
        } = req.body;

        // SAVE TO DATABASE LATER

        return res.status(201).json({
            message:"Message sent"
        });

    }catch(error){

        return res.status(500).json({
            message:error.message
        });
    }
};

module.exports = {

    getConversations,

    getConversationMessages,

    sendMessage
};