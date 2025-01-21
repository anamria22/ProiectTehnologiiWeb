import React, { useState } from "react";
import "./addFoodItem.css";
import axios from "axios";

const AddFoodItem = ({ onAddFoodItem }) => {
  //optiuni - dropdown
  const options = [
    { category: "Vegan" },
    { category: "Bio" },
    { category: "Fast-Food" },
    { category: "Sweets" }
  ];

  //stare - categorie
  const [option, setCategory] = useState("Category");
  const changeOption = (event) => {
    setCategory(event.target.value);
  };

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [about, setAbout] = useState("");

  //click btn adaugare
  const handleAddButtonClick = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/addFridgeItems",
        {
          option,
          name,
          date,
          about,
        }
      );

      //add in lista
      let newItem = response.data.item;
      onAddFoodItem(newItem);
    } catch (error) {
      console.error("Action failed", error.message);
    }
  };

  return (
    <div className="containerFridgeAdd">
      <div className="headerFridgeAdd">
        <div className="textFridgeAdd">Add item in fridge list</div>
        <div className="underLineFridgeAdd"></div>
      </div>
      <div className="inputsFridgeAdd">
        <div className="inputFridgeAdd">
          <select value={option} onChange={changeOption}>
            <option onChange={(e) => changeOption(e.target.value)}>
              Category
            </option>
            {options.map((ctr) => (
              <option value={ctr.category}>{ctr.category}</option>
            ))}
          </select>
        </div>
        <div className="inputFridgeAdd">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="inputFridgeAdd">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="inputFridgeAddAbout">
          <textarea
            placeholder="About"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>
      </div>
      <div className="submitContainerFridgeAdd">
        <button className="add" onClick={handleAddButtonClick}>
          Add
        </button>
      </div>
    </div>
  );
};

export default AddFoodItem;
