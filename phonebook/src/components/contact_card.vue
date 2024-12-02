<script setup>
import { ref } from "vue";
import moment from "moment-jalaali";
import convertNumbersToPersian from "@/utilities/convertor.js";

// const phone = "09928717698";
// const persianNumber = convertNumbersToPersian(phone);

const props = defineProps({
  all_forms_fields: Object,
});
</script>
<template>
  <div
    class="cardContainer text-xl  my-3 bg-gray-500 rounded-md
     shadow-black shadow-sm   w-[370px] "
  >
    <div class="cardInfo flex flex-col justify-center items-cente ">

    <!-- phone Number - profile  -->
      <div class="cardHeaderInfo my-8 flex flex-col gap-3 bg-sky-500 justify-center items-center">
        <v-avatar
          variant="elevated"
          class="!h-20 !w-20 my-2"
          :image="all_forms_fields.avatar"
        />
        <div class="cardHeaderTitle text-2xl font-bold text-white">
          <h2>{{ all_forms_fields.fullname }}</h2>
        </div>
        <div class="cardHeaderNumber text-xl">
          <h3>{{ convertNumbersToPersian(all_forms_fields.phoneNumber) }}</h3>
        </div>
      </div>

      <!-- birthday - coworker -->
      <div class="cardSecondaryInfo bg-sky-400/20 text-center flex items-center  justify-around w-full flex-wrap">
        <div class="birthDate">
          <h4 class="text-blue-300">
            تاریخ تولد:
          </h4>
          <p>
            {{
              convertNumbersToPersian(
                moment(all_forms_fields.selectedDate).format("jYYYY/jMM/jDD")
              )
            }}
          </p>
        </div>
        <div class="coworker ">
          <h4 class="text-blue-300">همکار</h4>
          <p>{{ all_forms_fields.isCoworker ? 'بله' : 'خیر' }}</p>
        </div>
      </div>

      <!-- Favs , Skillz -->
      <div class="cardPersonalInfo flex flex-col gap-3 px-8 my-6">
        <div class="cardSkillsContact flex flex-col items-start gap-2">
        <h4 class=" text-blue-200 ">🛠️ مهارت ها</h4>
        <p>{{ all_forms_fields.skills.join(" , ") }}</p>
      </div>
      <div class="cardFavoritesContact felx flex-col gap-2">
      <h4 class=" text-blue-200 ">✨ علایق</h4>
      <p>{{ all_forms_fields.favorites.join(" ، ") }}</p>
      </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.cardContainer {
  direction: rtl;
}
</style>
