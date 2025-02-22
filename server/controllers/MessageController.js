import { renameSync } from "fs";

import { getPrismaInstance } from "../utils/PrismaClient.js";
import { connect } from "http2";
import { type } from "os";
import { HfInference } from "@huggingface/inference";



export const addMessage = async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;
    console.log("Received data:", { message, from, to });

    if (!message || !from || !to) {
      return res
        .status(400)
        .json({ error: "From, to, and message are required" });
    }

    const senderId = parseInt(from, 10);
    const receiverId = parseInt(to, 10);

    const getUser = global.onlineUsers ? global.onlineUsers.get(to) : null;
    const messageStatus = getUser ? "delivered" : "sent";

    // ✅ FIXED: Ensure "messages" is lowercase and "receiver" is spelled correctly
    const newMessage = await prisma.messages.create({
      data: {
        message,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
        messageStatus,
      },
      include: { sender: true, receiver: true },
    });

    console.log("Message stored:", newMessage);
    return res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error("Error in addMessage:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;

    // Ensure 'from' and 'to' are valid integers
    if (!from || !to) {
      return res.status(400).json({ error: "'from' and 'to' are required" });
    }

    const fromId = parseInt(from, 10);
    const toId = parseInt(to, 10);

    if (isNaN(fromId) || isNaN(toId)) {
      return res
        .status(400)
        .json({ error: "'from' and 'to' must be valid integers" });
    }

    // Fetch the messages where the sender and receiver match either way
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { senderId: fromId, receiverId: toId },
          { senderId: toId, receiverId: fromId },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });

    // Mark unread messages as 'read'
    const unreadMessages = [];
    // console.log(unreadMessages,"..............................")
    messages.forEach((message, index) => {
      if (message.messageStatus !== "read" && message.receiverId === toId) {
        messages[index].messageStatus = "read";
        unreadMessages.push(message.id);
      }
    });

    if (unreadMessages.length > 0) {
      await prisma.messages.updateMany({
        where: {
          id: { in: unreadMessages },
        },
        data: {
          messageStatus: "read",
        },
      });
    }

    // Return the fetched messages
    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Error in getMessages:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const data = Date.now();

    const fileName = `uploads/images/${data}-${req.file.originalname}`; // ✅ Fixed file name
    renameSync(req.file.path, fileName);

    const prisma = getPrismaInstance();
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: "From and to are required" });
    }

    const message = await prisma.messages.create({
      data: {
        message: fileName,
        sender: { connect: { id: parseInt(from, 10) } },
        receiver: { connect: { id: parseInt(to, 10) } },
        type: "image",
      },
    });

    return res.status(201).json({ message });
  } catch (err) {
    next(err);
    console.error("Error in addImageMessage:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
};
   
export const addAudioMessage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const timestamp = Date.now();
    const fileName = `uploads/recordings/${timestamp}-${req.file.originalname}`;
    renameSync(req.file.path, fileName);

    const prisma = getPrismaInstance();
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: "From and To fields are required" });
    }

    const message = await prisma.messages.create({
      data: {
        message: fileName,
        sender: { connect: { id: parseInt(from, 10) } },
        receiver: { connect: { id: parseInt(to, 10) } },
        type: "audio",
      },
    });

    return res.status(201).json({ message });
  } catch (err) {
    console.error("Error in addAudioMessage:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
};

export const getInitialContactsWithMessages = async (req, res) => {
  try {
    const userId = parseInt(req.params.from, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const prisma = getPrismaInstance();

    const messages = await prisma.messages.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        message: true,
        messageStatus: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            about: true,
          },
        }, // Fetch profilePicture
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            about: true,
          },
        }, // Fetch profilePicture
      },
    });

    if (!messages.length) {
      return res.status(200).json({ users: [], onlineUsers: [] });
    }

    const users = new Map();
    const messageStatusChange = [];

    messages.forEach((message) => {
      const contactId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const contact =
        message.senderId === userId ? message.receiver : message.sender;

      if (message.messageStatus === "sent" && message.receiverId === userId) {
        messageStatusChange.push(message.id);
      }

      if (!users.has(contactId)) {
        users.set(contactId, {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          profilePicture: contact.profilePicture,
          // isOnline: contact.isOnline,
          type: message.type,
          about: contact.about,
          lastMessage: message.message,
          messageStatus: message.messageStatus,
          createdAt: message.createdAt,
          senderId: message.senderId,
          receiverId: message.receiverId,
          totalUnreadMessages: message.messageStatus !== "read" ? 1 : 0,
        });
      } else if (message.messageStatus !== "read") {
        const existingUser = users.get(contactId);
        existingUser.totalUnreadMessages += 1;
        users.set(contactId, existingUser);
      }
    });

    if (messageStatusChange.length) {
      await prisma.messages.updateMany({
        where: { id: { in: messageStatusChange } },
        data: { messageStatus: "delivered" },
      });
    }

    return res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: global.onlineUsers
        ? Array.from(global.onlineUsers.keys())
        : [],
    });
  } catch (error) {
    console.error("Error in getInitialContactsWithMessages:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: "From and to are required" });
    }

    await prisma.messages.updateMany({
      where: {
        senderId: parseInt(from, 10),
        receiverId: parseInt(to, 10),
        messageStatus: {
          in: ["sent", "delivered"],
        },
      },
      data: {
        messageStatus: "read",
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error in markMessagesAsRead:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const textGenratedMessageGpt = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt?.trim()) {
      return res.status(400).json({ 
        error: "Failed to generate text",
        details: "Prompt is required" 
      });
    }

    // Validate API key
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.error("HUGGINGFACE_API_KEY not found in environment variables");
      return res.status(500).json({ 
        error: "Failed to generate text",
        details: "API configuration error" 
      });
    }

    // Create a new instance for each request to ensure fresh authentication
    const hf = new HfInference(apiKey);

    // Validate API key by checking access (optional)
    // try {
    //   await hf.getAccessToken();
    // } catch (error) {
    //   return res.status(401).json({
    //     error: "Failed to generate text",
    //     details: "Invalid API key or insufficient permissions"
    //   });
    // }

    const response = await hf.textGeneration({
      model: "gpt2",
      inputs: prompt,
      parameters: {
        max_length: 100,
        temperature: 0.7,
        // Add any other parameters as needed
      }
    });

    if (!response?.generated_text) {
      return res.status(500).json({ 
        error: "Failed to generate text",
        details: "No response from AI service" 
      });
    }

    return res.json({ text: response.generated_text });
  } catch (error) {
    console.error("Text generation error:", error);
    
    // More specific error handling
    if (error.name === "AuthError") {
      return res.status(401).json({
        error: "Failed to generate text",
        details: "Authentication failed. Please check your API key."
      });
    }
    
    return res.status(500).json({ 
      error: "Failed to generate text",
      details: error.message || "Internal server error"
    });
  }
};


export const imageGenratedMessageGpt = async (req, res) => {
  try {
    const { prompt } = req.body;
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-2',
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry, bad quality, weird colors',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }
    });

    // Convert blob to base64
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
};