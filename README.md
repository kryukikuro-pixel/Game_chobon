# Sanabi Style Preview V2

GitHub에 올리고 Render에 바로 연결할 수 있게 만든 버전.

## 포함 기능
- 눈 내리는 흑백 시작 화면
- 좌측 메뉴 UI
- 방향키 이동 + 점프
- Z 키 와이어 포인트 연결
- 체크포인트 리셋
- `/dev` 개발자 전용 맵 에디터
- 맵 JSON 내보내기 / 로컬 저장 / 게임용 적용
- Render 배포용 `render.yaml` 포함

## 로컬 실행
```bash
npm install
npm start
```

브라우저:
- 메인: `http://localhost:3000`
- 개발자 툴: `http://localhost:3000/dev`

## GitHub 업로드
1. 압축 해제
2. 새 GitHub 저장소 생성
3. 파일 업로드
4. Render에서 해당 GitHub 저장소 연결
5. Build Command: `npm install`
6. Start Command: `npm start`

## Render
`render.yaml` 이 있어서 보통 자동 인식됨.

## 조작
- ← →
- ↑ 또는 Space
- Z : 와이어 연결 / 해제
- R : 체크포인트 복귀

## 타일 종류
- 0 빈칸
- 1 벽
- 2 특수 오브젝트
- 3 와이어 포인트
- 4 체크포인트

## 참고
이건 완성 게임이 아니라 프로토타입 구조임.
다음 단계로는
- 적 AI
- 공격
- 카메라 이동
- 진짜 와이어 물리
- 맵 파일 저장 서버화
같은 걸 붙이면 됨.