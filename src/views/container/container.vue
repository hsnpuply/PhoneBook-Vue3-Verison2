<script setup>
import Swal from "sweetalert2";
import { ref, reactive, onMounted, computed, watch } from "vue";
import Forms from "@/views/container/components/forms.vue";
import Card from "@/views/container/components/contact_card.vue";
import axios from "axios";
import { HalfCircleSpinner } from "epic-spinners";
import "animate.css";
import NoDataServerAnimation from "@/assets/NoDataServerAnimation.json";
import NoDataLocalAnimation from "@/assets/NoDataLocalAnimation.json";
import draggable from "vuedraggable";
import moment from "moment-jalaali";
import Sortable from "sortablejs/modular/sortable.complete.esm.js";
const col_filter = ref(false);

const myArray = ref([
  { id: 1, name: "Hasan" },
  { id: 2, name: "Javad" },
  { id: 3, name: "Vahid" },
]);
const drag = ref(false);
import {
  convertNumbersToPersian as PersianNumberConvertorX,
  deleteLocalstorageContact as DeleteContacts,
} from "../../utilities/functions";

import ContactRecord from "./components/contactRecord.vue";
import Drawer from "./components/drawer.vue";
import { locale } from "moment/moment";

const state = reactive({
  contacts: {
    LocalContacts: [],
    server_1_Contacts: [],
    paginated_contacts: [],
    contactsPreview: "",
    storedPreviewStatus: localStorage.getItem("Preview Status"),
    selectedContact: {},
  },
  pagination: {
    limit_contacts_per_page:Number(localStorage.getItem('contacts_per_page')) || 5,
    total_contacts: 44,
    current_page: 1,
  },
  forms: {
    register: false,
    edit: false,
  },
  loading: {
    preview: true,
    loadingStatus: false,
    animateClass: "",
    skeletonLoads: {
      LocalContacts: true,
      server_1_Contacts: true,
    },
  },
  mainTableKey: 0,
});

const updateContactsPerPage = (newVal) => {
  state.pagination.limit_contacts_per_page = newVal;
  // fetchContacts(newVal)
  localStorage.setItem('contacts_per_page', newVal);
};
// watch(()=> state.pagination.limit_contacts_per_page,(newValue)=>{
  
//   alert(newValue)

// })

watch(state.contacts.contactsPreview, (newValue) => {
  
  alert(state.contacts.contactsPreview);
  alert("something changed in contacts Preview");

  switch (newValue) {
    case "LocalStorage":
      state.contacts.contactsPreview = "LocalStorage";
      localStorage.setItem("Preview Status", state.contacts.contactsPreview);
      break;
    case "Server":
      state.contacts.contactsPreview = "Server";
      localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  }
});

function handleStorageChange(e) {
  if (e.key === "contacts_per_page") {
    state.pagination.limit_contacts_per_page = 5;
    localStorage.setItem("Preview Status", state.pagination.limit_contacts_per_page);
  }
}

window.addEventListener("storage", handleStorageChange);
const handlePreviewChange = (newVal) => {
  switch (newVal) {
    case "Server":
      state.contacts.contactsPreview = "Server";
      getData();
      break;
    case "LocalStorage":
      state.contacts.contactsPreview = "LocalStorage";
      getData();
      break;
    default:
      console.warn("Invalid selection:", newVal);
  }
};
onMounted(async () => {
  if (!localStorage.getItem('contacts_per_page')) {
    state.pagination.limit_contacts_per_page = 5;
    localStorage.setItem('contacts_per_page', state.pagination.limit_contacts_per_page);
  }
  if (localStorage.getItem('contacts_per_page')) {
    state.pagination.limit_contacts_per_page = localStorage.getItem('contacts_per_page');
  }

  if (!localStorage.getItem("Preview Status") && state.contacts.contactsPreview == "") {
    localStorage.setItem("Preview Status", "LocalStorage");
    state.contacts.contactsPreview = "LocalStorage";
  }

  if (state.contacts.storedPreviewStatus == "LocalStorage") {
    state.contacts.contactsPreview = "LocalStorage";
    localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  } else if (state.contacts.storedPreviewStatus == "Server") {
    state.contacts.contactsPreview = "Server";
    localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  } else {
    localStorage.setItem("Preview Status", "LocalStorage");
    state.contacts.contactsPreview = "LocalStorage";
  }
  getData();

  await fetchUsers();
  // await fetchContacts( state.pagination.limit_contacts_per_page)
  setTimeout(() => {
    state.loading.preview = false;
  }, 2400);

  setTimeout(() => {
    state.loading.loadingStatus = true;
  }, 2000);
  setTimeout(() => {
    state.loading.skeletonLoads.LocalContacts = false;
    state.loading.skeletonLoads.server_1_Contacts = false;
  }, 6000);
});

