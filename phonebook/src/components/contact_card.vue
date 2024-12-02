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
    class="cardContainer bg-gray-500 rounded-md shadow-black shadow-sm min-h-[120px] min-w-[300px]"
  >
    <div class="cardInfo flex flex-col justify-center items-center">
      <div class="cardHeaderInfo my-8 flex flex-col gap-3 justify-center items-center">
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
      <div class="cardSecondaryInfo text-center">
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
    </div>
  </div>
</template>
<style scoped>
.cardContainer {
  direction: rtl;
}
</style>
