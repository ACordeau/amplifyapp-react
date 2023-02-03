import React, { useContext, useEffect, useState } from "react";
import { listNotes, listUsers } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  createUser as createUserMutation,
  deleteUser as deleteUserMutation,
} from "./graphql/mutations";
import { API, Storage } from "aws-amplify";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  // const [failsafe, setFailsafe] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchNotes();
  }, []);

  // useEffect(() => {
  //   let flag = false;
  //   users.map((user) => {
  //     console.log(user.name);
  //     if (user.name === "Aaron") {
  //       flag = true;
  //       // setFailsafe(true);
  //     }
  //   });
  //   if (!flag) {
  //     createUser("Aaron", "test");
  //   }
  // }, [users]);

  async function fetchUsers() {
    const apiData = await API.graphql({ query: listUsers });
    const usersFromAPI = apiData.data.listUsers.items;

    // console.log(usersFromAPI);

    // usersFromAPI.map((user) => {
    //   console.log(user.name);
    //   if (user.name === "Aaron") {
    //     setFailsafe(true);
    //   }
    // });

    // if (!failsafe) {
    //   createUser("Aaron", "test");
    //   setFailsafe(true);
    // }
    console.log(usersFromAPI);
    setUsers(usersFromAPI);

    // usersFromAPI.map((user) => {
    //   deleteUser(user.id, user.name);
    // });

    // if (usersFromAPI.length === 0) {
    //   createUser("test", "test");
    // }
  }

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
    };
    if (!!data.image) {
      await Storage.put(data.name, image);
    }
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function createUser(username, password) {
    const data = {
      name: username,
      password: password,
    };

    await API.graphql({
      query: createUserMutation,
      variables: { input: data },
    });

    fetchUsers();
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  async function deleteUser(id, name) {
    console.log(id);
    const newUsers = users.filter((user) => user.id !== id);
    setUsers(newUsers);
    await Storage.remove(name);
    await API.graphql({
      query: deleteUserMutation,
      variables: { input: { id } },
    });
  }

  return (
    <AppContext.Provider
      value={{ createNote, deleteNote, notes, deleteUser, users, createUser }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
