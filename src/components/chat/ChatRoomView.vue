<!-- 채팅방 하나의 화면 -->
<!--채팅방 나가기, 채팅방 내 메세지 검색 , 채팅구성원 확인, 채팅유저 초대, 채팅 파일 모아보기, 채팅 이미지 모아보기 -->
<!--채팅 날짜 구분해서 채팅메세지 불러오기 / 나와 구성원 구분하여 띄워주기 / 구성원 프로필사진 : 메세지-->
<!-- 채팅입력창, 파일 보내기, 이미지 보내기-->


<template>
    <v-container> <!--전체 채팅방 감싸요-->

        <!-- 채팅방 상단 -->
        <v-app-bar>
            <template>
                <v-btn> back </v-btn> <!-- 채팅방리스트로돌아감 -->
            </template>
            <v-app-bar-title>{{ chatRoomId }}</v-app-bar-title> <!-- 채팅방 이름 -->
            <template>
                <v-form>
                    <v-text-field placeholder="채팅방 내 검색"></v-text-field>
                    <v-icon icon="mdi-magnify"></v-icon>
                </v-form>
                <v-icon icon="mdi-dots-vertical"></v-icon> <!-- 채팅방메뉴 : 사진모아보기, 파일모아보기, 채팅구성원확인, 채팅방 아예 나가기  // 유저초대?-->
            </template>
        </v-app-bar>

        <!-- 채팅방 -->
        <v-container>

            <div v-for="(chat, index) in chatMessageList" :key="chat.id">

                <!-- 날짜 분리 -->
                <div v-if="index === 0 || this.isDifferentDay(chat.createdAt, chatMessageList[index - 1].createdAt)">
                    <div>
                        <hr style="width: 27%; margin:auto;">
                        <span style="margin:auto;">{{ this.getDay(chat.createdAt) }}</span>
                        <hr style="width: 27%; margin:auto;">
                    </div>
                </div>

                <div> <!-- 채팅메세지들 감싸요 -->
                    <div>
                        <div v-if="index === 0 || chat.senderNum != chatMessageList[index - 1].senderNum"
                            style="margin-bottom: 20px;">
                            <span v-if="chat.senderNum != this.chatSenderNum">{{ chat.senderName }}</span>
                            <span v-if="chat.senderNum == this.chatSenderNum">나</span>
                        </div>
                        <div>
                            <span>{{ chat.message }}</span>
                            <span>{{ this.getTime(chat.createdAt) }}</span>
                        </div>
                    </div>
                </div>

            </div>
        </v-container>

        <!-- 채팅입력 -->
        <v-container>
            <div v-for="(file, index) in fileList" :key="index">
                <img :src="file.imageUrl" @error="e => e.target.src = require('@/assets/user.png')"
                    style="height: 120px; width: 120px; object-fit: cover;">
                <p class="custom-contents">{{ file.name }}</p>
            </div><!-- 파일미리보기 -->
            <v-text-field v-model="messageToSend" v-on:keypress.enter="sendMessage"></v-text-field>
            <v-file-input v-model="files" @change="fileUpdate" multiple>파일</v-file-input>
            <v-btn @click="sendMessage">전송</v-btn>
        </v-container>

    </v-container>
</template>

<script>
import axios from 'axios';
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'

