<template>
  <v-container class="mt-5">
    <v-card v-if="dataLoaded || isRegisterMode" class="mx-auto" max-width="800">
      <v-card-title>
        <div v-if="isEditMode" class="text-right">
          <v-btn @click="deleteUser()" class="red--text">삭제</v-btn>
        </div>
        <h3 v-if="isEditMode">직원 수정</h3>
        <h3 v-else-if="isDetailMode">직원 세부 정보</h3>
        <h3 v-else>직원 등록</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.userNum" label="사번" :readonly="isEditMode || isDetailMode" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.name" label="이름" :readonly="isDetailMode" required />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.departmentId"
                :items="departmentOptions"
                item-title="name"
                item-value="id"
                label="부서"
                :disabled="isDetailMode"
                v-if="departmentOptions.length > 0"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.positionId"
                :items="positionOptions"
                item-title="name"
                item-value="id"
                label="직급"
                :disabled="isDetailMode"
                v-if="positionOptions.length > 0"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.email" label="이메일" :readonly="isDetailMode" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.phone" label="전화번호" :readonly="isDetailMode" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.hireType"
                :items="hireTypeOptions"
                label="고용 유형"
                :disabled="isDetailMode"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.annualLeave" label="잔여 휴가" :readonly="isDetailMode" />
            </v-col>

            <v-col cols="12">
              <v-btn @click="openAdminCodeDialog" color="primary" v-if="!isDetailMode">세부 정보 조회</v-btn>
            </v-col>

            <v-col cols="12">
              <v-file-input
                label="프로필 이미지 업로드"
                v-model="userDetail.profileImage"
                accept="image/*"
                @change="onFileChange"
              />
              <v-img v-if="previewImageSrc" :src="previewImageSrc" max-width="200" />
            </v-col>

            <v-col cols="12" class="d-flex justify-space-between">
              <v-btn @click="goBack" outlined>목록으로</v-btn>
              <v-btn v-if="!isDetailMode" type="submit" color="primary">{{ isEditMode ? '수정 완료' : '등록 완료' }}</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="isAdminDialogOpen" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">관리자 코드 입력</v-card-title>
        <v-card-text>
          <v-text-field label="관리자 코드" v-model="adminCode" type="password" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="checkAdminCode">확인</v-btn>
          <v-btn color="secondary" @click="closeAdminDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card v-if="isAdmin && !isDetailMode" class="mt-5">
      <v-card-title>세부 정보</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="userDetail.password" label="비밀번호" type="password" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="userDetail.address" label="주소" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="userDetail.socialNum" label="주민등록번호" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeForm",
  data() {
    return {
      userDetail: {
        userNum: '',
        name: '',
        departmentId: null,
        positionId: null,
        email: '',
        phone: '',
        profileImage: '',
        hireType: '',
        annualLeave: 0,
        password: '',
        address: '',
        socialNum: '',
      },
      departmentOptions: [],
      positionOptions: [],
      hireTypeOptions: ['정규직', '계약직', '인턴', '파트타임'],
      previewImageSrc: null,
      isEditMode: false,
      isDetailMode: false,
      isRegisterMode: false,
      dataLoaded: false,
      isAdmin: false,  // 관리자 코드 입력 성공 여부
      isAdminDialogOpen: false,  // 관리자 코드 입력 Dialog 상태
      adminCode: '',  // 입력한 관리자 코드
      correctAdminCode: '12341234',  // 실제 관리자 코드
    };
  },
  methods: {
    setModeBasedOnRoute() {
      const routeName = this.$route.name;
      if (routeName === 'employee-edit') {
        this.isEditMode = true;
        this.isDetailMode = false;
        this.isRegisterMode = false;
      } else if (routeName === 'employee-detail') {
        this.isEditMode = false;
        this.isDetailMode = true;
        this.isRegisterMode = false;
      } else {
        this.isEditMode = false;
        this.isDetailMode = false;
        this.isRegisterMode = true;
      }
    },
    async fetchUserDetail() {
      const userNum = this.$route.params.userNum;
      if (!userNum) return;
      try {
        const response = await axios.get(`/user/list/${userNum}`);
        if (response.data) {
          this.userDetail = {
            ...response.data,
            departmentId: response.data.departmentId || null,
            positionId: response.data.positionId || null,
          };
          this.previewImageSrc = response.data.profileImage || null;
        }
        this.dataLoaded = true;
      } catch (error) {
        console.error("직원 정보를 불러오는 중 오류가 발생했습니다:", error);
      }
    },
    async fetchDepartments() {
      try {
        const response = await axios.get('/department');
        this.departmentOptions = response.data;
      } catch (error) {
        console.error('부서 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
    async fetchPositions() {
      try {
        const response = await axios.get('/positions');
        this.positionOptions = response.data;
      } catch (error) {
        console.error('직급 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (files && files.length > 0) {
        this.userDetail.profileImage = files[0];
        this.previewImage();
      } else {
        this.userDetail.profileImage = null;
        this.previewImageSrc = null;
      }
    },
    previewImage() {
      if (this.userDetail.profileImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImageSrc = e.target.result;
        };
        reader.readAsDataURL(this.userDetail.profileImage);
      } else {
        this.previewImageSrc = null;
      }
    },
    openAdminCodeDialog() {
      this.isAdminDialogOpen = true;
    },
    closeAdminDialog() {
      this.adminCode = '';
      this.isAdminDialogOpen = false;
    },
    checkAdminCode() {
      if (this.adminCode === this.correctAdminCode) {
        this.isAdmin = true;
        this.isAdminDialogOpen = false;
        // 관리자 세부 정보를 서버로부터 가져옵니다.
        this.fetchAdminDetails();
      } else {
        alert('잘못된 관리자 코드입니다.');
      }
    },
    async fetchAdminDetails() {
      try {
        // 서버에서 관리자용 세부 정보를 가져오는 API를 호출합니다.
        const response = await axios.get(`/user/admin-details/${this.userDetail.userNum}`);
        if (response.data) {
          this.userDetail.password = response.data.password;
          this.userDetail.address = response.data.address;
          this.userDetail.socialNum = response.data.socialNum;
        }
      } catch (error) {
        console.error("관리자 세부 정보를 불러오는 중 오류가 발생했습니다:", error);
      }
    },
    async submitForm() {
  try {
    const formData = new FormData();
    formData.append('userNum', this.userDetail.userNum);
    formData.append('name', this.userDetail.name);
    formData.append('departmentId', this.userDetail.departmentId);
    formData.append('positionId', this.userDetail.positionId);
    formData.append('email', this.userDetail.email);
    formData.append('phone', this.userDetail.phone);
    formData.append('hireType', this.userDetail.hireType);
    formData.append('annualLeave', this.userDetail.annualLeave);

    // 프로필 이미지가 있는 경우
    if (this.userDetail.profileImage) {
      formData.append('profileImage', this.userDetail.profileImage);
    }

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    };

    if (this.isEditMode) {
      await axios.put(`/user/list/${this.$route.params.userNum}`, formData, config);
      alert("수정 완료");
    } else {
      await axios.post("/user/register", formData, config);
      alert("등록 완료");
    }

    this.$router.push("/employee-management");
  } catch (error) {
    console.error("직원 정보를 저장하는 중 오류가 발생했습니다:", error);
    if (error.response) {
      alert(error.response.data.status_message);
    }
  }
},
    goBack() {
      this.$router.push("/employee-management");
    },
  },
  async mounted() {
    this.setModeBasedOnRoute();
    await this.fetchDepartments();
    await this.fetchPositions();
    if (this.$route.params.userNum) {
      await this.fetchUserDetail();
    }
  },
};
</script>

<style scoped>
.v-btn {
  margin-right: 10px;
}

.red--text {
  color: #f44336 !important;
}
</style>
