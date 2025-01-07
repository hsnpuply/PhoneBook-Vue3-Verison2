<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { convertNumbersToPersian as PersianNumberConvertorX } from "@/utilities/functions";
import moment from "moment-jalaali";
import draggable from "vuedraggable";
import Swal from "sweetalert2";


const props = defineProps({
  data: Array,
  DeleteContacts: Function,
  toggleEditForm: Function,
  getData:Function,
  columnOrder: Array,

}); 

const fieldsMapping = {
  "شماره": "index",
  "پروفایل": "avatar",
  "نام و نام خانوادگی": "fullname",
  "شماره تلفن": "phoneNumber",
  "تاریخ تولد": "selectedDate",
  "همکار": "isCoworker",
  "مهارت ها": "skills",
  "علاقه مندی ها": "favorites",
  "عملیات": "actions"
};
const emit = defineEmits(['update:data']);


// Reactive list to track updates
const localData = ref([...props.data]);

watch(localData, (newValue) => {
  emit('update:data', newValue);

});

// Watch for changes in props.data (from parent)
watch(() => props.data, (newValue) => {
  localData.value = [...newValue];
}, { deep: true, immediate: true });

// Watch for reorder and emit changes to parent
watch(localData, (newValue) => {
  emit('update:data', newValue);
}, { deep: true });
const saveOrderLocal = ()=>{
  switch(localStorage.getItem("Preview Status")){
    case 'LocalStorage':
    localStorage.setItem("contacts", JSON.stringify(localData.value));
    break;
    case 'Server':
      // console.log('lols');
      
      break;
    
  }
}

const is_expanded =ref(false)

// Reactive object to track expanded rows
const expandedRows = reactive({});

const toggle_expand = (id) => {
  expandedRows[id] = !expandedRows[id]; // Toggle expansion for the specific row
};
const formatPhoneNumber = (number) => {
  if (!number) return "";
  return number.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
};
const copyToClipboard = (number) => {
  navigator.clipboard.writeText(number)

      Swal.fire({
        icon: "success",
        title: "کپی شد",
        toast: true,
        position: "top",  // Top-right corner
        showConfirmButton: false,
        timer: 1000,
        color: "green",
        background: "#dddbdb",
        timerProgressBar: true,
      })

};
</script>
<template>

<draggable v-model="localData" group="allContacts" @end="saveOrderLocal" tag="tbody" class=" select-none text-xl bg-[#dddbdb] text-[#333333] cursor-grab">
    <template #item="{ element, index }">
      <tr :class="expandedRows[element.id] ? '!h-[200px] ' : ''"
          class="relative ease-in-out overflow-hidden h-[100px] text-right hover:!bg-[#4c749f] hover:text-white duration-150 even:bg-gray-200 even:!bg-[#e0c083] bg-gray-400/50 !bg-[#f8f1e5] hover:bg-sky-900/60">
        <td v-for="(col, i) in columnOrder" :key="i">
          <template v-if="fieldsMapping[col] === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'avatar'">
            <v-avatar variant="elevated" class="!h-20 !w-20 my-2" :image="element.avatar" />
          </template>
          <template v-else-if="fieldsMapping[col] === 'selectedDate'">
            {{ PersianNumberConvertorX(moment(element.selectedDate).format("jYYYY/jMM/jDD")) }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'phoneNumber'">
            <span class="cursor-pointer hover:underline" @click="copyToClipboard(element.phoneNumber)">
              {{ PersianNumberConvertorX(formatPhoneNumber(element.phoneNumber)) }}
            </span>
          </template>
          <template v-else-if="fieldsMapping[col] === 'isCoworker'">
            {{ element.isCoworker ? "بله" : "خیر" }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'skills'">
            <p class="max-w-20 max-h-5 overflow-hidden " :class="expandedRows[element.id] ? 'max-w-28 transition-[max-height] ease-in-out !max-h-[300px] !duration-500' : ''">
              {{ element.skills.join(" , ") }}
            </p>
          </template>
          <template v-else-if="fieldsMapping[col] === 'favorites'">
            <p class="max-w-20 max-h-20 overflow-hidden " :class="expandedRows[element.id] ? 'max-w-28  transition-[max-height] ease-in-out !max-h-[300px]  !duration-500' : ''">
              {{ element.favorites.join(" , ") }}
            </p>
          </template>
          <template v-else-if="fieldsMapping[col] === 'actions'">
            <div class="actionButtonsContainer flex gap-16 items-center justify-center">
              <!-- <v-btn variant="elevated" elevation="2" prepend-icon="mdi-delete" @click="props.DeleteContacts(element.id, props.data)"
                class="bg-red-600/90 hover:bg-red-600/95">
              </v-btn> -->
              <v-icon color="black" @click="props.toggleEditForm(element)" >mdi-pencil</v-icon>
              <v-icon color="red" class="hover:bg-red-500/80  rounded-full " @click="props.DeleteContacts(element.id, props.data)" >mdi-delete</v-icon>
              <!-- <v-btn variant="elevated" color="blue" prepend-icon="mdi-pen" @click="props.toggleEditForm(element)"
                class="bg-sky-600/90 hover:bg-sky-600/95">
              </v-btn> -->
            </div>
          </template>
          <template v-else>
            {{ Array.isArray(element[fieldsMapping[col]]) ? element[fieldsMapping[col]].join(", ") : element[fieldsMapping[col]] }}
          </template>
        </td>

        <!-- Display the expand toggle button only if the 'skills' array has more than 2 items -->
        <div v-if="element.skills && element.skills.length > 2" class="expand_toggle py-2 absolute -bottom-6 right-[45%]" @click="toggle_expand(element.id)">
          <v-btn icon="mdi-arrow-down" :class="expandedRows[element.id] ? 'rotate-180' : ''">
          </v-btn>
        </div>
      </tr>
    </template>
  </draggable>
</template>
<style></style> 
