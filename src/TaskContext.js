import React, { createContext, useEffect, useState } from "react";
import tasksData from "./tasksData.json";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    // Load tasks from localStorage or use initial data
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : tasksData;
  });

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const columns = [
    { id: "todo", name: "To Do" },
    { id: "in-progress", name: "In Progress" },
    { id: "done", name: "Done" },
    { id: "backlog", name: "Backlogs" },
  ];

  const [inputFilterString, setInputFilterString] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskEta, setNewTaskEta] = useState("");
  const [newTaskState, setNewTaskState] = useState("");

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    eta: "",
    state: "",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedEta, setEditedEta] = useState("");

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [targetTaskId, setTargetTaskId] = useState(null);

  const handleDragStart = (e, taskId) => {
    // console.log("Drag started:", taskId);
    const task = tasks.find((task) => task.id === taskId);
    if (task.status === "backlog") {
      e.preventDefault();
    } else {
      //   console.log("SetDraggedTaskId");
      setDraggedTaskId(taskId);
    }
  };

  const handleDragOverTask = (e, targetTaskId, columnId) => {
    e.preventDefault();

    if (columnId === "backlog") {
      e.dataTransfer.dropEffect = "none";
    } else {
      e.dataTransfer.dropEffect = "move";

      if (targetTaskId) {
        setTargetTaskId(targetTaskId);
      } else {
        const columnTasks = tasks
          .filter((task) => task.status === columnId)
          .sort((a, b) => a.order - b.order);

        const lastTaskInColumn = columnTasks[columnTasks.length - 1];

        setTargetTaskId(lastTaskInColumn?.id || null);
      }
    }
  };

  const handleDrop = (e, newStatus) => {
    const draggedTask = tasks.find((task) => task.id === draggedTaskId);

    if (newStatus === "backlog") {
      e.preventDefault();
      return;
    }

    // Only update if the task is moved to a new column
    if (draggedTask.status !== newStatus) {
      const sourceColumnTasks = tasks.filter(
        (task) => task.status === draggedTask.status
      );
      const targetColumnTasks = tasks.filter(
        (task) => task.status === newStatus
      );

      const updatedTasks = tasks.map((task) => {
        if (task.id === draggedTaskId) {
          const highestOrderInNewStatus = Math.max(
            ...targetColumnTasks.map((t) => t.order),
            -1
          );
          return {
            ...task,
            status: newStatus,
            order: highestOrderInNewStatus + 1,
          };
        }
        return task;
      });

      // Reassign order for the remaining tasks in souource column
      const reorderedSourceTasks = updatedTasks
        .filter((task) => task.status === draggedTask.status)
        .sort((a, b) => a.order - b.order)
        .map((task, index) => ({ ...task, order: index }));

      // Reassign order for tasks in the new column
      const reorderedTargetTasks = updatedTasks
        .filter((task) => task.status === newStatus)
        .sort((a, b) => a.order - b.order)
        .map((task, index) => ({ ...task, order: index }));

      // Merge the reordered tasks back into the task list
      const finalTasks = updatedTasks.map((task) => {
        const reorderedSourceTask = reorderedSourceTasks.find(
          (t) => t.id === task.id
        );
        const reorderedTargetTask = reorderedTargetTasks.find(
          (t) => t.id === task.id
        );
        return reorderedSourceTask || reorderedTargetTask || task;
      });

      setTasks(finalTasks);
    }
  };

  function toggleNewTask() {
    // console.log(tasks, "Tasks List");
    setIsCreatingTask((prev) => !prev);

    if (isCreatingTask) {
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskEta("");
    }
    setErrors({ title: "", description: "", eta: "", state: "" });
  }

  const isEtaEarlierThanToday = (eta) => {
    const [day, month, year] = eta.split("-").map(Number);
    const etaDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return etaDate < today;
  };

  const handleAddTask = () => {
    let validationErrors = { title: "", description: "", eta: "", state: "" };

    if (!newTaskTitle) {
      validationErrors.title = "Task title is required.";
    }
    if (!newTaskDescription) {
      validationErrors.description = "Description is required.";
    }
    if (!newTaskEta) {
      validationErrors.eta = "ETA is required.";
    }
    if (!newTaskState) {
      validationErrors.state = "Task state is required.";
    }
    const selectedEtaDate = new Date(newTaskEta);
    const today = new Date();

    if (selectedEtaDate < today && newTaskState === "backlog") {
      alert(
        "You cannot select 'Backlogs' state if the ETA is earlier than today."
      );
      return;
    }

    if (Object.values(validationErrors).some((error) => error)) {
      setErrors(validationErrors);
      return;
    }

    // Clear errors if no validation errors
    setErrors({ title: "", description: "", eta: "", state: "" });

    const highestToDoOrder = Math.max(
      ...tasks
        .filter((task) => task.status === "todo")
        .map((task) => task.order),
      -1
    );

    const newTask = {
      id: (tasks.length + 1).toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      status: isEtaEarlierThanToday(newTaskEta.split("-").reverse().join("-"))
        ? "backlog"
        : newTaskState,
      order: highestToDoOrder + 1,
      eta: newTaskEta.split("-").reverse().join("-"), // Include eta in the new task
    };

    // Add the new task to the tasks array
    setTasks([...tasks, newTask]);

    // Reset form and hide
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskEta("");
    setIsCreatingTask(false);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const editTask = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    setEditingTaskId(taskId);
    setEditedTitle(task.title);
    setEditedEta(task.eta.split("-").reverse().join("-"));
    setEditedDescription(task.description);
  };

  const saveTask = () => {
    console.log(
      isEtaEarlierThanToday(editedEta.split("-").reverse().join("-")),
      "'Is earlier?"
    );
    setTasks(
      tasks.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title: editedTitle,
              description: editedDescription,
              eta: editedEta.split("-").reverse().join("-"),
              status: isEtaEarlierThanToday(
                editedEta.split("-").reverse().join("-")
              )
                ? "backlog"
                : "in-progress",
            }
          : task
      )
    );
    setEditingTaskId(null); // Close the edit form
  };

  return (
    <TaskContext.Provider
      value={{
        columns,
        tasks,
        setTasks,
        inputFilterString,
        setInputFilterString,
        isCreatingTask,
        setIsCreatingTask,
        newTaskTitle,
        setNewTaskTitle,
        newTaskDescription,
        setNewTaskDescription,
        newTaskEta,
        setNewTaskEta,
        newTaskState,
        setNewTaskState,
        errors,
        setErrors,
        editingTaskId,
        setEditingTaskId,
        editedTitle,
        setEditedTitle,
        editedDescription,
        setEditedDescription,
        editedEta,
        setEditedEta,
        draggedTaskId,
        setDraggedTaskId,
        targetTaskId,
        setTargetTaskId,
        handleDragStart,
        handleDragOverTask,
        handleDrop,
        toggleNewTask,
        handleAddTask,
        isEtaEarlierThanToday,
        deleteTask,
        editTask,
        saveTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
