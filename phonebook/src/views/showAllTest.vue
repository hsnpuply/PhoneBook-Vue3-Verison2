<script setup>
import Swal from "sweetalert2";
import { ref, reactive, onMounted  } from "vue";
import moment from "moment-jalaali";
import Forms from "@/components/forms.vue";
import Card from "@/components/contact_card.vue";
import axios from 'axios';

const byLocalStorage = ref(true)


const skeletonLoadingState =ref(true)




const dataAxios = ref([]); // نگهداری داده دریافت شده
const loadingAxios = ref(true); // نمایش وضعیت بارگذاری
const errorAxios = ref(null); // نگهداری خطاها



const fetchDataAxios = async () => {
  try {
    // const response = await axios.get('https://jsonplaceholder.typicode.com/users'); // لینک API
    const response = await axios.get('https://reqres.in/api/users '); // لینک API
    dataAxios.value = response.data.data;
    console.log(dataAxios.value);
    
    // console.log('Street : ' , dataAxios.value[0].address.street,'\n' , ' in Lat ' , dataAxios.value[0].address.geo.lat , ' lang : ',dataAxios.value[0].address.geo.lng   )
  } catch (err) {
    errorAxios.value = err.message;
  } finally {
    loadingAxios.value = false;
  }
};

const selectedContact = reactive({});
const dialogRegisterState = ref(false);
const dialogEditState = ref(false);

const MyLocalContacts = reactive([]);




const  getData =()=>{
  const storedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
  MyLocalContacts.splice(0, MyLocalContacts.length, ...storedContacts);
  // console.log(storedContacts.length + '\n' + 'See Get Data Called')
  
}


const sekeletonLoadsF=()=>{
  setTimeout(()=>{
    skeletonLoadingState.value =  false
  },3000)
}
// Fetch contacts from localStorage on component mount
onMounted(() => {
  getData()
  fetchDataAxios()
  sekeletonLoadsF()
  fetchUsers()

});


const convertNumbersToPersian = (text) => {
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  let result = text;
  for (let i = 0; i < englishNumbers.length; i++) {
    const regex = new RegExp(englishNumbers[i], "g");
    result = result.replace(regex, persianNumbers[i]);
  }
  return result;
};