function updateMainTableKey(newValue) {
  state.mainTableKey = newValue;
}

const getData = async () => {
  const storedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
  state.contacts.paginated_contacts.splice(
    0,
    state.contacts.paginated_contacts.length,
    ...storedContacts
  );
  

  // Store all contacts without altering them later
  state.contacts.paginated_contacts.splice(
    0,
    state.contacts.paginated_contacts.length,
    ...storedContacts
  );

  // Set total contacts for pagination
  state.pagination.total_contacts = storedContacts.length;

  // Display the first page of data
  split_data();

  switch (state.contacts.contactsPreview) {
    case "LocalStorage":
      state.contacts.LocalContacts.splice(
        0,
        state.contacts.LocalContacts.length,
        ...storedContacts
      );
      break;

    case "Server":
      await fetchUsers();

      // await fetchContacts(state.pagination.limit_contacts_per_page);
      
      break;
  }
};
const newData = ref([]);
const totalPages = computed(() => {
  return Math.ceil(state.pagination.total_contacts / state.pagination.limit_contacts_per_page);
});

// Handle slicing for pagination
const split_data = () => {
    const start = (state.pagination.current_page - 1) * state.pagination.limit_contacts_per_page;
    const end = Number(start) + Number(state.pagination.limit_contacts_per_page);
    
  // Slice the right data for the current page
  const selected_Contacts = state.contacts.paginated_contacts.slice(start, end);

  // Replace only newData with the current page data using splice
  const incremnetal = ref(0)
  // debugger
  newData.value.splice(incremnetal.value, end, ...selected_Contacts);
  incremnetal.value += state.pagination.limit_contacts_per_page

};

const onPageChange = (newPage) => {
  console.log("Page changed to:", newPage);
  // Perform any additional logic when the page changes
  split_data();
};

// Pagination Controls
const prev_page = () => {
  if (state.pagination.current_page > 1) {
    state.pagination.current_page--;
    split_data();
  }
};

const next_page = () => {
  const maxPage = Math.ceil(state.pagination.total_contacts / state.pagination.limit_contacts_per_page);
  if (state.pagination.current_page < maxPage) {
    state.pagination.current_page++;
    split_data();
  }
};




const isPrevDisabled = computed(() => state.pagination.current_page === 1);
const isNextDisabled = computed(() => {
  const maxPage = Math.ceil(state.contacts.paginated_contacts.length / state.pagination.limit_contacts_per_page);
  return state.pagination.current_page >= maxPage;
});


