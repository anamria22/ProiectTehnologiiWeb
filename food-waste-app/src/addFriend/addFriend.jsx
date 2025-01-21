import React, { useState } from "react";
import "./addFriend.css";
import axios from "axios";

const AddFriend = ({ onAddFriend }) => {
  const [name, setName] = useState("");

  //optiuni dropdown
  const options = [
    { category: "Vegan" },
    { category: "Vegetarian" },
    { category: "Carnivorous" },
  ];

  const [category, setCategory] = useState("Category");
  const changeOption = (event) => {
    setCategory(event.target.value);
  };

  //click add friend
  const handleAddButtonClick = async () => {
    try {
      const response = await axios.post("http://localhost:5000/addFriend", {
        name,
        category,
      });

      let newFriend = response.data.friend;
      onAddFriend(newFriend);
    } catch (error) {
      console.error("Action failed", error.message);
    }
  };

  return (
    <div className="containerFriendAdd">
      <div className="headerFriendAdd">
        <div className="textFriendAdd">Add friend in friend list</div>
        <div className="underLineFriendAdd"></div>
      </div>
      <div className="inputsFriendAdd">
        <div className="inputFriendAdd">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="inputFriendAdd">
          <select value={category} onChange={changeOption}>
            <option onChange={(e) => changeOption(e.target.value)}>
              Category
            </option>
            {options.map((ctr) => (
              <option value={ctr.category}>{ctr.category}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="submitContainerFriendAdd">
        <button className="add" onClick={handleAddButtonClick}>
          Add
        </button>
      </div>
    </div>
  );
};

export default AddFriend;
