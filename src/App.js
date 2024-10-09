import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import './App.css';

const ItemType = {
  TODO_ITEM: 'TODO_ITEM',
  INPUT_CONTAINER: 'INPUT_CONTAINER'
};

function TodoItem({ task, index, moveTask, toggleCompletion, removeTask }) {
  const ref = React.useRef(null);

  const [, drag] = useDrag({
    type: ItemType.TODO_ITEM,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType.TODO_ITEM,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <li
      ref={ref}
      className={`todo-item ${task.completed ? 'completed' : ''} ${task.removing ? 'removing' : ''} ${task.adding ? 'adding' : ''}`}
    >
      <span>{task.text}</span>
      <div className="task-buttons">
        <button className="check-button" onClick={() => toggleCompletion(index)}>
          ✓
        </button>
        <button className="delete-button" onClick={() => removeTask(index)}>
          ✕
        </button>
      </div>
    </li>
  );
}

function TaskInputContainer({ newTask, setNewTask, addTask }) {
  return (
    <div className="task-input-container">
      <input
        type="text"
        placeholder="Enter a task"
        className="task-input"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button className="add-task-button" onClick={addTask}>Add Task</button>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([
    { text: 'Buy groceries', completed: false, removing: false, adding: false },
    { text: 'Read a book', completed: false, removing: false, adding: false },
    { text: 'Write some code', completed: false, removing: false, adding: false },
  ]);

  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask) {
      const newTaskItem = { text: newTask, completed: false, removing: false, adding: true };
      setTasks([...tasks, newTaskItem]);
      setNewTask('');

      // Reset the adding state after a short delay
      setTimeout(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task, index) =>
            index === prevTasks.length - 1 ? { ...task, adding: false } : task
          )
        );
      }, 300); // Match this duration with your CSS animation duration
    }
  };

  const moveTask = (fromIndex, toIndex) => {
    const updatedTasks = update(tasks, {
      $splice: [
        [fromIndex, 1],
        [toIndex, 0, tasks[fromIndex]],
      ],
    });
    setTasks(updatedTasks);
  };

  const toggleCompletion = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const removeTask = (index) => {
    setTasks(tasks.map((task, i) =>
      i === index ? { ...task, removing: true } : task
    ));

    // Remove the task after the animation duration
    setTimeout(() => {
      setTasks(tasks.filter((_, i) => i !== index));
    }, 300);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <h1>Productivity Manager</h1>
        
        {newTask && <h2>You better get it done!</h2>}
        
        <TaskInputContainer newTask={newTask} setNewTask={setNewTask} addTask={addTask} />

        <ul className="task-list">
          {tasks.map((task, index) => (
            <TodoItem
              key={index}
              index={index}
              task={task}
              moveTask={moveTask}
              toggleCompletion={toggleCompletion}
              removeTask={removeTask}
            />
          ))}
        </ul>
        
        {tasks.length > 0 && (
          <h3>Current Task ➜ {tasks[0].text}</h3>
        )}
      </div>
    </DndProvider>
  );
}

export default App;
