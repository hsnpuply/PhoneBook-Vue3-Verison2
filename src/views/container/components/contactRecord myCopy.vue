<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { convertNumbersToPersian as PersianNumberConvertorX } from "@/utilities/functions";
import moment from "moment-jalaali";
import draggable from "vuedraggable";

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
      console.log('lols');
      
      break;
    
  }
}
</script>
<template>

  <draggable v-model="localData" group="allContacts" 
  @end="saveOrderLocal"
  tag="tbody"
   class="select-none text-xl  bg-[#dddbdb] text-[#333333] cursor-grab">
    <template #item="{ element, index }">
      <tr class="h-2 hover:h-[10rem]  relative text-right hover:!bg-[#4c749f] hover:text-white duration-150  even:bg-gray-200 even:!bg-[#e0c083] bg-gray-400/50 !bg-[#f8f1e5] hover:bg-sky-900/60">
        <td v-for="(col, i) in columnOrder" :key="i" class="">
          <template v-if="fieldsMapping[col] === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'avatar'">
            <v-avatar variant="elevated" class="!h-20 !w-20 my-2" :image="element.avatar" />
          </template>
          <template v-else-if="fieldsMapping[col] === 'selectedDate'">
            {{
              PersianNumberConvertorX(moment(element.selectedDate).format("jYYYY/jMM/jDD"))
            }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'isCoworker'">
            {{ element.isCoworker ? "بله" : "خیر" }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'actions'">
            <div class="actionButtonsContainer flex gap-2 items-center justify-center">
            <v-btn variant="elevated" elevation="2" prepend-icon="mdi-delete" @click="
              props.DeleteContacts(
                element.id,
                props.data
              )
              " class="bg-red-600/90 hover:bg-red-600/95">
              حذف
            </v-btn>
            <v-btn variant="elevated" color="blue" prepend-icon="mdi-account" @click="props.toggleEditForm(element)"
              class="bg-sky-600/90 hover:bg-sky-600/95">
              ویرایش
            </v-btn>
          </div>

          </template>
          <template v-else>
            {{ Array.isArray(element[fieldsMapping[col]]) ? element[fieldsMapping[col]].join(", ") : element[fieldsMapping[col]] }}
          </template>
        </td>
        <div class="group test absolute bottom-0 left-0 bg-black w-full text-center p-2">
        <span class="">Lorem ipsum dolor sit amet.</span>
        </div>
      </tr>
    </template>
    
  </draggable>
</template>
<style></style>
