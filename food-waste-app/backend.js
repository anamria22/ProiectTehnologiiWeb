const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
//const { sequelize, User, FridgeItem, Friend, ShareList } = require("./src/models");
//pt sequelize

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database("BazaDeDate.db");

// cream tabelele daca nu exista
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    phoneNumber TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS fridgeItems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idUser INTEGER NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  about TEXT NOT NULL,
  shareable BOOLEAN DEFAULT false,
  FOREIGN KEY (idUser) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  idUser INTEGER NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (idUser) REFERENCES users(id)
  )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS shareList (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idUser INTEGER NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    about TEXT NOT NULL,
    shareable BOOLEAN DEFAULT true,
    FOREIGN KEY (idUser) REFERENCES users(id)
    )
`);

app.post("/register", (req, res) => {
  const { username, password, phoneNumber } = req.body;

  //validari
  if (!username || !password || !phoneNumber) {
    return res.status(400).json({ error: "All fields must be filled out" });
  } else {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Registration failed" });
      }

      if (row) {
        return res.status(400).json({ error: "Username already exists" });
      }

      db.run(
        "INSERT INTO users (username, password, phoneNumber) VALUES (?, ?, ?)",
        [username, password, phoneNumber],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Registration failed" });
          }

          res.json({ message: "Registration successful" });
        }
      );
    });
  }
});

//ORM 
// app.post("/register", async (req, res) => {
//   const { username, password, phoneNumber } = req.body;

//   if (!username || !password || !phoneNumber) {
//     return res.status(400).json({ error: "All fields must be filled out" });
//   }

//   try {
//     const existingUser = await User.findOne({ where: { username } });

//     if (existingUser) {
//       return res.status(400).json({ error: "Username already exists" });
//     }

//     const newUser = await User.create({ username, password, phoneNumber });
//     res.json({ message: "Registration successful" });
//   } catch (err) {
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

let idLoggedUser;
const currentDate = new Date().toISOString().split("T")[0];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      if (row) {
        idLoggedUser = row.id;
        res.json({ message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid username or password" });
      }
    }
  );
});

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { username, password } });

//     if (user) {
//       idLoggedUser = user.id;
//       res.json({ message: "Login successful" });
//     } else {
//       res.status(401).json({ error: "Invalid username or password" });
//     }
//   } catch (err) {
//     res.status(500).json({ error: "Login failed" });
//   }
// });

app.get("/getFridgeItems", (req, res) => {
  db.all(
    "SELECT * FROM fridgeItems WHERE idUser = ?",
    [idLoggedUser],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to get list of items" });
      } else {
        if (rows.length > 0) {
          const fridgeItemsList = rows.map((row) => {
            return {
              id: row.id,
              idUser: row.idUser,
              category: row.category,
              name: row.name,
              date: row.date,
              about: row.about,
              shareable: row.shareable,
            };
          });

          res.json({
            message: "Login successful",
            fridgeItems: fridgeItemsList,
          });
        } else {
          res.json({
            message: "Login successful",
            fridgeItems: [],
          });
        }
      }
    }
  );
});

// app.get("/getFridgeItems", async (req, res) => {
//   try {
//     const fridgeItems = await FridgeItem.findAll({ where: { idUser: idLoggedUser } });
//     res.json({ message: "Login successful", fridgeItems });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to get list of items" });
//   }
// });

app.get("/getExpiringItems", (req, res) => {
  db.all(
    "SELECT * FROM fridgeItems WHERE idUser = ? AND date <= date(?, '+7 days')",
    [idLoggedUser, currentDate],
    (err, rows) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to get list of expiring items" });
      } else {
        if (rows.length > 0) {
          const expiringItems = rows.map((row) => {
            return {
              id: row.id,
              idUser: row.idUser,
              category: row.category,
              name: row.name,
              date: row.date,
              about: row.about,
              shareable: row.shareable,
            };
          });
          res.json({
            message: "Got list of expiring items",
            expiringItemsList: expiringItems,
          });
        } else {
          res.json({
            message: "Got list of expiring items",
            expiringItemsList: [],
          });
        }
      }
    }
  );
});

app.get("/getFriends", (req, res) => {
  db.all(
    "SELECT * FROM friends WHERE idUser = ?",
    [idLoggedUser],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to get list of friends" });
      } else {
        if (rows.length > 0) {
          const friendsList = rows.map((row) => {
            return {
              id: row.id,
              name: row.name,
              idUser: row.idUser,
              tag: row.tag,
            };
          });

          res.json({
            message: "Login successful",
            friends: friendsList,
          });
        } else {
          res.json({
            message: "Login successful",
            friends: [],
          });
        }
      }
    }
  );
});

// app.get("/getFriends", async (req, res) => {
//   try {
//     const friends = await Friend.findAll({ where: { idUser: idLoggedUser } });
//     res.json({ message: "Login successful", friends });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to get list of friends" });
//   }
// });

app.post("/addFridgeItems", (req, res) => {
  const { option, name, date, about } = req.body;

  db.run(
    "INSERT INTO fridgeItems (idUser, category, name, date, about) VALUES (?, ?, ?, ?, ?)",
    [idLoggedUser, option, name, date, about],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to add item" });
      }
      const newItem = {
        idUser: idLoggedUser,
        category: option,
        name: name,
        date: date,
        about: about,
        shareable: false,
      };
      res.json({ message: "Added item succesfully", item: newItem });
    }
  );
});

// app.post("/addFridgeItems", async (req, res) => {
//   const { option, name, date, about } = req.body;

//   try {
//     const newItem = await FridgeItem.create({
//       idUser: idLoggedUser,
//       category: option,
//       name,
//       date,
//       about
//     });

//     res.json({ message: "Added item successfully", item: newItem });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add item" });
//   }
// });


app.post("/addFriend", (req, res) => {
  const { name, category } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [name], (err1, row1) => {
    if (err1) {
      return res.status(500).json({ error: "Failed to get list of items" });
    } else {
      if (row1) {
        db.get(
          "SELECT * FROM friends WHERE name = ? AND idUser = ?",
          [name, idLoggedUser],
          (err2, row2) => {
            if (err2) {
              console.error(err2.message);
              return res
                .status(500)
                .json({ error: "Failed to get list of items" });
            } else {
              if (!row2) {
                db.run(
                  "INSERT INTO friends (idUser, name, tag) VALUES (?, ?, ?)",
                  [idLoggedUser, name, category],
                  (err3) => {
                    if (err3) {
                      console.error(err3.message);

                      return res
                        .status(500)
                        .json({ error: "Failed to add friend" });
                    }
                    const newFriend = {
                      name: name,
                      idUser: idLoggedUser,
                      tag: category,
                    };
                    res.json({
                      message: "Added friend succesfully",
                      friend: newFriend,
                    });
                  }
                );
              } else {
                console.error("Prietenul exista deja in tabela!");
              }
            }
          }
        );
      } else {
        console.error("Utilizatorul nu exista!");
      }
    }
  });
});

// app.post("/addFriend", async (req, res) => {
//   const { name, category } = req.body;

//   try {
//     const user = await User.findOne({ where: { username: name } });

//     if (user) {
//       const existingFriend = await Friend.findOne({
//         where: { name, idUser: idLoggedUser }
//       });

//       if (!existingFriend) {
//         const newFriend = await Friend.create({
//           idUser: idLoggedUser,
//           name,
//           tag: category
//         });

//         res.json({ message: "Added friend successfully", friend: newFriend });
//       } else {
//         res.status(400).json({ error: "Friend already exists" });
//       }
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add friend" });
//   }
// });


app.get("/getShareItems", (req, res) => {
  db.all(
    "SELECT * FROM shareList WHERE idUser = ?",
    [idLoggedUser],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to get list of items" });
      } else {
        if (rows.length > 0) {
          const shareItemsList = rows.map((row) => {
            return {
              id: row.id,
              idUser: row.idUser,
              category: row.category,
              name: row.name,
              date: row.date,
              about: row.about,
              shareable: row.shareable,
            };
          });

          res.json({
            message: "Login successful",
            shareItems: shareItemsList,
          });
        } else {
          res.json({
            message: "Login successful",
            shareItems: [],
          });
        }
      }
    }
  );
});

// app.get("/getShareItems", async (req, res) => {
//   try {
//     const idLoggedUser = req.query.idUser; 
//     const shareItems = await ShareList.findAll({
//       where: {
//         idUser: idLoggedUser, 
//       },
//     });

//     if (shareItems.length > 0) {
//       res.json({
//         message: "Got list of shareable items",
//         shareItems: shareItems,
//       });
//     } else {
//       res.json({
//         message: "No shareable items found",
//         shareItems: [],
//       });
//     }
//   } catch (err) {
//     console.error("Failed to get list of shareable items:", err);
//     res.status(500).json({ error: "Failed to get list of shareable items" });
//   }
// });

app.get("/getSharedList", (req, res) => {
  const friendId = req.query.friendId;

  console.log("Received request to get shared list. ", req.body);

  db.get("SELECT * FROM friends WHERE id = ?", [friendId], (err1, row1) => {
    if (err1) {
      return res
        .status(500)
        .json({ error: "Failed to get friend from friends" });
    } else {
      if (row1) {
        const friendName = row1.name;
        db.get(
          "SELECT * FROM users WHERE username = ?",
          [friendName],
          (err2, row2) => {
            if (err2) {
              console.error(err2.message);
              return res
                .status(500)
                .json({ error: "Failed to get friend from users" });
            } else {
              if (row2) {
                const friendUserId = row2.id;
                db.all(
                  "SELECT * FROM shareList WHERE idUser = ? AND shareable = ?",
                  [friendUserId, true],
                  (err3, rows) => {
                    if (err3) {
                      return res
                        .status(500)
                        .json({ error: "Failed to get friend's shared list" });
                    } else {
                      if (rows.length > 0) {
                        const sharedItemsList = rows.map((row) => {
                          return {
                            id: row.id,
                            idUser: row.idUser,
                            category: row.category,
                            name: row.name,
                            date: row.date,
                            about: row.about,
                            shareable: row.shareable,
                          };
                        });

                        res.json({
                          message: "Retrieved friend's shared list",
                          sharedItems: sharedItemsList,
                        });
                      } else {
                        res.json({
                          message: "Retrieved friend's shared list",
                          sharedItems: [],
                        });
                      }
                    }
                  }
                );
              } else {
                console.error("Error getting friend's shared list");
              }
            }
          }
        );
      } else {
        console.error("No friend with that id");
      }
    }
  });
});

// app.get("/getSharedList", async (req, res) => {
//   const { friendId } = req.query;

//   console.log("Received request to get shared list. ", req.query);

//   try {
//     const friend = await Friend.findByPk(friendId);

//     if (!friend) {
//       return res.status(404).json({ error: "Friend not found" });
//     }

//     const friendUser = await User.findOne({ where: { username: friend.name } });

//     if (!friendUser) {
//       return res.status(404).json({ error: "Friend's user not found" });
//     }

//     const sharedItems = await ShareItem.findAll({
//       where: {
//         idUser: friendUser.id,
//         shareable: true,
//       },
//     });

//     if (sharedItems.length > 0) {
//       const sharedItemsList = sharedItems.map((item) => ({
//         id: item.id,
//         idUser: item.idUser,
//         category: item.category,
//         name: item.name,
//         date: item.date,
//         about: item.about,
//         shareable: item.shareable,
//       }));

//       res.json({
//         message: "Retrieved friend's shared list",
//         sharedItems: sharedItemsList,
//       });
//     } else {
//       res.json({
//         message: "Retrieved friend's shared list",
//         sharedItems: [],
//       });
//     }
//   } catch (err) {
//     console.error("Error retrieving shared list:", err.message);
//     res.status(500).json({ error: "Failed to get friend's shared list" });
//   }
// });

app.post("/addShareItems", (req, res) => {
  const { category, name, date, about, shareable } = req.body;

  console.log("Received request to add shareable item:", req.body);

  //cel mai probail aici se pierde category-ul
  db.run(
    "INSERT INTO shareList (idUser, category, name, date, about, shareable) VALUES (?, ?, ?, ?, ?, ?)",
    [idLoggedUser, category, name, date, about, shareable],
    (err) => {
      if (err) {
        console.error("Failed to add item to shareList:", err.message);
        return res.status(500).json({ error: "Failed to add item" });
      }

      const newItem = {
        idUser: idLoggedUser,
        category: category,
        name: name,
        date: date,
        about: about,
        shareable: shareable,
      };
      console.log("Added item to shareList successfully");
      res.json({ message: "Added item successfully", item: newItem });
    }
  );
});

// app.post("/addShareItems", async (req, res) => {
//   const { category, name, date, about, shareable } = req.body;
//   const idLoggedUser = req.body.idUser; // Asigură-te că id-ul utilizatorului este transmis în body

//   console.log("Received request to add shareable item:", req.body);

//   try {
//     const newItem = await ShareList.create({
//       idUser: idLoggedUser,
//       category: category,
//       name: name,
//       date: date,
//       about: about,
//       shareable: shareable,
//     });

//     console.log("Added item to shareList successfully");

//     res.json({
//       message: "Added item successfully",
//       item: {
//         id: newItem.id,
//         idUser: newItem.idUser,
//         category: newItem.category,
//         name: newItem.name,
//         date: newItem.date,
//         about: newItem.about,
//         shareable: newItem.shareable,
//       },
//     });
//   } catch (err) {
//     console.error("Failed to add item to shareList:", err.message);
//     res.status(500).json({ error: "Failed to add item" });
//   }
// });

app.get("/getUserData", (req, res) => {
  const friendId = req.query.friendId;
  db.get("SELECT * FROM users WHERE id = ?", [friendId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to get list of items" });
    } else {
      if (row) {
        const userData = {
          id: row.id,
          username: row.username,
          password: row.password,
          phoneNumber: row.phoneNumber,
        };

        res.json({
          message: "User data is here",
          userData: userData,
        });
      } else {
        res.json({
          message: "User data is here",
          userData: [],
        });
      }
    }
  });
});

app.delete("/deleteSharedItem/:itemId", (req, res) => {
  const itemId = req.params.itemId;

  db.run("DELETE FROM shareList WHERE id = ?", [itemId], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to delete shared item" });
    }
    res.json({ message: "Shared item deleted successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
