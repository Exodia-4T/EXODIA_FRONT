<template>
  <aside class="sidebar">
    <div class="menu">

      <!-- 로고 -->
      <div class="logo" @click="$router.push('/')">
        <img :src="require('@/assets/exodia_new.png')" alt="Logo" />
      </div>

      <!-- 사이드: 파일 관리 -->
      <div class="menu-item" @click="toggleMenu('document')" :class="{ 'active': $route.path.startsWith('/document') }"
        @mouseover="showSubSidebar('document')">
        <v-icon class="icon">mdi-folder-file-outline</v-icon>
        <span>파일 관리</span>
      </div>
      <!-- <div class="menu-item" @click="toggleMenu('document')" :class="{ 'active': $route.path.startsWith('/document') }"
        @mouseover="showSubSidebar('document')">
        <v-icon class="icon">mdi-folder-file-outline</v-icon>
        <span>파일 관리</span>
      </div> -->

      <!-- 서브사이드: 파일 관리 -->
      <div v-show="expandedMenu === 'document' || hoveredMenu === 'document'" class="sub-side-menu">
        <v-row @click="$router.push('/document')">
          전체 파일
        </v-row>
        <v-row @click="$router.push('/document/list/updated')">
          최근 수정 파일
        </v-row>
        <v-row @click="$router.push('/document/list/viewed')">
          최근 조회 파일
        </v-row>
      </div>

      <!-- 사이드: 결재 -->
      <div class="menu-item" @click="toggleMenu('submit')" :class="{ 'active': $route.path.startsWith('/submit') }"
        @mouseover="showSubSidebar('submit')">
        <v-icon class="icon">mdi-pencil-box</v-icon>
        <span>전자 결재</span>
      </div>

      <!-- 서브사이드: 결재 -->
      <div v-show="expandedMenu === 'submit' || hoveredMenu === 'submit'" class="sub-side-menu">
        <v-row @click="$router.push('/submit/list')">
          결재 할 문서
        </v-row>
        <v-row @click="$router.push('/submit/list/my')">
          결재 요청 문서
        </v-row>
      </div>

      <!-- 사이드: 예약 -->
      <div class="menu-item" @click="toggleMenu('reservation')"
        :class="{ 'active': $route.path.startsWith('/reservation/reservationList') }"
        @mouseover="showSubSidebar('reservation')">
        <v-icon class="icon">mdi-timer-sand</v-icon>
        <span>예약</span>
      </div>

      <!-- 서브사이드: 예약 -->
      <div v-show="expandedMenu === 'reservation' || hoveredMenu === 'reservation'" class="sub-side-menu">
        <v-row @click="$router.push('/reservation/meetReservationList')">
          회의실 예약
        </v-row>
        <v-row @click="$router.push('/reservation/reservationList')">
          법인 차량 예약 </v-row>
      </div>

      <div v-on:mouseleave="hideSubsidebar()">
        <!-- 사이드: 게시판 -->
        <div class="menu-item" @click="toggleMenu('board')" :class="{ 'active': $route.path.startsWith('/board') }"
          @mouseover="showSubSidebar('board')">
          <v-icon class="icon">mdi-format-list-bulleted</v-icon>
          <span>게시판</span>
        </div>

        <!-- 서브사이드: 게시판 -->
        <div v-show="expandedMenu === 'board' || hoveredMenu === 'board'" class="sub-side-menu">
          <v-row @click="$router.push('/board/notice/list')">공지사항</v-row>
          <v-row @click="$router.push('/board/familyevent/list')">경조사</v-row>
          <v-row @click="$router.push('/qna/list')">질의 응답 (Q&A)</v-row>
          <v-row @click="$router.push('/board/courseList')">강의리스트</v-row>
        </div>
      </div>



      <!-- 사이드: 화상 회의 -->
      <div class="menu-item" @click="toggleMenu('video')" :class="{ 'active': $route.path.startsWith('/video') }"
        @mouseover="showSubSidebar('video')">
        <v-icon class="icon">mdi-video</v-icon>
        <span>화상회의</span>
      </div>

      <!-- 서브사이드: 화상 회의 -->
      <div v-show="expandedMenu === 'video' || hoveredMenu === 'video'" class="sub-side-menu">
        <!-- 디자인 때문에 임의로 v-btn 제거 -->
        <v-row @click="$router.push('/video/create')">
          화상 회의 생성
        </v-row>
        <v-row @click="$router.push('/video/rooms')">
          화상 회의 목록
        </v-row>
      </div>


      <!-- 사이드: 조직도 -->
      <div class="menu-item" @click="toggleMenu('organization')"
        :class="{ 'active': $route.path.startsWith('/organization') }" @mouseover="showSubSidebar('borganizationoard')">
        <v-icon class="icon">mdi-account-group</v-icon>
        <span>조직도</span>
      </div>

      <!-- 사이드: 직원관리 -->
      <div v-if="isHrDepartment" class="menu-item" @click="toggleMenu('employee-management')"
        :class="{ 'active': $route.path.startsWith('/employee-management') }"
        @mouseover="showSubSidebar('employee-management')">
        <v-icon class="icon">mdi-account-cog</v-icon>
        <span>직원 관리</span>
      </div>
      <!-- 서브사이드: 직원관리 -->
      <div
        v-show="expandedMenu === 'employee-management' || hoveredMenu === 'employee-management' || hoveredMenu === 'salary-management' || hoveredMenu === 'department-management' || hoveredMenu === 'eventList'"
        class="sub-side-menu">

        <v-row @click="$router.push('/employee-management')">직원 목록</v-row>
        <v-row @click="$router.push('/salary-management')">급여 관리</v-row>
        <v-row @click="$router.push('/eventList')">일정 관리</v-row>
        <v-row @click="$router.push('/department-management')">부서 관리</v-row>
        <!-- <v-row style="font-weight:700; font-size:16px;">
          직원 관리
        </v-row>
        <v-row>
          <v-btn style="color:#ffffff" @click="$router.push('/employee-management/create')">
            직원 등록
          </v-btn>
        </v-row>
        <v-row @click="$router.push('/employee-management')">
          직원 목록
        </v-row>
        <v-row style="font-weight:700; font-size:16px;" @click="$router.push('/salary-management')">
          급여 관리
        </v-row>
        <v-row @click="$router.push('/eventList')" style="font-weight:700; font-size:16px;">
          일정 관리
        </v-row>
        <v-row style="font-weight:700; font-size:16px;" @click="$router.push('/department-management')">
          부서 관리
        </v-row> -->
      </div>
    </div>
  </aside>

