<template>
  <v-container class="board-container">
    <!-- Adjusted the title size and positioning -->
    <v-row class="mb-12" style="padding-left:30px" justify="space-between">
      <h1>질의 응답 ( {{ boardTitle }} )</h1>

      <!-- 매니저 관리 버튼 -->
      <v-col cols="auto" class="d-flex justify-end">
        <v-icon size="36" @click="openManagerModal">mdi-cog-outline</v-icon>
      </v-col>
    </v-row>

    <!-- 매니저 관리 모달 -->
    <v-dialog v-model="showManagerModal" max-width="800">
      <v-card>
        <v-card-title class="headline">매니저 관리</v-card-title>

        <v-card-text>
          <v-row>
            <!-- 유저 목록 -->
            <v-col cols="5">
              <h3>유저 목록</h3>
              <v-text-field v-model="userSearchQuery" label="유저 검색" @input="searchUsers"></v-text-field>
              <v-list>
                <v-list-item v-for="user in filteredUsers" :key="user.userNum">
                  <v-list-item-content>
                    {{ user.name }}
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn v-create @click="addManager(user)">추가</v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- 구분선 -->
            <v-divider vertical></v-divider>

            <!-- 매니저 목록 -->
            <v-col cols="5">
              <h3>매니저 목록</h3>
              <v-list>
                <v-list-item v-for="manager in managers" :key="manager.userNum">
                  <v-list-item-content>
                    {{ manager.name }}
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn v-delete @click="removeManager(manager)">삭제</v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-delete text @click="closeManagerModal">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row justify="center" align="center">
      <!-- 검색 범위 선택 -->
      <v-col cols="12" md="2">
        <v-select v-model="searchType" :items="searchOptions" variant="underlined" item-title="text" item-value="value"
          label="검색 범위" required></v-select>
      </v-col>

      <!-- 검색어 입력 -->
      <v-col cols="12" md="8">
        <v-text-field v-model="searchQuery" variant="underlined" label="검색어를 입력하세요." append-icon="mdi-magnify"
          @click:append="performSearch" required></v-text-field>
      </v-col>

    </v-row>
    <v-row justify="end">
      <v-col cols="12" md="3" class="d-flex justify-end">
        <v-btn v-create class="btn_write" @click="createNewPost">
          작성하기
        </v-btn>
        <v-btn v-list class="btn_my_questions" @click="goToMyQuestions">
          나의 질문 목록
        </v-btn>
      </v-col>
    </v-row>

    <!-- 게시글 목록 테이블 -->
    <v-row justify="center" class="mt-4">
      <v-col cols="12">
        <!-- 테이블 헤더에 상태 추가 -->
        <v-row class="mb-2 text-center"
          style="background-color:rgba(122, 86, 86, 0.2);border-radius:15px; padding:4px; color:#444444; font-weight:600;">
          <v-col cols="1"><strong>번호</strong></v-col>
          <v-col cols="7"><strong>제목</strong></v-col>
          <v-col cols="2"><strong>상태</strong></v-col>
          <v-col cols="2"><strong>작성일</strong></v-col>
        </v-row>

        <!-- 게시글 목록 데이터 -->
        <v-row v-for="(item, index) in boardItems" :key="item.id" class="board text-center" @click="goToDetail(item.id)"
          style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500; cursor:pointer">
          <v-col cols="1">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</v-col>
          <v-col cols="7" class="title-ellipsis text-start" style="max-width: 100%; display: inline-block;">
            {{ item.title }}
          </v-col>

          <v-col cols="2">
            <v-chip :color="item.answeredAt ? 'green' : 'red'" dark small>
              {{ item.answeredAt ? '답변완료' : '미답변' }}
            </v-chip>
          </v-col>
          <v-col cols="2">{{ formatDate(item.createdAt) }}</v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 페이지네이션 -->
    <v-pagination v-model="currentPage" :length="totalPages" @change="onPageChange" class="my-4"></v-pagination>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      boardItems: [], // 게시글 데이터
      currentPage: 1, // 현재 페이지
      totalPages: 1, // 총 페이지 수
      itemsPerPage: 10, // 페이지당 항목 수
      isAdmin: false, // 관리자인지 여부
      userNum: null, // 사용자 번호
      currentCategory: "", // 현재 카테고리
      boardTitle: "", // 게시판 제목
      showManagerModal: false, // 매니저 관리 모달 표시 여부
      users: [], // 전체 유저 목록
      filteredUsers: [], // 필터링된 유저 목록
      userSearchQuery: "", // 유저 검색 쿼리
      managers: [], // 매니저 목록

      // 검색 관련 변수
      searchType: "title + content",
      searchQuery: "",
      searchOptions: [
        { text: "전체", value: "title + content" },
        { text: "제목", value: "title" },
        { text: "내용", value: "content" },
      ],
    };
  },
  props: ["category"],
  watch: {
    currentPage() {
      this.fetchBoardItems();
    },
    category(newCategory) {
      this.currentCategory = newCategory;
      this.setBoardTitle();
      this.fetchBoardItems();
    },
  },
  created() {
    this.currentCategory = this.category || "NOTICE";
    this.checkUserRole();
    this.setBoardTitle();
    this.fetchBoardItems();
    this.userNum = localStorage.getItem("userNum");
  },
  methods: {
    // 사용자 권한 확인
    checkUserRole() {
      const departmentId = localStorage.getItem("departmentId");
      this.isAdmin = departmentId === "4";
      this.userNum = localStorage.getItem("userNum");
    },

    // 게시글 목록 가져오기
    async fetchBoardItems() {
      try {
        const params = {
          page: this.currentPage - 1,
          size: this.itemsPerPage,
          searchType: this.searchType,
          searchQuery: this.searchQuery || "",
        };
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/qna/list`;
        const response = await axios.get(apiUrl, { params });

        if (response.data && response.data.result) {
          const result = response.data.result;
          if (result && result.content) {
            this.boardItems = result.content.map(item => ({
              ...item,
              hasAnswer: item.answeredAt !== null, // answeredAt이 존재하면 true
            }));
            this.totalPages = result.totalPages;
          } else {
            this.boardItems = [];
            this.totalPages = 1;
          }
        }
      } catch (error) {
        this.boardItems = [];
        this.totalPages = 1;
        console.error("게시글 목록을 불러오는 중 오류가 발생했습니다:", error);
        alert("게시글 목록을 불러오는 중 문제가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.");
      }
    },

    // 유저 및 매니저 목록 가져오기
    async fetchUsersAndManagers() {
      try {
        const [userResponse, managerResponse] = await Promise.all([
          axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`),
          axios.get(`${process.env.VUE_APP_API_BASE_URL}/manager/list`),
        ]);

        const allUsers = userResponse.data;
        const managers = managerResponse.data;

        this.users = allUsers.filter(user => !managers.some(manager => manager.userNum === user.userNum));
        this.filteredUsers = [...this.users]; // 초기 상태에서 전체 유저 목록이 보이도록 설정
        this.managers = managers;
      } catch (error) {
        console.error("유저 및 매니저 목록을 불러오는 중 오류가 발생했습니다:", error);
        alert("유저 및 매니저 목록을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.");
      }
    },

    // 유저 검색
    async searchUsers() {
      try {
        const params = {
          search: this.userSearchQuery,
          searchType: "name",
        };
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/search`, { params });

        const searchedUsers = response.data;
        this.filteredUsers = searchedUsers.filter(
          user => !this.managers.some(manager => manager.userNum === user.userNum)
        );
      } catch (error) {
        console.error("유저 검색 중 오류가 발생했습니다:", error);
        alert("유저를 검색하는 중 문제가 발생했습니다. 검색어를 확인하고 다시 시도해주세요.");
      }
    },

    // 매니저 관리 모달 열기
    openManagerModal() {
      this.showManagerModal = true;
      this.fetchUsersAndManagers();
    },

    // 매니저 관리 모달 닫기
    closeManagerModal() {
      this.showManagerModal = false;
    },

    // 매니저 추가
    addManager(user) {
      axios
        .post(`${process.env.VUE_APP_API_BASE_URL}/manager/save`, { userNum: user.userNum })
        .then(response => {
          const addedManager = response.data;
          this.managers.push(addedManager);
          this.users = this.users.filter(u => u.userNum !== user.userNum);
          this.filteredUsers = this.filteredUsers.filter(u => u.userNum !== user.userNum);
          alert("매니저가 성공적으로 추가되었습니다.");
        })
        .catch(error => {
          console.error("매니저 추가 중 오류가 발생했습니다:", error);
          alert("매니저 추가 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    // 매니저 삭제
    removeManager(manager) {
      axios
        .delete(`${process.env.VUE_APP_API_BASE_URL}/manager/delete/${manager.userNum}`)
        .then(() => {
          this.users.push(manager);
          this.managers = this.managers.filter(m => m.userNum !== manager.userNum);
          this.filteredUsers.push(manager);
          alert("매니저가 성공적으로 삭제되었습니다.");
        })
        .catch(error => {
          console.error("매니저 삭제 중 오류가 발생했습니다:", error);
          alert("매니저 삭제 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    // 페이지 변경
    onPageChange(newPage) {
      this.currentPage = newPage;
      this.fetchBoardItems();
    },

    // 게시판 제목 설정
    setBoardTitle() {
      this.boardTitle = "Q&A";
    },

    formatDate(date) {
      return new Date(date)
        .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\.\s/g, '.') // 중간에 붙는 공백을 없앰
        .replace(/\.$/, ''); // 마지막에 붙는 '.'을 없앰
    },

    // 새 글 작성 페이지로 이동
    createNewPost() {
      this.$router.push({ name: "CreateQuestion" });
    },

    // 게시글 상세 페이지로 이동
    goToDetail(id) {
      this.$router.push({ name: "QnaDetail", params: { id } });
    },

    // 검색 실행
    performSearch() {
      this.currentPage = 1;
      this.fetchBoardItems();
    },

    // 나의 질문 목록으로 이동
    goToMyQuestions() {
      this.$router.push({ name: "UserQuestions" });
    },
  },
};
</script>

<style scoped>
.board-container {
  padding: 20px;
  border-radius: 12px;
}

.title-ellipsis {
  white-space: nowrap;
  /* 텍스트를 한 줄로 표시 */
  overflow: hidden;
  /* 넘치는 텍스트를 숨김 */
  text-overflow: ellipsis;
  /* 넘치는 부분을 '...'로 표시 */
}

.search-form {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

.v-select,
.v-text-field {
  flex: none;
  width: auto;
  margin-right: 20px;
}

.v-select .v-input__control,
.v-text-field .v-input__control {
  border: none;
  background: transparent;
}

.tbl_list {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0px;
}

.tbl_list th,
.tbl_list td {
  white-space: nowrap;
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #000000;
  transform: none;
  box-sizing: border-box;
  zoom: 1;
}

.tbl_list th {
  background-color: #f4f4f4;
  text-align: left;
}

.tbl_list td.text-left {
  text-align: left;
}

.tbl_list td.text-center {
  text-align: center;
}

.tbl_list td.text-right {
  text-align: right;
}

.tbl_list tr:hover {
  background-color: #ababab;
}

.btn_write {
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
}


.btn_my_questions {
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  margin-left: 10px;
}


.v-pagination {
  margin-top: 20px;
}

.v-pagination .v-pagination__item {
  border: none;
  color: #722121;
}

.v-pagination .v-pagination__item--active {
  font-weight: bold;
  background-color: #c5e1a5;
  color: white;
}

.btn_manager_management {
  background-color: #0056b3;
  color: #ffffff;
  margin-left: 20px;
}

.v-divider {
  height: 100%;
  width: 2px;
  background-color: #ddd;
}
</style>