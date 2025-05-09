import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,              // 100 مستخدم في نفس الوقت
  duration: '30s',       // لمدة 30 ثانية
  thresholds: {
    http_req_failed: ['rate<0.01'],       // أقل من 1% فشل
    http_req_duration: ['p(95)<400'],     // 95% من الطلبات أقل من 400ms
  },
};

export default function () {
  let res = http.get('https://brainshub00.web.app');
  
  check(res, {
    '✅ Status is 200': (r) => r.status === 200,
    '⚡ Response time < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(1); // لمحاكاة انتظار المستخدم
}