</template>


<script>
// import axios from 'axios';

export default {
  name: 'AppSidebar',
  data() {
    return {
      token: localStorage.getItem('token') || null,

      isSubSidebarVisible: false,
      currentPage: '',
      isHrDepartment: false,
      selectedType: '',
      showProject: false,
      typeOptions: [],
      hoveredMenu: '',
      isHoveringSidebar: false,
      expandedMenu: null,

    };

  },
  methods: {
    toggleProjectVisibility() {
      this.showProject = !this.showProject;
      if (this.showProject) {
        this.fetchTypes();

      }
    },
    async fetchTypes() {
      try {
        // const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/list/types`, { headers: { Authorization: `Bearer ${this.token}` } });
        // this.typeOptions = response.data.result;
        // console.log(this.typeOptions)
        console.log("타입 리스트 수정필요");
      } catch (e) {
        console.error('문서 타입 가져오는 중 오류 발생:', e);
      }
    },
    // 처음 사이드바 나타냄
    showSubSidebar(menu) {
      this.hoveredMenu = menu;
      this.isSubSidebarVisible = true;
      this.isHoveringSidebar = true;
    },
    hideSubsidebar() {
      this.expandedMenu = null;
    },
    toggleMenu(menu) {
      this.expandedMenu = this.expandedMenu === menu ? null : menu;
      console.log(this.expandedMenu);
    },
  },

  watch: {
    $route(to) {
      this.currentPage = to.path;
      if (this.currentPage.startsWith('/employee-management') || this.currentPage.startsWith('/salary-management')) {
        this.isSubSidebarVisible = true;
      }
    }
  },
  mounted() {
    this.currentPage = this.$route.path;
    const departmentId = localStorage.getItem('departmentId');
    if (departmentId === '4') {
      this.isHrDepartment = true;
    }
  }
};
</script>

<style scoped>
:root {
  --sidebar-width: 7%;
  --sub-sidebar-width: 15%;
  --header-height: 60px;
}

*:not(.menu-itm) {
  background-color: #7A5656;
}

.v-row {
  cursor: pointer;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  top: 15vh;
  left: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-content: center;
  overflow-y: auto;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

.menu {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: center;
  height: 100%;
  padding-top: 20px;
}

.menu-item {
  color: #ffffff;
  transition: background-color 0.3s;
  width: 100%;
  padding: 20px;
  position: relative;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
}

.menu-item .icon {
  font-size: 20px;
  color: #ffffff;
  padding-right: 15px;
}


.menu-item.active {
  font-weight: 700;
}

.sub-side-menu {
  padding-left: 40px;
}

.sub-side-menu>.v-row {
  font-size: 14px;
  padding: 10px;
  color: #ffffff;
}

.logo img {
  height: 15vh;
}

.myp {
  width: 150px;
}

.mypage-item {
  margin: 20px;
  list-style-type: none;
  cursor: pointer;
  transition: margin 0.3s ease;
}

.mypage-item:hover {
  margin: 30px;
  margin-left: 40px;
  font-weight: 700;
}

.logo {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #7A5656;
  z-index: 100;
  cursor: pointer;
}
</style>