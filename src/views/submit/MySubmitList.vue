<template>
    <v-container class="container">

        <v-row class="mb-12 mt-4" style="padding-left:30px">
            <h1>결재 요청 문서</h1>
        </v-row>

        <v-row no-gutters class="mb-4 justify-end">
            <!-- <v-col cols="9">
                <v-text-field v-model="searchQuery" variant="underlined" placeholder="검색어를 입력하세요"
                    append-icon="mdi-magnify" @click:append=searchFilter(searchQuery) style=""></v-text-field>
            </v-col> -->

            <v-col cols="auto">
                <v-btn v-create @click="$router.push('/submit')">
                    결재 생성
                </v-btn>
            </v-col>
        </v-row>


        <!-- 문서 리스트 -->
        <div v-if="this.submitList == null">
            <v-row justify="center">
                데이터가 존재하지 않습니다.
            </v-row>
        </div>


        <div v-if="this.submitList.length > 0">
            <v-row justify="center" style="margin:0; text-align:center; ">
                <v-col cols="12">
                    <v-row class="mb-2"
                        style="background-color:rgba(122,86,86,0.2); border-radius:12px; padding:4px; color:#444444; font-weight:600;">
                        <v-col cols="1"><strong>번호</strong></v-col>
                        <v-col cols="5"><strong>결재 종류</strong></v-col>
                        <v-col cols="4"><strong>결재 신청 일시</strong></v-col>
                        <v-col cols="2"><strong>결재 상태</strong></v-col>
                    </v-row>

                    <v-row v-for="(submit, index) in submitList" :key="submit.id" oulined
                        style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500"
                        @click="showDetail(submit.id)">
                        <v-col cols="1">{{ index + 1 }}</v-col>
                        <v-col cols="5">{{ submit.submitType }}</v-col>
                        <v-col cols="4">{{ formatDate(submit.submitTime) }} {{ formatLocalTime(submit.submitTime)
                            }}</v-col>
                        <v-col cols="2" class="d-flex justify-center align-center">
                            <v-chip v-if="submit.submitStatus === '반려'" color="red">
                                {{ submit.submitStatus }}
                            </v-chip>
                            <v-chip v-else-if="submit.submitStatus === '승인'" color="green">
                                {{ submit.submitStatus }}
                            </v-chip>
                            <v-chip v-else color="gray">
                                {{ submit.submitStatus }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </div>

        <div v-else>
            <v-row justify="center" :class="{ 'drawer-open': drawer }">
                데이터가 존재하지 않습니다.
            </v-row>
        </div>
        <!-- 
    <div class="pagination-controls">
        <button @click="goToPage(page - 1)" :disabled="page === 1">
            <v-icon>{{ 'mdi-chevron-left' }}</v-icon>
        </button>
        <span> {{ page }} / {{ totalPages }}</span>
        <button @click="goToPage(page + 1)" :disabled="page === totalPages">
            <v-icon>{{ 'mdi-chevron-right' }}</v-icon></button>
    </div> -->

        <!-- 상세 정보 -->
    </v-container>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,
            submitList: [],
            isMySubmitReq: true,
        }
    },
    mounted() {
        this.fetchMySubmits();
    },
    methods: {
        async fetchMySubmits() {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/submit/list/my`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                this.submitList = response.data.result;

            } catch (e) {
                console.error('결재 요청 정보를 가져오는 중 오류 발생:', e);
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        },
        showDetail(submitId) {
            this.$router.push({ name: 'SubmitDetailComponent', params: { submitId: submitId }, query: { isMySubmitReq: this.isMySubmitReq } })
            this.selectedSubmitId = submitId;
        },

    },
}
</script>
<style scoped>
.container {
    padding: 20px;
    border-radius: 12px;
}

.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.drawer-open {
    transition: margin-right 0.3s ease;
    margin-right: 200px;
}

.v-card>.v-navigation-drawer {
    padding-top: 8vh;
}

.v-card-title {
    padding: 0;
}

v-card-title,
.v-card-subtitle {
    display: flex;
    align-items: center;
}

.v-tabs-window {
    margin: 50px;
}

.v-avatar img {
    object-fit: cover;
}

.v-card-text {
    margin-bottom: 20px;
}


.detailFileName {
    font-size: 20px;
    margin: 20px 0 0;
}

.fileName {
    font-size: 13px;
    margin: 10px;
}

.userName {
    font-size: 13px;
}

.fileModifiedDate {
    font-size: 10px;
}

.v-timeline--vertical.v-timeline {
    row-gap: 0;
}

.v-divider {
    margin: 20px 0;
}

.searchButton {
    display: flex;
    justify-content: center;
    align-content: center;
}
</style>