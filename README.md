# 땅땅! (dang-dang)

로그인 없는 반응형 웹이다. 일상 다툼을 재미용 판결로 바꾼다. 법적 효력은 없다. 화면 표시명은 땅땅!이고, 설명은 AI 일상 재판소다.

## 문서

개발에 쓰는 기준은 아래 순서다.

1. 기능, API, DB, 보안: [AI_Judge_v2_1_FINAL_Cursor_Spec.md](docs/AI_Judge_v2_1_FINAL_Cursor_Spec.md)
2. 색, 컴포넌트, 레이아웃: [DDANG_02_Neobrutalism_UI_Guide.pdf](docs/DDANG_02_Neobrutalism_UI_Guide.pdf). v2.1 명세 04~08절의 네이비·아이보리·골드 화면 스타일을 대체한다. 기능 정책은 명세를 유지한다.
3. 브랜드: [DDANG_03_Brand_Identity.pdf](docs/DDANG_03_Brand_Identity.pdf). 서비스 표시명은 땅땅!이다.
4. 화면 흐름: [AI_Judge_v2_1_FINAL_Visual_Spec.pdf](docs/AI_Judge_v2_1_FINAL_Visual_Spec.pdf)
5. 시안 비교: [DDANG_01_Design_Concepts.pdf](docs/DDANG_01_Design_Concepts.pdf). 기본 UI는 01 네오 브루탈리즘이다. 02 레트로 코믹과 03 다크 시네마틱은 구현하지 않는다.
6. 처음 기획: [AI 판사 기획안 - Grok Bot.pdf](<docs/AI 판사 기획안 - Grok Bot.pdf>). 최종 명세가 우선한다.

## 실행

```bash
cp .env.example .env
npm install
npm run dev
```

기본 AI는 비밀값 없이 동작하는 mock이다. 관리자 화면은 `/admin`이고, 비밀번호는 `ADMIN_PASSWORD`다. 테스트는 `npm test`, 배포용 빌드는 `npm run build`다. SQLite 파일은 `data/dangdang.sqlite`에 생긴다.

`AI_PROVIDER=openai`와 `AI_API_KEY`를 넣으면 OpenAI 호환 API를 호출한다. 단일 서버에서는 제출과 상태 조회가 판결 작업을 처리하고, `npm run worker`로 같은 작업을 반복 처리할 수 있다.

Docker는 `docker compose up --build`로 앱과 Caddy를 띄운다.
