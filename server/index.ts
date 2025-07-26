import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Issuer, Strategy as OpenIDConnectStrategy } from "openid-client";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, sql } from "drizzle-orm";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Import shared schema
import * as schema from "../shared/schema.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_client = neon(process.env.DATABASE_URL);
const db = drizzle(sql_client, { schema });

// Session store setup
const PgSession = ConnectPgSimple(session);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

// Authentication middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Initialize OIDC strategy if in Replit environment
if (process.env.REPL_ID) {
  const issuerUrl = process.env.ISSUER_URL || `https://${process.env.REPL_ID}.${process.env.REPL_SLUG}.repl.co`;
  
  Issuer.discover(issuerUrl)
    .then((issuer) => {
      const client = new issuer.Client({
        client_id: process.env.REPL_ID!,
        client_secret: process.env.CLIENT_SECRET || "secret",
        redirect_uris: [`${issuerUrl}/auth/callback`],
        response_types: ["code"],
      });

      passport.use(
        "oidc",
        new OpenIDConnectStrategy(
          {
            client,
            params: {
              scope: "openid profile email",
            },
          },
          async (tokenSet, userinfo, done) => {
            try {
              let user = await db.query.users.findFirst({
                where: eq(schema.users.email, userinfo.email!),
              });

              if (!user) {
                const [newUser] = await db
                  .insert(schema.users)
                  .values({
                    email: userinfo.email!,
                    username: userinfo.preferred_username || userinfo.email!.split("@")[0],
                  })
                  .returning();

                // Create character for new user
                await db.insert(schema.characters).values({
                  userId: newUser.id,
                  name: `${userinfo.preferred_username || "Hero"}'s Character`,
                  level: 1,
                  xp: 0,
                  strength: 10,
                  endurance: 10,
                  agility: 10,
                  health: 100,
                  maxHealth: 100,
                  coins: 100,
                });

                user = newUser;
              }

              return done(null, user);
            } catch (error) {
              return done(error, null);
            }
          }
        )
      );
    })
    .catch((error) => {
      console.error("Failed to setup OIDC:", error);
    });
}

// Auth routes
app.get("/auth/login", passport.authenticate("oidc"));

