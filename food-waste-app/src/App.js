import React, { useEffect, useState } from "react";
import "./App.css";
import AddFoodItem from "./addFoodItem/addFoodItem";
import AddFriend from "./addFriend/addFriend";
import axios from "axios";

import { useParams } from "react-router-dom";

function App() {
  //obt username din URL
  const { username } = useParams();

  //stare pt vizibilitate formular
  const [showAddFoodItem, setShowAddFoodItem] = useState(false);
  const handleFridgeButtonClick = () => {
    setShowAddFoodItem(!showAddFoodItem);
  };

  const [showAddFriend, setShowFriend] = useState(false);
  const handleFriendButtonClick = () => {
    setShowFriend(!showAddFriend);
  };

  const handleAddFoodItem = async (newItem) => {
    setFridgeItemsList([...fridgeItems, newItem]);//spread operator
  };

  const handleAddFriend = async (newFriend) => {
    setFriendsList([...friendsList, newFriend]);
  };
  
  //init array 
  const [fridgeItems, setFridgeItemsList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);

  //share pe Facebook
  const handleFacebookShare = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getShareItems");
      const shareableItems = response.data.shareItems;
  
      const shareableItemsText = shareableItems.map(item => `${item.name} - ${item.category} - ${item.date} - ${item.about}`).join('\n');
      const message = `Check out my shareable items:\n${shareableItemsText}`;
    
      const currentUrl = window.location.href;
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(message)}`;

      window.open(shareUrl, '_blank');
    } catch (error) {
      console.error("Failed to fetch shareable items:", error.message);
    }
  };
//incarca alimentele la init aplicatie
  useEffect(() => {
    axios
      .get("http://localhost:5000/getFridgeItems")
      .then((response) => {
        const { fridgeItems: fetchedFridgeItems } = response.data;
        setFridgeItemsList(fetchedFridgeItems);
      })
      .catch((error) => {
        console.error("Error fetching fridge items: ", error.message);
      });
  }, []);

  //incarca lista prieteni
  useEffect(() => {
    axios
      .get("http://localhost:5000/getFriends")
      .then((response) => {
        const { friends: fetchedFriends } = response.data;
        setFriendsList(fetchedFriends);
      })
      .catch((error) => {
        console.error("Error fetching friends list: ", error.message);
      });
  }, []);

  //incarca alimente care urm sa expire
  useEffect(() => {
    axios
      .get("http://localhost:5000/getExpiringItems")
      .then((response) => {
        console.log("updated expiring list");
        const { expiringItemsList: fetchedExpiringItems } = response.data;
        setExpiringItems(fetchedExpiringItems);
      })
      .catch((error) => {
        console.error("Error fetching expiring items: ", error.message);
      });
  }, []);

  //notif alimente expirate
  const [alerted, setAlerted] = useState(false);
  useEffect(() => {
    if (expiringItems.length > 0 && alerted === false) {
      let message = "Items about to expire:\n";
      expiringItems.forEach((item) => {
        console.log(item);
        message += `\nItem ${item.name} expires on ${item.date}.`;
      });
      setAlerted(true);
      alert(message);
    }
  }, [expiringItems]);

  //lista prietenilor si alim lor partajate
  const [visibleLists, setVisibleLists] = useState({});
  const [sharedLists, setSharedLists] = useState({});
  const toggleSharedListVisibility = (friendId) => {
    setVisibleLists((prevVisibleLists) => ({
      ...prevVisibleLists,
      [friendId]: !prevVisibleLists[friendId],
    }));
    axios
      .get("http://localhost:5000/getSharedList", {
        params: {
          friendId: friendId,
        },
      })
      .then((response) => {
        const { sharedItems } = response.data;
        console.log(response.data);
        setSharedLists((prevSharedLists) => ({
          ...prevSharedLists,
          [friendId]: sharedItems,
        }));
        console.log(sharedLists[friendId]);
      })
      .catch((error) => {
        console.error("Error fetching shared list: ", error.message);
      });
  };

  //click pe share la aliment
  const handleShareButtonClick = async (item) => {
    try {
      await axios.post("http://localhost:5000/addShareItems", {
        category: item.category,
        name: item.name,
        date: item.date,
        about: item.about,
        shareable: true,
      });

      console.log("Category before API call:", item.category);
      console.log("Name before API call:", item.name);

      setShareItemsList((prevShareItems) => [
        ...prevShareItems,
        {
          idUser: item.idUser,
          category: item.category,
          name: item.name,
          date: item.date,
          about: item.about,
          shareable: true,
        },
      ]);
    } catch (error) {
      console.error("Action failed", error.message);
    }
  };

  //stocam alimentele partajate
  const [shareItems, setShareItemsList] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:5000/getShareItems")
      .then((response) => {
        const { shareItems: fetchedShareItems } = response.data;
        setShareItemsList(fetchedShareItems);
      })
      .catch((error) => {
        console.error("Error fetching fridge items: ", error.message);
      });
  }, []);

  const shareSpan = document.createElement("span");
  shareSpan.innerHTML = "share";

  //aratam detaliile utilizatorului de la care am fct claim
  const [userData, setUserData] = useState([]);
  const showUserData = (idUser) => {
    axios
      .get("http://localhost:5000/getUserData", {
        params: {
          friendId: idUser,
        },
      })
      .then((response) => {
        const { userData: fetchedUserData } = response.data;
        setUserData(fetchedUserData);

        if (fetchedUserData) {
          console.log("User data:", fetchedUserData);
          const string = `The item has been claimed. Contact the user ${fetchedUserData.username}, their phone number is ${fetchedUserData.phoneNumber}`;
          alert(string);
        } else {
          console.log("User not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data: ", error.message);
      });
  };

  //stergere alim din lista de share
  const deleteSharedItem = (itemId) => {
    axios
      .delete(`http://localhost:5000/deleteSharedItem/${itemId}`)
      .then(() => {
        console.log("Deleted item!");
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="welcome">
          Anti Food Waste App
        </div>
        <div className="username">User: {username}</div>
      </nav>

      <div className="content">
        <div className="Fridge">
          <h2 id="fridge-list-header">Food List</h2>
          <button id="add_item" onClick={handleFridgeButtonClick}>
            Add food item
          </button>
          {showAddFoodItem && <AddFoodItem onAddFoodItem={handleAddFoodItem} />}
          <ul id="Fridge_List">
            {fridgeItems &&
              fridgeItems.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.category} - {item.date} - {item.about}{" "}
                  <span onClick={() => handleShareButtonClick(item)}>
                    share
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="Shareable">
        <button style={{marginLeft: "45%", fontSize:"20px"}} onClick={handleFacebookShare}>Share on Facebook</button>
          <h2 id="sharable-list-header">Available Food</h2>
          <ul id="Sharable_List">
            {shareItems &&
              shareItems.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.category} - {item.date} - {item.about}
                </li>
              ))}
          </ul>
        </div>

        <div className="Friends">
          <h2 id="friends-list-header">Friends</h2>
          <button id="add_item" onClick={handleFriendButtonClick}>
            Add friend
          </button>
          {showAddFriend && <AddFriend onAddFriend={handleAddFriend} />}
          <ul id="Friend_List">
            {friendsList &&
              friendsList.map((friend) => (
                <li
                  key={friend.id}
                  onClick={() => toggleSharedListVisibility(friend.id)}
                >
                  {friend.name} - {friend.tag}
                  {visibleLists[friend.id] && (
                    <ul>
                      {sharedLists[friend.id] &&
                        sharedLists[friend.id].map((item) => (
                          <li key={item.id}>
                            {item.name} - {item.category} - {item.date} -{" "}
                            {item.about}
                            <span
                              onClick={() => {
                                showUserData(item.idUser);
                                deleteSharedItem(item.id);
                              }}
                            >
                              claim
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
