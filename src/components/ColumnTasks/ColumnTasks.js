import React from "react";
import Task from "./../Task/Task";
import EditTask from "../EditTask/EditTask";
import './columnTasks.css'

const ColumnTasks = ({
  editingTaskId,
  editedTitle,
  editedDescription,
  editedEta,
  column,
  filterString,
  tasks,
  onDragOverTask,
  onDragStart,
  onDrop,
  editTask,
  deleteTask,
  saveTask,
  setEditingTaskId,
  setEditedTitle,
  setEditedDescription,
  setEditedEta
}) => {
  return (
    <div
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <h2>{column.name}</h2>
      {tasks
        .filter((task) => {
          return (
            filterString?.length === 0 ||
            task.title?.toLowerCase().includes(filterString?.toLowerCase()) ||
            task.description?.toLowerCase().includes(filterString?.toLowerCase())
          );
        })
        .map((task) => (
          <div key={task.id}>
            {editingTaskId === task.id ? (
              <EditTask
                editedTitle={editedTitle}
                editedDescription={editedDescription}
                editedEta={editedEta}
                saveTask={saveTask}
                setEditingTaskId={setEditingTaskId}
                setEditedTitle={setEditedTitle}
                setEditedDescription={setEditedDescription}
                setEditedEta={setEditedEta}
              />
            ) : (
              <Task
                task={task}
                onDragStart={onDragStart}
                onDragOverTask={onDragOverTask} // Reordering logic
                editTask={editTask}
                deleteTask={deleteTask}
                saveTask={saveTask}
                draggable={task.id !== 'backlog'}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default ColumnTasks;