app.get(
  "/auth/callback",
  passport.authenticate("oidc", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

// API Routes

// User routes
app.get("/api/user", requireAuth, async (req, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, (req.user as any).id),
      with: {
        character: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Character routes
app.get("/api/character", requireAuth, async (req, res) => {
  try {
    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.userId, (req.user as any).id),
    });

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json(character);
  } catch (error) {
    console.error("Error fetching character:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/character", requireAuth, async (req, res) => {
  try {
    const { name, strength, endurance, agility } = req.body;
    
    const [updatedCharacter] = await db
      .update(schema.characters)
      .set({
        name,
        strength,
        endurance,
        agility,
        updatedAt: new Date(),
      })
      .where(eq(schema.characters.userId, (req.user as any).id))
      .returning();

    res.json(updatedCharacter);
  } catch (error) {
    console.error("Error updating character:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fitness data routes
app.get("/api/fitness", requireAuth, async (req, res) => {
  try {
    const fitnessData = await db.query.fitnessData.findMany({
      where: eq(schema.fitnessData.userId, (req.user as any).id),
      orderBy: desc(schema.fitnessData.date),
      limit: 30,
    });

    res.json(fitnessData);
  } catch (error) {
    console.error("Error fetching fitness data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/fitness", requireAuth, async (req, res) => {
  try {
    const { calories, steps, exerciseMinutes, activityType } = req.body;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if data already exists for today
    const existingData = await db.query.fitnessData.findFirst({
      where: sql`${schema.fitnessData.userId} = ${(req.user as any).id} AND DATE(${schema.fitnessData.date}) = ${today}`,
    });

    let fitnessRecord;
    
    if (existingData) {
      // Update existing record
      [fitnessRecord] = await db
        .update(schema.fitnessData)
        .set({
          calories: calories || existingData.calories,
          steps: steps || existingData.steps,
          exerciseMinutes: exerciseMinutes || existingData.exerciseMinutes,
          activityType: activityType || existingData.activityType,
          updatedAt: new Date(),
        })
        .where(eq(schema.fitnessData.id, existingData.id))
        .returning();
    } else {
      // Create new record
      [fitnessRecord] = await db
        .insert(schema.fitnessData)
        .values({
          userId: (req.user as any).id,
          calories: calories || 0,
          steps: steps || 0,
          exerciseMinutes: exerciseMinutes || 0,
          activityType: activityType || "general",
          date: new Date(),
        })
        .returning();
    }

    // Calculate XP based on activity
    const xpGained = Math.floor((calories || 0) / 10) + Math.floor((steps || 0) / 100) + (exerciseMinutes || 0) * 2;
    
    // Update character XP and potentially level
    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.userId, (req.user as any).id),
    });

    if (character) {
      const newXp = character.xp + xpGained;
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      await db
        .update(schema.characters)
        .set({
          xp: newXp,
          level: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(schema.characters.id, character.id));
    }

    res.json({ ...fitnessRecord, xpGained });
  } catch (error) {
    console.error("Error saving fitness data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Quest routes
app.get("/api/quests", requireAuth, async (req, res) => {
  try {
    const quests = await db.query.quests.findMany({
      where: eq(schema.quests.userId, (req.user as any).id),
      orderBy: desc(schema.quests.createdAt),
    });

    res.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/quests/:id/complete", requireAuth, async (req, res) => {
  try {
    const questId = req.params.id;
    
    const [updatedQuest] = await db
      .update(schema.quests)
      .set({
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(sql`${schema.quests.id} = ${questId} AND ${schema.quests.userId} = ${(req.user as any).id}`)
      .returning();

    if (!updatedQuest) {
      return res.status(404).json({ error: "Quest not found" });
    }

    // Award XP and coins
    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.userId, (req.user as any).id),
    });

    if (character) {
      await db
        .update(schema.characters)
        .set({
          xp: character.xp + updatedQuest.xpReward,
          coins: character.coins + updatedQuest.coinReward,
          updatedAt: new Date(),
        })
        .where(eq(schema.characters.id, character.id));
    }

    res.json(updatedQuest);
  } catch (error) {
    console.error("Error completing quest:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Battle routes
app.get("/api/battles", requireAuth, async (req, res) => {
  try {
    const battles = await db.query.battles.findMany({
      where: eq(schema.battles.userId, (req.user as any).id),
      orderBy: desc(schema.battles.createdAt),
      limit: 10,
    });

    res.json(battles);
  } catch (error) {
    console.error("Error fetching battles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/battles", requireAuth, async (req, res) => {
  try {
    const { enemyType, playerAction } = req.body;
    
    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.userId, (req.user as any).id),
    });

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    // Simple battle calculation
    const playerPower = character.strength + character.agility;
    const enemyPower = Math.floor(Math.random() * 50) + 20;
    const victory = playerPower > enemyPower;
    
    const xpGained = victory ? 50 : 10;
    const coinsGained = victory ? 25 : 5;

    const [battle] = await db
      .insert(schema.battles)
      .values({
        userId: (req.user as any).id,
        enemyType,
        playerAction,
        victory,
        xpGained,
        coinsGained,
      })
      .returning();

    // Update character
    await db
      .update(schema.characters)
      .set({
        xp: character.xp + xpGained,
        coins: character.coins + coinsGained,
        updatedAt: new Date(),
      })
      .where(eq(schema.characters.id, character.id));

    res.json(battle);
  } catch (error) {
    console.error("Error creating battle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Leaderboard routes
app.get("/api/leaderboard", async (req, res) => {
  try {
    const { period = "all" } = req.query;
    
    let whereClause = sql`1=1`;
    
    if (period === "weekly") {
      whereClause = sql`${schema.characters.updatedAt} >= NOW() - INTERVAL '7 days'`;
    } else if (period === "monthly") {
      whereClause = sql`${schema.characters.updatedAt} >= NOW() - INTERVAL '30 days'`;
    }

    const leaderboard = await db
      .select({
        id: schema.characters.id,
        name: schema.characters.name,
        level: schema.characters.level,
        xp: schema.characters.xp,
        username: schema.users.username,
      })
      .from(schema.characters)
      .innerJoin(schema.users, eq(schema.characters.userId, schema.users.id))
      .where(whereClause)
      .orderBy(desc(schema.characters.level), desc(schema.characters.xp))
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Story progress routes
app.get("/api/story", requireAuth, async (req, res) => {
  try {
    const progress = await db.query.storyProgress.findFirst({
      where: eq(schema.storyProgress.userId, (req.user as any).id),
    });

    res.json(progress || { currentChapter: 1, completedChapters: [] });
  } catch (error) {
    console.error("Error fetching story progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/story", requireAuth, async (req, res) => {
  try {
    const { currentChapter, completedChapters } = req.body;
    
    const existingProgress = await db.query.storyProgress.findFirst({
      where: eq(schema.storyProgress.userId, (req.user as any).id),
    });

    let progress;
    
    if (existingProgress) {
      [progress] = await db
        .update(schema.storyProgress)
        .set({
          currentChapter,
          completedChapters,
          updatedAt: new Date(),
        })
        .where(eq(schema.storyProgress.id, existingProgress.id))
        .returning();
    } else {
      [progress] = await db
        .insert(schema.storyProgress)
        .values({
          userId: (req.user as any).id,
          currentChapter,
          completedChapters,
        })
        .returning();
    }

    res.json(progress);
  } catch (error) {
    console.error("Error updating story progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Rewards routes
app.post("/api/rewards/daily", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if daily reward already claimed today
    const existingClaim = await db.query.achievements.findFirst({
      where: sql`${schema.achievements.userId} = ${userId} AND ${schema.achievements.type} = 'daily_reward' AND DATE(${schema.achievements.unlockedAt}) = ${today}`,
    });

    if (existingClaim) {
      return res.status(400).json({ error: "Daily reward already claimed today" });
    }

    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.userId, userId),
    });

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    const xpReward = 100;
    const coinReward = 50;

    // Update character with rewards
    await db
      .update(schema.characters)
      .set({
        xp: character.xp + xpReward,
        coins: character.coins + coinReward,
        updatedAt: new Date(),
      })
      .where(eq(schema.characters.id, character.id));

    // Record the daily reward claim
    await db.insert(schema.achievements).values({
      userId,
      title: "Daily Login",
      description: "Claimed daily login reward",
      type: "daily_reward",
    });

    res.json({ xpReward, coinReward });
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Character upgrade route
app.post("/api/character/upgrade", requireAuth, async (req, res) => {
  try {
    const { strength, endurance, agility } = req.body;
    const userId = (req.user as any).id;
    
    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.userId, userId),
    });

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    const totalUpgrades = (strength || 0) + (endurance || 0) + (agility || 0);
    const upgradeCost = totalUpgrades * 50; // 50 coins per stat point

    if (character.coins < upgradeCost) {
      return res.status(400).json({ error: "Insufficient coins" });
    }

    const [updatedCharacter] = await db
      .update(schema.characters)
      .set({
        strength: character.strength + (strength || 0),
        endurance: character.endurance + (endurance || 0),
        agility: character.agility + (agility || 0),
        coins: character.coins - upgradeCost,
        updatedAt: new Date(),
      })
      .where(eq(schema.characters.id, character.id))
      .returning();

    res.json(updatedCharacter);
  } catch (error) {
    console.error("Error upgrading character:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// WebSocket handling
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");
  
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received:", data);
      
      // Echo back for now
      ws.send(JSON.stringify({ type: "echo", data }));
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../public")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});