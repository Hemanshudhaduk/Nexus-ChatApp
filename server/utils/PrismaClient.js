  import { PrismaClient } from "@prisma/client";

  let prismaInstance = null;

  export function getPrismaInstance() {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient();
      console.log("✅ Connected to Prisma Database");

      // Graceful shutdown to avoid memory leaks
      process.on("beforeExit", async () => {
        console.log("⚠️ Closing Prisma connection...");
        await prismaInstance.$disconnect();
      });
    }
    return prismaInstance;
  }
