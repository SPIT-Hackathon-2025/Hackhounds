import React, { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, MoreHorizontal, X } from "lucide-react";

const ItemType = {
  CARD: "card",
};

const AddCardForm = ({ listId, onAdd, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const apiKey = "ada9b53617af86d8b7d62a78c55b1480";
      const token = "ATTA48b309436db66da31bd302af8f5f4db4a8a1d7a996faf8c741d0c508bce06585D8E23BEF";

      const response = await axios.post(
        "https://api.trello.com/1/cards",
        null,
        {
          params: {
            name: title,
            desc: description,
            idList: listId,
            key: apiKey,
            token,
          },
        }
      );

      onAdd(response.data);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-md">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter card title..."
        className="w-full mb-3 p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter description..."
        className="w-full mb-3 p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-gray-600 hover:text-gray-800"
        >
          <X size={18} />
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
};

const Card = ({ card }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.CARD,
    item: { id: card.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        bg-gradient-to-br from-white to-gray-50
        rounded-lg p-5 cursor-pointer 
        shadow-lg hover:shadow-xl transition-all duration-200
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : 'opacity-100'}
        border border-blue-100
        transform hover:-translate-y-1
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold text-gray-800">{card.name}</h3>
        <button className="text-blue-400 hover:text-blue-600">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <p className="text-base text-gray-600 line-clamp-3">{card.desc}</p>
      
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {card.labels.map((label, index) => (
            <span
              key={index}
              className="px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700 font-medium"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const List = ({ title, listId, cards, moveCard }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemType.CARD,
    drop: (item) => moveCard(item.id, listId),
  }));

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCard = (newCard) => {
    cards.push(newCard);
    setShowAddForm(false);
  };

  return (
    <div
      ref={drop}
      className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl p-5 min-h-[calc(100vh-8rem)] flex-1 shadow-lg"
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-blue-900">{title}</h2>
          <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
            {cards.length}
          </span>
        </div>
        <button className="text-blue-500 hover:text-blue-700 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className="space-y-4">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
        
        {showAddForm ? (
          <AddCardForm
            listId={listId}
            onAdd={handleAddCard}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-5 w-full py-3 px-4 text-base text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
};

// Rest of the Task component remains the same
const Task = () => {
  const [lists, setLists] = useState({
    todo: [],
    doing: [],
    done: [],
  });

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const apiKey = "ada9b53617af86d8b7d62a78c55b1480";
        const token =
          "ATTA48b309436db66da31bd302af8f5f4db4a8a1d7a996faf8c741d0c508bce06585D8E23BEF";

        const todoListId = "67a6fe3d6a2fcc2f8f0fe368";
        const doingListId = "67a6fe3da1e5f7848b93fdfa";
        const doneListId = "67a6fe3ddc4c055e507c49fc";

        const [todoResponse, doingResponse, doneResponse] = await Promise.all([
          axios.get(`https://api.trello.com/1/lists/${todoListId}/cards`, {
            params: { key: apiKey, token },
          }),
          axios.get(`https://api.trello.com/1/lists/${doingListId}/cards`, {
            params: { key: apiKey, token },
          }),
          axios.get(`https://api.trello.com/1/lists/${doneListId}/cards`, {
            params: { key: apiKey, token },
          }),
        ]);

        setLists({
          todo: todoResponse.data,
          doing: doingResponse.data,
          done: doneResponse.data,
        });
      } catch (error) {
        console.error("Error fetching Trello cards:", error);
      }
    };

    fetchCards();
  }, []);

  const moveCard = async (cardId, targetListId) => {
    try {
      const apiKey = "ada9b53617af86d8b7d62a78c55b1480";
      const token =
        "ATTA48b309436db66da31bd302af8f5f4db4a8a1d7a996faf8c741d0c508bce06585D8E23BEF";

      await axios.put(`https://api.trello.com/1/cards/${cardId}`, null, {
        params: { idList: targetListId, key: apiKey, token },
      });

      setLists((prevLists) => {
        const updatedLists = { ...prevLists };
        let movedCard;

        Object.keys(updatedLists).forEach((key) => {
          updatedLists[key] = updatedLists[key].filter((card) => {
            if (card.id === cardId) {
              movedCard = card;
              return false;
            }
            return true;
          });
        });

        if (movedCard) {
          updatedLists[
            targetListId === "67a6fe3d6a2fcc2f8f0fe368"
              ? "todo"
              : targetListId === "67a6fe3da1e5f7848b93fdfa"
              ? "doing"
              : "done"
          ].push(movedCard);
        }

        return updatedLists;
      });
    } catch (error) {
      console.error("Error moving Trello card:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <nav className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-5 shadow-lg">
          <div className="flex justify-between items-center max-w-[2000px] mx-auto">
            <h1 className="text-2xl font-bold text-white">
              Project Tasks
            </h1>
            <div className="flex items-center gap-5">
              <button className="text-white hover:text-blue-200 transition-colors">
                <Plus size={22} />
              </button>
              <button className="text-white hover:text-blue-200 transition-colors">
                <MoreHorizontal size={22} />
              </button>
            </div>
          </div>
        </nav>
        
        <main className="p-6 max-w-[2000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <List
              title="To Do"
              listId="67a6fe3d6a2fcc2f8f0fe368"
              cards={lists.todo}
              moveCard={moveCard}
            />
            <List
              title="In Progress"
              listId="67a6fe3da1e5f7848b93fdfa"
              cards={lists.doing}
              moveCard={moveCard}
            />
            <List
              title="Completed"
              listId="67a6fe3ddc4c055e507c49fc"
              cards={lists.done}
              moveCard={moveCard}
            />
          </div>
        </main>
      </div>
    </DndProvider>
  );
};

export default Task;