const deleteServerContact = async (id) => {
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
        state.contacts.server_1_Contacts = state.contacts.server_1_Contacts.filter(
          (contact) => contact.id !== id
        ); // Update the local list of users

        state.mainTableKey = state.mainTableKey + 1;
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

const toggleEditForm = (item) => {
  Object.assign(state.contacts.selectedContact, item);
  state.forms.edit = !state.forms.edit;
};
const toggleRegisterForm = () => {
  state.forms.register = !state.forms.register;
};

const UpdateStatusDataServer = ref(false);
const UpdateDataServer = async () => {
  if (UpdateStatusDataServer.value) {
    await fetchUsers();
  }
};

const fetchUsers = async () => {
  try {
    const response = await axios.get("http://localhost:4000/users"); // Replace with your actual URL
    state.contacts.server_1_Contacts = response.data;
    // console.log(state.contacts.server_1_Contacts);

    // console.log(users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const localStorageCondition = () => {
  if (
    state.contacts.LocalContacts.length > 0 &&
    !state.loading.skeletonLoads.LocalContacts &&
    state.contacts.contactsPreview == "LocalStorage"
  ) {
    state.contacts.contactsPreview = "LocalStorage";
    return true;
  }
};

const serverCondition = () => {
  if (
    state.contacts.server_1_Contacts.length > 0 &&
    !state.loading.skeletonLoads.server_1_Contacts &&
    state.contacts.contactsPreview == "Server"
  ) {
    state.contacts.contactsPreview = "Server";
    return true;
  }
};

const drawer = ref(null);

const noContactPreview = computed(() => {
  if (
    state.contacts.LocalContacts.length === 0 &&
    state.contacts.contactsPreview == "LocalStorage"
  ) {
    return true;
  } else if (
    state.contacts.server_1_Contacts.length === 0 &&
    state.contacts.contactsPreview == "Server"
  ) {
    return true;
  }

  return false;
});

const getEmojiNodata = (contactsPreview) => {
  switch (contactsPreview) {
    case "LocalStorage":
      return "😲";
    case "Server":
      return "😨";
    case "Database":
      return "😎";
    case "Cloud":
      return "☁️";
    default:
      return "❓"; // حالت پیش‌فرض
  }
};

const savingModeData = (contactsPreview) => {
  switch (contactsPreview) {
    case "LocalStorage":
      return "مرورگر ";
    case "Server":
      return "سرور";
    case "Database":
      return "دیتابیس";
    case "Cloud":
      return "فضای ابری";
    default:
      return "محل نامشخص";
  }
};

const getTitleEmoji = (contactsPreview) => {
  switch (contactsPreview) {
    case "LocalStorage":
      return "mdi-web";
    case "Server":
      return "mdi-server";
    case "Database":
      return "mdi-database";
    case "Cloud":
      return "mid-cloud";
    default:
      return "mdi-question-mark";
  }
};

const changePreviewStatus = (status) => {
  state.contacts.contactsPreview = status;
  localStorage.setItem("Preview Status", status);
  getData();
};

const NoDataLottie = (contactPreview) => {
  switch (contactPreview) {
    case "Server":
      return NoDataServerAnimation;
    case "LocalStorage":
      return NoDataLocalAnimation;
    default:
      return null;
  }
};

const lottieAnimation = computed(() => NoDataLottie(state.contacts.contactsPreview));

const tableItems = ref([
  "شماره",
  "پروفایل",
  "نام و نام خانوادگی",
  "شماره تلفن",
  "تاریخ تولد",
  "همکار",
  "مهارت ها",
  "علاقه مندی ها",
  "عملیات",
]);
const animationTriggered = ref(false);
const animationTriggered2 = ref(false);

const getNoContactAnimatedClass = computed(() => {
  if (state.contacts.LocalContacts.length === 0 && !animationTriggered.value) {
    animationTriggered.value = true;
    return "animate__animated animate__slow animate__fadeInUp";
  }
  return "";
});

const tableAnimationClass = computed(() => {
  if (state.contacts.LocalContacts.length === 0 && !animationTriggered2.value) {
    animationTriggered2.value = true;
    return "animate__animated animate__slow animate__fadeInUp";
  } else if (state.contacts.LocalContacts.length > 0 && !animationTriggered2.value) {
    animationTriggered2.value = true;
    return "tableHavingContact animate__animated animate__fadeInUp";
  }
  return "";
});

const isContact_on_current_mode = (contactsPreview) => {
  switch (contactsPreview) {
    case "LocalStorage":
      return "در حالت مرورگر";
    case "Server":
      return "در حالت سرور";
    case "Database":
      return "در حالت دیتابیس";
    case "Cloud":
      return "در حالت ابر";
    default:
      return false;
  }
};

const showRegisterButton = (previewStatus) => {
  if (previewStatus) {
    return (
      isContact_on_current_mode(previewStatus) !== false
      // !state.loading.skeletonLoads.LocalContacts ||
      // (state.contacts.LocalContacts.length === 0 && !savingModeData("محل نامشخص"))
    );
  } else {
    return false;
  }
};

// Factory user maker

const userMaking = () => {
  const randomNames = [
    "علی رضایی",
    "سارا احمدی",
    "رضا نیکو",
    "نرگس محمدی",
    "امید کاظمی",
    "زهرا عباسی",
    "کیان شریفی",
    "یاسمین فرهادی",
  ];
  const randomNumbers = [
    "09121234567",
    "09351112233",
    "09905556677",
    "09032223344",
    "09147896543",
    "09378945612",
    "09223334455",
  ];
  const randomDates = [
    "1375/07/10",
    "1368/03/05",
    "1380/09/22",
    "1372/01/15",
    "1379/11/30",
    "1384/04/17",
  ];
  const randomAvatars = [
    "https://picsum.photos/150?random=1",
    "https://picsum.photos/150?random=2",
    "https://picsum.photos/150?random=3",
    "https://picsum.photos/150?random=4",
    "https://picsum.photos/150?random=5",
  ];
  const skillsList = [
    "Vue.js",
    "React",
    "Node.js",
    "CSS",
    "HTML",
    "JavaScript",
    "Python",
  ];
  const interestsList = [
    "موسیقی",
    "ورزش",
    "کدنویسی",
    "فیلم",
    "عکاسی",
    "طبیعت گردی",
  ];

  // Generate new contacts
  const newContacts = Array.from({ length: 5 }, (_, index) => ({
    id: Date.now() + index,  // Ensure unique ID
    phoneNumber: randomNumbers[Math.floor(Math.random() * randomNumbers.length)],
    fullname: randomNames[Math.floor(Math.random() * randomNames.length)],
    selectedDate: randomDates[Math.floor(Math.random() * randomDates.length)],
    isCoworker: Math.random() > 0.5,
    skills: skillsList
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1),
    favorites: interestsList
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1),
    avatar: randomAvatars[Math.floor(Math.random() * randomAvatars.length)],
  }));

  // Retrieve existing contacts from localStorage
  const existingContacts = JSON.parse(localStorage.getItem("contacts")) || [];

  // Merge new contacts with existing contacts
  const updatedContacts = [...existingContacts, ...newContacts];

  // Update localStorage and state
  localStorage.setItem("contacts", JSON.stringify(updatedContacts));
  state.contacts.LocalContacts.push(...newContacts);
  state.contacts.paginated_contacts.push(...newContacts);

  // Call this function to handle additional actions
  getData();
};



