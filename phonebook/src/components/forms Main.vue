<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
    class="bg-teal-400/5 "
    :persistent="changePresistance"
  >
    <template
      #activator="{ props: activatorProps }"
    >
      <v-btn
        class="text-none font-weight-regular"
        prepend-icon="mdi-account"
        text="ویرایش"
        variant="flat"
        v-bind="activatorProps"
        @click="openMyDialog(item,type)"
      />
    </template>

    <v-card
      prepend-icon="mdi-account"
      :title="props.title"
      class="items-end "
    >
      <v-card-text class="text-right bg-gray-700 w-full  ">
        <v-row
          class=" justify-end   "
        >
          <v-col
            cols="12"
            md="4"
            sm="6"
            class=""
          >
            <v-text-field
              :v-model="props.phoneModel"
              label="شماره تلفن"
            />
          </v-col>

          <v-col
            cols="24"
            md="4"
            sm="6"
          >
            <v-text-field
              :v-model="props.fullname"
              label="نام و نام خانوادگی"
            />
          </v-col>
          <v-col cols="8">
            <v-text-field
              :v-model="props.birthDate"
              type="date"
              label="انتخاب تاریخ تولد"
            />
          </v-col>

          <v-col
            cols="8"
            class="d-flex justify-end"
          >
            <v-switch
              :v-model="props.isCoworker"
              color="primary"
            >
              <template #label>
                <span class="text-gray-100 text-lg font-bold">همکار</span>
              </template>
            </v-switch>
          </v-col>
        </v-row>
        <v-col
          cols="12"
          class="mb-2 flex justify-start  "
        >
          <v-row class="gap-4 justify-end">
            <v-btn
              variant="flat"
              color="red"
              @click="cancelDialog()"
            >
              انصراف
            </v-btn>

            <v-btn
              v-if="dialogMode === 'edit'"
              :loading="loading"
              variant="flat"
              color="green"
              @click="UpdateDialog(id)"
            >
              اعمال تغییرات
            </v-btn>

            <v-btn
              v-if="dialogMode === 'register'"
              :loading="loading"
              variant="flat"
              color="green"
              @click="submitData(item)"
            >
              ثبت مخاطب
            </v-btn>
          </v-row>
        </v-col>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup>
import {ref} from 'vue';
const dialog=ref(false)
const props = defineProps({
  title: String,
  changePresistance: Boolean,
  phoneModel:String,
  fullname:String,
  birthDate:String,
  isCoworker:Boolean,
  openMyDialog : Function,
  UpdateDialog:Function,
  submitData:Function,
})

const cancelDialog = () => {
  dialog.value = false;
}

</script>
<style scoped>
</style>