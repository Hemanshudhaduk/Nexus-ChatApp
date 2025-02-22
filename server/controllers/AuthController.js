import { getPrismaInstance } from "../utils/PrismaClient.js";
import { generateToken04 } from "../utils/TokenGenerator.js";

export const checkUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }

    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    return res.json({ status: true, user });
  } catch (err) {
    console.error("🔥 Error in checkUser:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const onBoardUser = async (req, res) => {
  try {
    const { email, name, about, image: profilePicture } = req.body;

    if (!email || !name || !profilePicture) {
      return res.status(400).json({
        status: false,
        message: "Email, Name, and Image are required",
      });
    }

    const prisma = getPrismaInstance();
    const newUser = await prisma.user.create({
      data: { email, name, about, profilePicture },
    });

    return res.json({ status: true, user: newUser });
  } catch (err) {
    console.error("🔥 Error in onBoardUser:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    // Fetch all users ordered by name
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        about: true,
      },
    });

    // Group users by their first letter
    const userGroupedByInitialLetter = users.reduce((acc, user) => {
      const initialLetter = user.name.charAt(0).toUpperCase();
      if (!acc[initialLetter]) {
        acc[initialLetter] = [];
      }
      acc[initialLetter].push(user);
      return acc;
    }, {});

    return res
      .status(200)
      .json({ status: true, users: userGroupedByInitialLetter });
  } catch (err) {
    console.error("🔥 Error in getAllUsers:", err);
    next(err); // Pass error to middleware
  }
};

export const generateToken = async (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverId = process.env.ZEGO_SERVER_ID;
    const userId = req.body.userId;
    console.log(userId,"................d.d")
    const effectiveTime = req.body.effectiveTime || 3600;
    const payload = "";

    if (!userId) {
      return res
        .status(400)
        .json({ status:false, message: "User ID is required" });
    }

    if (appId && serverId && userId) {
      const token = generateToken04(
        appId,
        serverId,
        userId,
        effectiveTime,
        payload
      );
      return res.status(200).json({ status: true, token });
    }
    return res
      .status(400)
      .json({ status: false, message: "Invalid Zego credentials" });
  } catch (err) {
    next(err);
  }
};
