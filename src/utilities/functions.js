
import axios from "axios";

export const convertNumbersToPersian = (text) => {
    const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  
    let result = text;
    for (let i = 0; i < englishNumbers.length; i++) {
      const regex = new RegExp(englishNumbers[i], "g");
      result = result.replace(regex, persianNumbers[i]);
    }
    return result;
  };

  import Swal from "sweetalert2";

export const deleteContact = (id,MyLocalContacts) => {
    // Retrieve the contacts array from localStorage
    const contactsFromStorage = JSON.parse(localStorage.getItem("contacts")) || [];
    let lastId = parseInt(localStorage.getItem("lastId")) || 0;
  
    // Filter out the contact with the given ID
    const updatedContacts = contactsFromStorage.filter((contact) => contact.id !== id);
  
    Swal.fire({
      title: "آیا از حذف مخاطب اطمینان دارید؟",
      text: "اطلاعات حذف شده قابلیت بازیابی ندارند",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "انصراف",
      confirmButtonText: "بله، حذف شود",
      background: "#374151",
      color: "white",
      iconColor: "#f03935",
      customClass: {
        cancelButton:
          "text-white !bg-gray-800 hover:!bg-gray-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
        confirmButton:
          "text-white !bg-red-700 hover:!bg-red-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Update lastId only if the deleted ID matches it
        if (id === lastId) {
          if (updatedContacts.length > 0) {
            // Set lastId to the new maximum ID from the remaining contacts
            lastId = Math.max(...updatedContacts.map((contact) => contact.id));
          } else {
            // Reset lastId to 0 if no contacts remain
            lastId = 0;
          }
          localStorage.setItem("lastId", lastId);
        }
        // Save the updated array back to localStorage
        localStorage.setItem("contacts", JSON.stringify(updatedContacts));
  
        // Update the local reactive variable
        MyLocalContacts.splice(0, MyLocalContacts.length, ...updatedContacts);
  
        // Show success message
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          color: "green",
        });
        Toast.fire({
          icon: "success",
          title: "مخاطب با موفقیت حذف شد",
        });
      }
    });
  };


 export  const deleteLocalstorageContact = (id,MyLocalContacts) => {
    // Retrieve the contacts array from localStorage
    const contactsFromStorage = JSON.parse(localStorage.getItem("contacts")) || [];
    let lastId = parseInt(localStorage.getItem("lastId")) || 0;
  
    // Filter out the contact with the given ID
    const updatedContacts = contactsFromStorage.filter((contact) => contact.id !== id);
  
    Swal.fire({
      title: "آیا از حذف مخاطب اطمینان دارید؟",
      text: "اطلاعات حذف شده قابلیت بازیابی ندارند",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "انصراف",
      confirmButtonText: "بله، حذف شود",
      background: "#374151",
      color: "white",
      iconColor: "#f03935",
      customClass: {
        cancelButton:
          "text-white !bg-gray-800 hover:!bg-gray-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
        confirmButton:
          "text-white !bg-red-700 hover:!bg-red-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Update lastId only if the deleted ID matches it
        if (id === lastId) {
          if (updatedContacts.length > 0) {
            // Set lastId to the new maximum ID from the remaining contacts
            lastId = Math.max(...updatedContacts.map((contact) => contact.id));
          } else {
            // Reset lastId to 0 if no contacts remain
            lastId = 0;
          }
          localStorage.setItem("lastId", lastId);
        }
        // Save the updated array back to localStorage
        localStorage.setItem("contacts", JSON.stringify(updatedContacts));
  
        // Update the local reactive variable
        MyLocalContacts.splice(0, MyLocalContacts.length, ...updatedContacts);
  
        // Show success message
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          color: "green",
        });
        Toast.fire({
          icon: "success",
          title: "مخاطب با موفقیت حذف شد",
        });
      }
    });
  };
  



export const deleteServerContact = async (id,users,state,UpdateDataServer) => {
  Swal.fire({
    title: "آیا از حذف مخاطب اطمینان دارید؟",
    text: "اطلاعات حذف شده قابلیت بازیابی ندارند",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "انصراف",
    confirmButtonText: "بله، حذف شود",
    background: "#374151",
    color: "white",
    iconColor: "#f03935",
    customClass: {
      cancelButton:
        "text-white !bg-gray-800 hover:!bg-gray-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
      confirmButton:
        "text-white !bg-red-700 hover:!bg-red-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/users/${id}`); // Update with your server's base URL
        users = users.filter((user) => user.id !== id); // Update the local list of users
        state.mainTableKey = state.mainTableKey + 1
        // Show success notification
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          color: "green",
        });
        Toast.fire({
          icon: "success",
          title: "مخاطب با موفقیت حذف شد",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          title: "خطا در حذف مخاطب",
          text: "لطفاً دوباره تلاش کنید.",
          icon: "error",
          confirmButtonText: "تایید",
        });
      }
    }
  });
  UpdateDataServer();
  state.mainTableKey = state.mainTableKey + 1;

};