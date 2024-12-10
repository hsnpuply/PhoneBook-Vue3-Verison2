<script setup>
import { ref } from 'vue';
import moment from "moment-jalaali";
import { convertNumbersToPersian,deleteContact } from "@/utilities/functions";



const props = defineProps({
  all_forms_fields: Object,
  MyLocalContacts:Object,
  toggleEditDialog:Function,
  dialogEditState:Boolean,
  selectedContact:Object,
  currentItem:Object,
  deleteServerContact:Function,
  currentID:String,
  byLocalStorage:Boolean,
});

const myCurrentID = ref(props.currentID)


const emit = defineEmits(["update:dialogEditState"]);


const toggleMyEditDialog = () => {
  Object.assign(props.selectedContact, props.currentItem);
  emit("update:dialogEditState", true);
};

const deleteByMode = ()=>{
  console.log(props.currentItem)
  if(props.byLocalStorage){
  deleteContact(props.all_forms_fields.id,props.MyLocalContacts)
}else{
  props.deleteServerContact(props.currentItem.id)
  
}

}
</script>
<template>
  <div
    class="cardContainer relative hover:-translate-y-4
     duration-300 text-xl text-black px-8 my-3 bg-sky-500/60 
     rounded-md shadow-black shadow-sm min-w-80"
  >
    <div class="cardInfo flex flex-col justify-center items-center z-20">
      <!-- phone Number - profile  -->
      <div class="cardHeaderInfo my-8 flex flex-col gap-3 justify-center items-center">
        <v-avatar
          variant="elevated"
          class="!h-20 !w-20 my-2"
          :image="all_forms_fields.avatar"
        />
        <div class="cardHeaderTitle text-2xl font-bold">
          <h2>{{ all_forms_fields.fullname }}</h2>
        </div>
        <div class="cardHeaderNumber text-xl">
          <h3>{{ convertNumbersToPersian(all_forms_fields.phoneNumber) }}</h3>
        </div>
      </div>

      <!-- birthday - coworker -->
      <div
        class="cardSecondaryInfo text-center flex items-center justify-around w-full flex-wrap"
      >
        <div class="birthDate">
          <h4 class="text-white pb-1">تاریخ تولد:</h4>
          <p>
            {{
              convertNumbersToPersian(
                moment(all_forms_fields.selectedDate).format("jYYYY/jMM/jDD")
              )
            }}
          </p>
        </div>
        <div class="coworker">
          <h4 class="text-white pb-1">همکار</h4>
          <p>{{ all_forms_fields.isCoworker ? "بله" : "خیر" }}</p>
        </div>
      </div>

      <!-- Favs , Skillz -->
      <div class="cardPersonalInfo flex flex-col gap-3 px-8 mt-6 mb-20 w-full ">
        <div class="cardSkillsContact flex flex-col items-start gap-2 min-h-20">
          <h4 class="text-white ">🛠️ مهارت ها</h4>
          <p class="max-h-28 overflow-hidden" :title="all_forms_fields.skills.join(' - ')">{{ all_forms_fields.skills.join(" , ") }}</p>
        </div>
        <div class="cardFavoritesContact felx flex-col gap-2 ">
          <h4 class="text-white">✨ علایق</h4>
          <p>{{ all_forms_fields.favorites.join(" ، ") }}</p>
        </div>
      </div>
      <div
        class="cardActionButtons py-5 absolute  bottom-0 z-50 left-0 flex items-end justify-center gap-4  w-full"
      >
        <v-btn
          variant="elevated"
          color="blue"
          prepend-icon="mdi-account"
          class="bg-sky-600/90 hover:bg-sky-600/95"
          @click="toggleMyEditDialog()"
        >
          ویرایش
        </v-btn>
        <v-btn
          variant="elevated"
          elevation="2"
          prepend-icon="mdi-delete"
          @click="deleteByMode"
          class="bg-red-600/90 hover:bg-red-600/95"
        >
          حذف
        </v-btn>
      </div>
    </div>

  </div>
</template>
<style >
.cardContainer {
  position: relative;
  direction: rtl;
  background-size: cover;
  box-shadow: 2px 2px 8px #000;
}
</style>
