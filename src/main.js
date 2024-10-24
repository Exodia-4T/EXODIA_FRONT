import { jwtDecode } from 'jwt-decode';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import adapter from 'webrtc-adapter';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
// import './main.css';

window.adapter = adapter;

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8087';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const vuetifyInstance = createVuetify({
  components,
  directives,
});

axios.interceptors.request.use(config => {
  if (config.url.includes("amazonaws.com")) {
    delete config.headers['Authorization'];
  }
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          localStorage.clear();
          alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
          router.push('/login').then(() => {
            window.location.reload();
          });
        } else {
          localStorage.clear();
          alert('중복 로그인이 감지되었습니다. 강제 로그아웃 됩니다.');
          router.push('/login').then(() => {
            window.location.reload();
          });
        }
      } else {
        router.push('/login').then(() => {
          window.location.reload();
        });
      }
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);

app.component('VueDatePicker', VueDatePicker);

app.config.globalProperties.$axios = axios;

app.use(router);
app.use(store);
app.use(vuetifyInstance);

// app.mixin({
//   methods: {
//     checkButtons() {
//       // v-btn 클래스만 선택
//       const buttons = document.querySelectorAll('.v-btn');
//       buttons.forEach(button => {
//         const text = button.innerText;

//         // 버튼 기본 스타일 리셋 (다른 컴포넌트에는 영향 X)
//         button.classList.add('reset-btn');

//         // "생성", "등록", "작성"이 포함된 버튼
//         if (text.includes('생성') || text.includes('등록') || text.includes('작성')) {
//           button.classList.add('custom-create-register-btn');
//           button.classList.remove('custom-write-btn', 'custom-list-btn');
//         }
//         // "삭제", "닫기", "취소" 버튼
//         else if (text.includes('삭제') || text.includes('닫기') || text.includes('취소')) {
//           button.classList.add('custom-write-btn');
//           button.classList.remove('custom-create-register-btn', 'custom-list-btn');
//         }
//         // "목록" 버튼
//         else if (text.includes('목록')) {
//           button.classList.add('custom-list-btn');
//           button.classList.remove('custom-create-register-btn', 'custom-write-btn');
//         }
//       });
//     }
//   },
//   mounted() {
//     this.checkButtons();
//   },
//   updated() {
//     this.checkButtons();
//   }
// });


app.mount('#app');

app.directive('create', {
  mounted(el) {
    if (el.textContent.includes('작성') || el.textContent.includes('생성') || el.textContent.includes('수정') ||
      el.textContent.includes('등록') || el.textContent.includes('저장') || el.textContent.includes('답변') ||
      el.textContent.includes('업데이트') || el.textContent.includes('퇴근') || el.textContent.includes('변경') || el.textContent.includes('추가')) {
      el.style.backgroundColor = '#9a2f2f'; // 배경색 - 붉은색
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('update', {
  mounted(el) {
    if (el.textContent.includes('수정') || el.textContent.includes('업데이트')) {
      el.style.backgroundColor = '#ffffff'; // 배경색 - 흰색
      el.style.borderColor = '#9a2f2f';
      el.style.color = '#9a2f2f';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('delete', {
  mounted(el) {
    // 텍스트가 "생성"을 포함하는지 확인
    if (el.textContent.includes('닫기') || el.textContent.includes('취소') || el.textContent.includes('삭제')) {
      el.style.backgroundColor = '#949494'; // 배경색 - 회색
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('list', {
  mounted(el) {
    if (el.textContent.includes('목록') || el.textContent.includes('보기') || el.textContent.includes('출근') || el.textContent.includes('시작')) {
      el.style.backgroundColor = '#4caf50'; // 배경색 - 초록색
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});
