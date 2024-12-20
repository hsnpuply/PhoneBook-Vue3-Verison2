<script setup>
import {reactive, ref,watch} from 'vue'
const props = defineProps({
    drawer:Boolean,
    contactsPreview:String,
    changePreviewStatus:Function,
    server_1_Contacts:Array,
    localContacts:Array

})

const state=reactive({
    contacts:{
        contactsPreview:props.contactsPreview
    },
    toggle:{
        drawer:props.drawer
    }
})

const emit = defineEmits([
  "update:drawer",
 
]);

const toggleDrawer = ()=>{
    state.toggle.drawer= false
    emit("update:drawer", state.toggle.drawer); 
}

watch(() => props.contactsPreview,(newVal)=>{
  state.contacts.contactsPreview=newVal;
})

const themeChanger = (item) => {
  switch (item) {
    case 'سبز':
      return 'bg-gradient-to-t from-[#ebf1ef] to-[#a8e6cf]'; // ترکیب سبز روشن و سبز ملایم
    case 'آبی':
      return 'bg-gradient-to-t from-[#ebf0f1] to-[#87ceeb]'; // ترکیب آبی آسمانی و آبی دریایی
    case 'بنفش':
      return 'bg-gradient-to-t from-[#edebf1] to-[#e1abf7]'; // ترکیب بنفش عمیق و بنفش ملایم
    case 'زرد':
      return 'bg-gradient-to-t from-[#fcfbfa] to-[#f7da63]'; // ترکیب زرد خورشیدی و زرد طلایی
  }
};

const themeItems = ref(['آبی', 'سبز', 'زرد', 'بنفش'])

const PickedTheme = ref('سبز')


</script>
<template>
        <v-navigation-drawer v-model="props.drawer"  temporary class=" select-none fixed duration-[580ms] h-[100vh] left-0 top-0 " 
        :class="themeChanger(PickedTheme) || 'bg-gradient-to-t from-[#ebf1ef] to-[#a8e6cf]'"
      :width="500">
      <v-list-item class="bg-[#f2faf5] h-16  shadow-sm shadow-sky-600/20 ">
        <div class="headerDrawer    ">
          <div class="headerContainer flex items-center justify-between w-full ">
            <div class="closeDrawer text-[#19a44c] bg-[#9ad7b1] font-extrabold rounded-md cursor-pointer
               px-2 py-1 text-center text-sm select-none flex items-center justify-center text-lg"
              @click.stop="toggleDrawer">
              <v-icon icon="mdi-close"></v-icon>

            </div>
            <div class="titleHeader">
              <h2 class="text-[#38ac67] text-lg font-semibold">تنظیمات کاربری</h2>
            </div>
          </div>
        </div>
      </v-list-item>

      <v-divider></v-divider>

      <div class="settingsImage mt-8 mb-10 flex items-center justify-center">
        <img src="@/assets/settingsDrawer.jpg" title="تنظیمات کاربری" class="w-[42%] rounded-lg shadow-sm shadow-black">
      </div>
      <div class="listSettings  py-8   flex flex-col gap-5 px-12">
        <div class="apperanceSettings ">
          <div class="settingsTitle text-right">
            <h3 class="text-xl font-semibold text-[#58b97f]"><span class="text-gray-600 select-none ">__ </span> ظاهر
              <span class=" select-none text-gray-600"> __</span>
            </h3>
          </div>
          <div class="apperanceSettingsList flex items-center justify-between  ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-xl my-6">
              <span class="text-green-700 bg-green-300 px-[.9rem] text-2xl py-1 rounded-full select-none">?

                <v-tooltip activator="parent" location="top">انتخاب رنگ قالب</v-tooltip>
              </span>
              <span class="text-black font-semibold">انتخاب قالب :</span>
            </div>
            <div class="selectTheme">
              <v-select :items="themeItems" v-model="PickedTheme" class="w-28 text-right " label="رنگ" bg-color="white" variant="outlined" />
            </div>
          </div>
          <div class="animationSettings flex items-ceneter justify-between ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-xl my-6 ">
              <span class="text-green-700 bg-green-300 px-[.9rem] text-2xl py-1 rounded-full select-none">
                <v-tooltip activator="parent" location="top">
                  فعال کردن انیمیشن ها
                </v-tooltip>
                ?</span>
              <span class="text-black font-semibold">انیمیشن :</span>
            </div>
            <div class="animationSwitchButton flex justify-center items-center ">
              <v-switch color="success" ripple class=" flex switchBtn " />
            </div>
          </div>
        </div>
        <div class="contentSettings">
          <div class="settingsTitle text-right">
            <h3 class="text-xl text-[#58b97f] font-semibold"><span class="text-gray-600 select-none ">__ </span> نحوه
              ذخیره سازی
              مخاطبین <span class=" select-none text-gray-600"> __</span></h3>
          </div>
          <div class="storagesButtons flex flex-col gap-4 mt-5 ">
  
            <div class="webBroweser">
              <v-btn class="text-right w-full md:w-3/4 " size="x-large"
              :variant="state.contacts.contactsPreview == 'LocalStorage' ? 'elevated' : 'outlined'"
              :color="state.contacts.contactsPreview == 'LocalStorage'? 'green' : 'black'"
              @click.stop="props.changePreviewStatus('LocalStorage')" prepend-icon="mdi mdi-web">مرورگر
                <v-tooltip activator="parent" location="top">مخاطبین در مرورگر شما ذخیره میشود و تازمانی که شما ذخیره
                  ساز محلی را پاک نکنید مخاطبین باقی میمانند</v-tooltip>
              </v-btn>
            </div>
            <div class="server_1">
              <v-btn
                class="text-right w-full md:w-3/4 " size="x-large"
                :variant="state.contacts.contactsPreview == 'Server' ? 'elevated' : 'outlined'"
                 :color="state.contacts.contactsPreview == 'Server'? 'green' : 'black'"
                @click.stop="props.changePreviewStatus('Server')" prepend-icon="mdi mdi-server"> سرور
                <v-tooltip activator="parent" location="bottom">مخاطبین در سرور شماره یک ذخیره میشوند</v-tooltip>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

    </v-navigation-drawer>

</template>
<style></style>