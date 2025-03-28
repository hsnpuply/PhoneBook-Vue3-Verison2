import Swal from "sweetalert2";

const deleteContact = (id,MyLocalContacts) => {
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

  export default deleteContact;