export default {
    props: [
        'chatRoomIdProp' // ⭐⭐⭐ 채팅방 리스트에서 채팅방 id, name, userNums 받자.=
    ],
    components: {

    },
    data() {
        return {
            stompClient: null,
            chatRoomId: null, // ⭐⭐⭐ this.$route.params.id, // props 로 처리할지 params->axios.get로 처리할지..
            // chatRoomName: "", // 채팅방 이름
            chatMessageList: [], // 주고받은 채팅내역

            chatSenderNum: '', // 채팅방을 여는 사람 == 채팅보내는 사람

            files: null, // v-file-input로 업로드한 파일들
            fileList: [], // files를 가공한 리스트.
            fileRes: null, // 메세지와 함께 보내기 위한 파일메타데이터(name, s3url)

            // messageType: '', // 메세지 타입 // TALK, FILE
            messageToSend: '', // 메세지입력란
        }
    },
    async created() {
        // this.chatRoomId = this.chatRoomIdProp; // ⭐⭐⭐ props 로 처리할지 params 로 처리할지.. ⭐⭐⭐
        this.chatRoomId = this.$route.params.id;
        this.chatSenderNum = localStorage.getItem('userNum');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/${this.chatRoomId}`);
        if (response.data) {
            this.chatMessageList = response.data.result;
        }
    },
    mounted() {
        this.connect();
    },
    methods: {
        connect() {
            if (this.stompClient && this.stompClient.connected) { return; } // 연결확인
            const socket = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/ws`);
            this.stompClient = Stomp.over(socket);
            const authtoken = localStorage.getItem('token');
            this.stompClient.connect(
                { Authorization: `Bearer ${authtoken}` },
                (frame) => {
                    console.log("frame : " + frame);
                    console.log("Connected to WebSocket");
                    this.stompClient.subscribe(`/topic/chat/room/${this.chatRoomId}`, (message) => {
                        const receivedMessage = JSON.parse(message.body);
                        this.chatMessageList.push(receivedMessage);
                    });
                },
                (error) => {
                    console.error("Connection error: ", error);
                    setTimeout(() => this.connect(), 5000);  // 재연결 시도
                }
            )
        },

        async sendMessage() {

            // 메시지가 비어있거나 공백 문자만 포함 + fileList가 없는 경우
            if (this.messageToSend.trim() === '' && this.fileList.length === 0) {
                return; // 함수 종료
            }

            if (this.stompClient && this.stompClient.connected) {
                if (this.fileList.length > 0) { // 파일이 있으면.
                    try {
                        const presignedUrls = await this.getPresignedURL();
                        console.log(presignedUrls);

                        // 각 파일에 대해 Presigned URL을 이용하여 S3에 업로드 -> s3 url만 남는다.
                        const uploadedFileUrls = await Promise.all(this.fileList.map(file => this.uploadFileToS3(file.file, presignedUrls[file.name])));

                        // 파일 중 업로드가 실패한 파일이 있으면 필터링
                        const successfulUploads = uploadedFileUrls.filter(url => url !== null);

                        // 메세지 보내면서 파일 메타데이터 저장을 한다.
                        // 메타데이터 저장을 위한 데이터 가공.
                        if (successfulUploads.length > 0) {
                            this.fileRes = successfulUploads.map((url, index) => ({
                                chatFileName: this.fileList[index].name,
                                chatFileUrl: url,
                            }));
                        }
                    } catch (error) {
                        console.error('Upload failed:', error);
                    }
                }

                const messageReq = {
                    senderNum: this.chatSenderNum,
                    roomId: this.chatRoomId,
                    messageType: this.fileList.length > 0 ? "FILE" : "TALK",
                    message: this.messageToSend,
                    files: this.fileRes,
                };

                this.stompClient.send(`/app/chat/message`, JSON.stringify(messageReq));

                this.messageToSend = ''; // 입력 필드 초기화
                this.fileList = []; // 빈 배열로 초기화
                this.fileRes = null;

            } else {
                console.error('WebSocket unconnected');
                setTimeout(() => this.connect(), 5000);
            }
        },

        // presignedUrl 생성
        async getPresignedURL() {
            const reqFiles = this.fileList.map(file => ({ chatFileName: file.name, fileSize: file.size}));
            console.log(reqFiles);
            const response = await axios.post(
                `${process.env.VUE_APP_API_BASE_URL}/file/presigned-urls`, reqFiles
            );
            return response.data.result; // [{filename:presignedUrl} ... ]
        },

        // presignedUrl으로 s3에 업로드
        async uploadFileToS3(file, presignedUrl) {
            try {
                const config = {
                    headers: {
                        'Content-Type': file.type,
                    },
                };

                await axios.put(presignedUrl, file, config);
                // S3에 업로드된 파일의 URL에서 ? 앞부분만 반환 (쿼리 파라미터 제거)
                return this.extractS3Url(presignedUrl);
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
                return null; // 업로드 실패 시 null 반환
            }
        },

        // Presigned URL에서 ? 이전의 S3 URL만 남김
        extractS3Url(presignedUrl) {
            return presignedUrl.split('?')[0]; // ? 기준으로 앞부분만 추출
        },

        // files -> fileList 로 가공
        fileUpdate() {
            this.fileList = []; // 초기화 후 파일 추가
            this.files.forEach(file => {
                this.fileList.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file,
                    imageUrl: URL.createObjectURL(file)
                })
            });
            this.files = null;
        },

        // 보내는 시간
        getTime(createdAt) {
            const createdTime = new Date(createdAt);
            let hour = createdTime.getHours();
            let minute = createdTime.getMinutes();
            let ampm = hour < 12 ? '오전' : '오후';

            hour = hour % 12 || 12; // 12시간 형식으로 변환
            minute = minute < 10 ? '0' + minute : minute;

            return `${ampm} ${hour}:${minute}`;
        },

        // 날짜 감별
        isDifferentDay(d1, d2) {
            const day1 = new Date(d1);
            const day2 = new Date(d2);

            return day1.getFullYear() !== day2.getFullYear() ||
                day1.getMonth() !== day2.getMonth() ||
                day1.getDate() !== day2.getDate();
        },

        // 날짜 감별 후 표시
        getDay(createdAt) {
            const createdTime = new Date(createdAt);
            return `${createdTime.getFullYear()}년 ${createdTime.getMonth() + 1}월 ${createdTime.getDate()}일`;
        },
    }
}

</script>