const updateContactsPreview = (newPreview) => {
  state.contacts.contactsPreview = newPreview;
};

const animatedItems = ref(new Set());

const handleAnimationEnd = (item) => {
  animatedItems.value.add(item);
};
const delete_localstorage_contacts =()=>{
 // Clear localStorage contacts
 localStorage.setItem("contacts", JSON.stringify([]));

// Clear reactive state contacts
state.contacts.LocalContacts.splice(0, state.contacts.LocalContacts.length);  getData()
  

}




watch(()=> state.pagination.current_page , ()=>{
  split_data()
})

</script>
<template>
  <div
    class="w-full h-[100vh] flex flex-col gap-8 items-center justify-center bg-black/30"
    v-if="!state.loading.loadingStatus"
  >
    <half-circle-spinner :size="100" color="green" />
    <h2 class="text-xl loading_text">... در حال بارگذاری</h2>
  </div>

  <div class="mx-auto mainContent h-full bg-cover" v-if="state.loading.loadingStatus">
    <header class="titlePage overflow-hidden">
      <div class="titleText animate__animated animate__fadeInUp animate__slow">
        <h1
          class="text-center py-8 text-3xl text-white title_header font-semibold flex items-center justify-center gap-2"
        >
          <span class="mdi" :class="getTitleEmoji(state.contacts.contactsPreview)"></span>
          دفترچه تلفن {{ savingModeData(state.contacts.contactsPreview) }}
        </h1>
        <!-- <div class="fixed top-0 right-0">
          <AnalogClock class="scale-[.35] bg-green-500   " />
        </div> -->
      </div>
    </header>

    <div class="container mx-auto rounded-lg">
      <div
        class="px-4 my-2 text-center lg:!text-left animate__animated animate__slow animate__fadeInLeft"
      >
        <div class="setting">
          <span
            class="cursor-pointer mdi mdi-cog text-3xl text-white hover:scale-[.9] inline-flex duration-700 ease-in-out hover:rotate-[180deg] origin-center"
            @click.stop="drawer = !drawer"
          />
        </div>
      </div>

      <v-table
        class="the_table hidden xl:block"
        :class="tableAnimationClass"
        :key="state.mainTableKey"
      >
        <thead class="relative bg-transparent">
          <v-btn class="bg-[#2c3e50]" size="large" @click="col_filter = true"
            >ترتیب ستون ها</v-btn
          >
          <tr class="text-right !bg-[#2c3e50] text-[#627080] text-white text-lg">
            <th class="text-right" v-for="(item, index) in tableItems" :key="index">
              {{ item }}
            </th>
          </tr>
        </thead>

        <!-- Skeleton of LocalStorage -->
        <tbody
          class="w-full"
          v-if="
            state.loading.skeletonLoads.LocalContacts &&
            state.contacts.contactsPreview == 'LocalStorage'
          "
        >
          <tr
            v-for="(item, index) in state.contacts.LocalContacts.length"
            :key="index"
            class="even:bg-[#e0c083] bg-[#f8f1e5]"
          >
            <td v-for="item in 8" :key="item" class="!h-28">
              <v-skeleton-loader type="text" color="transparent" class="">
              </v-skeleton-loader>
            </td>
            <td class="min-w-48">
              <div class="w-full px-8">
                <v-skeleton-loader type="button,button" color="transparent" class=" ">
                </v-skeleton-loader>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Skeleton of Server -->

        <tbody
          class="w-full"
          v-if="
            state.loading.skeletonLoads.LocalContacts &&
            state.contacts.contactsPreview == 'Server'
          "
        >
          >
          <tr
            v-for="(item, index) in state.contacts.server_1_Contacts.length"
            :key="index"
            class="bg-[#bcbfc5] even:bg-[#e5e7eb]"
          >
            <td v-for="item in 8" :key="item" class="!h-28">
              <v-skeleton-loader type="text" color="transparent" class="">
              </v-skeleton-loader>
            </td>
            <td class="min-w-48">
              <div class="w-full px-8">
                <v-skeleton-loader type="button,button" color="transparent" class=" ">
                </v-skeleton-loader>
              </div>
            </td>
          </tr>
        </tbody>

        <ContactRecord
          :columnOrder="tableItems"
          v-if="localStorageCondition()"
          :data="state.contacts.LocalContacts"
          :DeleteContacts="DeleteContacts"
          :toggleEditForm="toggleEditForm"
          :getData="getData"
        />

        <!-- Server -->
        <!-- <ContactRecord
          :columnOrder="tableItems"
          v-if="serverCondition()"
          :data="state.contacts.server_1_Contacts"
          :DeleteContacts="deleteServerContact"
          :toggleEditForm="toggleEditForm"
          :getData="getData"
        /> -->
        <ContactRecord
          :columnOrder="tableItems"
          v-if="serverCondition()"
          :data="newData"
          :DeleteContacts="deleteServerContact"
          :toggleEditForm="toggleEditForm"
          :getData="getData"
        />
      </v-table>
      <div
        class="flex flex-col py-20 xl:py-0 md:rounded-lg !rounded-2xl bg-white items-center justify-center min-h-[200px] text-center"
        :class="getNoContactAnimatedClass"
        v-if="noContactPreview"
      >
        <Vue3Lottie
          v-if="lottieAnimation"
          :animationData="lottieAnimation"
          :height="400"
          :width="400"
        />

        <p class="pb-10 text-3xl">
          {{ getEmojiNodata(state.contacts.contactsPreview) }}

          هیچ مخاطبی در
          {{ savingModeData(state.contacts.contactsPreview) }}
          موجود نیست
        </p>
      </div>
    </div>

    <!-- Card Of LocalContacts -->
    <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="
        !state.loading.skeletonLoads.LocalContacts &&
        state.contacts.contactsPreview == 'LocalStorage'
      "
    >
      <Card
        v-model:dialogEditState="state.forms.edit"
        :currentItem="item"
        :MyLocalContacts="state.contacts.LocalContacts"
        :selectedContact="state.contacts.selectedContact"
        :all_forms_fields="item"
        v-for="(item, index) in state.contacts.LocalContacts"
        :deleteServerContact="deleteServerContact"
        :contactsPreview="state.contacts.contactsPreview"
        :key="index"
        class="!max-w-[50%] flex-1 flex-wrap"
      />
    </div>

    <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="
        !state.loading.skeletonLoads.server_1_Contacts &&
        state.contacts.contactsPreview == 'Server'
      "
    >
      <Card
        v-for="(item, index) in state.contacts.server_1_Contacts"
        v-model:dialogEditState="state.forms.edit"
        :currentItem="item"
        :MyLocalContacts="state.contacts.LocalContacts"
        :selectedContact="state.contacts.selectedContact"
        :all_forms_fields="item"
        :deleteServerContact="deleteServerContact"
        :serverUpdate="UpdateDataServer"
        :contactsPreview="state.contacts.contactsPreview"
        :key="index"
        class="!max-w-[50%] flex-1 flex-wrap"
      />
    </div>

    <div
      class="skeletonLoaders xl:hidden flex flex-row-reverse flex-wrap items-stretch justify-center container mx-auto gap-8 rounded-lg"
      v-if="state.loading.skeletonLoads.LocalContacts"
    >
      <v-skeleton-loader
        v-for="(item, index) in state.contacts.LocalContacts"
        :key="index"
        min-height="540"
        elevation="24"
        type="	image , text, paragraph , article  , button , button"
        class="bg-sky-500/60 rounded-lg border shadow-lg min-w-[47%] shadow-black skeletonLoaderCard"
      >
      </v-skeleton-loader>
    </div>

    <div
      class="skeletonLoaders xl:hidden flex flex-row-reverse flex-wrap items-stretch justify-center container mx-auto gap-8 rounded-lg"
      v-if="state.loading.skeletonLoads.server_1_Contacts"
    >
      <v-skeleton-loader
        v-for="(item, index) in state.contacts.server_1_Contacts"
        :key="index"
        min-height="540"
        elevation="24"
        type="	image , text, paragraph , article  , button , button"
        class="bg-sky-500/60 rounded-lg border shadow-lg min-w-[47%] shadow-black skeletonLoaderCard"
      >
      </v-skeleton-loader>
    </div>

    <div
      v-if="
        !state.loading.skeletonLoads.LocalContacts ||
        !state.loading.skeletonLoads.server_1_Contacts
      "
      class="addNewContact flex-wrap  flex xl:!justify-end justify-center container mx-auto xl:!px-0 py-5 xs:px-10 animate__animated animate__slow animate__delay-1s animate__fadeInRight"
    >
      <v-btn
        v-if="showRegisterButton(state.contacts.contactsPreview)"
        variant="elevated"
        elevation="3"
        size="large"
        @click="toggleRegisterForm"
        class="bg-[#295687] hover:bg-[#3a6ea5]"
      >
        ثبت مخاطب
        <v-icon left class="pl-3"> mdi-plus </v-icon>
      </v-btn>
      <v-btn
        v-if="
          showRegisterButton(state.contacts.contactsPreview) &&
          state.contacts.contactsPreview == 'LocalStorage'
        "
        variant="elevated"
        elevation="3"
        class="bg-[#cd9732] hover:bg-[#cfa353] ml-5"
        size="large"
        @click="userMaking"
      >
        مخاطبین تصادفی
        <v-icon left class="pl-3"> mdi-human-male-male </v-icon>
      </v-btn>
      <v-btn
        v-if="
          showRegisterButton(state.contacts.contactsPreview) &&
          state.contacts.contactsPreview == 'LocalStorage'
        "
        variant="elevated"
        elevation="3"
        class="bg-[#ee5d3c] hover:bg-[#cf7653eb] ml-5"
        size="large"
        @click="delete_localstorage_contacts"
      >
         حذف همه ی مخاطبین
        <v-icon left class="pl-3"> mdi-delete </v-icon>
      </v-btn>
    </div>

    <!-- <div class="flex items-center justify-center gap-4">
      <v-btn prepend-icon="mdi mdi-skip-previous" @click="prev_page">قبلی</v-btn>
      <div class="pagination_pages flex items-center gap-2 text-xl">
      <span>1</span>
      <span>of</span>
      <span>5</span>
      </div>
      <v-btn append-icon="mdi mdi-skip-next" @click="next_page">بعدی</v-btn>
    </div> -->
    <!-- v-if="showRegisterButton(state.contacts.contactsPreview) &&
    state.contacts.contactsPreview == 'LocalStorage'" -->
    <!-- <div
           class="pagination flex items-center justify-center gap-4 text-black">
      <v-btn @click="prev_page" size="large"  class="rounded-lg" :disabled="isPrevDisabled"  prepend-icon="mdi mdi-skip-previous">قبلی</v-btn>
      <p class="text-xl text-white"> 
      <span>صفحه</span> <span>{{ state.pagination.current_page }}</span> از  <span>{{ (state.pagination.total_contacts / state.pagination.limit_contacts_per_page).toFixed()  }}</span>
      </p>
      <v-btn @click="next_page" size="large" class="rounded-lg" :disabled="isNextDisabled" append-icon="mdi mdi-skip-next">بعدی</v-btn>
    </div> -->

    <!-- test pagination  -->
    <div class="text-center bg-black/40  ">
    <v-container>
      <v-row justify="center" >
        <v-col cols="40"  >
          <v-container class="max-width " >
            <v-pagination
              v-model="state.pagination.current_page"
              :length="totalPages"
              class="my-4 text-white  "
              rounded="circle"
              size="50px"
              next-icon="mdi-skip-next"
              prev-icon="mdi-skip-previous"
            />
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
  <!-- <v-pagination :length="4" ></v-pagination> -->

    <div
      v-if="
        state.loading.skeletonLoads.LocalContacts && state.contacts.LocalContacts.length
      "
      class="mt-5 animate__animated animate__slow animate__fadeInUp animate__delay-2s flex items-center !justify-center xl:!justify-end w-full bg-gray-500/20 mx-auto container lg:mx-0"
    >
      <v-skeleton-loader type="button" color="transparent" class="w-32">
      </v-skeleton-loader>
    </div>

    <Drawer
      v-model="drawer"
      v-model:drawer="drawer"
      :contactsPreview="state.contacts.contactsPreview"
      @changePreviewStatus="handlePreviewChange"
      :changePreviewStatus="changePreviewStatus"
      :show_contacts_per_page="state.pagination.limit_contacts_per_page"
      @update:show_contacts_per_page="updateContactsPerPage"
      />
    <v-main style="height: 250px">
      <div class="d-flex justify-center align-center h-100"></div>
    </v-main>
  </div>

  <Forms
    v-model:modelState="state.forms.register"
    title="ثبت مخاطب"
    :registerMode="true"
    :editMode="false"
    :getData="getData"
    :mainTableKey="state.mainTableKey"
    @update:mainTableKey="updateMainTableKey"
    :contactsPreview="state.contacts.contactsPreview"
  />
  <!-- :getData="getData()" -->

  <Forms
    v-model:model-state="state.forms.edit"
    title="ویرایش مخاطب"
    :editMode="true"
    :currentID="state.contacts.selectedContact.id"
    :allFormsFields="state.contacts.selectedContact"
    :getData="getData"
    :contactsPreview="state.contacts.contactsPreview"
    :registerMode="false"
    @update:mainTableKey="updateMainTableKey"
  />

  <v-dialog v-model="col_filter" width="550" persistent class="column_order">
    <v-card title="ترتیب ستون ها" class="rounded-xl">
      <div class="columns flex flex-col gap-4 items-center justify-center">
        <draggable v-model="tableItems" item-key="id" tag="transition-group" class="">
          <template #item="{ element, index }">
            <div
              v-if="true"
              :key="element"
              :style="{
                animationDelay: `${(tableItems.length - index) * 0.2}s !important`,
              }"
              class="hover:!bg-[#4c749f] even:bg-[#f8f1e5] col w-[300px] rounded-lg cursor-move select-none py-2 bg-gray-500 odd:bg-gray-300 odd:!bg-[#e0c083] text-black"
              :class="{
                test_animate: !animatedItems.has(element),
              }"
              @animationend="handleAnimationEnd(element)"
            >
              {{ element }}
            </div>
          </template>
        </draggable>
      </div>
      <template v-slot:actions>
        <div class="w-full my-2">
          <v-btn
            class="bg-[#295687] hover:bg-[#3a6ea5] px-9"
            text="تایید"
            @click="col_filter = false"
            :style="{
              animationDelay: `3s !important`,
            }"
            :class="{
              test_animate: !animatedItems.has(element),
            }"
            @animationend="handleAnimationEnd(element)"
          ></v-btn>
        </div>
      </template>
    </v-card>
  </v-dialog>
  

  <!-- <div class="matn relative group">
  <p class="text-2xl max-h-[80px] overflow-hidden group-hover:max-h-[400px] duration-700">
    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda quis eum id adipisci cumque ut nulla! Ea repellat veniam, neque consequuntur, obcaecati odio officiis necessitatibus, modi quam optio sequi quia reprehenderit. Natus numquam quasi explicabo ipsum enim iusto laborum labore, officia tempora nesciunt animi asperiores. Qui autem debitis natus recusandae nemo veniam, exercitationem nesciunt quia? Ut pariatur laudantium deleniti amet consequuntur animi earum deserunt corrupti. Mollitia esse cum perferendis quae. Assumenda consequatur esse cumque temporibus est adipisci dolore saepe culpa, dolorem perspiciatis laboriosam facere in cum harum delectus enim quos quisquam ex quibusdam ab quasi vero vel omnis deserunt. Voluptatem explicabo quam reiciendis. Suscipit, ratione doloremque voluptatibus soluta cumque, dolorum id accusantium quas magni explicabo voluptate possimus error neque voluptatem!
  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda quis eum id adipisci cumque ut nulla! Ea repellat veniam, neque consequuntur, obcaecati odio officiis necessitatibus, modi quam optio sequi quia reprehenderit. Natus numquam quasi explicabo ipsum enim iusto laborum labore, officia tempora nesciunt animi asperiores. Qui autem debitis natus recusandae nemo veniam, exercitationem nesciunt quia? Ut pariatur laudantium deleniti amet consequuntur animi earum deserunt corrupti. Mollitia esse cum perferendis quae. Assumenda consequatur esse cumque temporibus est adipisci dolore saepe culpa, dolorem perspiciatis laboriosam facere in cum harum delectus enim quos quisquam ex quibusdam ab quasi vero vel omnis deserunt. Voluptatem explicabo quam reiciendis. Suscipit, ratione doloremque voluptatibus soluta cumque, dolorum id accusantium quas magni explicabo voluptate possimus error neque voluptatem!
  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda quis eum id adipisci cumque ut nulla! Ea repellat veniam, neque consequuntur, obcaecati odio officiis necessitatibus, modi quam optio sequi quia reprehenderit. Natus numquam quasi explicabo ipsum enim iusto laborum labore, officia tempora nesciunt animi asperiores. Qui autem debitis natus recusandae nemo veniam, exercitationem nesciunt quia? Ut pariatur laudantium deleniti amet consequuntur animi earum deserunt corrupti. Mollitia esse cum perferendis quae. Assumenda consequatur esse cumque temporibus est adipisci dolore saepe culpa, dolorem perspiciatis laboriosam facere in cum harum delectus enim quos quisquam ex quibusdam ab quasi vero vel omnis deserunt. Voluptatem explicabo quam reiciendis. Suscipit, ratione doloremque voluptatibus soluta cumque, dolorum id accusantium quas magni explicabo voluptate possimus error neque voluptatem!
  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda quis eum id adipisci cumque ut nulla! Ea repellat veniam, neque consequuntur, obcaecati odio officiis necessitatibus, modi quam optio sequi quia reprehenderit. Natus numquam quasi explicabo ipsum enim iusto laborum labore, officia tempora nesciunt animi asperiores. Qui autem debitis natus recusandae nemo veniam, exercitationem nesciunt quia? Ut pariatur laudantium deleniti amet consequuntur animi earum deserunt corrupti. Mollitia esse cum perferendis quae. Assumenda consequatur esse cumque temporibus est adipisci dolore saepe culpa, dolorem perspiciatis laboriosam facere in cum harum delectus enim quos quisquam ex quibusdam ab quasi vero vel omnis deserunt. Voluptatem explicabo quam reiciendis. Suscipit, ratione doloremque voluptatibus soluta cumque, dolorum id accusantium quas magni explicabo voluptate possimus error neque voluptatem!
  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda quis eum id adipisci cumque ut nulla! Ea repellat veniam, neque consequuntur, obcaecati odio officiis necessitatibus, modi quam optio sequi quia reprehenderit. Natus numquam quasi explicabo ipsum enim iusto laborum labore, officia tempora nesciunt animi asperiores. Qui autem debitis natus recusandae nemo veniam, exercitationem nesciunt quia? Ut pariatur laudantium deleniti amet consequuntur animi earum deserunt corrupti. Mollitia esse cum perferendis quae. Assumenda consequatur esse cumque temporibus est adipisci dolore saepe culpa, dolorem perspiciatis laboriosam facere in cum harum delectus enim quos quisquam ex quibusdam ab quasi vero vel omnis deserunt. Voluptatem explicabo quam reiciendis. Suscipit, ratione doloremque voluptatibus soluta cumque, dolorum id accusantium quas magni explicabo voluptate possimus error neque voluptatem!
  </p>
  <div class="more bg-black/90 text-center absolute w-full bottom-0 h-4 group-hover:!h-0 group-hover:-bottom-4" >
  <v-icon icon="mdi-clock" size="x-large"></v-icon>
  </div>
</div>   -->



</template>

<style scoped>
.mainContent {
  background-image: url(../../assets/images/backgrounds/localstorage/a.jpg);
  background-position: center;
  background-size: cover;
}
.title_header {
  filter: drop-shadow(2px 3px 4px #000);
}
.test_animate {
  animation: testAnimate 1s 1s ease-out forwards;
  opacity: 0;
}

@keyframes testAnimate {
  from {
    opacity: 0;
    transform: translateX(200px);
  }
  to {
    opacity: 1;
    transform: translateX(0px);
  }
}
</style>
