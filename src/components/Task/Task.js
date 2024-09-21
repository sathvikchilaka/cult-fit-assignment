import React from "react";
import { BiEdit, BiTrash, BiTimeFive } from "react-icons/bi";
import './task.css'

const Task = ({
  task,
  draggable,
  onDragStart,
  onDragOverTask,
  editTask,
  deleteTask,
  saveTask,
}) => {

  const calculateDaysLeft = (eta) => {
    const [day, month, year] = eta.split("-").map(Number);
    const etaDate = new Date(year, month - 1, day);
    const today = new Date();
    const timeDiff = etaDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return daysLeft;
  };

  const daysLeft = calculateDaysLeft(task.eta);  

  const getTaskClassName = (status) => {
    switch (status) {
      case "todo":
        return "task-card todo";
      case "in-progress":
        return "task-card in-progress";
      case "done":
        return "task-card done";
      case "backlog":
        return "task-card backlog";
      default:
        return "task-card";
    }
  };  

  return (
    <div
      className={getTaskClassName(task.status)}
      style={{ cursor: task.status!=='backlog'? 'grab':'default' }}
      draggable={draggable}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={(e) => onDragOverTask(e, task.id)} // Reordering logic
    >
      <div className="task-header-container">
        <h3 className="task-title-text">{task.title}</h3>
        <span className="leftover-time-task">
          <BiTimeFive />
          {
            daysLeft>=0?(
              <>
                {daysLeft} Days Left
              </>
            ) : (
              <>
                {-1*daysLeft} Days Overdue
              </>
            )

          }
        </span>
      </div>
      <div className="task-body-container">
        <p className="task-description-text">{task.description}</p>

        <div className="task-body-icons">
          <BiEdit className="task-icon" onClick={() => editTask(task.id)} />
          <BiTrash className="task-icon" onClick={() => deleteTask(task.id)} />
        </div>
      </div>
    </div>
  );
};

export default Task;