const deleteContact = (id) => {
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

const toggleEditDialog = (item) => {
  Object.assign(selectedContact, item);
  dialogEditState.value = !dialogEditState.value;
};
const toggleRegisterDialog = () => {
  dialogRegisterState.value = !dialogRegisterState.value;
};

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');

const registerUser = async () => {
  try {
    const response = await axios.post('http://localhost:5000/users', {
      // id:response.length + 1,
      username: username.value,
      email: email.value,
      password: password.value,
    });

    successMessage.value = `User registered successfully! ID: ${response.data.id}`;
    errorMessage.value = '';  // Clear error message if successful
  } catch (error) {
    errorMessage.value = 'Registration failed. Please try again.';
    successMessage.value = '';  // Clear success message if failed
  }
  fetchUsers()
};


const users = ref([]);

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/users');  // Replace with your actual URL
    users.value = response.data;  // Store the response data (users) in the users array
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const localStorageCondition = ()=>{
  if(MyLocalContacts.length > 0 && !skeletonLoadingState.value && byLocalStorage.value){
    return true
}
}

const drawer=ref(null)

</script>
<template>
  <div class="mx-auto mainContent h-full bg-cover">
    <header class="titlePage">
      <div class="titleText">
        <h1 class="text-center py-8 text-3xl text-black font-semibold">دفترچه تلفن</h1>
      </div>
    </header>

    <div class="container mx-auto rounded-lg "  >

      <v-btn
            color="primary"
            @click.stop="drawer = !drawer"
          >
            Toggle
          </v-btn>

      <v-table class="the_table hidden xl:block " >
        <thead class=" ">
          <tr class="text-right bg-[#f9fafc] text-[#627080] text-lg relative">
            <th class="text-right">شماره</th>
            <th class="text-right">پروفایل</th>
            <th class="text-right">نام و نام خانوادگی</th>
            <th class="text-right">شماره تلفن</th>
            <th class="text-right">تاریخ تولد</th>
            <th class="text-right">همکار</th>
            <th class="text-right">مهارت ها</th>
            <th class="text-right">علاقه مندی ها</th>
            <th class="text-right">عملیات</th>
            <div class=" cursor-pointer absolute left-2 top-2 group" @click.stop="drawer = !drawer">
              <v-icon class="group-hover:text-green-500 duration-150">mdi-flower</v-icon>
              <!-- a -->
            </div>

            
          </tr>

        </thead>

          <tbody  class=" w-full  " v-if="skeletonLoadingState">
              <tr v-for="(item,index) in MyLocalContacts.length" :key="index" class="bg-[#bcbfc5] even:bg-[#e5e7eb]">
                <td v-for="item in 8" :key="item" class="!h-28">
                  <v-skeleton-loader
                    type="text"
                    color="transparent"
                    class=""
                  >
                  </v-skeleton-loader>
                </td>
                <td class=" min-w-48 ">
                  <div class="w-full px-8">
                    <v-skeleton-loader
                    type="button,button"
                    color="transparent"
                    class=" "
                  >
                  </v-skeleton-loader>
                  </div>
                </td>
          </tr>


        </tbody>

        <tbody 
        v-if="localStorageCondition()"
        class="bg-[#dddbdb] text-[#212222] overflow-hidden"
        >
          <tr
            v-for="(item, index) in MyLocalContacts"
            :key="index"
            class="text-right text-xl overflow-hidden even:bg-gray-200 bg-gray-400/50
             cursor-pointer hover:bg-sky-900/60 hover:text-white duration-100
              select-none "
            @dblclick="toggleEditDialog(item)"
            
          >
            <td>{{ index + 1 }}</td>
            <td>
              <v-avatar
                variant="elevated"
                class="!h-20 !w-20 my-2"
                :image="item.avatar"
              />
            </td>
            <td>{{ item.fullname }}</td>
            <td>{{ convertNumbersToPersian(item.phoneNumber) }}</td>
            <td>
              {{
                convertNumbersToPersian(moment(item.selectedDate).format("jYYYY/jMM/jDD"))
              }}
            </td>
            <td>{{ item.isCoworker ? "بله" : "خیر" }}</td>
            <td>{{ item.skills ? item.skills.join(" , ") : "" }}</td>
            <td>{{ item.favorites ? item.favorites.join(" , ") : "" }}</td>
            <td class="">
              <div class="actionButtonsContainer flex gap-2 items-center justify-center">
                <v-btn
                variant="elevated"
                elevation="2"
                prepend-icon="mdi-delete"
                @click="deleteContact(item.id)"
                class="bg-red-600/90 hover:bg-red-600/95"
              >
                حذف
              </v-btn>
              <v-btn
                variant="elevated"
                color="blue"
                prepend-icon="mdi-account"
                @click="toggleEditDialog(item)"
                class="bg-sky-600/90 hover:bg-sky-600/95"
              >
                ویرایش
              </v-btn>
              </div>

            </td>
          </tr>
        </tbody>
      </v-table>
      <div class=" flex flex-col py-20 xl:py-0 md:rounded-lg !rounded-2xl   bg-white items-center justify-center min-h-[200px] text-center" v-if="MyLocalContacts.length <= 0">
          <img src="../assets/no-data.jpg" alt="" class="w-[35rem]">
          <p class="pb-10 text-3xl">😲 هیچ مخاطبی موجود نیست</p>
        </div>

    </div>

    <div class="test_card  mx-4 md:!mx-auto md:container w-full
     flex flex-row-reverse flex-wrap xl:hidden 
     items-stretch justify-center gap-8 cursor-pointer"  v-if="!skeletonLoadingState" >
    <Card   
    v-model:dialogEditState="dialogEditState" 
    :currentItem="item"
    :MyLocalContacts="MyLocalContacts"
    :selectedContact="selectedContact"
     :all_forms_fields="item" v-for="(item,index) in MyLocalContacts" :key="index" class="!max-w-[50%]  flex-1  flex-wrap " />
  </div>
  <div class="skeletonLoaders xl:hidden flex flex-row-reverse flex-wrap 
     items-stretch justify-center container mx-auto gap-8 rounded-lg " v-if="skeletonLoadingState">
    <v-skeleton-loader
          v-for="(item,index) in MyLocalContacts" :key="index"
          min-height="540"
          elevation="24"
          type="	image , text, paragraph , article  , button , button"
          class="bg-sky-500/60 rounded-lg border shadow-lg min-w-[47%] shadow-black skeletonLoaderCard"
        >
        </v-skeleton-loader>
  </div>

  <div class="addNewContact  w-full
   flex  xl:!justify-end justify-center container mx-auto xl:!px-0  py-5 xs:px-10 xl:px-0 ">
      <v-btn
        v-if="!skeletonLoadingState || MyLocalContacts.length <= 0"
        variant="elevated"
        elevation="3"
        color="green"
        size="large"
        @click="toggleRegisterDialog"
      >
        ثبت مخاطب
        <v-icon left> mdi-plus </v-icon>
      </v-btn>
    </div>
    <div class="flex items-center !justify-center xl:!justify-end w-full bg-gray-500/20  mx-auto container lg:mx-0 ">
      <v-skeleton-loader v-if="skeletonLoadingState && MyLocalContacts.length > 0"
          type="button"
          color="transparent"
          class="w-32"
        >
        </v-skeleton-loader>
    </div>
<!-- 
  <div class=" flex-wrap justify-center gap-4  testAxios flex  " >
    <div class="flex justify-stretch rounded-lg bg-red-500/70 odd:bg-blue-500/70  gap-4" v-for="(item,index) in dataAxios" :key="index">
      <div class=" flex items-center gap-4 p-4 ">
        <img :src="item.avatar"  class=" w-26 rounded-full">
      <div class="i">
        <p>full name :<span class="text-black text-lg font-bold">{{ item.first_name + ' ' + item.last_name }}</span></p>
        <p>email: <span class="text-black text-lg font-bold">{{ item.email }}</span></p>
      </div>
      </div>
    </div>
  </div> -->

  <div>
    <h1>User Registration</h1>
    <form @submit.prevent="registerUser">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <div v-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
    </div>
    <div v-if="successMessage" class="success">
      <p>{{ successMessage }}</p>
    </div>
  </div>


  <div class="bg-pink-600 p-5">
    <h1 class="text-center text-black text-xl font-bold">Users List</h1>
    <ul v-if="users.length > 0" class="flex flex-col gap-5 ">
      <li v-for="user in users" :key="user.id" class="last-of-type:border-none border-b-2 border-black border-spacing-9">
        <p>Username: {{ user.username }}</p>
        <p>Email: {{ user.email }}</p>
      </li>
    </ul>
    <p v-else>No users found.</p>
  </div>



  <v-navigation-drawer
        v-model="drawer"
        temporary
        class="fixed left-0 top-0"
      >
        <v-list-item
          prepend-avatar="../assets/rose_ai.jpg"
          title="Hasan Barati"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-view-dashboard"
           title="سرور" value="home" @click.stop="byLocalStorage = true" :class="byLocalStorage ? 'bg-gray-800/40' : ''"></v-list-item>
          <v-list-item prepend-icon="mdi-forum" title="مرورگر"
           value="about" @click.stop="byLocalStorage = false" :class="!byLocalStorage ? 'bg-gray-800/40' : ''"></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 250px">
        <div class="d-flex justify-center align-center h-100">

        </div>
      </v-main>
  

  </div>

  <Forms
        v-model:modelState="dialogRegisterState"
        title="ثبت مخاطب"
        :registerMode="true"
        :getData="getData"

      />
      <!-- :getData="getData()" -->

  <Forms
    v-model:model-state="dialogEditState"
    title="ویرایش مخاطب"
    :editMode="true"
    :currentID="selectedContact.id"
    :allFormsFields="selectedContact"
    :getData="getData"

  />




</template>

<style scoped>
.mainContent {
  background-image: url(../assets/test.jpg);
  background-position: center;
}

</style>

<style>
.tableHeadings {
  background-color: red;
  padding: 20px;
}
.the_table {
  filter: drop-shadow(4px 4px 5px #777575);
  direction: rtl;
}
.swal2-actions {
  flex-direction: row-reverse !important;
}
</style>
